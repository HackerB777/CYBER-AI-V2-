import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Terminal, Clock, CheckCircle, XCircle, Zap, Trash2, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { useCommandHistory, CommandHistoryEntry } from "@/hooks/useCommandHistory";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const CommandEntry = ({ entry }: { entry: CommandHistoryEntry }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyCommand = async () => {
    await navigator.clipboard.writeText(entry.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Command copied to clipboard" });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "border rounded-lg overflow-hidden",
        entry.success ? "border-green-500/30 bg-green-500/5" : "border-destructive/30 bg-destructive/5"
      )}
    >
      <div
        className="p-3 cursor-pointer hover:bg-background/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {entry.success ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium text-foreground">{entry.tool}</span>
                {entry.autoExecuted && (
                  <span className="flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">
                    <Zap className="w-3 h-3" />
                    AUTO
                  </span>
                )}
              </div>
              {entry.target && (
                <span className="text-xs text-muted-foreground">Target: {entry.target}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatTime(entry.timestamp)}
            </div>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border/30"
          >
            <div className="p-3 space-y-3">
              {/* Command */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Terminal className="w-3 h-3" /> Command
                  </span>
                  <Button size="sm" variant="ghost" className="h-6 px-2" onClick={copyCommand}>
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
                <pre className="p-2 rounded bg-background/80 text-xs font-mono text-primary overflow-x-auto">
                  {entry.command}
                </pre>
              </div>

              {/* Output */}
              {entry.output && (
                <div>
                  <span className="text-xs text-muted-foreground mb-1 block">Output</span>
                  <pre className="p-2 rounded bg-black/50 text-xs font-mono text-green-400 max-h-32 overflow-auto whitespace-pre-wrap">
                    {entry.output}
                  </pre>
                </div>
              )}

              {/* Analysis */}
              {entry.analysis && (
                <div>
                  <span className="text-xs text-muted-foreground mb-1 block">AI Analysis</span>
                  <div className="p-2 rounded bg-primary/5 text-xs max-h-32 overflow-auto whitespace-pre-wrap">
                    {entry.analysis}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const CommandHistoryPanel = () => {
  const { history, clearHistory } = useCommandHistory();

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="cyber-border rounded-lg bg-card/30 backdrop-blur overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-primary/10">
                <History className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Command History</h2>
                <p className="text-xs text-muted-foreground">
                  {history.length} command{history.length !== 1 ? "s" : ""} executed
                </p>
              </div>
            </div>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* History List */}
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-center py-8">
                <Terminal className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No commands executed yet</p>
                <p className="text-xs text-muted-foreground/70">
                  Enable a tool and execute commands to see history here
                </p>
              </div>
            ) : (
              history.map((entry) => <CommandEntry key={entry.id} entry={entry} />)
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
