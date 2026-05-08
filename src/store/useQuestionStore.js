import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import sampleQuestions from '../data/sampleQuestions'
import { supabase, isConfigured, questionToRow, rowToQuestion } from '../lib/supabase'

const generateId = () => `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

// Debounce helper — collapses rapid mutations into one remote write
let pushTimer = null
const schedulePush = (fn) => {
  clearTimeout(pushTimer)
  pushTimer = setTimeout(fn, 1500)
}

const useQuestionStore = create(
  persist(
    (set, get) => ({
      questions:  sampleQuestions,
      syncStatus: 'idle',   // 'idle' | 'syncing' | 'synced' | 'error'
      lastSynced: null,
      syncError:  null,

      // ── Internal helpers ────────────────────────────────────────────────
      _setSyncing: () => set({ syncStatus: 'syncing', syncError: null }),
      _setSynced:  () => set({ syncStatus: 'synced',  lastSynced: Date.now(), syncError: null }),
      _setSyncErr: (msg) => set({ syncStatus: 'error', syncError: msg }),

      // ── CRUD ────────────────────────────────────────────────────────────
      addQuestion: (data) => {
        const question = { ...data, id: generateId(), createdAt: Date.now() }
        set((s) => ({ questions: [...s.questions, question] }))

        if (isConfigured) {
          schedulePush(async () => {
            get()._setSyncing()
            const { error } = await supabase.from('questions').upsert(questionToRow(question))
            error ? get()._setSyncErr(error.message) : get()._setSynced()
          })
        }
        return question
      },

      updateQuestion: (id, data) => {
        set((s) => ({
          questions: s.questions.map((q) =>
            q.id === id ? { ...q, ...data, updatedAt: Date.now() } : q
          ),
        }))

        if (isConfigured) {
          schedulePush(async () => {
            const q = get().questions.find((q) => q.id === id)
            if (!q) return
            get()._setSyncing()
            const { error } = await supabase.from('questions').upsert(questionToRow(q))
            error ? get()._setSyncErr(error.message) : get()._setSynced()
          })
        }
      },

      deleteQuestion: (id) => {
        set((s) => ({ questions: s.questions.filter((q) => q.id !== id) }))

        if (isConfigured) {
          ;(async () => {
            get()._setSyncing()
            const { error } = await supabase.from('questions').delete().eq('id', id)
            error ? get()._setSyncErr(error.message) : get()._setSynced()
          })()
        }
      },

      // ── Bulk import ──────────────────────────────────────────────────────
      bulkImport: (incoming) => {
        const stamped = incoming.map((q) => ({
          ...q, id: q.id || generateId(), createdAt: q.createdAt || Date.now(),
        }))
        const existingIds = new Set(get().questions.map((q) => q.id))
        const newOnes = stamped.filter((q) => !existingIds.has(q.id))
        set((s) => ({ questions: [...s.questions, ...newOnes] }))

        if (isConfigured && newOnes.length > 0) {
          schedulePush(async () => {
            get()._setSyncing()
            const { error } = await supabase.from('questions').upsert(newOnes.map(questionToRow))
            error ? get()._setSyncErr(error.message) : get()._setSynced()
          })
        }
        return { added: newOnes.length, skipped: stamped.length - newOnes.length }
      },

      replaceAll: (incoming) => {
        const stamped = incoming.map((q) => ({
          ...q, id: q.id || generateId(), createdAt: q.createdAt || Date.now(),
        }))
        set({ questions: stamped })

        if (isConfigured) {
          schedulePush(async () => {
            get()._setSyncing()
            // Delete all remote, then re-insert
            const { error: delErr } = await supabase.from('questions').delete().neq('id', '')
            if (delErr) { get()._setSyncErr(delErr.message); return }
            const { error } = await supabase.from('questions').upsert(stamped.map(questionToRow))
            error ? get()._setSyncErr(error.message) : get()._setSynced()
          })
        }
        return stamped.length
      },

      // ── Sync ────────────────────────────────────────────────────────────
      sync: async () => {
        if (!isConfigured) return
        get()._setSyncing()
        try {
          // 1. Pull from Supabase
          const { data: remote, error } = await supabase.from('questions').select('*')
          if (error) throw error

          const remoteQuestions = remote.map(rowToQuestion)

          // 2. Merge: build a map keyed by id, remote wins on conflict
          const local = get().questions
          const merged = new Map()
          local.forEach((q) => merged.set(q.id, q))
          remoteQuestions.forEach((q) => {
            const existing = merged.get(q.id)
            // Remote wins if it's newer or local doesn't have it
            if (!existing || (q.updatedAt || 0) >= (existing.updatedAt || 0)) {
              merged.set(q.id, q)
            }
          })

          // 3. Push any local-only records back up
          const remoteIds = new Set(remoteQuestions.map((q) => q.id))
          const localOnly = local.filter((q) => !remoteIds.has(q.id))
          if (localOnly.length > 0) {
            await supabase.from('questions').upsert(localOnly.map(questionToRow))
          }

          set({ questions: Array.from(merged.values()) })
          get()._setSynced()
        } catch (err) {
          get()._setSyncErr(err.message || 'Sync failed')
        }
      },

      pushAll: async () => {
        if (!isConfigured) return
        get()._setSyncing()
        const { error } = await supabase
          .from('questions')
          .upsert(get().questions.map(questionToRow))
        error ? get()._setSyncErr(error.message) : get()._setSynced()
      },

      // ── Queries ──────────────────────────────────────────────────────────
      getBySubject:  (subject)  => get().questions.filter((q) => q.subject === subject),
      getBySubjects: (subjects) =>
        subjects.length === 0
          ? get().questions
          : get().questions.filter((q) => subjects.includes(q.subject)),
      getStats: () => {
        const questions = get().questions
        const bySubject = {}
        questions.forEach((q) => { bySubject[q.subject] = (bySubject[q.subject] || 0) + 1 })
        return { total: questions.length, bySubject }
      },
    }),
    { name: 'kmd-questions', version: 1 }
  )
)

export default useQuestionStore
