-- Create system_logs table for real-time logging
CREATE TABLE public.system_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'success', 'warning', 'error')),
  message TEXT NOT NULL,
  source TEXT DEFAULT 'system',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs or public logs (null user_id)
CREATE POLICY "Users can view own logs and public logs" 
ON public.system_logs 
FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);

-- Users can insert their own logs
CREATE POLICY "Users can insert own logs" 
ON public.system_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow anonymous inserts for system events
CREATE POLICY "Allow anonymous system logs" 
ON public.system_logs 
FOR INSERT 
WITH CHECK (user_id IS NULL);

-- Enable realtime for logs table
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_logs;

-- Create index for faster queries
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX idx_system_logs_user_id ON public.system_logs(user_id);