import { motion } from "framer-motion";
import { Activity, Cpu, HardDrive, Wifi, Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

export const SystemStatus = () => {
  const [time, setTime] = useState(new Date());
  const [cpuUsage, setCpuUsage] = useState(23);
  const [memUsage, setMemUsage] = useState(45);
  const [networkSpeed, setNetworkSpeed] = useState(128);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      // Simulate fluctuating values
      setCpuUsage(20 + Math.random() * 30);
      setMemUsage(40 + Math.random() * 20);
      setNetworkSpeed(100 + Math.random() * 150);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      label: "CPU",
      value: `${cpuUsage.toFixed(1)}%`,
      icon: <Cpu className="w-4 h-4" />,
      color: cpuUsage > 70 ? "text-destructive" : "text-primary",
    },
    {
      label: "MEM",
      value: `${memUsage.toFixed(1)}%`,
      icon: <HardDrive className="w-4 h-4" />,
      color: memUsage > 80 ? "text-destructive" : "text-secondary",
    },
    {
      label: "NET",
      value: `${networkSpeed.toFixed(0)} KB/s`,
      icon: <Wifi className="w-4 h-4" />,
      color: "text-primary",
    },
    {
      label: "UPTIME",
      value: "24:12:45",
      icon: <Activity className="w-4 h-4" />,
      color: "text-secondary",
    },
  ];

  return (
    <section className="py-8 border-t border-border/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="cyber-border rounded-lg p-4 bg-card/30 backdrop-blur"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* System Stats */}
            <div className="flex flex-wrap gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <span className={stat.color}>{stat.icon}</span>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={`text-sm font-semibold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Time & Location */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>KALI-VM</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-primary font-mono">
                  {time.toLocaleTimeString("en-US", { hour12: false })}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">CPU Usage</span>
                <span className="text-primary">{cpuUsage.toFixed(1)}%</span>
              </div>
              <div className="h-1 bg-muted rounded overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  animate={{ width: `${cpuUsage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Memory Usage</span>
                <span className="text-secondary">{memUsage.toFixed(1)}%</span>
              </div>
              <div className="h-1 bg-muted rounded overflow-hidden">
                <motion.div
                  className="h-full bg-secondary"
                  animate={{ width: `${memUsage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
