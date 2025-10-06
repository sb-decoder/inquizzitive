-- Master setup file to import all SQL modules in correct order

-- Import table definitions
\i tables/profiles.sql
\i tables/quiz_history.sql
\i tables/bookmarked_questions.sql
\i tables/user_analytics.sql
\i tables/study_streaks.sql
\i tables/user_preferences.sql
\i tables/bookmarks.sql
\i tables/achievement_progress.sql

-- Import RLS and policies
\i roles/profiles.sql
\i roles/quiz_history.sql
\i roles/bookmarked_questions.sql
\i roles/user_analytics.sql
\i roles/study_streaks.sql
\i roles/user_preferences.sql
\i roles/bookmarks.sql
\i roles/achievement_progress.sql

-- Import functions and triggers
\i triggers/functions.sql
\i triggers/triggers.sql

-- Import views
\i views/views.sql
