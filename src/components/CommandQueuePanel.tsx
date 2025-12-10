import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ListOrdered, 
  Play, 
  Square, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Clock,
  ChevronDown,
  ChevronUp,
  Terminal,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCommandQueue, QueuedCommand } from "@/hooks/useCommandQueue";
import { useKaliAgent } from "@/hooks/useKaliAgent";
import { useToast } from "@/hooks/use-toast";

const CommandItem = ({ 
  cmd, 
  index, 
  onRemove, 
  onMoveUp, 
  onMoveDown,
  isFirst,
  isLast,
  isProcessing
}: { 
  cmd: QueuedCommand; 
  index: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  isProcessing: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);

  const statusIcon = {
    pending: <Clock className="w-4 h-4 text-muted-foreground" />,
    running: <Loader2 className="w-4 h-4 text-primary animate-spin" />,
    completed: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    failed: <XCircle className="w-4 h-4 text-red-500" />,
  };

  const statusColors = {
    pending: "border-border/50",
    running: "border-primary/50 bg-primary/5",
    completed: "border-green-500/30 bg-green-500/5",
    failed: "border-red-500/30 bg-red-500/5",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`border rounded-lg ${statusColors[cmd.status]} overflow-hidden`}
    >
      <div className="flex items-center gap-2 p-3">
        <span className="text-xs text-muted-foreground w-6">{index + 1}</span>
        {statusIcon[cmd.status]}
        <code className="flex-1 text-xs font-mono truncate text-foreground">
          {cmd.command}
        </code>
        
        <div className="flex items-center gap-1">
          {cmd.status === "pending" && !isProcessing && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={onMoveUp}
                disabled={isFirst}
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={onMoveDown}
                disabled={isLast}
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={onRemove}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          )}
          {(cmd.output || cmd.error) && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setExpanded(!expanded)}
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (cmd.output || cmd.error) && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0">
              {cmd.output && (
                <pre className="text-xs font-mono bg-background/50 p-2 rounded max-h-32 overflow-auto text-muted-foreground">
                  {cmd.output}
                </pre>
              )}
              {cmd.error && (
                <pre className="text-xs font-mono bg-destructive/10 p-2 rounded text-destructive">
                  {cmd.error}
                </pre>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const CommandQueuePanel = () => {
  const [input, setInput] = useState("");
  const { 
    queue, 
    isProcessing, 
    progress, 
    addToQueue, 
    addMultipleToQueue,
    removeFromQueue, 
    clearQueue, 
    startProcessing, 
    stopProcessing,
    reorderQueue
  } = useCommandQueue();
  const { agentStatus, executeCommand } = useKaliAgent();
  const { toast } = useToast();

  const handleAddCommands = () => {
    const commands = input.split("\n").filter(cmd => cmd.trim());
    if (commands.length === 0) return;
    
    addMultipleToQueue(commands);
    setInput("");
    toast({
      title: "Commands Added",
      description: `${commands.length} command(s) added to queue`,
    });
  };

  const handleStartQueue = async () => {
    if (agentStatus.status !== "online") {
      toast({
        title: "Agent Offline",
        description: "Connect to Kali agent to execute commands",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Queue Started",
      description: "Executing commands sequentially...",
    });

    await startProcessing(executeCommand);

    const completed = queue.filter(q => q.status === "completed").length;
    const failed = queue.filter(q => q.status === "failed").length;
    
    toast({
      title: "Queue Complete",
      description: `${completed} succeeded, ${failed} failed`,
    });
  };

  const pendingCount = queue.filter(q => q.status === "pending").length;
  const completedCount = queue.filter(q => q.status === "completed").length;
  const failedCount = queue.filter(q => q.status === "failed").length;

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-border rounded-lg bg-card/30 backdrop-blur overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <ListOrdered className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Command Queue</h2>
                <p className="text-xs text-muted-foreground">
                  Batch execute multiple commands sequentially
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Agent Status */}
              <div className="flex items-center gap-2 mr-4">
                <div className={`w-2 h-2 rounded-full ${agentStatus.status === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                <span className="text-xs text-muted-foreground">
                  {agentStatus.status === "online" ? "Online" : "Offline"}
                </span>
              </div>

              {isProcessing ? (
                <Button variant="destructive" size="sm" onClick={stopProcessing}>
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  onClick={handleStartQueue}
                  disabled={pendingCount === 0 || agentStatus.status !== "online"}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Execute ({pendingCount})
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearQueue}
                disabled={isProcessing}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          {queue.length > 0 && (
            <div className="px-4 py-2 border-b border-border/30">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{completedCount + failedCount} / {queue.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center gap-4 mt-2 text-xs">
                <span className="text-muted-foreground">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Pending: {pendingCount}
                </span>
                <span className="text-green-500">
                  <CheckCircle2 className="w-3 h-3 inline mr-1" />
                  Completed: {completedCount}
                </span>
                <span className="text-red-500">
                  <XCircle className="w-3 h-3 inline mr-1" />
                  Failed: {failedCount}
                </span>
              </div>
            </div>
          )}

          {/* Add Commands */}
          <div className="p-4 border-b border-border/30">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter commands (one per line)&#10;e.g.&#10;nmap -sV 192.168.1.1&#10;nikto -h http://target.com&#10;dirb http://target.com"
                className="min-h-[80px] resize-none bg-background/50 font-mono text-sm"
              />
              <Button
                onClick={handleAddCommands}
                disabled={!input.trim() || isProcessing}
                className="self-end"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Queue List */}
          <ScrollArea className="h-[300px]">
            <div className="p-4 space-y-2">
              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <Terminal className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-sm">No commands in queue</p>
                  <p className="text-xs mt-1">Add commands above to batch execute</p>
                </div>
              ) : (
                <AnimatePresence>
                  {queue.map((cmd, index) => (
                    <CommandItem
                      key={cmd.id}
                      cmd={cmd}
                      index={index}
                      onRemove={() => removeFromQueue(cmd.id)}
                      onMoveUp={() => reorderQueue(index, index - 1)}
                      onMoveDown={() => reorderQueue(index, index + 1)}
                      isFirst={index === 0}
                      isLast={index === queue.length - 1}
                      isProcessing={isProcessing}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-3 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="w-3 h-3" />
              <span>Commands execute sequentially on your Kali VM. Ensure agent is running.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};