import { motion } from "framer-motion";
import { Wifi, WifiOff, Loader2, Download, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { useKaliAgent } from "@/hooks/useKaliAgent";
import { cn } from "@/lib/utils";

export const KaliConnectionStatus = () => {
  const { agentStatus, checkConnection } = useKaliAgent();

  const handleDownload = () => {
    window.open("/kali-agent.py", "_blank");
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {agentStatus.status === "checking" && (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        )}
        {agentStatus.status === "online" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <Wifi className="w-4 h-4 text-green-500" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <span className="text-xs text-green-500 font-mono">KALI CONNECTED</span>
          </motion.div>
        )}
        {agentStatus.status === "offline" && (
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-destructive" />
            <span className="text-xs text-destructive font-mono">AGENT OFFLINE</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={checkConnection}
          className="h-7 px-2"
          title="Refresh connection"
        >
          <RefreshCw className={cn("w-3 h-3", agentStatus.status === "checking" && "animate-spin")} />
        </Button>

        {agentStatus.status === "offline" && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="h-7 px-2 text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Get Agent
          </Button>
        )}
      </div>
    </div>
  );
};
