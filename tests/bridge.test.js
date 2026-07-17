import { spawn } from 'node:child_process';
import http from 'node:http';
import { WebSocket } from 'ws';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const BASE = 'http://127.0.0.1:3351';
const WS_URL = 'ws://127.0.0.1:3351/ws';
const SERVER_SCRIPT = path.resolve('src/bridge/producer-pal-portal.js');

let serverProcess;

function waitForPort(port, timeout = 5000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.request({ hostname: '127.0.0.1', port, path: '/health', method: 'GET' }, (res) => {
        res.on('data', () => {});
        res.on('end', () => resolve());
      });
      req.on('error', () => {
        if (Date.now() - start > timeout) return reject(new Error(`Port ${port} not ready after ${timeout}ms`));
        setTimeout(tick, 200);
      });
      req.end();
    };
    tick();
  });
}

function mcpCall(tool, args = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ tool, args });
    const req = http.request({ hostname: '127.0.0.1', port: 3351, path: '/mcp/call', method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch { resolve(raw); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function wsConnect() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    const messages = [];
    ws.on('message', (data) => { messages.push(JSON.parse(data.toString())); });
    ws.on('open', () => resolve({ ws, messages }));
    ws.on('error', reject);
  });
}

async function run() {
  console.log('Starting Lyra Bridge...');
  serverProcess = spawn('node', [SERVER_SCRIPT], { cwd: process.cwd(), stdio: 'inherit' });
  await waitForPort(3351);
  console.log('Bridge is up.\n');

  const { ws } = await wsConnect();

  console.log('--- Test: health ---');
  const health = await new Promise((resolve) => {
    http.request({ hostname: '127.0.0.1', port: 3351, path: '/health', method: 'GET' }, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => resolve(JSON.parse(raw)));
    }).end();
  });
  console.log(JSON.stringify(health, null, 2));

  console.log('\n--- Test: tools listing ---');
  const tools = await new Promise((resolve) => {
    http.request({ hostname: '127.0.0.1', port: 3351, path: '/mcp/tools', method: 'GET' }, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => resolve(JSON.parse(raw)));
    }).end();
  });
  const lyraCount = tools.tools.filter((g) => g.namespace === 'lyra').reduce((acc, g) => acc + g.tools.length, 0);
  console.log(`Lyra namespaces: ${lyraCount} tools`);

  console.log('\n--- Test: lyra.memory.read (empty) ---');
  const memRead = await mcpCall('lyra.memory.read', { project: 'test', session: 'test' });
  console.log(JSON.stringify(memRead, null, 2));

  console.log('\n--- Test: lyra.memory.write ---');
  const memWrite = await mcpCall('lyra.memory.write', { project: 'test', session: 'test', key: 'decision', value: { action: 'test' }, confirm: true });
  console.log(JSON.stringify(memWrite, null, 2));

  console.log('\n--- Test: lyra.memory.read (after write) ---');
  const memRead2 = await mcpCall('lyra.memory.read', { project: 'test', session: 'test', key: 'decision' });
  console.log(JSON.stringify(memRead2, null, 2));

  console.log('\n--- Test: lyra.memory.write without confirm ---');
  const memWriteNoConfirm = await mcpCall('lyra.memory.write', { project: 'test', session: 'test', key: 'blocked', value: { action: 'blocked' } });
  console.log(JSON.stringify(memWriteNoConfirm, null, 2));

  console.log('\n--- Test: lyra.arrangement.coach ---');
  const coach = await mcpCall('lyra.arrangement.coach', { scope: 'current' });
  console.log(JSON.stringify(coach, null, 2));

  console.log('\n--- Test: lyra.latency.watchdog ---');
  const watchdog = await mcpCall('lyra.latency.watchdog', {});
  console.log(JSON.stringify(watchdog, null, 2));

  console.log('\n--- Test: unknown lyra tool ---');
  const unknown = await mcpCall('lyra.unknown.tool', {});
  console.log(JSON.stringify(unknown, null, 2));

  ws.close();
  await delay(200);
  serverProcess.kill('SIGTERM');
  await delay(300);
  console.log('\nAll tests completed.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
