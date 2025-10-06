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
