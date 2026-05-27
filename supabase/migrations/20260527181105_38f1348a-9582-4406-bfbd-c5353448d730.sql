
CREATE TABLE public.cumples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nombre VARCHAR(40) NOT NULL,
  dia SMALLINT NOT NULL CHECK (dia BETWEEN 1 AND 31),
  mes SMALLINT NOT NULL CHECK (mes BETWEEN 1 AND 12),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cumples TO authenticated;
GRANT ALL ON public.cumples TO service_role;
ALTER TABLE public.cumples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own cumples" ON public.cumples FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own cumples" ON public.cumples FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own cumples" ON public.cumples FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own cumples" ON public.cumples FOR DELETE TO authenticated USING (auth.uid() = user_id);
