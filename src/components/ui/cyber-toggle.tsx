import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CyberToggleProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  variant?: "primary" | "destructive" | "secondary" | "warning";
  size?: "sm" | "md" | "lg";
}

const CyberToggle = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  CyberToggleProps
>(({ className, variant = "primary", size = "md", ...props }, ref) => {
  const variantStyles = {
    primary: {
      track: "data-[state=checked]:bg-primary/20 data-[state=checked]:border-primary data-[state=checked]:shadow-[0_0_20px_hsl(var(--primary)/0.6),inset_0_0_10px_hsl(var(--primary)/0.3)]",
      thumb: "data-[state=checked]:bg-primary data-[state=checked]:shadow-[0_0_15px_hsl(var(--primary)),0_0_30px_hsl(var(--primary)/0.5)]",
      glow: "bg-primary",
    },
    destructive: {
      track: "data-[state=checked]:bg-destructive/20 data-[state=checked]:border-destructive data-[state=checked]:shadow-[0_0_20px_hsl(var(--destructive)/0.6),inset_0_0_10px_hsl(var(--destructive)/0.3)]",
      thumb: "data-[state=checked]:bg-destructive data-[state=checked]:shadow-[0_0_15px_hsl(var(--destructive)),0_0_30px_hsl(var(--destructive)/0.5)]",
      glow: "bg-destructive",
    },
    secondary: {
      track: "data-[state=checked]:bg-secondary/20 data-[state=checked]:border-secondary data-[state=checked]:shadow-[0_0_20px_hsl(var(--secondary)/0.6),inset_0_0_10px_hsl(var(--secondary)/0.3)]",
      thumb: "data-[state=checked]:bg-secondary data-[state=checked]:shadow-[0_0_15px_hsl(var(--secondary)),0_0_30px_hsl(var(--secondary)/0.5)]",
      glow: "bg-secondary",
    },
    warning: {
      track: "data-[state=checked]:bg-warning/20 data-[state=checked]:border-warning data-[state=checked]:shadow-[0_0_20px_hsl(var(--warning)/0.6),inset_0_0_10px_hsl(var(--warning)/0.3)]",
      thumb: "data-[state=checked]:bg-warning data-[state=checked]:shadow-[0_0_15px_hsl(var(--warning)),0_0_30px_hsl(var(--warning)/0.5)]",
      glow: "bg-warning",
    },
  };

  const sizeStyles = {
    sm: { track: "h-5 w-10", thumb: "h-3 w-3", translate: "data-[state=checked]:translate-x-5" },
    md: { track: "h-7 w-14", thumb: "h-5 w-5", translate: "data-[state=checked]:translate-x-7" },
    lg: { track: "h-9 w-18", thumb: "h-7 w-7", translate: "data-[state=checked]:translate-x-9" },
  };

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded border-2 border-muted transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 bg-muted/30 relative overflow-hidden group",
        sizeStyles[size].track,
        variantStyles[variant].track,
        className
      )}
      {...props}
      ref={ref}
    >
      {/* Animated background gradient */}
      <motion.div
        className={cn(
          "absolute inset-0 opacity-0 group-data-[state=checked]:opacity-100 transition-opacity duration-500",
          "bg-gradient-to-r from-transparent via-current to-transparent"
        )}
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: "linear",
        }}
        style={{ color: `hsl(var(--${variant === "primary" ? "primary" : variant}))` }}
      />
      
      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-20 group-data-[state=checked]:opacity-40 transition-opacity duration-300">
        <svg className="w-full h-full" viewBox="0 0 56 28">
          <pattern id="circuit" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M0 7h4M10 7h4M7 0v4M7 10v4" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5"/>
            <circle cx="7" cy="7" r="1" fill="currentColor" opacity="0.3"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>

      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block rounded-sm bg-muted-foreground/50 shadow-lg ring-0 transition-all duration-300 data-[state=unchecked]:translate-x-1 relative",
          sizeStyles[size].thumb,
          sizeStyles[size].translate,
          variantStyles[variant].thumb,
          "after:absolute after:inset-0 after:rounded-sm after:bg-gradient-to-br after:from-white/20 after:to-transparent"
        )}
      >
        {/* Pulse effect when checked */}
        <motion.span
          className={cn(
            "absolute inset-0 rounded-sm opacity-0 group-data-[state=checked]:opacity-100",
            variantStyles[variant].glow
          )}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
        />
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  );
});
CyberToggle.displayName = "CyberToggle";

export { CyberToggle };
