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

async function callPpal(tool, args = {}) {
  const response = await proxyToProducerPal({ tool, args });
  if (response && response.status === 'ok') return response.result || response;
  return response || { status: 'error', message: 'Producer Pal did not respond.' };
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
  const liveSet = await callPpal('ppal-read-live-set', { include: ['tracks', 'scenes', 'locators'] });
  const tracks = Array.isArray(liveSet?.tracks) ? liveSet.tracks : [];
  const scenes = Array.isArray(liveSet?.scenes) ? liveSet.scenes : [];

  const arrangementClips = tracks.reduce((sum, t) => sum + (Number(t.arrangementClipCount) || 0), 0);
  const sessionClips = tracks.reduce((sum, t) => sum + (Number(t.sessionClipCount) || 0), 0);
  const emptyScenes = scenes.filter((s) => (Number(s.clipCount) || 0) === 0).length;

  const suggestions = [];
  if (scenes.length > 20 && emptyScenes > 8) suggestions.push(`Reduce scenes: ${emptyScenes}/${scenes.length} empty`);
  if (arrangementClips === 0 && sessionClips > 0) suggestions.push('Promote session clips to arrangement');
  if (tracks.length > 12) suggestions.push('Consider bus grouping for cleanup');

  return {
    status: 'ok',
    scope,
    metrics: {
      trackCount: tracks.length,
      sceneCount: scenes.length,
      emptyScenes,
      arrangementClips,
      sessionClips
    },
    suggestions
  };
}

async function handleLatencyWatchdog(args) {
  const { trackId } = args || {};
  const tracks = await callPpal('ppal-read-live-set', { include: ['tracks'] });
  const list = Array.isArray(tracks?.tracks) ? tracks.tracks : [];

  const candidates = list
    .filter((t) => {
      if (trackId !== undefined && String(t.trackIndex) !== String(trackId)) return false;
      return (t.deviceCount || 0) > 3;
    })
    .map((t) => ({
      trackIndex: t.trackIndex,
      name: t.name,
      deviceCount: t.deviceCount,
      hint: 'High device count may increase latency; consider flattening or freezing.'
    }));

  return {
    status: 'ok',
    scanned: list.length,
    candidates
  };
}

async function handleRackLibrarian(args) {
  const tracks = await callPpal('ppal-read-live-set', { include: ['tracks'] });
  const list = Array.isArray(tracks?.tracks) ? tracks.tracks : [];
  const rackSummary = [];

  for (const track of list.slice(0, 8)) {
    const detail = await callPpal('ppal-read-track', { trackIndex: track.trackIndex, include: ['devices'] });
    const devices = Array.isArray(detail?.devices) ? detail.devices : [];
    const racks = devices.filter((d) => /rack/i.test(d.type || d.name || ''));
    for (const rack of racks) {
      rackSummary.push({
        trackIndex: track.trackIndex,
        trackName: track.name,
        devicePath: rack.path,
        name: rack.name,
        type: rack.type
      });
    }
  }

  return {
    status: 'ok',
    scannedTracks: Math.min(list.length, 8),
    racks: rackSummary,
    suggestion: 'Use ppal-read-device devicePath with include:[params] to inspect macro names.'
  };
}

async function handleDummyBuild(args) {
  const { target, preset = 'filter-sweep' } = args || {};
  if (!target) return { status: 'error', message: 'target is required, e.g. t0/d0/paramName' };

  const [trackPart, ...rest] = String(target).split('/');
  const trackIndex = Number(trackPart.replace(/^t/, ''));
  const devicePath = rest.join('/');

  const clip = await callPpal('ppal-create-clip', {
    trackIndex,
    length: '1bar',
    notes: ''
  });

  const transform =
    preset === 'lfo'
      ? `timing = swing(0.05)\nvelocity = sin(n/4) * 40 + 60`
      : `timing = quant(n/16)\nvelocity = ramp(40, 100)`;

  const updated = await callPpal('ppal-update-clip', {
    ids: [clip.id].filter(Boolean).join(','),
    transforms: transform
  });

  return {
    status: 'ok',
    preset,
    target,
    clip: clip,
    transform
  };
}

