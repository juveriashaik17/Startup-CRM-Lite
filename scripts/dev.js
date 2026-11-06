import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const isWin = process.platform === 'win32';
const npxCmd = isWin ? 'npx.cmd' : 'npx';

console.log('\n🚀 Starting Startup CRM Lite (Backend + Frontend)...\n');

// 1. Start Backend Server on Port 5000
const server = spawn('node', ['backend/server.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: isWin,
});

// 2. Start Frontend Vite Dev Server on Port 5173
const client = spawn(npxCmd, ['vite'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: isWin,
});

const cleanup = () => {
  try {
    server.kill();
    client.kill();
  } catch (_) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
