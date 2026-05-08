import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SUBJECTS } from '../data/sampleQuestions'
import { supabase, isConfigured, flashcardToRow, rowToFlashcard } from '../lib/supabase'

const generateId = () => `fc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

const INTERVALS = {
  again: 1  * 60 * 1000,
  hard:  10 * 60 * 1000,
  good:  24 * 60 * 60 * 1000,
  easy:  4  * 24 * 60 * 60 * 1000,
}

const sampleCards = SUBJECTS.map((subject, i) => ({
  id:          `fc_sample_${i}`,
  subject,
  front:       `Key concept in ${subject}`,
  back:        `Review ${subject} core principles from your notes. This card is a placeholder — edit or add your own!`,
  confidence:  'new',
  nextReview:  Date.now(),
  reviewCount: 0,
  createdAt:   Date.now() - i * 1000,
}))

let pushTimer = null
const schedulePush = (fn) => { clearTimeout(pushTimer); pushTimer = setTimeout(fn, 1500) }

const useFlashcardStore = create(
  persist(
    (set, get) => ({
      cards:               sampleCards,
      activeSubjectFilter: 'All',
      currentCardIndex:    0,
      sessionStats:        { reviewed: 0, again: 0, hard: 0, good: 0, easy: 0 },
      syncStatus:          'idle',
      lastSynced:          null,
      syncError:           null,

      _setSyncing: () => set({ syncStatus: 'syncing', syncError: null }),
      _setSynced:  () => set({ syncStatus: 'synced',  lastSynced: Date.now(), syncError: null }),
      _setSyncErr: (msg) => set({ syncStatus: 'error', syncError: msg }),

      // ── CRUD ──────────────────────────────────────────────────────────
      addCard: (data) => {
        const card = {
          ...data,
          id: generateId(), confidence: 'new',
          nextReview: Date.now(), reviewCount: 0, createdAt: Date.now(),
        }
        set((s) => ({ cards: [card, ...s.cards] }))

        if (isConfigured) {
          schedulePush(async () => {
            get()._setSyncing()
            const { error } = await supabase.from('flashcards').upsert(flashcardToRow(card))
            error ? get()._setSyncErr(error.message) : get()._setSynced()
          })
        }
        return card
      },

      updateCard: (id, data) => {
        set((s) => ({ cards: s.cards.map((c) => (c.id === id ? { ...c, ...data } : c)) }))

        if (isConfigured) {
          schedulePush(async () => {
            const c = get().cards.find((c) => c.id === id)
            if (!c) return
            get()._setSyncing()
            const { error } = await supabase.from('flashcards').upsert(flashcardToRow(c))
            error ? get()._setSyncErr(error.message) : get()._setSynced()
          })
        }
      },

      deleteCard: (id) => {
        set((s) => ({ cards: s.cards.filter((c) => c.id !== id) }))

        if (isConfigured) {
          ;(async () => {
            get()._setSyncing()
            const { error } = await supabase.from('flashcards').delete().eq('id', id)
            error ? get()._setSyncErr(error.message) : get()._setSynced()
          })()
        }
      },

      // ── SRS Review ────────────────────────────────────────────────────
      rateCard: (id, rating) => {
        const interval = INTERVALS[rating] || INTERVALS.good
        set((s) => ({
          cards: s.cards.map((c) =>
            c.id === id
              ? { ...c, confidence: rating, nextReview: Date.now() + interval, reviewCount: (c.reviewCount || 0) + 1 }
              : c
          ),
          sessionStats: {
            ...s.sessionStats,
            reviewed: s.sessionStats.reviewed + 1,
            [rating]: s.sessionStats[rating] + 1,
          },
        }))

        if (isConfigured) {
          schedulePush(async () => {
            const c = get().cards.find((c) => c.id === id)
            if (!c) return
            get()._setSyncing()
            const { error } = await supabase.from('flashcards').upsert(flashcardToRow(c))
            error ? get()._setSyncErr(error.message) : get()._setSynced()
          })
        }
      },

      resetSessionStats: () =>
        set({ sessionStats: { reviewed: 0, again: 0, hard: 0, good: 0, easy: 0 } }),

      // ── Sync ──────────────────────────────────────────────────────────
      sync: async () => {
        if (!isConfigured) return
        get()._setSyncing()
        try {
          const { data: remote, error } = await supabase.from('flashcards').select('*')
          if (error) throw error

          const remoteCards = remote.map(rowToFlashcard)
          const local = get().cards
          const merged = new Map()
          local.forEach((c) => merged.set(c.id, c))
          // Remote wins for review/confidence data (it's the authoritative SRS state)
          remoteCards.forEach((c) => merged.set(c.id, c))

          // Push local-only cards
          const remoteIds = new Set(remoteCards.map((c) => c.id))
          const localOnly = local.filter((c) => !remoteIds.has(c.id))
          if (localOnly.length > 0) {
            await supabase.from('flashcards').upsert(localOnly.map(flashcardToRow))
          }

          set({ cards: Array.from(merged.values()) })
          get()._setSynced()
        } catch (err) {
          get()._setSyncErr(err.message || 'Sync failed')
        }
      },

      // ── Navigation ────────────────────────────────────────────────────
      setFilter:    (subject) => set({ activeSubjectFilter: subject, currentCardIndex: 0 }),
      setCardIndex: (i)       => set({ currentCardIndex: i }),

      // ── Queries ───────────────────────────────────────────────────────
      getDueCards: () => {
        const { cards, activeSubjectFilter } = get()
        const now = Date.now()
        return cards.filter(
          (c) => c.nextReview <= now &&
            (activeSubjectFilter === 'All' || c.subject === activeSubjectFilter)
        )
      },
      getFilteredCards: () => {
        const { cards, activeSubjectFilter } = get()
        return activeSubjectFilter === 'All' ? cards : cards.filter((c) => c.subject === activeSubjectFilter)
      },
      getStats: () => {
        const { cards } = get()
        const byConfidence = { new: 0, again: 0, hard: 0, good: 0, easy: 0 }
        cards.forEach((c) => { byConfidence[c.confidence] = (byConfidence[c.confidence] || 0) + 1 })
        return { total: cards.length, byConfidence }
      },
    }),
    { name: 'kmd-flashcards', version: 1 }
  )
)

export default useFlashcardStore
