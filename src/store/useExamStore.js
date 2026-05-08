import { create } from 'zustand'

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const useExamStore = create((set, get) => ({
  // ── Config ────────────────────────────────────────────────────────────────
  config: {
    subjects: [],
    questionLimit: 50,
    timed: false,
    timeLimitMinutes: 60,
    shuffleChoices: true,
  },

  // ── Active Exam State ─────────────────────────────────────────────────────
  status: 'idle', // 'idle' | 'active' | 'finished'
  questions: [],
  currentIndex: 0,
  answers: {},       // { [questionId]: { selected, correct, timeSpent } }
  revealed: {},      // { [questionId]: true } — rationale shown
  startTime: null,
  timeRemaining: 0,

  // ── Config Actions ────────────────────────────────────────────────────────
  setConfig: (patch) =>
    set((s) => ({ config: { ...s.config, ...patch } })),

  // ── Exam Lifecycle ────────────────────────────────────────────────────────
  startExam: (questionPool) => {
    const { config } = get()
    const shuffled = shuffle(questionPool)
    const limited = shuffled.slice(0, config.questionLimit)
    set({
      status: 'active',
      questions: limited,
      currentIndex: 0,
      answers: {},
      revealed: {},
      startTime: Date.now(),
      timeRemaining: config.timed ? config.timeLimitMinutes * 60 : null,
    })
  },

  submitAnswer: (questionId, selected) => {
    const { questions, answers } = get()
    const question = questions.find((q) => q.id === questionId)
    if (!question || answers[questionId]) return // prevent re-answer

    const correct = selected === question.correctAnswer
    const wasRevealed = !correct // reveal rationale immediately on wrong answer

    set((s) => ({
      answers: {
        ...s.answers,
        [questionId]: { selected, correct, timeMs: Date.now() - s.startTime },
      },
      revealed: wasRevealed
        ? { ...s.revealed, [questionId]: true }
        : s.revealed,
    }))
  },

  revealRationale: (questionId) =>
    set((s) => ({ revealed: { ...s.revealed, [questionId]: true } })),

  nextQuestion: () =>
    set((s) => ({
      currentIndex: Math.min(s.currentIndex + 1, s.questions.length - 1),
    })),

  prevQuestion: () =>
    set((s) => ({ currentIndex: Math.max(s.currentIndex - 1, 0) })),

  goToQuestion: (index) =>
    set((s) => ({
      currentIndex: Math.max(0, Math.min(index, s.questions.length - 1)),
    })),

  finishExam: () => set({ status: 'finished' }),

  tickTimer: () =>
    set((s) => {
      if (!s.config.timed || s.timeRemaining === null) return s
      const next = s.timeRemaining - 1
      if (next <= 0) return { timeRemaining: 0, status: 'finished' }
      return { timeRemaining: next }
    }),

  resetExam: () =>
    set({
      status: 'idle',
      questions: [],
      currentIndex: 0,
      answers: {},
      revealed: {},
      startTime: null,
      timeRemaining: 0,
    }),

  // ── Computed Getters ──────────────────────────────────────────────────────
  getResults: () => {
    const { questions, answers } = get()
    const total = questions.length
    const answered = Object.keys(answers).length
    const correct = Object.values(answers).filter((a) => a.correct).length
    const incorrect = answered - correct
    const score = total > 0 ? Math.round((correct / total) * 100) : 0

    const bySubject = {}
    questions.forEach((q) => {
      if (!bySubject[q.subject]) bySubject[q.subject] = { total: 0, correct: 0 }
      bySubject[q.subject].total++
      if (answers[q.id]?.correct) bySubject[q.subject].correct++
    })

    return { total, answered, correct, incorrect, score, bySubject }
  },
}))

export default useExamStore
