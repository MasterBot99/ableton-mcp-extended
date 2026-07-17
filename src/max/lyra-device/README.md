# Lyra — Max for Live Device

Quellcode und fertiges Max-Patch für das Lyra Presence Layer Device.

## Dateien

```
src/max/lyra-device/
├── bridge-client.js          ← Node for Max: HTTP + WebSocket Client
├── lyra-device.maxpat         ← Fertiges Patch (node.script + UI)
├── package.json              ← CommonJS + ws für node.script
├── MAX8_BUILD_GUIDE.md       ← Manuelle Build-Anleitung (Fallback)
└── README.md                 ← Diese Datei
```

## Voraussetzungen

- Ableton Live 12.4+ mit Max for Live (oder Max 8.2+)
- Bridge-Server: `cd /Users/andi/ableton-mcp-extended && npm start`
- Einmalig im Device-Ordner: `cd src/max/lyra-device && npm install`

## Schnellstart (Max 8)

1. **Max 8** öffnen
2. **File → Open** → `src/max/lyra-device/lyra-device.maxpat`
3. Presentation Mode sollte Status / Suggestion / Memory / Connect-Toggle zeigen
4. Bridge starten (`npm start` im Projektroot)
5. **Connect-Toggle ON** → Status wird `connected`
6. Optional: Message `tool lyra.memory.read {...}` klicken (Result-Feld + Max Console)

### Als Max for Live Device speichern

1. Im geöffneten Patch: **File → Save As**
2. Format: **Max for Live Device** (`.amxd`)
3. Ziel z. B.: `~/Music/Ableton/User Library/Max for Live/Lyra.amxd`
4. In Live: Browser → Max for Live → **Lyra** auf einen MIDI-Track ziehen

> `bridge-client.js` und `node_modules/` müssen neben dem Device erreichbar bleiben  
> (gleicher Ordner wie die `.amxd`, oder Pfad im `node.script` anpassen).  
> Praktisch: `.amxd` im `lyra-device/`-Ordner speichern **oder** Script + `node_modules` mitkopieren.

## Verdrahtung (Überblick)

| Richtung | Message / Outlet |
|---|---|
| Max → Script | `connect`, `disconnect`, `tool <name> <argsJson>` |
| Script → Max | `status`, `suggestion`, `memory`, `result`, `error`, `message` |
| WebSocket | `ws://127.0.0.1:3351/ws` |
| Tools (HTTP) | `POST http://127.0.0.1:3351/mcp/call` |

Patch-Logik:

```
toggle → sel 1 0 → [connect] / [disconnect] → node.script bridge-client.js
node.script → route status suggestion memory result error message
  → prepend set → textedit (Status / Suggestion / Memory / Result)
```

## Bridge-Integration

```bash
cd /Users/andi/ableton-mcp-extended
npm install
npm start
# Health: curl http://127.0.0.1:3351/health
```

## Troubleshooting

| Problem | Check |
|---|---|
| Status bleibt disconnected | Bridge läuft? `curl http://127.0.0.1:3351/health` |
| `Cannot find module 'ws'` | `cd src/max/lyra-device && npm install` |
| node.script startet nicht | Max 8.2+, Max Console, `script start` Message klicken |
| Keine UI-Updates | Outlet-Verdrahtung / `route`-Argumente prüfen |

## Hinweis

Die finale `.amxd` ist proprietär und wird in Max gespeichert.  
`lyra-device.maxpat` + `bridge-client.js` sind die versionierbare Quelle.
