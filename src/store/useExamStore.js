import { create } from 'zustand'

// Fisher-Yates shuffle for arrays
const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Shuffle A/B/C/D choices while keeping correct answer + rationale linked
const shuffleQuestionChoices = (question) => {
  const letters = Object.keys(question.choices)           // ['A','B','C','D']
  const correctText = question.choices[question.correctAnswer]

  // Pair each choice text with its per-choice rationale so they travel together
  const pairs = letters.map((letter) => ({
    text:      question.choices[letter],
    rationale: question.rationale?.[letter],
  }))

  // Fisher-Yates in-place on pairs
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]]
  }

  const newChoices   = {}
  const newRationale = { general: question.rationale?.general }
  let   newCorrect   = question.correctAnswer

  letters.forEach((letter, i) => {
    newChoices[letter] = pairs[i].text
    if (pairs[i].rationale != null) newRationale[letter] = pairs[i].rationale
    if (pairs[i].text === correctText) newCorrect = letter   // track new position
  })

  return { ...question, choices: newChoices, correctAnswer: newCorrect, rationale: newRationale }
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
    const limited  = shuffled.slice(0, config.questionLimit)
    // Shuffle A/B/C/D order per question if enabled
    const questions = config.shuffleChoices
      ? limited.map(shuffleQuestionChoices)
      : limited
    set({
      status: 'active',
      questions,
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

    set((s) => ({
      answers: {
        ...s.answers,
        [questionId]: { selected, correct, timeMs: Date.now() - s.startTime },
      },
      // Always reveal rationale immediately on any answer (correct or wrong)
      revealed: { ...s.revealed, [questionId]: true },
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
