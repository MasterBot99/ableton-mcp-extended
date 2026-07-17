#!/usr/bin/env python3
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MARKETPLACE = ROOT / ".grok-plugin" / "marketplace.json"
OUTPUT = ROOT / "external_plugins" / "plugin-index.json"


def main():
    if not MARKETPLACE.exists():
        print(f"error: {MARKETPLACE} not found", file=sys.stderr)
        sys.exit(1)

    with open(MARKETPLACE, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    index = {
        "plugins": [
            {
                "name": catalog["name"],
                "version": catalog["version"],
                "description": catalog["description"],
                "license": catalog["license"],
                "homepage": catalog["homepage"],
                "source": catalog["source"],
                "tags": catalog.get("tags", []),
                "mcp": catalog.get("mcp", {}),
                "permissions": catalog.get("permissions", {})
            }
        ]
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"generated {OUTPUT}")


if __name__ == "__main__":
    main()
