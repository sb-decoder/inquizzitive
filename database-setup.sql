-- Enable Row Level Security (RLS) for all tables
-- This ensures users can only access their own data

-- Create profiles table to extend auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_history table to store user quiz results
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

-- Create bookmarked_questions table to store user's saved questions
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

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on quiz_history table
ALTER TABLE public.quiz_history ENABLE ROW LEVEL SECURITY;

-- Enable RLS on bookmarked_questions table
ALTER TABLE public.bookmarked_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for quiz_history table
CREATE POLICY "Users can view own quiz history" ON public.quiz_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz history" ON public.quiz_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for bookmarked_questions table
CREATE POLICY "Users can view own bookmarks" ON public.bookmarked_questions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON public.bookmarked_questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks" ON public.bookmarked_questions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON public.bookmarked_questions
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_history_user_id ON public.quiz_history(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_history_created_at ON public.quiz_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_history_category ON public.quiz_history(category);

-- Create indexes for bookmarked_questions
CREATE INDEX IF NOT EXISTS idx_bookmarked_questions_user_id ON public.bookmarked_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarked_questions_created_at ON public.bookmarked_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarked_questions_category ON public.bookmarked_questions(category);
