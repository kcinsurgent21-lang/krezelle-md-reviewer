import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (url && key && url.startsWith('https://'))
  ? createClient(url, key)
  : null

export const isConfigured = !!supabase

// ── Column mappers ────────────────────────────────────────────────────────────

export const questionToRow = (q) => ({
  id:             q.id,
  subject:        q.subject,
  question:       q.question,
  choices:        q.choices,
  correct_answer: q.correctAnswer,
  rationale:      q.rationale || {},
  difficulty:     q.difficulty || 'medium',
  created_at:     q.createdAt  || Date.now(),
  updated_at:     Date.now(),
})

export const rowToQuestion = (r) => ({
  id:            r.id,
  subject:       r.subject,
  question:      r.question,
  choices:       r.choices,
  correctAnswer: r.correct_answer,
  rationale:     r.rationale || {},
  difficulty:    r.difficulty || 'medium',
  createdAt:     r.created_at,
  updatedAt:     r.updated_at,
})

export const flashcardToRow = (c) => ({
  id:           c.id,
  subject:      c.subject,
  front:        c.front,
  back:         c.back,
  confidence:   c.confidence || 'new',
  next_review:  c.nextReview  || Date.now(),
  review_count: c.reviewCount || 0,
  created_at:   c.createdAt   || Date.now(),
})

export const rowToFlashcard = (r) => ({
  id:          r.id,
  subject:     r.subject,
  front:       r.front,
  back:        r.back,
  confidence:  r.confidence  || 'new',
  nextReview:  r.next_review  || Date.now(),
  reviewCount: r.review_count || 0,
  createdAt:   r.created_at,
})
