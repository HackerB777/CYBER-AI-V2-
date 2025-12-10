import { motion } from "framer-motion";
import { ToolCard } from "./ToolCard";
import { 
  Radar, 
  Key, 
  Bug, 
  Shield, 
  Eye, 
  FileSearch,
  Crosshair,
  ShieldCheck,
  Network,
  Lock,
  Fingerprint,
  Wifi,
  Database,
  Globe,
  Zap,
  AlertTriangle,
  Search,
  ShieldAlert,
  Server,
  FileCode,
  Scan
} from "lucide-react";

const offensiveTools = [
  {
    name: "Nmap",
    description: "Network discovery & security auditing",
    command: "nmap -sV -sC target",
    icon: <Radar className="w-5 h-5" />,
  },
  {
    name: "Hydra",
    description: "Password cracking & brute force",
    command: "hydra -l admin -P wordlist.txt ssh://target",
    icon: <Key className="w-5 h-5" />,
  },
  {
    name: "Nikto",
    description: "Web server vulnerability scanner",
    command: "nikto -h http://target",
    icon: <Bug className="w-5 h-5" />,
  },
  {
    name: "Metasploit",
    description: "Penetration testing framework",
    command: "msfconsole -q",
    icon: <Crosshair className="w-5 h-5" />,
  },
  {
    name: "SQLMap",
    description: "SQL injection detection & exploitation",
    command: "sqlmap -u 'http://target?id=1' --dbs",
    icon: <Database className="w-5 h-5" />,
  },
  {
    name: "Aircrack-ng",
    description: "WiFi security & WPA cracking",
    command: "aircrack-ng capture.cap -w wordlist.txt",
    icon: <Wifi className="w-5 h-5" />,
  },
  {
    name: "John the Ripper",
    description: "Advanced password hash cracker",
    command: "john --wordlist=rockyou.txt hashes.txt",
    icon: <Lock className="w-5 h-5" />,
  },
  {
    name: "Burp Suite",
    description: "Web application security testing",
    command: "burpsuite &",
    icon: <Globe className="w-5 h-5" />,
  },
  {
    name: "Hashcat",
    description: "GPU-accelerated password recovery",
    command: "hashcat -m 0 -a 0 hash.txt wordlist.txt",
    icon: <Zap className="w-5 h-5" />,
  },
  {
    name: "Gobuster",
    description: "Directory & DNS brute forcing",
    command: "gobuster dir -u http://target -w wordlist.txt",
    icon: <Search className="w-5 h-5" />,
  },
];

const defensiveTools = [
  {
    name: "Fail2ban",
    description: "Intrusion prevention system",
    command: "fail2ban-client start",
    icon: <Shield className="w-5 h-5" />,
  },
  {
    name: "Snort",
    description: "Network intrusion detection",
    command: "snort -A console -c /etc/snort/snort.conf",
    icon: <Eye className="w-5 h-5" />,
  },
  {
    name: "Lynis",
    description: "Security auditing & hardening",
    command: "lynis audit system",
    icon: <FileSearch className="w-5 h-5" />,
  },
  {
    name: "ClamAV",
    description: "Antivirus & malware detection",
    command: "clamscan -r /home/",
    icon: <ShieldCheck className="w-5 h-5" />,
  },
  {
    name: "OSSEC",
    description: "Host-based intrusion detection",
    command: "ossec-control start",
    icon: <ShieldAlert className="w-5 h-5" />,
  },
  {
    name: "Wireshark",
    description: "Network protocol analyzer",
    command: "wireshark &",
    icon: <Network className="w-5 h-5" />,
  },
  {
    name: "Suricata",
    description: "High performance IDS/IPS",
    command: "suricata -c /etc/suricata/suricata.yaml -i eth0",
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  {
    name: "Rkhunter",
    description: "Rootkit & malware scanner",
    command: "rkhunter --check",
    icon: <Fingerprint className="w-5 h-5" />,
  },
  {
    name: "OpenVAS",
    description: "Vulnerability assessment system",
    command: "gvm-start",
    icon: <Server className="w-5 h-5" />,
  },
  {
    name: "AIDE",
    description: "File integrity monitoring",
    command: "aide --check",
    icon: <FileCode className="w-5 h-5" />,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export const ToolsGrid = () => {
  return (
    <section className="py-12 relative">
      {/* Hex pattern background */}
      <div className="absolute inset-0 hex-pattern opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Offensive Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-16"
        >
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-destructive to-destructive/20" />
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-destructive/20 blur-xl rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <h2 className="text-2xl font-display font-bold text-destructive flex items-center gap-3 relative px-4 py-2">
                <Crosshair className="w-7 h-7 animate-pulse" />
                <span className="text-glow-sm">OFFENSIVE ARSENAL</span>
                <Scan className="w-5 h-5 animate-spin-slow opacity-50" />
              </h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-destructive to-destructive/20" />
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            variants={containerVariants}
          >
            {offensiveTools.map((tool, index) => (
              <motion.div
                key={tool.name}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ToolCard {...tool} variant="offensive" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Defensive Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-secondary to-secondary/20" />
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-secondary/20 blur-xl rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              <h2 className="text-2xl font-display font-bold text-secondary flex items-center gap-3 relative px-4 py-2">
                <Shield className="w-7 h-7 animate-pulse" />
                <span className="text-glow-sm">DEFENSIVE SYSTEMS</span>
                <ShieldCheck className="w-5 h-5 opacity-50" />
              </h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-secondary to-secondary/20" />
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            variants={containerVariants}
          >
            {defensiveTools.map((tool, index) => (
              <motion.div
                key={tool.name}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ToolCard {...tool} variant="defensive" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
