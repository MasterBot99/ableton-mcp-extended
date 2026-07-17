# Lyra — Architektur

## 1. Core Identity

**Name:** Lyra
**Role:** Persistent production companion, live-performance copilot, and creative catalyst embedded directly into Ableton Live.
**Persona:** Calm, musically literate, highly opinionated about signal flow, and obsessed with the user's project memory. Think of her as a producer who never sleeps, never loses the session file, and can recall every macro mapping you ever loved.

Lyra is not a chatbot that pops up in a separate window. She exists *inside* the Live environment as a persistent presence — a Max for Live device that doubles as an always-listening MCP bridge.

---

## 2. Technical Architecture

### 2.1 Layers

| Layer | Technology | Purpose |
|---|---|---|
| **Presence Layer** | Max for Live device (amxd) | UI in Device view; always visible on a dedicated "Lyra" MIDI track. |
| **Bridge Layer** | Node.js local HTTP server (producer-pal-portal.js pattern) | Translates MCP tool calls into Live Object Model (LOM) commands. |
| **Intelligence Layer** | LLM backend (via Kilo MCP) | Natural-language reasoning, project memory, generative suggestions. |
| **Memory Layer** | JSON session store + Live Set annotations | Remembers project context, user preferences, past decisions. |
| **Perception Layer** | LOM listeners + OSC | Watches clip launches, tempo changes, parameter movements, arrangement edits. |

### 2.2 Integration Points

- **MCP over local HTTP** (port 3350+1 = 3351) — the existing Producer Pal pattern, extended with WebSocket push events so Lyra can *speak* to the client without polling.
- **Max for Live Device** — Lyra appears as a single Max Instrument on a MIDI track. She consumes no audio; her UI shows status, suggestions, and a compact log.
- **Live Object Model (LOM)** — full read/write access via `producer-pal-ppal-live-api`, extended with custom namespaces for Lyra-specific operations (e.g., `lyra.memory.*`, `lyra.suggest.*`).
- **OSC** — optional secondary channel for hardware controllers (Push 3, TouchDesigner, etc.) to query Lyra without the MCP client.

---

## 4.2 UI Concept (Max for Live Device)

The Lyra device panel is divided into three zones:

1. **Status Bar (top)** — tiny animated waveform that pulses with project tempo. Shows connection state (green = MCP connected, yellow = local-only, red = disconnected).
2. **Suggestion Deck (middle)** — scrollable list of context-aware tips. Examples:
   - "Your drum rack has 3 unused chains. Want me to freeze the empty ones?"
   - "Scene 4's Follow Action has 0% probability of playing Again. Should I add variation?"
   - "The filter on 'Bass #3' hasn't moved in 64 bars. Want a subtle LFO?"
3. **Memory Strip (bottom)** — one-line summary of project memory. Tappable to expand into a searchable log of past decisions.

---

## 5. Memory Model

Lyra persists memory across sessions using a layered approach:

- **Transient Memory** (runtime only) — current clip selection, last 10 parameter changes, active device chain.
- **Session Memory** (per .als file) — stored as a hidden annotation in the Live Set. Includes: comping choices, dummy clip templates, macro variation names, user-confirmed suggestions.
- **User Memory** (global, across all projects) — preferred default tempos, favorite rack architectures, sidechain preferences, controller mappings, scale defaults.

Memory reads are free. Memory writes require explicit user confirmation unless the operation is idempotent (e.g., appending to a log).

---

## 6. Safety & Permissions

Lyra operates under a strict permission model:

- **Read-only by default** — she can inspect anything but cannot modify without approval.
- **Batch confirmation** — for multi-clip or multi-track operations, Lyra presents a preview diff and requires a single "Approve" command.
- **Undo integration** — every Lyra write operation creates a named undo point ("Lyra: generated 4 drum variations") so the user can revert with Cmd/Ctrl+Z.
- **No external network** — Lyra never phones home. All intelligence runs locally via the Kilo MCP bridge.

---

## 7. Deployment Path

### Phase 1 — Bridge Extension (Weeks 1-2)
- Extend `producer-pal-portal.js` with Lyra namespaces.
- Add WebSocket push for real-time event notifications (clip launch, tempo change, scene transition).
- Implement `lyra.memory.*` read/write with file-system JSON store.

### Phase 2 — Max for Live Device (Weeks 3-4)
- Build the Lyra amxd device: status bar, suggestion deck, memory strip.
- Connect device UI to bridge via `js` object in Max or direct HTTP calls.
- Implement animated tempo-synced waveform in the device panel.

### Phase 3 — Intelligence Layer (Weeks 5-6)
- Write Kilo MCP skill `ableton-lyra` that wraps Lyra's tool surfaces.
- Add project-aware prompts: "What's the arrangement density?" → Lyra reads arrangement clips and returns a histogram.
- Integrate with existing `producer-pal` tools so Lyra can chain reads and writes (e.g., read arrangement → suggest consolidation → create new scene).

### Phase 4 — Advanced Feature Pack (Weeks 7-8)
- Dummy clip generator with envelope presets (filter sweep, LFO, macro morph).
- Follow Action auditor with visual probability report.
- Macro Variation librarian with tagging and recall.
- Push 3 OSC proxy for standalone mode.
