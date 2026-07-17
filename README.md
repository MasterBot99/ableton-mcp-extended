# ableton-mcp-extended

Ableton Live MCP (Model Context Protocol) Bridge — **Producer Pal** Extension mit **Lyra** Digital Avatar Companion.

## Status

| Komponente | Status |
|---|---|
| Producer Pal MCP Bridge | Verbunden mit Live 12.4.3 |
| Lyra Konzept | Entwurf abgeschlossen |
| Bridge Extension (`lyra.*` namespaces) | Phase 1 abgeschlossen, getestet |
| Lyra `.amxd` Device | Phase 2 — Source vorbereitet, Build in Max 8 |
| Kilo MCP Skill `ableton-lyra` | Phase 2 — SKILL.md erstellt |
| Dokumentation | Restrukturiert + Architektur + Capability Matrix |

## Quickstart

```bash
# Repository klonen
git clone https://github.com/andi/ableton-mcp-extended.git
cd ableton-mcp-extended

# Ordnerstruktur
ableton-mcp-extended/
├── README.md
├── CHANGELOG.md
├── .gitignore
├── docs/
│   ├── architecture/        # Lyra System-Architektur
│   ├── specifications/      # Capability Matrix, MCP Namespaces
│   ├── research/            # Ableton Live 12 Workflows
│   └── workflows/           # Ausführbare Workflows
├── specs/                   # Technische API-Verträge
├── src/
│   ├── bridge/              # Node.js MCP→LOM Bridge
│   ├── skill/               # Kilo MCP Skill
│   └── max/                 # Max Patch Quellcode
├── tests/                   # Smoke-Tests
├── logs/                    # Log-Dateien
└── assets/                  # Screenshots, Presets
```

## Beteiligte Systeme

- **Ableton Live 12.4.3** — Host DAW
- **Producer Pal 1.4.14** — MCP-Bridge (LOM-API)
- **Max 8** — Max for Live Device Runtime
- **Kilo MCP** — LLM-Backend / Skill-System

## Beitragen

Siehe `docs/architecture/` für die Architekturübersicht und `specs/` für API-Verträge.
