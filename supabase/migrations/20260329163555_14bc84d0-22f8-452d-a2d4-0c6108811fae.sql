-- Chat conversations table
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  title text NOT NULL DEFAULT 'محادثة جديدة',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view their conversations" ON public.chat_conversations
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can insert conversations" ON public.chat_conversations
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can update conversations" ON public.chat_conversations
  FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete conversations" ON public.chat_conversations
  FOR DELETE TO public USING (true);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  sources jsonb DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view messages" ON public.chat_messages
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can insert messages" ON public.chat_messages
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can delete messages" ON public.chat_messages
  FOR DELETE TO public USING (true);