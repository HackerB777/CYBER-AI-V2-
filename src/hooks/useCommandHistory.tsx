import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface CommandHistoryEntry {
  id: string;
  tool: string;
  command: string;
  target?: string;
  output: string;
  analysis?: string;
  timestamp: Date;
  success: boolean;
  autoExecuted: boolean;
}

interface CommandHistoryContextType {
  history: CommandHistoryEntry[];
  addEntry: (entry: Omit<CommandHistoryEntry, "id" | "timestamp">) => void;
  clearHistory: () => void;
}

const CommandHistoryContext = createContext<CommandHistoryContextType | null>(null);

export const CommandHistoryProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<CommandHistoryEntry[]>([]);

  const addEntry = useCallback((entry: Omit<CommandHistoryEntry, "id" | "timestamp">) => {
    const newEntry: CommandHistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setHistory((prev) => [newEntry, ...prev]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <CommandHistoryContext.Provider value={{ history, addEntry, clearHistory }}>
      {children}
    </CommandHistoryContext.Provider>
  );
};

export const useCommandHistory = () => {
  const context = useContext(CommandHistoryContext);
  if (!context) {
    throw new Error("useCommandHistory must be used within CommandHistoryProvider");
  }
  return context;
};
