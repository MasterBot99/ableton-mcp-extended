# Changelog

Alle relevanten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

## [Unreleased]

### Hinzugefügt
- Phase 1: Lyra Bridge Server (`src/bridge/producer-pal-portal.js`)
  - HTTP-Server auf Port 3351 mit Producer-Pal-Proxy auf Port 3350
  - 13 `lyra.*` MCP-Namespaces
  - WebSocket `/ws` für Push-Events
  - JSON-File-Store für Memory Layer (`~/Library/Application Support/ableton-lyra/memory/`)
- Phase 1 Tests (`tests/bridge.test.js`) — 1 Suite, alle Tests grün
- `package.json` mit `ws` Dependency
- Phase 2: Lyra Max for Live Device Source (`src/max/lyra-device/`)
  - `bridge-client.js` — Max `js` Objekt für HTTP + WebSocket Kommunikation
  - `lyra-device.maxpat` — Minimaler Patch-Template
  - README mit Build-Anleitung für Max 8
- `.kilo/skills/ableton-lyra/SKILL.md` — Kilo MCP Skill mit 97 Zeilen Dokumentation

### Geändert
- Umbenennung und Aufteilung der ursprünglichen Dokumente in thematische Ordner

## [2026-07-15] — Projektstart

### Hinzugefügt
- Initiales Projektgerüst mit 3 Dokumenten:
  - `digital-avatar-concept.md`
  - `project-audit-organize-aesthetic.md`
  - `ableton-advanced-workflows-research.md`
