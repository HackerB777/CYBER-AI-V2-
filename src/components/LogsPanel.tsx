import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, XCircle, Terminal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSystemLogs, SystemLog } from "@/hooks/useSystemLogs";
import { Button } from "./ui/button";

export const LogsPanel = () => {
  const { logs, isLoading, addLog, clearLogs } = useSystemLogs();

  // Add initial system log on mount
  useEffect(() => {
    const initLog = async () => {
      await addLog("info", "Real-time system monitoring initialized", "system");
    };
    initLog();
  }, []);

  const getLogIcon = (level: SystemLog["level"]) => {
    switch (level) {
      case "info":
        return <Info className="w-4 h-4 text-primary" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-secondary" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "error":
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getLevelColor = (level: SystemLog["level"]) => {
    switch (level) {
      case "info":
        return "text-primary/80";
      case "success":
        return "text-secondary/80";
      case "warning":
        return "text-warning/80";
      case "error":
        return "text-destructive/80";
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", { hour12: false });
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-border rounded-lg overflow-hidden bg-card/30 backdrop-blur"
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border/30">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">SYSTEM LOGS</span>
            <div className="ml-auto flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearLogs}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary pulse-glow" />
                <span className="text-xs text-muted-foreground">LIVE</span>
              </div>
            </div>
          </div>

          {/* Logs List */}
          <div className="p-4 max-h-80 overflow-y-auto scroll-fade">
            {isLoading ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                Loading logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                No logs yet. System activity will appear here.
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0"
                  >
                    <span className="mt-0.5">{getLogIcon(log.level)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-muted-foreground font-mono">
                          [{formatTime(log.created_at)}]
                        </span>
                        <span className={cn("text-xs uppercase font-medium", getLevelColor(log.level))}>
                          {log.level}
                        </span>
                        {log.source !== "system" && (
                          <span className="text-xs text-muted-foreground/60">
                            [{log.source}]
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground/90 truncate">{log.message}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
