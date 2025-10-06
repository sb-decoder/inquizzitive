-- Table: public.user_preferences

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preferred_categories TEXT[] DEFAULT '{}', -- User's preferred categories
  target_daily_questions INTEGER DEFAULT 10,
  reminder_time TIME DEFAULT '09:00:00',
  reminder_enabled BOOLEAN DEFAULT true,
  difficulty_preference TEXT DEFAULT 'Medium',
  study_goals JSONB, -- User's study goals and targets
  notification_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes for user_preferences
-- (No specific indexes defined in original files for user_preferences)
