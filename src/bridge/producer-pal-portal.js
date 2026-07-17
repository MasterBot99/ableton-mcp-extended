import http from 'node:http';
import { WebSocketServer } from 'ws';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

const PORT = process.env.LYRA_BRIDGE_PORT ? Number(process.env.LYRA_BRIDGE_PORT) : 3351;
const PRODUCER_PAL_PORT = process.env.PRODUCER_PAL_PORT ? Number(process.env.PRODUCER_PAL_PORT) : 3350;
const MEMORY_DIR = path.join(process.env.HOME, 'Library', 'Application Support', 'ableton-lyra', 'memory');

const clients = new Set();
let liveSetContext = null;

fs.mkdirSync(MEMORY_DIR, { recursive: true });

const toolDefinitions = [
  {
    namespace: 'ppal',
    tools: [
      { name: 'ppal-connect', description: 'Connect to Ableton Live and initialize Producer Pal.' },
      { name: 'ppal-read-live-set', description: 'Read Live Set global settings, track/scene overview.' },
      { name: 'ppal-read-track', description: 'Read track settings, clips, and devices.' },
      { name: 'ppal-read-clip', description: 'Read clip settings, MIDI notes, and audio properties.' },
      { name: 'ppal-create-clip', description: 'Create MIDI or audio clip(s).' },
      { name: 'ppal-update-clip', description: 'Update clip(s), MIDI notes, and warp settings.' },
      { name: 'ppal-update-track', description: 'Update track(s).' },
      { name: 'ppal-update-device', description: 'Update device(s), chain(s), or drum pad(s).' },
      { name: 'ppal-library', description: 'Search Live\'s browser library by name, tags, kind, or source.' },
      { name: 'ppal-playback', description: 'Control playback of the arrangement and session scenes/clips.' },
      { name: 'ppal-create-scene', description: 'Create empty scene(s) or capture playing session clips.' },
      { name: 'ppal-update-scene', description: 'Update scene(s).' },
      { name: 'ppal-live-api', description: 'Direct access to the Ableton Live Object Model.' },
      { name: 'ppal-select', description: 'Navigate to and select items in Live.' }
    ]
  },
  {
    namespace: 'lyra',
    tools: [
      { name: 'lyra.memory.read', description: 'Read project memory, session history, user preferences.' },
      { name: 'lyra.memory.write', description: 'Write memory (requires user confirmation for destructive ops).' },
      { name: 'lyra.arrangement.coach', description: 'Analyze arrangement density, suggest consolidations.' },
      { name: 'lyra.rack.librarian', description: 'List, tag, and recall Macro Variations across all racks.' },
      { name: 'lyra.dummy.build', description: 'Generate dummy clip envelopes for a target parameter.' },
      { name: 'lyra.comp.assist', description: 'Monitor comping takes, suggest best sections.' },
      { name: 'lyra.sample.similar', description: 'Find similar samples using Live\'s built-in similarity engine.' },
      { name: 'lyra.perform.audit', description: 'Audit Follow Actions, launch modes, and scene probability.' },
      { name: 'lyra.perform.sequencer', description: 'Sequence Macro Variations or dummy clips in Arrangement.' },
      { name: 'lyra.midi.coach', description: 'Recommend MIDI Transformations for selected clips.' },
      { name: 'lyra.midi.mutate', description: 'Apply Max for Live MIDI Tools to generate or transform notes.' },
      { name: 'lyra.latency.watchdog', description: 'Scan device chain latency, recommend flatten targets.' },
      { name: 'lyra.push.proxy', description: 'Query and control Push 3 session state via OSC.' }
    ]
  }
];

function broadcast(data) {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(payload);
    }
  }
}

function proxyToProducerPal(body) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: PRODUCER_PAL_PORT,
      path: '/mcp/call',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch { resolve(raw); }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function handleLyraMemoryRead(args) {
  const { project, session, key } = args || {};
  const base = MEMORY_DIR;
  let targetDir = base;
  if (project) targetDir = path.join(targetDir, 'projects', project);
  if (session) targetDir = path.join(targetDir, 'sessions', session);
  let files = [];
  try { files = fs.readdirSync(targetDir).filter((f) => f.endsWith('.json')); } catch {}
  if (!key) return { files, dir: targetDir };
  const fp = path.join(targetDir, `${key}.json`);
  if (!fs.existsSync(fp)) return { found: false, key };
  const content = JSON.parse(fs.readFileSync(fp, 'utf8'));
  return { found: true, key, value: content };
}

async function handleLyraMemoryWrite(args) {
  const { project, session, key, value, confirm = false } = args || {};
  if (!confirm) {
    return {
      status: 'pending_confirmation',
      message: 'Memory writes require confirm:true or explicit user approval.',
      preview: { project, session, key, value }
    };
  }
  const targetDir = path.join(MEMORY_DIR, 'projects', String(project || 'default'), 'sessions', String(session || 'default'));
  fs.mkdirSync(targetDir, { recursive: true });
  const fp = path.join(targetDir, `${String(key)}.json`);
  fs.writeFileSync(fp, JSON.stringify(value, null, 2));
  return { status: 'ok', written: fp, key };
}

async function handleArrangementCoach(args) {
  const { scope = 'current' } = args || {};
  return {
    status: 'ok',
    scope,
    message: 'Arrangement coach requires Producer Pal read access. Use ppal-read-live-set + ppal-read-track for density analysis.',
    suggestion: 'Run ppal-read-live-set include:[tracks,scenes,locators] then ppal-read-track for each track with arrangement-clips.'
  };
}

