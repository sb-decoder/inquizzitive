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
