import { useState, useCallback, useRef } from "react";

export interface QueuedCommand {
  id: string;
  command: string;
  status: "pending" | "running" | "completed" | "failed";
  output?: string;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

interface UseCommandQueueReturn {
  queue: QueuedCommand[];
  isProcessing: boolean;
  currentIndex: number;
  progress: number;
  addToQueue: (command: string) => void;
  addMultipleToQueue: (commands: string[]) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  startProcessing: (executeCommand: (cmd: string) => Promise<{ success: boolean; output: string; error: string }>) => Promise<void>;
  stopProcessing: () => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
}

export const useCommandQueue = (): UseCommandQueueReturn => {
  const [queue, setQueue] = useState<QueuedCommand[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const stopRef = useRef(false);

  const generateId = () => `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addToQueue = useCallback((command: string) => {
    const newCommand: QueuedCommand = {
      id: generateId(),
      command: command.trim(),
      status: "pending",
    };
    setQueue(prev => [...prev, newCommand]);
  }, []);

  const addMultipleToQueue = useCallback((commands: string[]) => {
    const newCommands: QueuedCommand[] = commands
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0)
      .map(command => ({
        id: generateId(),
        command,
        status: "pending" as const,
      }));
    setQueue(prev => [...prev, ...newCommands]);
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(cmd => cmd.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    if (!isProcessing) {
      setQueue([]);
      setCurrentIndex(-1);
    }
  }, [isProcessing]);

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueue(prev => {
      const newQueue = [...prev];
      const [removed] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, removed);
      return newQueue;
    });
  }, []);

  const stopProcessing = useCallback(() => {
    stopRef.current = true;
  }, []);

  const startProcessing = useCallback(async (
    executeCommand: (cmd: string) => Promise<{ success: boolean; output: string; error: string }>
  ) => {
    if (isProcessing || queue.length === 0) return;

    setIsProcessing(true);
    stopRef.current = false;

    const pendingCommands = queue.filter(cmd => cmd.status === "pending");
    
    for (let i = 0; i < pendingCommands.length; i++) {
      if (stopRef.current) break;

      const cmd = pendingCommands[i];
      const queueIndex = queue.findIndex(q => q.id === cmd.id);
      setCurrentIndex(queueIndex);

      // Update status to running
      setQueue(prev => prev.map(q => 
        q.id === cmd.id ? { ...q, status: "running" as const, startedAt: new Date() } : q
      ));

      try {
        const result = await executeCommand(cmd.command);
        
        setQueue(prev => prev.map(q => 
          q.id === cmd.id ? {
            ...q,
            status: result.success ? "completed" as const : "failed" as const,
            output: result.output,
            error: result.error,
            completedAt: new Date(),
          } : q
        ));
      } catch (error) {
        setQueue(prev => prev.map(q => 
          q.id === cmd.id ? {
            ...q,
            status: "failed" as const,
            error: error instanceof Error ? error.message : "Unknown error",
            completedAt: new Date(),
          } : q
        ));
      }
    }

    setIsProcessing(false);
    setCurrentIndex(-1);
  }, [isProcessing, queue]);

  const completedCount = queue.filter(q => q.status === "completed" || q.status === "failed").length;
  const progress = queue.length > 0 ? (completedCount / queue.length) * 100 : 0;

  return {
    queue,
    isProcessing,
    currentIndex,
    progress,
    addToQueue,
    addMultipleToQueue,
    removeFromQueue,
    clearQueue,
    startProcessing,
    stopProcessing,
    reorderQueue,
  };
};