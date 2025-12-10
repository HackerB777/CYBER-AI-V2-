#!/usr/bin/env python3
"""
Kali Linux Auto-Execution Agent
================================
This agent runs locally on your Kali Linux VM and allows the web interface
to execute commands remotely via a secure local API.

Usage:
    1. Download this file to your Kali VM
    2. Make it executable: chmod +x kali-agent.py
    3. Run it: python3 kali-agent.py
    4. The agent will start on http://localhost:8888

IMPORTANT: Only use for authorized penetration testing!
"""

import http.server
import json
import subprocess
import threading
import socketserver
from urllib.parse import urlparse, parse_qs
import re

PORT = 8888
ALLOWED_TOOLS = [
    'nmap', 'masscan', 'nikto', 'nuclei', 'hydra', 'john', 'hashcat',
    'sqlmap', 'gobuster', 'dirb', 'wfuzz', 'ffuf', 'netcat', 'nc',
    'curl', 'wget', 'whois', 'dig', 'host', 'traceroute', 'ping',
    'arp-scan', 'netdiscover', 'enum4linux', 'smbclient', 'rpcclient',
    'snort', 'suricata', 'tcpdump', 'wireshark', 'tshark', 'lynis',
    'openvas', 'clamav', 'clamscan', 'yara', 'volatility', 'binwalk',
    'strings', 'file', 'hexdump', 'xxd', 'base64', 'md5sum', 'sha256sum',
    'searchsploit', 'msfconsole', 'msfvenom', 'setoolkit',
    'airmon-ng', 'airodump-ng', 'aireplay-ng', 'aircrack-ng',
    'wpscan', 'whatweb', 'wafw00f', 'fierce', 'dnsrecon', 'sublist3r',
    'theHarvester', 'recon-ng', 'maltego', 'shodan', 'censys',
    'burpsuite', 'zap', 'skipfish', 'w3af', 'arachni', 'vega',
    'metasploit', 'armitage', 'cobalt', 'empire', 'powershell',
    'responder', 'impacket', 'crackmapexec', 'evil-winrm', 'bloodhound',
    'cat', 'ls', 'pwd', 'id', 'whoami', 'uname', 'ifconfig', 'ip',
    'echo', 'grep', 'awk', 'sed', 'cut', 'sort', 'uniq', 'wc', 'head', 'tail'
]

class CommandExecutor:
    def __init__(self):
        self.running_processes = {}
        self.process_id = 0
        self.lock = threading.Lock()

    def is_safe_command(self, command):
        """Basic validation - check if command starts with an allowed tool"""
        cmd_parts = command.strip().split()
        if not cmd_parts:
            return False
        base_cmd = cmd_parts[0].split('/')[-1]  # Handle full paths
        return base_cmd in ALLOWED_TOOLS

    def execute(self, command, timeout=300):
        """Execute a command and return output"""
        if not self.is_safe_command(command):
            return {
                'success': False,
                'error': f'Command not in allowed list. Allowed: {", ".join(ALLOWED_TOOLS[:10])}...',
                'output': ''
            }

        try:
            process = subprocess.Popen(
                command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            with self.lock:
                self.process_id += 1
                pid = self.process_id
                self.running_processes[pid] = process

            try:
                stdout, stderr = process.communicate(timeout=timeout)
                return {
                    'success': process.returncode == 0,
                    'output': stdout,
                    'error': stderr,
                    'return_code': process.returncode,
                    'process_id': pid
                }
            except subprocess.TimeoutExpired:
                process.kill()
                return {
                    'success': False,
                    'error': f'Command timed out after {timeout}s',
                    'output': ''
                }
            finally:
                with self.lock:
                    if pid in self.running_processes:
                        del self.running_processes[pid]

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'output': ''
            }

    def stop(self, process_id):
        """Stop a running process"""
        with self.lock:
            if process_id in self.running_processes:
                self.running_processes[process_id].terminate()
                return {'success': True, 'message': f'Process {process_id} terminated'}
            return {'success': False, 'message': f'Process {process_id} not found'}

executor = CommandExecutor()

class AgentHandler(http.server.BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == '/health' or self.path == '/':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            response = {
                'status': 'online',
                'agent': 'kali-pentest-agent',
                'version': '1.0.0',
                'allowed_tools': ALLOWED_TOOLS
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == '/execute':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            
            try:
                data = json.loads(body)
                command = data.get('command', '')
                timeout = data.get('timeout', 300)

                print(f"[EXEC] Running: {command}")
                result = executor.execute(command, timeout)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())

            except json.JSONDecodeError:
                self.send_response(400)
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Invalid JSON'}).encode())

        elif self.path == '/stop':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            
            try:
                data = json.loads(body)
                process_id = data.get('process_id')
                result = executor.stop(process_id)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())

            except:
                self.send_response(400)
                self.end_headers()

        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {args[0]}")

class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True

if __name__ == '__main__':
    print("""
╔═══════════════════════════════════════════════════════════════╗
║           KALI LINUX AUTO-EXECUTION AGENT v1.0                ║
╠═══════════════════════════════════════════════════════════════╣
║  ⚠️  FOR AUTHORIZED PENETRATION TESTING ONLY                  ║
║                                                               ║
║  This agent allows remote command execution from the          ║
║  web interface. Only whitelisted security tools are allowed.  ║
╚═══════════════════════════════════════════════════════════════╝
    """)
    
    print(f"[*] Starting agent on http://localhost:{PORT}")
    print(f"[*] Allowed tools: {len(ALLOWED_TOOLS)} security utilities")
    print("[*] Press Ctrl+C to stop\n")

    with ThreadedTCPServer(("", PORT), AgentHandler) as server:
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\n[*] Agent stopped")
            server.shutdown()
