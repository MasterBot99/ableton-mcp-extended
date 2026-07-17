# Lyra — Max 8 Build-Anleitung

Ziel: Ein funktionsfähiges Max for Live Device `Lyra.amxd`, das sich mit dem Bridge-Server (Port 3351) verbindet und Status, Vorschläge sowie Memory im Device-View anzeigt.

## Fertiges Patch (empfohlen)

Das Patch ist bereits gebaut:

```
src/max/lyra-device/lyra-device.maxpat
```

1. Max 8: **File → Open** → `lyra-device.maxpat`
2. Einmalig: `cd src/max/lyra-device && npm install` (für `ws`)
3. Bridge: `cd /Users/andi/ableton-mcp-extended && npm start`
4. Connect-Toggle einschalten
5. Optional als Device: **File → Save As → Max for Live Device** → `Lyra.amxd`

Die Schritte unten sind nur nötig, falls du das Patch manuell neu aufbaust.

## Voraussetzungen

- Max 8.2.0 oder neuer (Node for Max ist ab Max 8 fest eingebaut, keine Extra-Installation nötig)
- Bridge-Server läuft: `cd /Users/andi/ableton-mcp-extended && npm start`
- `bridge-client.js` liegt in `src/max/lyra-device/`
- `cd src/max/lyra-device && npm install` (lokal `ws` für node.script)

> **Node for Max Prüfung:**
> 1. Max 8 öffnen
> 2. Objekt-Menü nach `node.script` suchen
> 3. Falls vorhanden: Node for Max ist verfügbar
> 4. Falls nicht: Max auf 8.2.0+ updaten über https://cycling74.com/downloads/

## Schritt 1 — Neuer Patcher

1. In Max 8: **File → New Patcher**
2. Ein leeres Patch-Fenster öffnet sich

## Schritt 2 — node.script erstellen

1. Aus dem Objekt-Menü: **node.script** auf die Fläche ziehen
2. Doppelklick auf das Objekt → Script-Editor öffnet sich
3. Unten im Script-Editor: **Save As** → navigiere zu `/Users/andi/ableton-mcp-extended/src/max/lyra-device/bridge-client.js`
4. Schließe den Script-Editor
5. Das `node.script`-Objekt hat 1 Inlet (links) und 1 Outlet (rechts)

> Warum `node.script` statt `js`?
> - Max 8s eingebauter `js`-Interpreter hat kein natives `WebSocket` und keine npm-Packages
> - `node.script` startet einen echten Node.js-Prozess mit vollem Ökosystem (`require`, npm, async/await)
> - Der Client nutzt `require('ws')` für die WebSocket-Verbindung zum Bridge-Server

## Schritt 3 — Status-Anzeige (Status Bar)

1. Ziehe ein **text**-Objekt auf die Fläche
2. Ziehe ein **route**-Objekt auf die Fläche
3. Verbinde den Outlet des `node.script`-Objekts mit dem Inlet des `route`-Objekts
4. Im `route`-Objekt: Rechtsklick → Edit → füge folgende Einträge hinzu: `status`, `suggestion`, `memory`, `result`, `error`
5. Verbinde den Outlet für `status` des `route`-Objekts mit dem Inlet des `text`-Objekts
6. Das `text`-Objekt zeigt später "connected" oder "disconnected" an

## Schritt 4 — Message-Log (Suggestion Deck)

1. Ziehe ein weiteres **text**-Objekt auf die Fläche
2. Verbinde den Outlet für `suggestion` des `route`-Objekts (aus Schritt 3) mit dem Inlet dieses `text`-Objekts
3. Ziehe ein **prepend**-Objekt auf die Fläche
4. Verbinde den Outlet des `text`-Objekts mit dem Inlet des `prepend`-Objekts
5. Ziehe ein weiteres **text**-Objekt auf die Fläche
6. Verbinde den Outlet des `prepend`-Objekts mit dem Inlet des zweiten `text`-Objekts
7. Dieses Text-Feld zeigt später die Lyra-Vorschläge an

## Schritt 5 — Result-Anzeige (Memory Strip)

1. Ziehe ein drittes **text**-Objekt auf die Fläche
2. Benenne es um in `memory_summary` (Rechtsklick → Rename)
3. Verbinde den Outlet für `memory` des `route`-Objekts (aus Schritt 3) mit dem Inlet dieses Text-Objekts
4. Später zeigt dieses Feld die Memory-Zusammenfassung an

