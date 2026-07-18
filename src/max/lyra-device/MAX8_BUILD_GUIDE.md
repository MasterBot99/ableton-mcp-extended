# Lyra — Max Device: Build & Deploy

## Aktueller Stand

Das Max-Patch `lyra-device.maxpat` ist gebaut und getestet:
- `node.script` mit `@autostart 1 @watch 1`
- `route`-Objekt dispatcht `status`, `suggestion`, `memory`, `result`, `error`, `message`
- UI: Status-Bar, Suggestion-Deck, Memory-Strip, Result-Debug, Error-Display
- Connect-Toggle + Tool-Test-Message vorbereitet
- Bridge-Verbindung und `lyra.memory.read` getestet
- Script ist im Patch eingebettet (`embed: 1`), keine externen Pfade nötig

## Voraussetzungen

- Max 8.2.0+ oder Max 9 (Node for Max ist eingebaut)
- Bridge-Server läuft: `cd /Users/andi/ableton-mcp-extended && npm start`
- `node_modules/` liegt im gleichen Ordner wie die `.maxpat`

## Schritt 1 — node_modules sicherstellen

```bash
cd /Users/andi/ableton-mcp-extended/src/max/lyra-device
npm install
```

Prüfen, dass `node_modules/ws/` existiert.

## Schritt 2 — Patch in Max öffnen

1. Max öffnen
2. **File → Open** → `src/max/lyra-device/lyra-device.maxpat`
3. Ggf. `node.script` neu laden:
   - Rechtsklick auf `node.script` → **Script → Reload**
   - Oder: Message `script stop` → `script start` klicken
4. Console prüfen: `Lyra Bridge Client ready` sollte erscheinen

## Schritt 3 — Bridge starten

```bash
cd /Users/andi/ableton-mcp-extended
npm start
```

Health-Check:
```bash
curl http://127.0.0.1:3351/health
```

## Schritt 4 — Verbindung testen

1. Im Patch: **Connect-Toggle ON** (präsentiert im Presentation Mode)
2. Status-Feld sollte auf `connected` wechseln
3. Tool-Test-Message klicken: `tool lyra.memory.read project default session default`
4. Erwartung:
   - Result-Feld zeigt JSON mit `files`, `dir`
   - Memory-Feld zeigt `memory files: 0 @ <pfad>`
   - Max Console zeigt `Lyra: calling lyra.memory.read ...`

## Schritt 5 — Device exportieren

**Wichtig:** Um das Patch als echtes M4L-Device zu exportieren, brauchst du eine aktive **Max for Live Lizenz**.

### Mit M4L-Lizenz:

1. Im Patch: **File → Export as Max for Live Device**
2. Dateiname: `Lyra.amxd`
3. Ordner: `/Users/andi/Music/Ableton/User Library/Max for Live/`
4. Speichern
5. In Ableton Live: Browser → **Max for Live** → `Lyra` erscheint als Device

### Ohne M4L-Lizenz (Workaround):

1. Das Patch in Max geöffnet lassen
2. Das **Patch-Fenster direkt in den Browser-Bereich von Ableton Live ziehen**
3. Auf einen MIDI-Track legen
4. Es erscheint dann als Device auf dem Track, auch wenn es nicht im Browser listet

**Warnung:** Ohne Lizenz kannst du keine `.amxd` exportieren. Das direkte Ziehen des Patch-Fensters ist der einzige Weg, es in Live zu laden.

## Schritt 6 — In Ableton Live nutzen

1. Browser → **Max for Live** → `Lyra` sollte erscheinen
2. `Lyra` auf einen MIDI-Track ziehen
3. Device-View:
   - **Status** zeigt `connected` (wenn Bridge läuft)
   - **Suggestion Deck** zeigt Lyra-Vorschläge
   - **Memory** zeigt Gedächtnis-Zusammenfassung
   - **Result** zeigt Tool-Antworten
   - **Error** zeigt Fehler

## Schritt 7 — Memory befüllen (optional)

Test-Schreiboperation:
```
tool lyra.memory.write project default session default key decision value hello confirm 1
```

Dann Read:
```
tool lyra.memory.read project default session default
```

Memory-Feld sollte jetzt den geschriebenen Key anzeigen.

## Troubleshooting

| Problem | Check |
|---|---|
| Status bleibt disconnected | Bridge läuft? `curl http://127.0.0.1:3351/health` |
| `Cannot find module 'ws'` | `cd src/max/lyra-device && npm install` und `node_modules/` mitkopieren |
| `node.script` startet nicht | Max Console (`Ctrl+Alt+Shift+C`), Script-Pfad prüfen |
| Keine UI-Updates | `route`-Argumente prüfen, Outlets verdrahtet? |
| Device erscheint als "Max patcher" | Ohne M4L-Lizenz: Patch-Fenster aus Max direkt in Live-Browser ziehen |
| Device nicht im Browser | Live neu starten, Browser refreshen, oder Patch aus Max ziehen |
| Memory-Pfad nicht gefunden | Standard: `~/Library/Application Support/ableton-lyra/memory/` |

## Produktions-Deployment

Für den fertigen Einsatz:

1. `Lyra.maxpat` + `bridge-client.js` + `node_modules/` in einem Ordner bündeln
2. Falls M4L-Lizenz vorhanden: `File → Export as Max for Live Device` → `.amxd` erstellen
3. Ohne Lizenz: Patch in Max öffnen und als Device in Live laden
4. Bridge-Server als Service einrichten (`launchd` auf macOS)
5. Automatisches Reconnect im `bridge-client.js` aktivieren (bereits enthalten)

## Hinweis

Die Source-Versionierung erfolgt über:
- `lyra-device.maxpat` — Patch-Layout und Wiring
- `bridge-client.js` — Node for Max Script
- `MAX8_BUILD_GUIDE.md` — Diese Anleitung

Ohne aktive Max for Live Lizenz ist der Export als `.amxd` nicht möglich. Das Patch kann trotzdem direkt in Ableton Live als Gerät geladen werden, wenn es aus Max in den Browser gezogen wird.
