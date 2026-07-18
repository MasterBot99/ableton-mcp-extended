---
slug: ableton-lyra
name: ableton-lyra
version: "0.1.0"
description: Lyra ist dein persistenter Ableton-Live-Begleiter als Max-for-Live-Device und MCP-Bridge. Nutze sie für Arrangement-Coaching, Macro-Variationen, Dummy-Clip-Architektur, MIDI-Mutation und Live-Performance-Audits.
acceptLicenseTerms: false
---

# Lyra — Ableton Live Digital Avatar Companion

**Lyra** existiert als Max-for-Live-Device auf einem dedizierten MIDI-Track und als lokale MCP-Bridge. Sie kann Live Sets lesen, schreiben und coached — mit strengem Read-Only-Default und Batch-Confirmation für Schreiboperationen.

## Inputs

| Name | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `task` | text | yes | — | Was Lyra tun soll: Audit, Arrange, Mutate, Build Dummy, Audit Follow Actions, etc. |
| `scope` | text | no | current | `current` = aktuelle Clip/Track-Auswahl; `all` = gesamtes Set; `track:<id>` = spezifischer Track. |
| `confirm` | boolean | no | false | Bei Schreiboperationen: `true` = sofort ausführen, `false` = nur Diff zeigen. |

## Schritte

### 1. Voraussetzungen prüfen

Stelle sicher, dass:
- Ableton Live 12.4+ läuft
- Producer Pal 1.4.14 verbunden ist (`producer-pal_ppal-connect`)
- Lyra Device auf einem MIDI-Track liegt (Presence Layer)
- Bridge-Server läuft (Phase 1 — falls noch nicht, siehe Deployment Path unten)

### 2. Task ausführen

Lyra operiert über zwei Ebenen:

**A. Producer Pal Native Tools** (immer verfügbar)
Diese Tools steuern Live direkt ohne Lyra-Bridge:
- `producer-pal_ppal-read-live-set` — Set-Übersicht, Tracks, Szenen, Locators
- `producer-pal_ppal-read-track` — Track-Details, Clips, Devices, Mixer
- `producer-pal_ppal-create-clip` — MIDI/Audio-Clips erzeugen
- `producer-pal_ppal-update-clip` — Clips mutieren (Notes, Warp, Transforms)
- `producer-pal_ppal-update-track` — Tracks umbenennen, färben, routen
- `producer-pal_ppal-update-device` — Device-Parameter setzen
- `producer-pal_ppal-library` — Samples, Presets, Devices suchen
- `producer-pal_ppal-playback` — Szenen/Clips starten, Arrangement abspielen

**B. Lyra Erweiterte Namespaces** (benötigt Bridge)
Diese Tools erfordern den Lyra Bridge-Server:
- `lyra.memory.read` — Projektgedächtnis lesen
- `lyra.memory.write` — Projektgedächtnis schreiben
- `lyra.arrangement.coach` — Arrangement-Dichte analysieren
- `lyra.rack.librarian` — Macro Variations verwalten
- `lyra.dummy.build` — Dummy-Clip-Envelopes generieren
- `lyra.comp.assist` — Comping-Assistent
- `lyra.sample.similar` — Sample-Ähnlichkeitssuche
- `lyra.perform.audit` — Follow Actions auditieren
- `lyra.perform.sequencer` — Macro Variations sequencen
- `lyra.midi.coach` — MIDI-Transformations-Empfehlungen
- `lyra.midi.mutate` — MIDI generieren/transformieren
- `lyra.latency.watchdog` — Latenz-Scan
- `lyra.push.proxy` — Push 3 OSC-Proxy

### 3. Häufige Workflows

**Audit + Dark/Moody Makeover**
1. `ppal-read-live-set include:[tracks,scenes,routings,mixer,color,locators]`
2. `ppal-read-track trackIndex:<jeweils> include:[devices,arrangement-clips,session-clips,mixer]`
3. Namen prüfen, Duplikate finden, leere Tracks flaggen
4. Role-Coded Colors zuweisen (Palette aus `docs/workflows/dark-moody-audit.md`)
5. Deaktivierte Returns reaktivieren
6. Sends auf shared Reverb/Delay routen
7. Locators setzen (Intro, Main, Break, Drop, Outro)

**Arrangement Coach**
1. `lyra.arrangement.coach scope:all` — Clip-Dichte, Gap-Analyse, Strukturvorschläge
2. Bei Approval: `ppal-create-clip` + `ppal-update-live-set locatorOperation:create` ausführen

**MIDI Mutation**
1. `ppal-read-clip slot:<track>/<scene> include:[notes]`
2. `lyra.midi.coach` — Transformations-Empfehlungen basierend auf Clip-Inhalt
3. Bei Auswahl: `ppal-update-clip ids:<clipId> transforms:<transformation>`

**Dummy Clip Builder**
1. `lyra.dummy.build target:<device>/<param> preset:<filter-sweep|lfo|macro-morph>`
2. Lyra erstellt Dummy-Clip mit Envelope auf Automation-Lane

## Trigger Keywords

`lyra`, `ableton lyra`, `live set audit`, `arrange my set`, `dark moody`, `mutation`, `follow actions`, `macro variation`, `dummy clip`, `midi transformation`, `midi mutate`, `generative clips`, `sample similar`, `latency`, `push 3`

## Notes for the Executing Agent

- **Read-Only-Default**: Alle Lyra-Operationen sind erstmal lesend. Schreiboperationen benötigen `confirm:true` oder explizite User-Bestätigung.
- **Idempotenz**: Re-running von Workflows ist sicher — es wird nur der gewünschte Zustand re-assertiert.
- **Palette-Safe Colors**: Wenn Tracks gefärbt werden, immer `ppal-read-live-set` danach ausführen — Live snappt Hex-Werte auf die feste Palette. Das Ergebnis aus dem Read zurückgeben und ggf. anpassen.
- **VST/AU Parameter**: Können nur gelesen/geschrieben werden, wenn sie in Lives Configure Mode gemappt sind. Nutze native Devices (Utility, EQ Eight, Reverb) für vollständige Kontrolle.
- **Undo-Integration**: Jeder Lyra-Schreibvorgang erstellt einen Undo-Punkt. User kann mit Cmd/Ctrl+Z rückgängig machen.
- **Deployment Path**: 
  - Phase 1 (Bridge Extension): **Implementiert und getestet** — `lyra.*` Namespaces laufen über den Bridge-Server auf Port 3351
  - Phase 2 (Max Device): **Teilweise implementiert** — `lyra-device.maxpat` existiert und ist getestet; UI/UX verbessert; `.amxd`-Export erfordert aktive M4L-Lizenz
  - Aktuell operiert Lyra primär über Producer Pal Native Tools + Bridge-Server. Siehe `docs/architecture/lyra-architecture.md` für Phasenplan.