## Schritt 6 — Connect/Disconnect Button

1. Ziehe ein **button**-Objekt auf die Fläche
2. Ziehe ein **toggle**-Objekt auf die Fläche
3. Verbinde den Outlet des `toggle`-Objekts mit dem Inlet des `button`-Objekts
4. Verbinde den Outlet des `button`-Objekts mit dem linken Inlet des `node.script`-Objekts
5. Ein Klick auf den Button sendet "connect" zum Script, ein zweiter Klick sendet "disconnect"

## Schritt 7 — Live Device Parameter (optional, für Automation)

1. Ziehe ein **live.**-Objekt auf die Fläche (suche nach "live.object" oder "live.param")
2. Für den Status-Parameter:
   - Ziehe ein **int**-Objekt
   - Verbinde es mit dem Live-Parameter-Objekt
   - Diesen Int-Wert kannst du später in Live automatisieren
3. Wiederhole für weitere Parameter (Suggestion, Memory Summary)

## Schritt 8 — Presentation Mode (UI)

1. Klicke auf das **Presentation Mode**-Icon in der Werkzeugleiste (oder drücke `Cmd + Shift + P`)
2. Im Presentation Mode:
   - Platziere die drei `text`-Objekte vertikal:
     - **Oben**: Status-Anzeige (z.B. 640x40 Pixel, Hintergrund dunkelgrau)
     - **Mitte**: Suggestion-Deck (größer, z.B. 640x300 Pixel, scrollbar)
     - **Unten**: Memory-Strip (z.B. 640x60 Pixel, Hintergrund leicht dunkler)
   - Platziere den Connect-Button unten rechts
3. Tippe auf die Objekte, um Titel/Styles zu setzen:
   - Status: Schriftart Arial, 14pt, weiß auf dunkelgrau
   - Suggestion: Schriftart Arial, 12pt, hellgrau auf schwarz
   - Memory: Schriftart Arial, 11pt, grün auf dunkelgrau

## Schritt 9 — Device als .amxd speichern

1. Verlasse den Presentation Mode
2. **File → Save As**
3. Format wählen: **Max for Live Device**
4. Navigiere zu: `~/Music/Ableton/User Library/Max for Live/`
5. Dateiname: `Lyra.amxd`
6. Speichern

## Schritt 10 — In Ableton Live testen

1. Öffne Ableton Live 12.4
2. Browser → **Max for Live** → `Lyra` sollte jetzt erscheinen
3. Ziehe Lyra auf einen MIDI-Track
4. Stelle sicher, dass der Bridge-Server läuft (`npm start` im Projektordner)
5. Im Device-View:
   - Status sollte auf "connected" wechseln
   - Suggestion-Deck zeigt Vorschläge an
   - Memory-Strip zeigt Gedächtnis-Zusammenfassung

## Troubleshooting

**Bridge nicht erreichbar:**
- Prüfe, ob der Bridge-Server läuft: `curl http://127.0.0.1:3351/health`
- Falls nicht: `cd /Users/andi/ableton-mcp-extended && npm start`

**Device lädt nicht:**
- Max Console öffnen (`Ctrl + Alt + Shift + C` in Live)
- Fehlermeldungen prüfen
- Node for Max muss installiert sein (https://docs.cycling74.com/nodeformax/)
- `bridge-client.js` Pfad prüfen (muss relativ zum Patch sein)

**Keine UI-Updates:**
- Prüfe WebSocket-Verbindung im Max Console
- Outlets/Verdrahtung kontrollieren

**Memory-Pfad nicht gefindbar:**
- Standard: `~/Library/Application Support/ableton-lyra/memory/`
- In `bridge-client.js` die Variable `MEMORY_DIR` anpassen falls nötig

## Hinweis

Das ist ein **Minimal-Viable-Device**. Für Production empfehle ich:
- Besseres UI-Design in Presentation Mode
- Parameter-Mapping für alle 13 Lyra-Tools
- Fehlerbehandlung + Logging im `node.script`-Script
- Automatisches Reconnect bei Bridge-Neustart
- Node for Max Pakete via `npm install` im Projektordner verwalten

Bei Fragen stehe ich bereit.
