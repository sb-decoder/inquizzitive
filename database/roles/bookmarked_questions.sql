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
