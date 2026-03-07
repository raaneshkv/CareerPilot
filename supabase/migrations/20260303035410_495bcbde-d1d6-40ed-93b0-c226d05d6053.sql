
-- Interview sessions table
CREATE TABLE public.interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL,
  skills text[] DEFAULT '{}',
  overall_score integer,
  status text NOT NULL DEFAULT 'in_progress',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.interview_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.interview_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.interview_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.interview_sessions FOR DELETE USING (auth.uid() = user_id);

-- Interview questions table
CREATE TABLE public.interview_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  question text NOT NULL,
  type text NOT NULL,
  difficulty text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own questions" ON public.interview_questions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.interview_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));
CREATE POLICY "Users can insert own questions" ON public.interview_questions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.interview_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));

-- Interview answers table
CREATE TABLE public.interview_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.interview_questions(id) ON DELETE CASCADE,
  answer text NOT NULL DEFAULT '',
  technical_score integer,
  clarity_score integer,
  structure_score integer,
  feedback text,
  skipped boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own answers" ON public.interview_answers FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.interview_questions q 
    JOIN public.interview_sessions s ON s.id = q.session_id 
    WHERE q.id = question_id AND s.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert own answers" ON public.interview_answers FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.interview_questions q 
    JOIN public.interview_sessions s ON s.id = q.session_id 
    WHERE q.id = question_id AND s.user_id = auth.uid()
  ));
