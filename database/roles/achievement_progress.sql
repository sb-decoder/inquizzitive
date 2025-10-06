-- Enable RLS on achievement_progress table
ALTER TABLE public.achievement_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for achievement_progress
CREATE POLICY "Users can view own achievements" ON public.achievement_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.achievement_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON public.achievement_progress
  FOR UPDATE USING (auth.uid() = user_id);
