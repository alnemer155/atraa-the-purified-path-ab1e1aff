
-- Quiz participants
CREATE TABLE public.quiz_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL UNIQUE,
  nickname TEXT NOT NULL,
  emoji TEXT NOT NULL,
  bio TEXT,
  bio_public BOOLEAN DEFAULT false,
  age INTEGER NOT NULL CHECK (age >= 5 AND age <= 60),
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Daily questions cache
CREATE TABLE public.quiz_daily_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_date DATE NOT NULL UNIQUE,
  questions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User answers
CREATE TABLE public.quiz_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.quiz_participants(id) ON DELETE CASCADE,
  question_date DATE NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(participant_id, question_date)
);

-- Share links
CREATE TABLE public.quiz_share_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_code TEXT NOT NULL UNIQUE,
  participant_id UUID NOT NULL REFERENCES public.quiz_participants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_daily_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_share_links ENABLE ROW LEVEL SECURITY;

-- Public read for leaderboard and questions
CREATE POLICY "Anyone can view participants" ON public.quiz_participants FOR SELECT USING (true);
CREATE POLICY "Anyone can view daily questions" ON public.quiz_daily_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can view answers" ON public.quiz_answers FOR SELECT USING (true);
CREATE POLICY "Anyone can view share links" ON public.quiz_share_links FOR SELECT USING (true);

-- Anon insert/update for quiz operations
CREATE POLICY "Anon can insert participants" ON public.quiz_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon can update participants" ON public.quiz_participants FOR UPDATE USING (true);
CREATE POLICY "Anon can insert questions" ON public.quiz_daily_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon can insert answers" ON public.quiz_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon can insert share links" ON public.quiz_share_links FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX idx_quiz_answers_participant ON public.quiz_answers(participant_id);
CREATE INDEX idx_quiz_answers_date ON public.quiz_answers(question_date);
CREATE INDEX idx_quiz_share_code ON public.quiz_share_links(share_code);
CREATE INDEX idx_quiz_participants_score ON public.quiz_participants(score DESC);
