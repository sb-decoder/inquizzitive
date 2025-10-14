CREATE TABLE IF NOT EXISTS public.quiz (
  quiz_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_questions Integer NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  quiz_data JSONB NOT NULL, -- stores the full quiz questions and user answers
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_attended (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_questions INTEGER NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  user_id TEXT NOT NULL,
  quiz_id UUID REFERENCES public.quiz(quiz_id) ON DELETE CASCADE NOT NULL,
  correct_answers INTEGER NOT NULL,
  score_percentage DECIMAL(5,2) NOT NULL,
  time_taken INTEGER,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for quiz_history
CREATE INDEX IF NOT EXISTS idx_quiz_id ON public.quiz(quiz_id);

ALTER TABLE public.quiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attended ENABLE ROW LEVEL SECURITY;
