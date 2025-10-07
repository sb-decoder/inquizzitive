-- Master setup file to import all SQL modules in correct order

-- Import table definitions
-- Table: public.profiles

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for profiles table
-- (No specific indexes defined in original files for profiles)

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

-- Table: public.user_analytics

CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analysis_date DATE DEFAULT CURRENT_DATE NOT NULL,
  weak_areas JSONB, -- Array of weak categories with scores and priorities
  strengths JSONB, -- Array of strong categories with scores
  recommendations JSONB, -- Array of generated recommendations
  overall_progress JSONB, -- Overall progress metrics
  category_analysis JSONB, -- Detailed category breakdown
  difficulty_analysis JSONB, -- Performance by difficulty level
  insights JSONB, -- Generated insights and observations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, analysis_date)
);

-- Indexes for user_analytics
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_date ON public.user_analytics(user_id, analysis_date DESC);

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


-- Import RLS and policies
-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Enable RLS on quiz_history table
ALTER TABLE public.quiz_history ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_history table
CREATE POLICY "Users can view own quiz history" ON public.quiz_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz history" ON public.quiz_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable RLS on bookmarked_questions table
ALTER TABLE public.bookmarked_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for bookmarked_questions table
CREATE POLICY "Users can view own bookmarks" ON public.bookmarked_questions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON public.bookmarked_questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks" ON public.bookmarked_questions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON public.bookmarked_questions
  FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on user_analytics table
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_analytics
CREATE POLICY "Users can view own analytics" ON public.user_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" ON public.user_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics" ON public.user_analytics
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS on study_streaks table
ALTER TABLE public.study_streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for study_streaks
CREATE POLICY "Users can view own streaks" ON public.study_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON public.study_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON public.study_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS on user_preferences table
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS on bookmarks table
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bookmarks
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks" ON public.bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on achievement_progress table
ALTER TABLE public.achievement_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for achievement_progress
CREATE POLICY "Users can view own achievements" ON public.achievement_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.achievement_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON public.achievement_progress
  FOR UPDATE USING (auth.uid() = user_id);


-- Import functions and triggers
-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update study streaks automatically when quiz is completed
CREATE OR REPLACE FUNCTION public.update_study_streak()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update today's streak data
  INSERT INTO public.study_streaks (
    user_id,
    streak_date,
    quizzes_taken,
    total_questions,
    total_correct,
    average_score,
    categories_practiced
  )
  VALUES (
    NEW.user_id,
    CURRENT_DATE,
    1,
    NEW.total_questions,
    NEW.correct_answers,
    NEW.score_percentage,
    ARRAY[NEW.category]
  )
  ON CONFLICT (user_id, streak_date) DO UPDATE SET
    quizzes_taken = study_streaks.quizzes_taken + 1,
    total_questions = study_streaks.total_questions + NEW.total_questions,
    total_correct = study_streaks.total_correct + NEW.correct_answers,
    average_score = (study_streaks.average_score * study_streaks.quizzes_taken + NEW.score_percentage) / (study_streaks.quizzes_taken + 1),
    categories_practiced = array_append(
      CASE WHEN NEW.category = ANY(study_streaks.categories_practiced)
           THEN study_streaks.categories_practiced
           ELSE array_append(study_streaks.categories_practiced, NEW.category)
      END,
      NULL
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initialize user preferences on signup
CREATE OR REPLACE FUNCTION public.initialize_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default preferences for new user
  INSERT INTO public.user_preferences (
    user_id,
    preferred_categories,
    target_daily_questions,
    study_goals
  )
  VALUES (
    NEW.id,
    ARRAY['Current Affairs', 'History', 'Geography'],
    10,
    '{
      "weekly_target": 50,
      "target_categories": ["Current Affairs", "History"],
      "target_accuracy": 75,
      "exam_date": null
    }'::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old analytics data (keep last 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics()
RETURNS void AS $$
BEGIN
  DELETE FROM public.user_analytics
  WHERE analysis_date < CURRENT_DATE - INTERVAL '90 days';

  DELETE FROM public.study_streaks
  WHERE streak_date < CURRENT_DATE - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger to update streaks on quiz completion
DROP TRIGGER IF EXISTS on_quiz_completed ON public.quiz_history;
CREATE TRIGGER on_quiz_completed
  AFTER INSERT ON public.quiz_history
  FOR EACH ROW EXECUTE FUNCTION public.update_study_streak();

-- Update the existing user creation trigger to also create preferences
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create new trigger for preferences
CREATE TRIGGER on_user_preferences_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_preferences();


-- Import views
-- Create views for easier querying
CREATE OR REPLACE VIEW public.user_performance_summary AS
SELECT 
  u.id as user_id,
  u.email,
  p.full_name,
  COUNT(qh.id) as total_quizzes,
  AVG(qh.score_percentage) as average_score,
  MAX(qh.score_percentage) as best_score,
  COUNT(DISTINCT qh.category) as categories_practiced,
  MAX(qh.created_at) as last_quiz_date,
  COALESCE(ss.current_streak, 0) as current_streak
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.quiz_history qh ON u.id = qh.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as current_streak
  FROM public.study_streaks 
  WHERE streak_date >= CURRENT_DATE - INTERVAL '30 days'
    AND quizzes_taken > 0
  GROUP BY user_id
) ss ON u.id = ss.user_id
GROUP BY u.id, u.email, p.full_name, ss.current_streak;

