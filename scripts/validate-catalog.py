#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MARKETPLACE = ROOT / ".grok-plugin" / "marketplace.json"
INDEX = ROOT / "external_plugins" / "plugin-index.json"

REQUIRED_KEYS = {"name", "version", "description", "license", "source"}
NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")


def check_name(name):
    if not NAME_RE.match(name):
        return "name must be kebab-case"
    return None


def check_source(source):
    if source.get("type") == "local":
        p = Path(source.get("path", ""))
        if not p.is_absolute():
            p = ROOT / p
        if not p.exists():
            return f"local source path does not exist: {p}"
    return None


def main():
    if not MARKETPLACE.exists():
        print(f"error: {MARKETPLACE} not found", file=sys.stderr)
        sys.exit(1)

    with open(MARKETPLACE, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    errors = []
    missing = REQUIRED_KEYS - set(catalog.keys())
    if missing:
        errors.append(f"missing keys: {sorted(missing)}")

    if "name" in catalog:
        err = check_name(catalog["name"])
        if err:
            errors.append(err)

    if "source" in catalog:
        err = check_source(catalog["source"])
        if err:
            errors.append(err)

    if "homepage" in catalog and not str(catalog["homepage"]).startswith(("http://", "https://")):
        errors.append("homepage must be a URL")

    if errors:
        print("catalog validation failed:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        sys.exit(1)

    if not INDEX.exists():
        print(f"warning: {INDEX} does not exist; run generate-plugin-index.py first")
        sys.exit(1)

    print("catalog validation passed")


if __name__ == "__main__":
    main()
