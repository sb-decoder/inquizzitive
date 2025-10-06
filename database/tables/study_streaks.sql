-- Table: public.study_streaks

CREATE TABLE IF NOT EXISTS public.study_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  streak_date DATE DEFAULT CURRENT_DATE NOT NULL,
  quizzes_taken INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  categories_practiced TEXT[], -- Array of categories practiced that day
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, streak_date)
);

-- Indexes for study_streaks
CREATE INDEX IF NOT EXISTS idx_study_streaks_user_date ON public.study_streaks(user_id, streak_date DESC);
