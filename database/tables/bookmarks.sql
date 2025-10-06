-- Table: public.bookmarks

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_history_id UUID REFERENCES public.quiz_history(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL, -- Index of the question in the quiz
  question_data JSONB NOT NULL, -- The actual question, options, answer, explanation
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  notes TEXT, -- User's personal notes
  tags TEXT[] DEFAULT '{}', -- User-defined tags
  is_mastered BOOLEAN DEFAULT false, -- Whether user has mastered this question
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_category ON public.bookmarks(user_id, category);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);
