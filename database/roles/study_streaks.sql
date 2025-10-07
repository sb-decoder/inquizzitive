-- Enable RLS on study_streaks table
ALTER TABLE public.study_streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for study_streaks
CREATE POLICY "Users can view own streaks" ON public.study_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON public.study_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON public.study_streaks
  FOR UPDATE USING (auth.uid() = user_id);
