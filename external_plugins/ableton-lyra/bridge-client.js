// Lyra Bridge Client — Node for Max (node.script)
// Kommuniziert mit dem Lyra Bridge Server (Port 3351) via HTTP + WebSocket.

const Max = require('max-api');
const WebSocket = require('ws');
const http = require('http');

const BRIDGE_HOST = '127.0.0.1';
const BRIDGE_PORT = 3351;
const RECONNECT_INTERVAL_MS = 3000;
const OFFLINE_LOG_EVERY_MS = 30000;

let ws = null;
let reconnectTimer = null;
let connected = false;
/** User/script wants a live connection (reconnect while true). */
let wantConnected = false;
let messageId = 0;
const pendingRequests = new Map();

let lastOfflineLogAt = 0;
let offlineNoticed = false;

// --- helpers ---

function isOfflineError(err) {
  const msg = (err && err.message) ? err.message : String(err || '');
  return /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|EHOSTUNREACH|ECONNRESET/.test(msg);
}

function setStatus(state) {
  Max.outlet('status', state);
}

/** Offline failures: one UI error, then quiet retries + occasional Max.post */
function reportOffline(err) {
  const now = Date.now();
  if (!offlineNoticed) {
    offlineNoticed = true;
    lastOfflineLogAt = now;
    setStatus('disconnected');
    Max.outlet('error', 'Bridge offline — waiting for :' + BRIDGE_PORT);
    Max.post('Lyra: bridge not reachable at ' + BRIDGE_HOST + ':' + BRIDGE_PORT + ' (will retry quietly)');
    return;
  }
  if (now - lastOfflineLogAt >= OFFLINE_LOG_EVERY_MS) {
    lastOfflineLogAt = now;
    Max.post('Lyra: still waiting for bridge on port ' + BRIDGE_PORT + '…');
  }
}

function reportError(err) {
  if (isOfflineError(err)) {
    reportOffline(err);
    return;
  }
  const msg = (err && err.message) ? err.message : String(err);
  Max.outlet('error', 'WebSocket error: ' + msg);
  Max.post('Lyra: ' + msg);
}

function clearOfflineState() {
  offlineNoticed = false;
  lastOfflineLogAt = 0;
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function scheduleReconnect() {
  if (!wantConnected || reconnectTimer || connected) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    if (wantConnected && !connected) {
      connectWebSocket();
    }
  }, RECONNECT_INTERVAL_MS);
}

function cleanupSocket() {
  if (!ws) return;
  try {
    ws.removeAllListeners();
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  } catch (e) {
    // ignore
  }
  ws = null;
}

// --- HTTP ---

function sendHttp(tool, args) {
  const body = JSON.stringify({ tool, args: args || {} });
  const options = {
    hostname: BRIDGE_HOST,
    port: BRIDGE_PORT,
    path: '/mcp/call',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const id = messageId;
      const entry = pendingRequests.get(id);
      if (entry) {
        pendingRequests.delete(id);
        try {
          entry.resolve(JSON.parse(data));
        } catch (e) {
          entry.resolve({ status: 'error', message: 'Invalid JSON', raw: data });
        }
      }
    });
  });

  req.on('error', (err) => {
    const id = messageId;
    const entry = pendingRequests.get(id);
    if (entry) {
      pendingRequests.delete(id);
      entry.resolve({ status: 'error', message: err.message });
    }
  });

  req.write(body);
  req.end();
  messageId++;
}

function call(tool, args) {
  return new Promise((resolve) => {
    const id = messageId;
    pendingRequests.set(id, { resolve });
    sendHttp(tool, args);
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        resolve({ status: 'timeout', tool });
      }
    }, 30000);
  });
}

// --- WebSocket ---

