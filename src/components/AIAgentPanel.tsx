import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Trash2, Copy, Check, Terminal, AlertTriangle, Play, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CyberToggle } from "@/components/ui/cyber-toggle";
import { usePentestAgent } from "@/hooks/usePentestAgent";
import { useKaliAgent } from "@/hooks/useKaliAgent";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const AIAgentPanel = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [autoExecute, setAutoExecute] = useState(false);
  const [executingCommand, setExecutingCommand] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { streamChat, isLoading, clearHistory, analyzeOutput } = usePentestAgent();
  const { agentStatus, executeCommand, isExecuting, extractCommand } = useKaliAgent();
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleExecuteCommand = async (command: string) => {
    if (agentStatus.status !== "online" || isExecuting) return;

    setExecutingCommand(command);
    toast({
      title: "Executing Command",
      description: command.slice(0, 50) + (command.length > 50 ? "..." : ""),
    });

    try {
      const result = await executeCommand(command);
      
      // Add execution result as a new message
      const executionMessage: Message = {
        role: "assistant",
        content: `**Command Executed:**\n\`\`\`bash\n${command}\n\`\`\`\n\n**Output:**\n\`\`\`\n${result.output || result.error || "No output"}\n\`\`\``,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, executionMessage]);

      // Auto-analyze the output
      if (result.success && result.output) {
        let analysisContent = "";
        setStreamingContent("");
        
        await streamChat({
          action: "analyze_output",
          commandOutput: result.output,
          onDelta: (text) => {
            analysisContent += text;
            setStreamingContent(analysisContent);
          },
          onDone: () => {
            if (analysisContent) {
              setMessages(prev => [
                ...prev,
                { role: "assistant", content: `**AI Analysis:**\n${analysisContent}`, timestamp: new Date() },
              ]);
            }
            setStreamingContent("");
          },
        });
      }

      toast({
        title: result.success ? "Command Completed" : "Command Failed",
        description: result.success ? "Output captured and analyzed" : result.error,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Execution Error",
        description: error instanceof Error ? error.message : "Failed to execute",
        variant: "destructive",
      });
    } finally {
      setExecutingCommand(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setStreamingContent("");

    try {
      let fullResponse = "";
      await streamChat({
        action: "chat",
        commandOutput: userMessage.content,
        onDelta: (text) => {
          fullResponse += text;
          setStreamingContent(fullResponse);
        },
        onDone: async () => {
          setMessages(prev => [
            ...prev,
            { role: "assistant", content: fullResponse, timestamp: new Date() },
          ]);
          setStreamingContent("");

          // Auto-execute if enabled and Kali agent is connected
          if (autoExecute && agentStatus.status === "online") {
            const command = extractCommand(fullResponse);
            if (command) {
              await handleExecuteCommand(command);
            }
          }
        },
      });
    } catch (error) {
      toast({
        title: "Agent Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setMessages([]);
    clearHistory();
    toast({ title: "Chat cleared", description: "Conversation history reset" });
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderMessage = (content: string, isAssistant: boolean, messageIndex: number) => {
    if (!isAssistant) {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }

    const parts = content.split(/(```(?:bash|sh|shell)?\n[\s\S]*?```)/g);
    let codeBlockIndex = 0;

    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const code = part.replace(/```(?:bash|sh|shell)?\n/, "").replace(/```$/, "").trim();
        const currentIndex = `${messageIndex}-${codeBlockIndex++}`;
        const isCurrentlyExecuting = executingCommand === code;
        
        return (
          <div key={i} className="my-2 relative group">
            <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-t border border-b-0 border-border/50">
              <Terminal className="w-3 h-3 text-primary" />
              <span className="text-xs text-muted-foreground">Command</span>
              <div className="ml-auto flex items-center gap-1">
                {agentStatus.status === "online" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-primary hover:text-primary"
                    onClick={() => handleExecuteCommand(code)}
                    disabled={isExecuting || isCurrentlyExecuting}
                  >
                    {isCurrentlyExecuting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                  onClick={() => copyToClipboard(code, parseInt(currentIndex.replace("-", "")))}
                >
                  {copiedIndex === parseInt(currentIndex.replace("-", "")) ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
            <pre className="bg-background/80 p-3 rounded-b border border-border/50 overflow-x-auto">
              <code className="text-sm text-primary font-mono">{code}</code>
            </pre>
          </div>
        );
      }
      return <p key={i} className="whitespace-pre-wrap my-1">{part}</p>;
    });
  };

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
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">AI Pentest Agent</h2>
                <p className="text-xs text-muted-foreground">
                  Ask for commands, paste outputs for analysis, get recommendations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Auto-Execute Toggle */}
              <div className="flex items-center gap-2">
                <CyberToggle
                  checked={autoExecute}
                  onCheckedChange={setAutoExecute}
                  disabled={agentStatus.status !== "online"}
                />
                <div className="flex items-center gap-1">
                  <Zap className={`w-4 h-4 ${autoExecute && agentStatus.status === "online" ? "text-yellow-500" : "text-muted-foreground"}`} />
                  <span className="text-xs text-muted-foreground">Auto-Execute</span>
                </div>
              </div>
              
              {/* Agent Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${agentStatus.status === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                <span className="text-xs text-muted-foreground">
                  {agentStatus.status === "online" ? "Kali Agent Online" : "Agent Offline"}
                </span>
              </div>

              <Button variant="ghost" size="sm" onClick={handleClear}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
            {messages.length === 0 && !streamingContent && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Bot className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-sm">Ask me anything about penetration testing</p>
                <div className="mt-4 text-xs space-y-1 text-center">
                  <p>"Generate an nmap scan command for 192.168.1.0/24"</p>
                  <p>"Analyze this Hydra output..."</p>
                  <p>"What's the best approach to test a web app?"</p>
                </div>
                {autoExecute && agentStatus.status === "online" && (
                  <div className="mt-4 px-3 py-2 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    Auto-execute enabled - commands will run automatically
                  </div>
                )}
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 ${msg.role === "user" ? "text-right" : ""}`}
                >
                  <div
                    className={`inline-block max-w-[85%] p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary/20 text-foreground"
                        : "bg-muted/50 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                      {msg.role === "assistant" && <Bot className="w-3 h-3" />}
                      <span>{msg.role === "user" ? "You" : "Agent"}</span>
                      <span>•</span>
                      <span>{msg.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <div className="text-sm">
                      {renderMessage(msg.content, msg.role === "assistant", idx)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {streamingContent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4"
              >
                <div className="inline-block max-w-[85%] p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                    <Bot className="w-3 h-3 animate-pulse" />
                    <span>Agent</span>
                    <span className="animate-pulse">typing...</span>
                  </div>
                  <div className="text-sm">
                    {renderMessage(streamingContent, true, -1)}
                  </div>
                </div>
              </motion.div>
            )}

            {isExecuting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4"
              >
                <div className="inline-block p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Executing command on Kali agent...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border/30">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for commands, paste scan outputs, or request analysis..."
                className="min-h-[60px] resize-none bg-background/50"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <AlertTriangle className="w-3 h-3" />
              <span>
                {autoExecute && agentStatus.status === "online" 
                  ? "Auto-execute ON - commands will run automatically on your Kali VM"
                  : "For authorized testing only. Commands can be executed via Kali agent or copied manually."}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};