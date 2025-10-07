-- Table: public.achievement_progress

CREATE TABLE IF NOT EXISTS public.achievement_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type TEXT NOT NULL, -- 'quiz_count', 'streak', 'category_master', 'score_milestone'
  achievement_name TEXT NOT NULL,
  progress_value INTEGER DEFAULT 0,
  target_value INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  category TEXT, -- For category-specific achievements
  metadata JSONB DEFAULT '{}', -- Additional achievement data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_type, achievement_name)
);

-- Indexes for achievement_progress
CREATE INDEX IF NOT EXISTS idx_achievement_progress_user_type ON public.achievement_progress(user_id, achievement_type);
