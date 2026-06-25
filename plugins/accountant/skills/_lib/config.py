"""Shared workspace configuration resolver for accountant toolkit scripts."""

import os
from pathlib import Path


def resolve_workspace() -> Path:
    """Return the accountant workspace root as a Path.

    Resolution order:
    1. ACCOUNTANT_WORKSPACE environment variable (set by the LLM on bootstrap).
    2. workspace.properties file at the plugin root
       (plugins/accountant/workspace.properties).

    Raises RuntimeError with actionable instructions if neither is found.
    """
    if ws := os.environ.get("ACCOUNTANT_WORKSPACE"):
        return Path(ws)

    # _lib/ → skills/ → plugins/accountant/ (plugin root)
    plugin_root = Path(__file__).parent.parent.parent
    props_file = plugin_root / "workspace.properties"
    if props_file.exists():
        for raw in props_file.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                if key.strip() == "ACCOUNTANT_WORKSPACE":
                    return Path(value.strip())

    raise RuntimeError(
        "Could not resolve ACCOUNTANT_WORKSPACE.\n"
        "Fix one of:\n"
        "  • export ACCOUNTANT_WORKSPACE=/path/to/workspace   (in the shell or via bootstrap)\n"
        f"  • create {props_file} with ACCOUNTANT_WORKSPACE=/path/to/workspace\n"
        f"    (copy {plugin_root / 'workspace.properties.example'} and edit it)"
    )
