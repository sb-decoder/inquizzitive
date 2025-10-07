-- Enable RLS on quiz_history table
ALTER TABLE public.quiz_history ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_history table
CREATE POLICY "Users can view own quiz history" ON public.quiz_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz history" ON public.quiz_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
