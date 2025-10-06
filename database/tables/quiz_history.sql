-- Table: public.quiz_history

CREATE TABLE IF NOT EXISTS public.quiz_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score_percentage DECIMAL(5,2) NOT NULL,
  time_taken INTEGER, -- in seconds
  quiz_data JSONB, -- stores the full quiz questions and user answers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for quiz_history
CREATE INDEX IF NOT EXISTS idx_quiz_history_user_id ON public.quiz_history(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_history_created_at ON public.quiz_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_history_category ON public.quiz_history(category);
