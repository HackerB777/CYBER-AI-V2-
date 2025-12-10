import { useState, useCallback, useEffect } from "react";

const KALI_AGENT_URL = "http://localhost:8888";

interface ExecutionResult {
  success: boolean;
  output: string;
  error: string;
  return_code?: number;
  process_id?: number;
}

interface AgentStatus {
  status: "online" | "offline" | "checking";
  version?: string;
  allowed_tools?: string[];
}

export const useKaliAgent = () => {
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({ status: "checking" });
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);

  const checkConnection = useCallback(async () => {
    setAgentStatus({ status: "checking" });
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${KALI_AGENT_URL}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setAgentStatus({
          status: "online",
          version: data.version,
          allowed_tools: data.allowed_tools,
        });
        return true;
      }
    } catch {
      setAgentStatus({ status: "offline" });
    }
    return false;
  }, []);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  const executeCommand = useCallback(async (command: string, timeout = 300): Promise<ExecutionResult> => {
    if (agentStatus.status !== "online") {
      return {
        success: false,
        output: "",
        error: "Kali agent is not connected. Please start the agent on your Kali VM.",
      };
    }

    setIsExecuting(true);
    try {
      const response = await fetch(`${KALI_AGENT_URL}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, timeout }),
      });

      const result: ExecutionResult = await response.json();
      setLastResult(result);
      return result;
    } catch (error) {
      const errorResult: ExecutionResult = {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : "Failed to execute command",
      };
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setIsExecuting(false);
    }
  }, [agentStatus.status]);

  const stopExecution = useCallback(async (processId: number) => {
    try {
      await fetch(`${KALI_AGENT_URL}/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ process_id: processId }),
      });
    } catch {
      // Ignore errors when stopping
    }
  }, []);

  const extractCommand = useCallback((aiResponse: string): string | null => {
    const codeMatch = aiResponse.match(/```(?:bash|sh|shell)?\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1].trim().split("\n")[0] : null;
  }, []);

  return {
    agentStatus,
    isExecuting,
    lastResult,
    checkConnection,
    executeCommand,
    stopExecution,
    extractCommand,
  };
};
