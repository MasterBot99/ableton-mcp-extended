# Project Audit, Organize & Dark/Moody Aesthetic Workflow

A reusable, reviewable workflow for interfacing with Ableton Live through **Producer Pal** (MCP).
It runs three phases on any Live Set:

1. **Audit** — read the project, detect inconsistencies (naming, duplicates, routing, color, dead tracks).
2. **Organize** — fix names, group tracks by role, add structural locators.
3. **Aesthetic** — apply a cohesive dark/moody palette + a unified tonal/atmospheric chain.

Producer Pal exposes no local script API; the workflow is expressed as an ordered list of
MCP tool calls. Run them top-to-bottom. Each call is idempotent-ish (re-running is safe; it
re-asserts the desired state). Colors are constrained to **Live's fixed palette** — exact hexes
are snapped to the nearest palette color, so the workflow specifies palette-safe hues.

---

## Palette (dark / moody, role-coded)

| Role | Hex (requested) | Live-snapped | Meaning |
|---|---|---|---|
| Kick / Kick group | `#9C2A2A` | `#AF3333` | muted dark red |
| Sub / Rumble | `#6A4C93` | `#624BAD` | deep purple |
| Drums (hats/clap/snare/crash) | `#2D6E7E` | `#236384` | dark slate blue |
| Stab / Lead | `#5B3A8C` | `#A34BAD` | moody magenta-purple |
| FX / Sample vox | `#1F8A70` | `#0A9C8E` | desaturated teal |
| Return: Reverb / Kick-B | `#3A6EA5` | `#2F52A2` | dim blue |
| Return: Delay | `#1F8A70` | `#0A9C8E` | teal |
| Return: Parallel Comp | `#3C3C3C` | `#3C3C3C` | grey |
| Master | `#C2884A` | `#B78256` | warm amber-dark |

---

## Phase 1 — AUDIT (read-only)

Run these reads and record the findings. No mutations.

```
ppal-read-live-set  include: [tracks, scenes, routings, mixer, color, locators]
ppal-read-track     trackIndex: <each>  include: [devices, arrangement-clips, session-clips, mixer]

Audit checklist:
  [ ] Track names: consistent scheme? (numeric prefix + role, no raw sample filenames)
  [ ] Duplicate names? (e.g. two "Open Hats")
  [ ] Empty/orphan tracks? (arrangementClipCount=0 AND sessionClipCount=0) -> flag "(EMPTY/REVIEW)"
  [ ] Groups present and members routed to them?
  [ ] Return tracks active? (deactivated returns = no atmosphere) -> check via Live API is_active
  [ ] Sends: do non-kick tracks feed reverb/delay, or are sends parked at -70 dB?
  [ ] Color: is there a coherent scheme, or one flat color?
  [ ] Monitoring state mixed (auto/off) on audio tracks?
```

Audit findings for `Dark170BPM` (170 BPM, 4/4, 20 tracks):
- All tracks were flat `#FF3636` (red) — no role distinction.
- Duplicate `Open Hats` (t10, t13); raw sample filenames as names (`17-EDV2_MA_FLOOR_BOOTY`).
- Empty tracks: `8-MIDI`, `18-Audio` (zero clips).
- Returns A (reverb), B (delay), D (kick-B reverb) were **deactivated** → no shared space.
- Only the kick group sent to returns; drums/lead/stab/samples parked sends at -70 dB.

---

## Phase 2 — ORGANIZE

### 2a. Fix duplicate / raw-filename track names
```
ppal-update-track  ids: [3330,3332,3333,3324,3327]
  name: "17-FX Vox Phrase, 19-FX Think Vox, 20-Lead Serum, 10-Open Hats (Shimmer), 13-Open Hats (Bright)"
```

### 2b. Flag empty/orphan tracks (non-destructive — do NOT delete)
```
ppal-update-track  ids: [8, 3331]
  name: "8-MIDI (EMPTY/REVIEW), 18-Audio (EMPTY/REVIEW)"
```

### 2c. Add structural locators (audit + arrangement organization)
```
ppal-update-live-set  locatorOperation: create  locatorName: Intro   locatorTime: 1|1
ppal-update-live-set  locatorOperation: create  locatorName: Main   locatorTime: 9|1
ppal-update-live-set  locatorOperation: create  locatorName: Break  locatorTime: 25|1
ppal-update-live-set  locatorOperation: create  locatorName: Drop   locatorTime: 33|1
ppal-update-live-set  locatorOperation: create  locatorName: Outro  locatorTime: 49|1
```
Adjust boundaries to clip-density: read arrangement starts per track, then pick downbeat
positions where density changes.

