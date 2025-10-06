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
