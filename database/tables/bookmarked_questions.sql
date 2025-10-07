-- Table: public.bookmarked_questions

CREATE TABLE IF NOT EXISTS public.bookmarked_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- array of answer options
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  notes TEXT, -- user's personal notes about the question
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure uniqueness: same user cannot bookmark the same question twice
  UNIQUE(user_id, question, correct_answer)
);

-- Indexes for bookmarked_questions
CREATE INDEX IF NOT EXISTS idx_bookmarked_questions_user_id ON public.bookmarked_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarked_questions_created_at ON public.bookmarked_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarked_questions_category ON public.bookmarked_questions(category);
