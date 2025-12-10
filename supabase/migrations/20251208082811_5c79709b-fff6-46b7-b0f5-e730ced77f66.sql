-- Create targets table for target management
CREATE TABLE public.targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  ip_address TEXT,
  hostname TEXT,
  os_type TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  last_scanned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own targets" ON public.targets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own targets" ON public.targets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own targets" ON public.targets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own targets" ON public.targets FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_targets_updated_at BEFORE UPDATE ON public.targets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create vulnerabilities table
CREATE TABLE public.vulnerabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_id UUID REFERENCES public.targets(id) ON DELETE CASCADE,
  cve_id TEXT,
  name TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  description TEXT,
  solution TEXT,
  cvss_score DECIMAL(3,1),
  status TEXT DEFAULT 'open',
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vulnerabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vulnerabilities" ON public.vulnerabilities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vulnerabilities" ON public.vulnerabilities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vulnerabilities" ON public.vulnerabilities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vulnerabilities" ON public.vulnerabilities FOR DELETE USING (auth.uid() = user_id);

-- Create sessions table for session dashboard
CREATE TABLE public.pentest_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_id UUID REFERENCES public.targets(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  credentials JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pentest_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.pentest_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.pentest_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.pentest_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.pentest_sessions FOR DELETE USING (auth.uid() = user_id);

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_id UUID REFERENCES public.targets(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.pentest_sessions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  format TEXT DEFAULT 'markdown',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports" ON public.reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reports" ON public.reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reports" ON public.reports FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();