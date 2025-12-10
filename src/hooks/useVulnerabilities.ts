import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Vulnerability {
  id: string;
  user_id: string;
  target_id: string | null;
  cve_id: string | null;
  name: string;
  severity: string;
  description: string | null;
  solution: string | null;
  cvss_score: number | null;
  status: string;
  discovered_at: string;
  created_at: string;
}

export const useVulnerabilities = () => {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchVulnerabilities = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('vulnerabilities')
      .select('*')
      .order('discovered_at', { ascending: false });

    if (!error && data) {
      setVulnerabilities(data);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchVulnerabilities();
  }, [fetchVulnerabilities]);

  const addVulnerability = async (vuln: Omit<Vulnerability, 'id' | 'user_id' | 'created_at' | 'discovered_at'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('vulnerabilities')
      .insert({ ...vuln, user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      setVulnerabilities(prev => [data, ...prev]);
      return data;
    }
    return null;
  };

  const updateVulnerability = async (id: string, updates: Partial<Vulnerability>) => {
    const { data, error } = await supabase
      .from('vulnerabilities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setVulnerabilities(prev => prev.map(v => v.id === id ? data : v));
      return data;
    }
    return null;
  };

  const deleteVulnerability = async (id: string) => {
    const { error } = await supabase
      .from('vulnerabilities')
      .delete()
      .eq('id', id);

    if (!error) {
      setVulnerabilities(prev => prev.filter(v => v.id !== id));
      return true;
    }
    return false;
  };

  return { vulnerabilities, isLoading, addVulnerability, updateVulnerability, deleteVulnerability, refetch: fetchVulnerabilities };
};
