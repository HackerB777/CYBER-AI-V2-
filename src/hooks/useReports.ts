import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Report {
  id: string;
  user_id: string;
  target_id: string | null;
  session_id: string | null;
  title: string;
  content: string | null;
  format: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchReports = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReports(data);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const addReport = async (report: Omit<Report, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('reports')
      .insert({ ...report, user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      setReports(prev => [data, ...prev]);
      return data;
    }
    return null;
  };

  const updateReport = async (id: string, updates: Partial<Report>) => {
    const { data, error } = await supabase
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setReports(prev => prev.map(r => r.id === id ? data : r));
      return data;
    }
    return null;
  };

  const deleteReport = async (id: string) => {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    if (!error) {
      setReports(prev => prev.filter(r => r.id !== id));
      return true;
    }
    return false;
  };

  const exportReport = (report: Report) => {
    const blob = new Blob([report.content || ''], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return { reports, isLoading, addReport, updateReport, deleteReport, exportReport, refetch: fetchReports };
};
