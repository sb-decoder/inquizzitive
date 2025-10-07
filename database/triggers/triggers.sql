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
