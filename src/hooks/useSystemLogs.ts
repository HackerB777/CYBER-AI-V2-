import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface SystemLog {
  id: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
  source: string;
  created_at: string;
}

export const useSystemLogs = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fetch initial logs
  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("system_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setLogs(data as SystemLog[]);
      }
      setIsLoading(false);
    };

    fetchLogs();
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("system-logs-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "system_logs",
        },
        (payload) => {
          const newLog = payload.new as SystemLog;
          setLogs((prev) => [newLog, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Function to add a new log
  const addLog = async (
    level: SystemLog["level"],
    message: string,
    source: string = "system"
  ) => {
    const { error } = await supabase.from("system_logs").insert({
      level,
      message,
      source,
      user_id: user?.id || null,
    });

    if (error) {
      console.error("Failed to add log:", error);
    }
  };

  // Clear all logs for user
  const clearLogs = async () => {
    setLogs([]);
  };

  return { logs, isLoading, addLog, clearLogs };
};
