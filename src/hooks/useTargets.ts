import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Target {
  id: string;
  user_id: string;
  name: string;
  ip_address: string | null;
  hostname: string | null;
  os_type: string | null;
  notes: string | null;
  status: string;
  last_scanned_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useTargets = () => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchTargets = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('targets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTargets(data);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  const addTarget = async (target: Omit<Target, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'last_scanned_at'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('targets')
      .insert({ ...target, user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      setTargets(prev => [data, ...prev]);
      return data;
    }
    return null;
  };

  const updateTarget = async (id: string, updates: Partial<Target>) => {
    const { data, error } = await supabase
      .from('targets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setTargets(prev => prev.map(t => t.id === id ? data : t));
      return data;
    }
    return null;
  };

  const deleteTarget = async (id: string) => {
    const { error } = await supabase
      .from('targets')
      .delete()
      .eq('id', id);

    if (!error) {
      setTargets(prev => prev.filter(t => t.id !== id));
      return true;
    }
    return false;
  };

  return { targets, isLoading, addTarget, updateTarget, deleteTarget, refetch: fetchTargets };
};
