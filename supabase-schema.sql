-- ============================================================
-- KrezelleMD Reviewer — Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id            TEXT        PRIMARY KEY,
  subject       TEXT        NOT NULL,
  question      TEXT        NOT NULL,
  choices       JSONB       NOT NULL,
  correct_answer TEXT       NOT NULL,
  rationale     JSONB       DEFAULT '{}',
  difficulty    TEXT        DEFAULT 'medium',
  created_at    BIGINT      DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  updated_at    BIGINT      DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- Flashcards table
CREATE TABLE IF NOT EXISTS public.flashcards (
  id            TEXT        PRIMARY KEY,
  subject       TEXT        NOT NULL,
  front         TEXT        NOT NULL,
  back          TEXT        NOT NULL,
  confidence    TEXT        DEFAULT 'new',
  next_review   BIGINT      DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  review_count  INTEGER     DEFAULT 0,
  created_at    BIGINT      DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS questions_subject_idx  ON public.questions (subject);
CREATE INDEX IF NOT EXISTS flashcards_subject_idx ON public.flashcards (subject);
CREATE INDEX IF NOT EXISTS flashcards_review_idx  ON public.flashcards (next_review);

-- ============================================================
-- Row Level Security (RLS)
-- For a personal/single-user app: disable RLS so the anon key
-- has full read/write access. This is fine since it's YOUR
-- private Supabase project — only you have the anon key.
-- ============================================================
ALTER TABLE public.questions  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards DISABLE ROW LEVEL SECURITY;

-- Grant access to the anon role
GRANT ALL ON public.questions  TO anon;
GRANT ALL ON public.flashcards TO anon;
