# Lyra — Capability Matrix

## 3.1 Studio Assistant

| Capability | Implementation |
|---|---|
| **Auto-arrangement coaching** | Watches clip density and suggests scene consolidation, duplicate removal, and arrangement view extraction. |
| **Macro variation librarian** | Names, tags, and cross-references Macro Variations across Racks. Can recall "the aggressive bass variation from bar 32." |
| **Dummy clip architect** | Generates dummy clip envelopes for filter sweeps, chain-selector transitions, and macro morphs on demand. |
| **Comping concierge** | Monitors take lanes, flags the best comp candidates, and can auto-consolidate with user confirmation. |
| **Sample similarity search** | Leverages Live's Sound Similarity Search API to suggest alternate drum hits or melodic fragments when a clip feels stale. |
| **Stem hygiene** | Auto-stems the arrangement at session close, names files, and writes a mix summary. |
| **Latency watchdog** | Detects high latency in device chains and suggests Freeze/Flatten targets. |

## 3.2 Live Performance Copilot

| Capability | Implementation |
|---|---|
| **Follow Action auditor** | Scans all clips for Follow Action misconfigurations (e.g., clips that always stop instead of progressing). |
| **Scene probability visualizer** | Draws a probability graph for generative sets so the performer knows the odds of a scene jump. |
| **Legato guardian** | Warns before a clip launch that would break Legato timing if the user accidentally switches to Trigger mode. |
| **Macro variation sequencer** | Triggers Macro Variations from dummy clips or Arrangement automation with sample-accurate timing. |
| **Tempo-follower sync** | Reads Tempo Follower status and adjusts project tempo or clip warp markers accordingly. |
| **Push 3 proxy** | When Lyra detects Push 3 in standalone mode, she mirrors the Session View state and can launch scenes via OSC. |

## 3.3 Creative Catalyst

| Capability | Implementation |
|---|---|
| **MIDI Transformation coach** | Suggests specific Live 12 MIDI Transformations (Strum, Time Warp, Recombine, Connect) based on clip content. |
| **Generative clip spawner** | Uses Max for Live MIDI Tools (Euclidean, Velocity Shaper, Turing Machine) to generate variations and inject them into the Session. |
| **Scale-aware mutation** | Reads the project's global scale and applies "Fit to Scale" or "Add Intervals" transformations to out-of-key notes. |
| **Macro randomization guardrails** | Randomizes Rack Macros but excludes critical parameters (e.g., wet/dry balances) per user rules stored in memory. |
| **"Mud pie" builder** | Automates the Copycatt-style "melodic mud pie" rack construction: layered micro-samples + randomized arpeggiators + pitch-locked LFOs. |
