import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const commands = [
  "Initializing AI security modules...",
  "Loading threat detection algorithms...",
  "Connecting to Kali Linux subsystems...",
  "Scanning network vulnerabilities...",
  "Deploying defensive countermeasures...",
  "System ready. Awaiting commands.",
];

export const HeroSection = () => {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [completedLines, setCompletedLines] = useState<string[]>([]);

  useEffect(() => {
    if (currentLine >= commands.length) return;

    const text = commands[currentLine];
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex <= text.length) {
        setDisplayedText(text.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setCompletedLines((prev) => [...prev, text]);
        setDisplayedText("");
        setTimeout(() => {
          setCurrentLine((prev) => prev + 1);
        }, 200);
      }
    }, 25);

    return () => clearInterval(typeInterval);
  }, [currentLine]);

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 scanline opacity-30 pointer-events-none" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
              y: Math.random() * 500,
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <motion.div
              className="relative inline-block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Glow effect behind title */}
              <motion.div
                className="absolute inset-0 blur-3xl bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 -z-10"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              <h2 className="text-5xl md:text-7xl font-display font-bold mb-4">
                <motion.span
                  className="text-primary inline-block"
                  animate={{
                    textShadow: [
                      "0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary))",
                      "0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary)), 0 0 80px hsl(var(--primary))",
                      "0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary))",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  CYBER
                </motion.span>
                <motion.span
                  className="text-secondary inline-block ml-3"
                  animate={{
                    textShadow: [
                      "0 0 10px hsl(var(--secondary)), 0 0 20px hsl(var(--secondary)), 0 0 40px hsl(var(--secondary))",
                      "0 0 20px hsl(var(--secondary)), 0 0 40px hsl(var(--secondary)), 0 0 80px hsl(var(--secondary))",
                      "0 0 10px hsl(var(--secondary)), 0 0 20px hsl(var(--secondary)), 0 0 40px hsl(var(--secondary))",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  AI
                </motion.span>
              </h2>
            </motion.div>
            <motion.p
              className="text-muted-foreground text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              AI-Powered Offensive & Defensive Security Platform
            </motion.p>
          </div>

          {/* Terminal Window */}
          <motion.div
            className="cyber-border rounded-lg overflow-hidden bg-background/80 backdrop-blur relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Animated border */}
            <motion.div
              className="absolute inset-0 rounded-lg pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent, hsl(var(--primary)/0.5), transparent)",
                backgroundSize: "200% 100%",
              }}
              animate={{
                backgroundPosition: ["100% 0%", "-100% 0%"],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

            {/* Terminal Title Bar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-border/50">
              <div className="flex gap-2">
                <motion.div
                  className="w-3 h-3 rounded-full bg-destructive/80"
                  whileHover={{ scale: 1.2 }}
                />
                <motion.div
                  className="w-3 h-3 rounded-full bg-warning/80"
                  whileHover={{ scale: 1.2 }}
                />
                <motion.div
                  className="w-3 h-3 rounded-full bg-primary/80"
                  whileHover={{ scale: 1.2 }}
                />
              </div>
              <span className="text-xs text-muted-foreground ml-2">
                root@kali:~/cyberai
              </span>
            </div>

            {/* Terminal Content */}
            <div className="p-4 min-h-[200px] font-mono text-sm">
              <div className="text-muted-foreground mb-2">$ ./cybercore --init</div>

              {completedLines.map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-primary/80 mb-1"
                >
                  <span className="text-secondary">[✓]</span> {line}
                </motion.div>
              ))}

              {currentLine < commands.length && (
                <div className="text-primary">
                  <motion.span
                    className="text-warning"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    [→]
                  </motion.span>{" "}
                  {displayedText}
                  <span className="typing-cursor" />
                </div>
              )}

              {currentLine >= commands.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 pt-4 border-t border-border/30"
                >
                  <span className="text-primary">root@kali</span>
                  <span className="text-muted-foreground">:</span>
                  <span className="text-secondary">~</span>
                  <span className="text-muted-foreground">$ </span>
                  <span className="typing-cursor" />
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
