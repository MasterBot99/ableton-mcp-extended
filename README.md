# ableton-mcp-extended

Ableton Live MCP (Model Context Protocol) Bridge — **Producer Pal** Extension mit **Lyra** Digital Avatar Companion.

## Status

| Komponente | Status |
|---|---|
| Producer Pal MCP Bridge | Verbunden mit Live 12.4.3 |
| Lyra Bridge Extension (`lyra.*` namespaces) | Phase 1 abgeschlossen, getestet |
| Lyra Max Patch (`lyra-device.maxpat`) | Gebaut und getestet, UI verbessert |
| Lyra Device in Live | Als `.maxpat` ladbar, `.amxd` erfordert M4L-Lizenz |
| Kilo MCP Skill `ableton-lyra` | Verfügbar |
| Plugin Marketplace | Eintrag in `MasterBot99/plugin-marketplace` |

## Quickstart

```bash
# Repository klonen
git clone https://github.com/MasterBot99/ableton-mcp-extended.git
cd ableton-mcp-extended

# Dependencies installieren
npm install

# Bridge-Server starten
npm start
```

## Voraussetzungen

- **Ableton Live 12.4+** mit **Producer Pal 1.4.14**
- **Max 8.2+** oder **Max 9** (Node for Max eingebaut)
- **Node.js 18+** für den Bridge-Server
- **Git** für Versionierung

## Ordnerstruktur

```
ableton-mcp-extended/
├── README.md
├── CHANGELOG.md
├── .gitignore
├── package.json
├── src/
│   ├── bridge/
│   │   └── producer-pal-portal.js   # MCP Bridge Server
│   └── max/
│       └── lyra-device/
│           ├── lyra-device.maxpat    # Max Patch Source
│           ├── bridge-client.js      # Node for Max Script
│           ├── package.json          # Node dependencies
│           ├── node_modules/          # ws dependency
│           └── MAX8_BUILD_GUIDE.md   # Build & Deploy Anleitung
├── tests/
│   └── bridge.test.js                # Bridge Smoke-Tests
├── docs/
│   ├── architecture/
│   ├── specifications/
│   ├── research/
│   └── workflows/
├── specs/
│   └── mcp-namespaces.md
├── external_plugins/
│   └── ableton-lyra/                 # Plugin Package für Marketplace
└── .kilo/
    └── skills/
        └── ableton-lyra/
            └── SKILL.md              # Kilo MCP Skill Definition
```

## Bridge-Server starten

```bash
cd /Users/andi/ableton-mcp-extended
npm start
```

Health-Check:
```bash
curl http://127.0.0.1:3351/health
```

Erwartete Ausgabe:
```json
{
  "status": "ok",
  "port": 3351,
  "producerPal": 3350,
  "clients": 0
}
```

## Lyra Max Patch laden

### Option A: Als `.maxpat` in Ableton Live laden

1. Öffne `src/max/lyra-device/lyra-device.maxpat` in **Max 9**
2. Ziehe das Patch-Fenster direkt in den **Browser-Bereich von Ableton Live**
3. Lass es über der Kategorie **Max for Live** los
4. Auf einen MIDI-Track ziehen

### Option B: In Max öffnen und testen

1. Max 9 öffnen
2. `File → Open` → `src/max/lyra-device/lyra-device.maxpat`
3. `node.script` prüfen/reloden
4. Bridge starten: `npm start`
5. Connect-Toggle ON → Status sollte `connected` zeigen

### Option C: Als `.amxd` exportieren (benötigt M4L-Lizenz)

Nur möglich mit aktiver **Max for Live Device-Lizenz**:
1. Patch in Max öffnen
2. `File → Export as Max for Live Device`
3. Speichern als `Lyra.amxd` in `~/Music/Ableton/User Library/Max for Live/`
4. In Live Browser → Max for Live → `Lyra` suchen

## Verfügbare Tools

### Producer Pal Native Tools (`ppal-*`)

Immer verfügbar, steuern Live direkt:

- `ppal-connect` — Verbindung zu Ableton Live herstellen
- `ppal-read-live-set` — Set-Übersicht, Tracks, Szenen, Locators
- `ppal-read-track` — Track-Details, Clips, Devices, Mixer
- `ppal-read-clip` — Clip-Einstellungen, MIDI-Noten, Audio-Eigenschaften
- `ppal-create-clip` — MIDI/Audio-Clips erzeugen
- `ppal-update-clip` — Clips mutieren (Notes, Warp, Transforms)
- `ppal-update-track` — Tracks umbenennen, färben, routen
- `ppal-update-device` — Device-Parameter setzen
- `ppal-library` — Samples, Presets, Devices suchen
- `ppal-playback` — Szenen/Clips starten, Arrangement abspielen
- `ppal-create-scene` — Leere Szenen erzeugen
- `ppal-update-scene` — Szenen aktualisieren
- `ppal-live-api` — Direkter Zugriff auf Ableton Live Object Model
- `ppal-select` — Items in Live navigieren/auswählen

### Lyra Erweiterte Tools (`lyra.*`)

Benötigen Bridge-Server:

- `lyra.memory.read` — Projektgedächtnis lesen
- `lyra.memory.write` — Projektgedächtnis schreiben
- `lyra.arrangement.coach` — Arrangement-Dichte analysieren, Vorschläge machen
- `lyra.rack.librarian` — Macro Variations auflisten
- `lyra.dummy.build` — Dummy-Clip-Envelopes generieren
- `lyra.comp.assist` — Comping-Assistent
- `lyra.sample.similar` — Sample-Ähnlichkeitssuche
- `lyra.perform.audit` — Follow Actions auditieren
- `lyra.perform.sequencer` — Macro Variations sequencen
- `lyra.midi.coach` — MIDI-Transformations-Empfehlungen
- `lyra.midi.mutate` — MIDI generieren/transformieren
- `lyra.latency.watchdog` — Latenz-Scan
- `lyra.push.proxy` — Push 3 OSC-Proxy

## Tests

```bash
# Bridge Smoke-Tests
node --test tests/bridge.test.js

# Catalog Validierung (im plugin-marketplace Repo)
python3 scripts/validate-catalog.py
python3 scripts/generate-plugin-index.py --check
```

## Troubleshooting

| Problem | Lösung |
|---|---|
| Bridge startet nicht | `npm install` in `src/bridge/` und `src/max/lyra-device/` ausführen |
| `Cannot find module 'ws'` | `cd src/max/lyra-device && npm install` |
| `node.script` startet nicht | Max Console (`Ctrl+Alt+Shift+C`), Script-Pfad prüfen |
| Keine UI-Updates | `route`-Argumente prüfen, Outlets verdrahtet? |
| Device erscheint als "Max patcher" | Ohne M4L-Lizenz: Patch-Fenster aus Max direkt in Live-Browser ziehen |
| Device nicht im Browser | Live neu starten, Browser refreshen |
| Memory-Pfad nicht gefunden | Standard: `~/Library/Application Support/ableton-lyra/memory/` |

## Beitragen

Siehe `docs/architecture/` für die Architekturübersicht und `specs/` für API-Verträge.

## Lizenz

MIT