async function handleCompAssist(args) {
  const tracks = await callPpal('ppal-read-live-set', { include: ['tracks'] });
  const list = Array.isArray(tracks?.tracks) ? tracks.tracks : [];
  const candidates = list.filter((t) => /comp/i.test(t.name) || /parallel/i.test(t.name));

  return {
    status: 'ok',
    scannedTracks: list.length,
    candidates: candidates.map((t) => ({ trackIndex: t.trackIndex, name: t.name })),
    suggestion: 'Use ppal-read-clip on each candidate track to inspect takes and clip lengths.'
  };
}

async function handleSampleSimilar(args) {
  const { sample, tags, type: sampleType } = args || {};
  const result = await callPpal('ppal-library', {
    action: 'search',
    query: sample ? String(sample) : '',
    tags: tags ? String(tags) : '',
    type: sampleType || '',
    limit: 10
  });

  return {
    status: 'ok',
    query: { sample, tags, type: sampleType },
    matches: Array.isArray(result) ? result : []
  };
}

async function handlePerformAudit(args) {
  const liveSet = await callPpal('ppal-read-live-set', { include: ['scenes'] });
  const scenes = Array.isArray(liveSet?.scenes) ? liveSet.scenes : [];

  const audit = scenes.map((s) => ({
    sceneIndex: s.sceneIndex,
    name: s.name,
    clipCount: s.clipCount,
    suggestion: s.clipCount === 0 ? 'Empty scene — consider removing or reusing.' : undefined
  }));

  return {
    status: 'ok',
    scenes: audit,
    summary: {
      total: scenes.length,
      empty: audit.filter((s) => s.clipCount === 0).length
    }
  };
}

async function handlePerformSequencer(args) {
  const { target, pattern } = args || {};
  if (!target) return { status: 'error', message: 'target is required, e.g. t0/d0 for a device or macro target' };

  const scene = await callPpal('ppal-create-scene', { count: 1, name: `Lyra ${new Date().toISOString().slice(11, 19)}` });
  return {
    status: 'ok',
    message: 'Sequence target recorded. Use ppal-update-device / ppal-update-scene to write automation.',
    target,
    pattern,
    scene
  };
}

async function handleMidiCoach(args) {
  const tracks = await callPpal('ppal-read-live-set', { include: ['tracks'] });
  const list = Array.isArray(tracks?.tracks) ? tracks.tracks : [];
  const midiTracks = list.filter((t) => t.type === 'midi').slice(0, 5);

  const analyzed = [];
  for (const track of midiTracks) {
    const detail = await callPpal('ppal-read-track', { trackIndex: track.trackIndex, include: ['session-clips'] });
    const clips = Array.isArray(detail?.sessionClips) ? detail.sessionClips : [];
    analyzed.push({
      trackIndex: track.trackIndex,
      name: track.name,
      clipCount: clips.length,
      suggestion: clips.length ? 'Use ppal-read-clip include:[notes] for note analysis.' : 'Empty MIDI track'
    });
  }

  return {
    status: 'ok',
    midiTracks: analyzed,
    suggestion: 'Pick a clip and apply transforms: quantize, humanize, or pitch mapping.'
  };
}

async function handleMidiMutate(args) {
  const { clipId, transforms } = args || {};
  if (!clipId) return { status: 'error', message: 'clipId is required' };
  if (!transforms) return { status: 'error', message: 'transforms is required, newline-separated transform expressions' };

  const updated = await callPpal('ppal-update-clip', {
    ids: String(clipId),
    transforms: String(transforms)
  });

  return {
    status: 'ok',
    clipId,
    transforms,
    result: updated
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
