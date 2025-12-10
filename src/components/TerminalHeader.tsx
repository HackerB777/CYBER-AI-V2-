import { motion } from "framer-motion";
import { Shield, Skull, Terminal, LogIn, LogOut, User } from "lucide-react";
import { KaliConnectionStatus } from "./KaliConnectionStatus";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export const TerminalHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
    } else {
      navigate("/auth");
    }
  };

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Terminal className="w-8 h-8 text-primary" />
              </motion.div>
              <motion.div
                className="absolute inset-0 blur-md bg-primary/30"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg">
                <span className="text-primary text-glow-sm">CYBER</span>
                <span className="text-secondary text-glow-sm">AI</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                Advanced Security Toolkit v2.1.0
              </p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <KaliConnectionStatus />
            
            <div className="hidden md:flex items-center gap-2 text-sm">
              <motion.div
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-muted-foreground">SYSTEM</span>
              <span className="text-primary">ONLINE</span>
            </div>
            
            <div className="hidden sm:flex gap-4 text-muted-foreground">
              <motion.div
                className="flex items-center gap-1 hover:text-secondary transition-colors cursor-pointer"
                whileHover={{ scale: 1.1 }}
              >
                <Shield className="w-4 h-4" />
                <span className="text-xs">DEFENSE</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-1 hover:text-destructive transition-colors cursor-pointer"
                whileHover={{ scale: 1.1 }}
              >
                <Skull className="w-4 h-4" />
                <span className="text-xs">OFFENSE</span>
              </motion.div>
            </div>

            {/* Auth Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleAuthAction}
                variant="ghost"
                size="sm"
                className={`relative overflow-hidden group ${
                  user 
                    ? "text-primary hover:text-primary border border-primary/30 hover:border-primary/50 hover:bg-primary/10" 
                    : "text-secondary hover:text-secondary border border-secondary/30 hover:border-secondary/50 hover:bg-secondary/10"
                }`}
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                {user ? (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline text-xs">{user.email?.split("@")[0]}</span>
                    <LogOut className="w-3 h-3 ml-2" />
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    <span className="text-xs">ACCESS</span>
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </header>
  );
};
