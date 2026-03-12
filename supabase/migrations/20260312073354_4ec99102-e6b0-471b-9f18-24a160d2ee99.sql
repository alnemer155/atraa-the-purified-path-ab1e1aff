
-- Remove overly permissive INSERT/UPDATE policies (edge functions use service role which bypasses RLS)
DROP POLICY "Anon can insert participants" ON public.quiz_participants;
DROP POLICY "Anon can update participants" ON public.quiz_participants;
DROP POLICY "Anon can insert questions" ON public.quiz_daily_questions;
DROP POLICY "Anon can insert answers" ON public.quiz_answers;
DROP POLICY "Anon can insert share links" ON public.quiz_share_links;
