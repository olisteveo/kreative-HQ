import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tunnelUrlFile = path.join(__dirname, '..', '.tunnel-url');

// Find cloudflared binary
function findCloudflared() {
  const possiblePaths = [
    '/opt/homebrew/bin/cloudflared',  // Apple Silicon Mac
    '/usr/local/bin/cloudflared',      // Intel Mac
    'cloudflared'                      // If in PATH
  ];
  
  for (const p of possiblePaths) {
    try {
      if (p === 'cloudflared' || fs.existsSync(p)) {
        return p;
      }
    } catch (e) {
      // Continue
    }
  }
  return 'cloudflared'; // Fallback to PATH
}

const cloudflaredPath = findCloudflared();
console.log(`🔍 Using cloudflared: ${cloudflaredPath}`);

// Clean up any old tunnel URL
if (fs.existsSync(tunnelUrlFile)) {
  fs.unlinkSync(tunnelUrlFile);
}

console.log('🚀 Starting Cloudflare tunnel...');
console.log('⏳ Waiting for tunnel URL...\n');

// Start cloudflared tunnel
const tunnel = spawn(cloudflaredPath, ['tunnel', '--url', 'http://localhost:3001'], {
  stdio: 'pipe',
  env: { ...process.env }
});

let tunnelUrl = null;
let buffer = '';

// Parse output to find tunnel URL
tunnel.stdout.on('data', (data) => {
  const output = data.toString();
  buffer += output;
  
  // Look for tunnel URL in output
  const match = buffer.match(/(https:\/\/[a-z0-9-]+\.trycloudflare\.com)/);
  if (match && !tunnelUrl) {
    tunnelUrl = match[1];
    console.log(`✅ Tunnel URL: ${tunnelUrl}`);
    console.log('📡 OpenClaw will connect to this URL\n');
    
    // Save to file for server to read
    fs.writeFileSync(tunnelUrlFile, tunnelUrl);
  }
});

tunnel.stderr.on('data', (data) => {
  const output = data.toString();
  // Log everything from stderr for debugging
  if (!output.includes('INF')) { // Filter out info logs
    console.log(`[tunnel] ${output.trim()}`);
  }
  
  // Also check stderr for URL
  buffer += output;
  const match = buffer.match(/(https:\/\/[a-z0-9-]+\.trycloudflare\.com)/);
  if (match && !tunnelUrl) {
    tunnelUrl = match[1];
    console.log(`✅ Tunnel URL: ${tunnelUrl}`);
    console.log('📡 OpenClaw will connect to this URL\n');
    
    fs.writeFileSync(tunnelUrlFile, tunnelUrl);
  }
});

tunnel.on('error', (err) => {
  console.error('❌ Failed to start tunnel:', err.message);
  console.error('Make sure cloudflared is installed: brew install cloudflared');
  process.exit(1);
});

tunnel.on('exit', (code) => {
  if (code !== 0 && !tunnelUrl) {
    console.error(`❌ Tunnel exited with code ${code}`);
    process.exit(1);
  }
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down tunnel...');
  tunnel.kill();
  if (fs.existsSync(tunnelUrlFile)) {
    fs.unlinkSync(tunnelUrlFile);
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  tunnel.kill();
  if (fs.existsSync(tunnelUrlFile)) {
    fs.unlinkSync(tunnelUrlFile);
  }
  process.exit(0);
});