async function handleLatencyWatchdog(args) {
  const { trackId } = args || {};
  return {
    status: 'ok',
    message: 'Latency scan requires Live Object Model access via ppal-live-api.',
    suggestion: 'Use ppal-read-track trackId with include:[devices] and inspect device chains for CPU-heavy devices.'
  };
}

async function handleRackLibrarian(args) {
  return {
    status: 'ok',
    message: 'Rack librarian requires ppal-read-track with include:[devices] to enumerate racks and macros.',
    suggestion: 'Scan tracks for rack devices, then read macro names and current variation indexes.'
  };
}

async function handleDummyBuild(args) {
  const { target, preset } = args || {};
  return {
    status: 'ok',
    message: 'Dummy clip builder requires ppal-create-clip + ppal-update-clip with automation transforms.',
    suggestion: `Create a MIDI clip on the target track and apply transform: envelope to ${target || 'selected parameter'}.`
  };
}

async function handleCompAssist(args) {
  return {
    status: 'ok',
    message: 'Comping assistant requires analyzing clip takes via ppal-read-clip.',
    suggestion: 'Read all clips in the current session and rank by note density / duration / user tagging.'
  };
}

async function handleSampleSimilar(args) {
  const { sample } = args || {};
  return {
    status: 'ok',
    message: 'Sample similarity search requires Live\'s browser similarity engine via ppal-library.',
    suggestion: `Use ppal-library query with similar-to:${sample || '<sample-name>'} to find matches.`
  };
}

async function handlePerformAudit(args) {
  return {
    status: 'ok',
    message: 'Follow Action audit requires reading scene and clip launch settings via ppal-read-live-set.',
    suggestion: 'Inspect scenes for Follow Action probability, repeat mode, and disabled clips.'
  };
}

async function handlePerformSequencer(args) {
  return {
    status: 'ok',
    message: 'Macro sequencer requires ppal-update-scene and ppal-update-device for macro automation.',
    suggestion: 'Sequence macro variations across scenes using arrangement automation or dummy clips.'
  };
}

async function handleMidiCoach(args) {
  return {
    status: 'ok',
    message: 'MIDI coach requires ppal-read-clip with include:[notes] to analyze current clip content.',
    suggestion: 'Inspect note density, pitch range, and rhythm before recommending Transformations.'
  };
}

async function handleMidiMutate(args) {
  return {
    status: 'ok',
    message: 'MIDI mutate requires ppal-update-clip with transform expressions.',
    suggestion: 'Use transforms like: randomize-velocity, invert-intervals, scale-degree-map, groove-template.'
  };
}

async function handlePushProxy(args) {
  return {
    status: 'ok',
    message: 'Push 3 OSC proxy requires OSC server integration outside current MCP bridge scope.',
    suggestion: 'Use ppal-live-api or external OSC bridge for Push session state queries.'
  };
}

const lyraHandlers = {
  'lyra.memory.read': handleLyraMemoryRead,
  'lyra.memory.write': handleLyraMemoryWrite,
  'lyra.arrangement.coach': handleArrangementCoach,
  'lyra.rack.librarian': handleRackLibrarian,
  'lyra.dummy.build': handleDummyBuild,
  'lyra.comp.assist': handleCompAssist,
  'lyra.sample.similar': handleSampleSimilar,
  'lyra.perform.audit': handlePerformAudit,
  'lyra.perform.sequencer': handlePerformSequencer,
  'lyra.midi.coach': handleMidiCoach,
  'lyra.midi.mutate': handleMidiMutate,
  'lyra.latency.watchdog': handleLatencyWatchdog,
  'lyra.push.proxy': handlePushProxy
};

function handleToolCall(toolName, args) {
  return { status: 'ok', tool: toolName, args, result: 'stubbed' };
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', port: PORT, producerPal: PRODUCER_PAL_PORT, clients: clients.size }));
    return;
  }

  if (url.pathname === '/mcp/tools' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ tools: toolDefinitions }));
    return;
  }

  if (url.pathname === '/mcp/call' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const toolName = String(payload.tool || payload.name || '');
        const args = payload.args || payload.arguments || {};

        if (toolName.startsWith('ppal-')) {
          const ppalPayload = { tool: toolName, args };
          try {
            const ppalResult = await proxyToProducerPal(ppalPayload);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok', tool: toolName, result: ppalResult }));
            broadcast({ type: 'ppal', tool: toolName, result: ppalResult });
          } catch (err) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'error', tool: toolName, message: `Producer Pal proxy failed: ${err.message}` }));
          }
          return;
        }

        if (toolName.startsWith('lyra.')) {
          const handler = lyraHandlers[toolName];
          if (!handler) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'error', message: `Unknown Lyra tool: ${toolName}` }));
            return;
          }
          const result = await handler(args);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok', tool: toolName, result }));
          broadcast({ type: 'lyra', tool: toolName, result });
          return;
        }

        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: `Unknown tool namespace: ${toolName}` }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: `Invalid JSON: ${err.message}` }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'error', message: 'Not found. Use /mcp/call for tool calls or /mcp/tools for listing.' }));
});

const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'connected', port: PORT }));
  ws.on('close', () => { clients.delete(ws); });
  ws.on('error', () => { clients.delete(ws); });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Lyra Bridge listening on http://127.0.0.1:${PORT}`);
  console.log(`Producer Pal proxy -> http://127.0.0.1:${PRODUCER_PAL_PORT}`);
  console.log(`WebSocket -> ws://127.0.0.1:${PORT}/ws`);
  console.log(`Memory -> ${MEMORY_DIR}`);
});
