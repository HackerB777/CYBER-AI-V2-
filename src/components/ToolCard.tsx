import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CyberToggle } from "./ui/cyber-toggle";
import { Play, Square, Terminal, Loader2, Bot, Copy, Check, Send, Zap, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePentestAgent } from "@/hooks/usePentestAgent";
import { useKaliAgent } from "@/hooks/useKaliAgent";
import { useCommandHistory } from "@/hooks/useCommandHistory";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

interface ToolCardProps {
  name: string;
  description: string;
  command: string;
  variant: "offensive" | "defensive";
  icon: React.ReactNode;
}

export const ToolCard = ({ name, description, command, variant, icon }: ToolCardProps) => {
  const [enabled, setEnabled] = useState(false);
  const [target, setTarget] = useState("");
  const [generatedCommand, setGeneratedCommand] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [outputInput, setOutputInput] = useState("");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [copied, setCopied] = useState(false);
  const [executionOutput, setExecutionOutput] = useState("");
  const [autoMode, setAutoMode] = useState(false);
  
  const { generateCommand, analyzeOutput, isLoading } = usePentestAgent();
  const { agentStatus, isExecuting, executeCommand, extractCommand } = useKaliAgent();
  const { addEntry } = useCommandHistory();
  const { toast } = useToast();

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    if (!checked) {
      setGeneratedCommand("");
      setAiAnalysis("");
      setOutputInput("");
      setShowAnalysis(false);
    }
  };

  const handleGenerateCommand = async () => {
    if (!enabled) return;
    try {
      const result = await generateCommand(name, target || undefined);
      setGeneratedCommand(result);
      
      if (autoMode && agentStatus.status === "online") {
        // Auto-execute mode: extract and run the command
        const cmd = extractCommand(result);
        if (cmd) {
          toast({ title: "Auto-Executing", description: cmd });
          const execResult = await executeCommand(cmd);
          if (execResult.success) {
            setExecutionOutput(execResult.output);
            setOutputInput(execResult.output);
            toast({ title: "Executed", description: "Command completed successfully" });
            // Auto-analyze the output
            const analysis = await analyzeOutput(name, execResult.output);
            setAiAnalysis(analysis);
            setShowAnalysis(true);
            // Log to command history
            addEntry({
              tool: name,
              command: cmd,
              target: target || undefined,
              output: execResult.output,
              analysis: analysis,
              success: true,
              autoExecuted: true,
            });
          } else {
            setExecutionOutput(execResult.error || "Execution failed");
            toast({ title: "Execution Failed", description: execResult.error, variant: "destructive" });
            // Log failed execution
            addEntry({
              tool: name,
              command: cmd,
              target: target || undefined,
              output: execResult.error || "Execution failed",
              success: false,
              autoExecuted: true,
            });
          }
        }
      } else {
        toast({ title: "Command Generated", description: "Copy and run in your Kali terminal" });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to generate command",
        variant: "destructive" 
      });
    }
  };

  const handleAnalyzeOutput = async () => {
    if (!outputInput.trim()) {
      toast({ title: "No output", description: "Paste your command output first", variant: "destructive" });
      return;
    }
    try {
      const result = await analyzeOutput(name, outputInput);
      setAiAnalysis(result);
      setShowAnalysis(true);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to analyze output",
        variant: "destructive" 
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    // Extract command from markdown code blocks
    const codeMatch = text.match(/```(?:bash|sh|shell)?\n([\s\S]*?)```/);
    const commandText = codeMatch ? codeMatch[1].trim() : text;
    await navigator.clipboard.writeText(commandText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Command copied to clipboard" });
  };

  const isOffensive = variant === "offensive";

  const renderMarkdown = (content: string) => {
    const parts = content.split(/(```(?:bash|sh|shell)?\n[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const code = part.replace(/```(?:bash|sh|shell)?\n/, "").replace(/```$/, "").trim();
        return (
          <div key={i} className="my-2">
            <div className="flex items-center justify-between bg-background/50 px-2 py-1 rounded-t border border-b-0 border-border/50">
              <div className="flex items-center gap-2">
                <Terminal className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">Command</span>
              </div>
              <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => copyToClipboard(code)}>
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
            <pre className="bg-background/80 p-2 rounded-b border border-border/50 overflow-x-auto">
              <code className="text-xs text-primary font-mono">{code}</code>
            </pre>
          </div>
        );
      }
      return <p key={i} className="text-xs whitespace-pre-wrap my-1">{part}</p>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "cyber-border rounded-lg overflow-hidden bg-card/50 backdrop-blur transition-all duration-300",
        enabled && isOffensive && "border-destructive/50 shadow-[0_0_20px_hsl(var(--destructive)/0.2)]",
        enabled && !isOffensive && "border-secondary/50 shadow-[0_0_20px_hsl(var(--secondary)/0.2)]"
      )}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded bg-muted/50",
              enabled && isOffensive && "text-destructive",
              enabled && !isOffensive && "text-secondary",
              !enabled && "text-muted-foreground"
            )}>
              {icon}
            </div>
            <div>
              <h3 className={cn(
                "font-semibold tracking-wide",
                enabled && isOffensive && "text-destructive",
                enabled && !isOffensive && "text-secondary",
                !enabled && "text-foreground"
              )}>
                {name}
              </h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <CyberToggle
            checked={enabled}
            onCheckedChange={handleToggle}
            variant={isOffensive ? "destructive" : "secondary"}
          />
        </div>

        {/* Command Preview */}
        <div className="flex items-center gap-2 p-2 rounded bg-muted/30 text-xs">
          <Terminal className="w-3 h-3 text-muted-foreground" />
          <code className="text-muted-foreground">$ {command}</code>
        </div>
      </div>

      {/* Card Body - AI Execution Area */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 space-y-3">
              {/* Auto-Execute Toggle */}
              {agentStatus.status === "online" && (
                <div className="flex items-center justify-between p-2 rounded bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-500 font-mono">AUTO-EXECUTE</span>
                  </div>
                  <CyberToggle
                    checked={autoMode}
                    onCheckedChange={setAutoMode}
                    variant="secondary"
                  />
                </div>
              )}

              {/* Target Input */}
              <div className="flex gap-2">
                <Input
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="Target IP/hostname (optional)"
                  className="text-xs h-8 bg-background/50"
                />
                <Button
                  onClick={handleGenerateCommand}
                  disabled={isLoading || isExecuting}
                  size="sm"
                  className={cn(
                    "h-8",
                    autoMode && agentStatus.status === "online" 
                      ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" 
                      : isOffensive 
                        ? "bg-destructive/20 text-destructive hover:bg-destructive/30" 
                        : "bg-secondary/20 text-secondary hover:bg-secondary/30"
                  )}
                >
                  {isLoading || isExecuting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : autoMode && agentStatus.status === "online" ? (
                    <Zap className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                  <span className="ml-2">{autoMode && agentStatus.status === "online" ? "Execute" : "Generate"}</span>
                </Button>
              </div>

              {/* Execution Output */}
              {executionOutput && (
                <div className="p-3 rounded bg-black/50 border border-green-500/30 max-h-40 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-2 text-xs text-green-500">
                    <Terminal className="w-3 h-3" />
                    <span>Execution Output</span>
                  </div>
                  <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{executionOutput}</pre>
                </div>
              )}

              {/* Generated Command */}
              {generatedCommand && (
                <div className="p-3 rounded bg-background/80 border border-border/30 max-h-60 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                    <Bot className="w-3 h-3 text-primary" />
                    <span>AI Generated Command</span>
                  </div>
                  {renderMarkdown(generatedCommand)}
                </div>
              )}

              {/* Output Analysis Section */}
              <div className="border-t border-border/30 pt-3">
                <p className="text-xs text-muted-foreground mb-2">Paste command output for AI analysis:</p>
                <textarea
                  value={outputInput}
                  onChange={(e) => setOutputInput(e.target.value)}
                  placeholder="Paste your terminal output here..."
                  className="w-full h-20 p-2 text-xs font-mono bg-background/50 border border-border/30 rounded resize-none"
                />
                <Button
                  onClick={handleAnalyzeOutput}
                  disabled={isLoading || !outputInput.trim()}
                  size="sm"
                  className="mt-2 w-full"
                  variant="outline"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Analyze Output
                </Button>
              </div>

              {/* AI Analysis Result */}
              {showAnalysis && aiAnalysis && (
                <div className="p-3 rounded bg-primary/5 border border-primary/20 max-h-60 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-2 text-xs text-primary">
                    <Bot className="w-3 h-3" />
                    <span>AI Analysis</span>
                  </div>
                  {renderMarkdown(aiAnalysis)}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