---

## Phase 3 — AESTHETIC (dark / moody + unified tone)

### 3a. Role-coded colors (palette-safe hex from the table above)
```
ppal-update-track  ids: [2,1472,3,4,5]   color: #9C2A2A            # Kicks + group
ppal-update-track  ids: [6,7]            color: #6A4C93            # Rumble + sub
ppal-update-track  ids: [3323,3324,3325,3326,3327,3328]  color: #2D6E7E   # Drums
ppal-update-track  ids: [2203,3333]      color: #5B3A8C            # Stab + Lead
ppal-update-track  ids: [3329,3330,3332] color: #1F8A70            # FX / sample vox
ppal-update-track  ids: [1774,2205]      color: #3A6EA5            # Reverb returns
ppal-update-track  ids: [1775]           color: #1F8A70            # Delay return
ppal-update-track  ids: [2071]           color: #3C3C3C            # Parallel comp
ppal-update-track  ids: [441]            color: #C2884A            # Master
```

### 3b. Activate the shared-space returns (the single biggest atmosphere fix)
```
ppal-live-api  operations:
  - { path: "live_set return_tracks 0", type: set_property, property: is_active, value: true }  # Reverb
  - { path: "live_set return_tracks 1", type: set_property, property: is_active, value: true }  # Delay
  - { path: "live_set return_tracks 3", type: set_property, property: is_active, value: true }  # Kick-B reverb
```

### 3c. Route every musical track into the shared reverb/delay space
`sendReturn` is a single letter (A/B/...) applied to all `ids`; `sendGainDb` is one scalar
broadcast to all `ids` (per-call). Negative dB = quieter send.

```
# Reverb (A) — shared dark space
ppal-update-track  ids: [3323,3324,3327,2203,3333,3330,3332,3329]  sendReturn: A  sendGainDb: -20
# Delay (B) — per-track taste
ppal-update-track  ids: [3323]  sendReturn: B  sendGainDb: -24
ppal-update-track  ids: [2203]  sendReturn: B  sendGainDb: -20
ppal-update-track  ids: [3333]  sendReturn: B  sendGainDb: -22
ppal-update-track  ids: [3330]  sendReturn: B  sendGainDb: -26
ppal-update-track  ids: [3332]  sendReturn: B  sendGainDb: -26
ppal-update-track  ids: [3329]  sendReturn: B  sendGainDb: -28
```

### 3d. Lock the tonal center to a minor key (dark moody default)
```
ppal-update-live-set  scale: "A Minor"
```
(Match to existing content — here the Stab loops are already A minor.)

### 3e. Tune a reference reverb to a dark, closed space (ValhallaVintageVerb example)
Read the device first to get param ids, then:
```
ppal-update-device  ids: [<valhalla device id>]
  params: [ Mix 28, Decay 6.5, Size 0.7, HighCut 4200, LowCut 120,
            PreDelay 18, Attack 0.012, ModDepth 0.3 ]
```
High-cut ~4 kHz + low-cut ~120 Hz = a closed, moody plate rather than an airy hall.

### 3f. Master glue for cohesion
```
ppal-update-device  ids: [<master Utility id>]
  params: [ Stereo Width 0.85, Bass Mono "On", Bass Freq 120, DC Filter "On", Output -1 ]
```
(Note: `Bass Mono` / `DC Filter` take enum `On`/`Off`, not 1/0.)

---

## Re-runnability & safety

- **Idempotent**: re-running re-asserts state; nothing is destroyed.
- **Non-destructive**: empty tracks are *flagged*, not deleted. Deletion is a manual decision.
- **Palette constraint**: always read back `ppal-read-live-set` after coloring — Live snaps
  hex to its fixed palette; tune the requested hex from the snapped result.
- **VST/AU params** (e.g. returns' inner plugins) can't be read/set unless mapped in Live's
  Configure mode. Drive atmosphere through sends + native devices (Utility, EQ Eight,
  ValhallaVintageVerb, etc.) which Producer Pal controls directly.
- **Before/after diff**: capture `ppal-read-live-set` (tracks + locators) before and after to
  produce an audit report.
