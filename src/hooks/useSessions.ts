import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Json } from '@/integrations/supabase/types';

export interface PentestSession {
  id: string;
  user_id: string;
  target_id: string | null;
  name: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  notes: string | null;
  credentials: Json;
  created_at: string;
}

export const useSessions = () => {
  const [sessions, setSessions] = useState<PentestSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchSessions = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('pentest_sessions')
      .select('*')
      .order('started_at', { ascending: false });

    if (!error && data) {
      setSessions(data);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const addSession = async (session: { name: string; target_id?: string | null; notes?: string; status?: string }) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('pentest_sessions')
      .insert({ ...session, user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      setSessions(prev => [data, ...prev]);
      return data;
    }
    return null;
  };

  const updateSession = async (id: string, updates: { status?: string; ended_at?: string; notes?: string; credentials?: Json }) => {
    const { data, error } = await supabase
      .from('pentest_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setSessions(prev => prev.map(s => s.id === id ? data : s));
      return data;
    }
    return null;
  };

  const deleteSession = async (id: string) => {
    const { error } = await supabase
      .from('pentest_sessions')
      .delete()
      .eq('id', id);

    if (!error) {
      setSessions(prev => prev.filter(s => s.id !== id));
      return true;
    }
    return false;
  };

  const endSession = async (id: string) => {
    return updateSession(id, { status: 'completed', ended_at: new Date().toISOString() });
  };

  return { sessions, isLoading, addSession, updateSession, deleteSession, endSession, refetch: fetchSessions };
};
