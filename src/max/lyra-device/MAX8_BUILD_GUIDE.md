# Lyra — Max Patch: Save & Deploy

## Aktueller Stand

Das Max-Patch `lyra-device.maxpat` und `bridge-client.js` sind bereits gebaut und getestet:
- `node.script` mit `@autostart 1 @watch 1`
- `route`-Objekt dispatcht `status`, `suggestion`, `memory`, `result`, `error`, `message`
- UI: Status-Bar, Suggestion-Deck, Memory-Strip, Result-Debug, Error-Display
- Connect-Toggle + Tool-Test-Message vorbereitet
- Bridge-Verbindung und `lyra.memory.read` getestet
- Absoluter Script-Pfad in `node.script` eingetragen

## Schritt 1 — node_modules sicherstellen

```bash
cd /Users/andi/ableton-mcp-extended/src/max/lyra-device
npm install
```

Prüfen, dass `node_modules/ws/` existiert. Ohne diesen Ordner startet `node.script` nicht.

## Schritt 2 — Patch in Max öffnen

1. Max 8 öffnen
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

## Schritt 5 — Als .maxpat speichern

**Wichtig:** Die `.maxpat` muss im gleichen Ordner wie `bridge-client.js` und `node_modules/` liegen, sonst findet `node.script` das Script nicht.

1. Im Patch: **File → Save As**
2. Format: **Max Patch** (`.maxpat`)
3. Dateiname: `Lyra.maxpat`
4. Ordner: `/Users/andi/ableton-mcp-extended/src/max/lyra-device/`
   - **Nicht** in `~/Music/Ableton/User Library/` speichern, solange du entwickelst
5. Speichern

## Schritt 6 — In Ableton Live laden

Ohne `.amxd`-Export geht es trotzdem:

1. Ableton Live 12.4 öffnen
2. In Max 8: das geöffnete Patch-Fenster direkt in den **Browser-Bereich von Ableton Live ziehen**
   - Alternativ: `File → Export As Max for Live Device` falls der Menüpunkt existiert
3. In Live: Browser → **Max for Live** → `Lyra` sollte erscheinen
4. `Lyra` auf einen MIDI-Track ziehen
5. Device-View:
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
| `Cannot find module 'ws'` | `cd src/max/lyra-device && npm install` |
| `node.script` startet nicht | Max 8.2+, Max Console (`Ctrl+Alt+Shift+C`), Script-Pfad prüfen |
| Keine UI-Updates | `route`-Argumente prüfen, Outlets verdrahtet? |
| `.maxpat` lädt nicht in Live | Patch in Max öffnen und neu speichern, Browser-Cache leeren |
| Memory-Pfad nicht gefunden | Standard: `~/Library/Application Support/ableton-lyra/memory/` |

## Produktions-Deployment

Für den fertigen Einsatz:

1. `Lyra.maxpat` + `bridge-client.js` + `node_modules/` in einem Ordner bündeln
2. Ordner nach `~/Music/Ableton/User Library/Max for Live/` kopieren
3. Bridge-Server als Service einrichten (`launchd` auf macOS)
4. Automatisches Reconnect im `bridge-client.js` aktivieren (bereits enthalten)

## Hinweis

Die Source-Versionierung erfolgt über:
- `lyra-device.maxpat` — Patch-Layout und Wiring
- `bridge-client.js` — Node for Max Script
- `MAX8_BUILD_GUIDE.md` — Diese Anleitung

Ohne aktive Max for Live Lizenz ist der Export als `.amxd` nicht möglich. Die `.maxpat` kann trotzdem direkt in Ableton Live als Gerät geladen werden, wenn Max for Live installiert ist.