function connectWebSocket() {
  if (!wantConnected) return;
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
    return;
  }

  cleanupSocket();
  setStatus(connected ? 'connected' : 'connecting');

  try {
    ws = new WebSocket(`ws://${BRIDGE_HOST}:${BRIDGE_PORT}/ws`);

    ws.on('open', () => {
      connected = true;
      clearOfflineState();
      clearReconnectTimer();
      setStatus('connected');
      Max.post('Lyra: connected to bridge on port ' + BRIDGE_PORT);
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'suggestion') {
          Max.outlet('suggestion', msg.text != null ? String(msg.text) : '');
        } else if (msg.type === 'memory') {
          Max.outlet('memory', msg.summary != null ? String(msg.summary) : '');
        } else if (msg.type === 'connected') {
          setStatus('connected');
          Max.outlet('message', 'bridge port ' + msg.port);
        } else if (msg.type === 'ppal' || msg.type === 'lyra') {
          Max.outlet('message', JSON.stringify(msg));
          if (msg.result && msg.result.suggestion) {
            Max.outlet('suggestion', String(msg.result.suggestion));
          }
        } else {
          Max.outlet('message', JSON.stringify(msg));
        }
      } catch (e) {
        Max.outlet('error', 'WebSocket parse error: ' + e.message);
      }
    });

    ws.on('close', () => {
      const wasConnected = connected;
      connected = false;
      ws = null;
      if (!wantConnected) {
        setStatus('disconnected');
        return;
      }
      if (wasConnected) {
        setStatus('disconnected');
        Max.post('Lyra: connection closed — reconnecting…');
      }
      scheduleReconnect();
    });

    // 'error' always precedes 'close' for failed connects; log once, reconnect via close
    ws.on('error', (err) => {
      reportError(err);
    });
  } catch (e) {
    reportError(e);
    scheduleReconnect();
  }
}

function disconnectWebSocket() {
  wantConnected = false;
  clearReconnectTimer();
  cleanupSocket();
  connected = false;
  clearOfflineState();
  setStatus('disconnected');
  Max.post('Lyra: disconnected');
}

// --- Public API ---

async function callTool(tool, args) {
  return await call(tool, args);
}

async function readMemory(project, session, key) {
  return await call('lyra.memory.read', { project, session, key });
}

async function writeMemory(project, session, key, value) {
  return await call('lyra.memory.write', { project, session, key, value, confirm: true });
}

async function arrangementCoach(scope) {
  return await call('lyra.arrangement.coach', { scope: scope || 'current' });
}

async function latencyWatchdog(trackId) {
  return await call('lyra.latency.watchdog', { trackId });
}

// --- Max API Handlers ---

Max.addHandler('connect', () => {
  wantConnected = true;
  clearOfflineState();
  connectWebSocket();
});

Max.addHandler('disconnect', () => {
  disconnectWebSocket();
});

/**
 * Max-friendly tool call (avoid commas in message boxes — Max splits on ,).
 *
 * Forms:
 *   tool lyra.memory.read
 *   tool lyra.memory.read project default session default
 *   tool lyra.memory.read {"project":"default"}
 */
Max.addHandler('tool', async (...atoms) => {
  if (!atoms.length) {
    Max.outlet('error', 'tool requires a name');
    return;
  }

  const toolName = String(atoms[0]);
  let args = {};

  if (atoms.length === 2) {
    const raw = String(atoms[1]);
    try {
      args = JSON.parse(raw);
    } catch (e) {
      // single non-JSON atom → ignore / empty args
      Max.post('Lyra: tool args not JSON, using empty object: ' + raw);
      args = {};
    }
  } else if (atoms.length > 2) {
    // key value pairs: project default session default
    for (let i = 1; i + 1 < atoms.length; i += 2) {
      const key = String(atoms[i]);
      let val = atoms[i + 1];
      if (typeof val === 'string' && (val === 'true' || val === 'false')) {
        val = val === 'true';
      } else if (typeof val === 'string' && /^-?\d+(\.\d+)?$/.test(val)) {
        val = Number(val);
      }
      args[key] = val;
    }
  }

  Max.post('Lyra: calling ' + toolName + ' ' + JSON.stringify(args));
  const result = await call(toolName, args);
  const out = (result && typeof result === 'object')
    ? JSON.stringify(result)
    : String(result);
  Max.outlet('result', out);

  // Surface useful fields in the UI strips
  if (result && typeof result === 'object') {
    if (result.suggestion) {
      Max.outlet('suggestion', String(result.suggestion));
    }
    if (result.result && result.result.suggestion) {
      Max.outlet('suggestion', String(result.result.suggestion));
    }
    if (toolName === 'lyra.memory.read' && result.result) {
      const r = result.result;
      const summary = r.files
        ? ('memory files: ' + (Array.isArray(r.files) ? r.files.length : 0) + ' @ ' + (r.dir || ''))
        : JSON.stringify(r).slice(0, 200);
      Max.outlet('memory', summary);
    }
  }
});

Max.addHandler('getConnectionState', () => {
  return connected ? 1 : 0;
});

// --- Lifecycle ---
// Do not auto-connect on load (avoids ECONNREFUSED spam). Use the Connect toggle.

setStatus('disconnected');
Max.post('Lyra Bridge Client ready — toggle Connect when the bridge is running');
