#!/usr/bin/env python3
"""Apply a structured enrichment to a receipt YAML fiche.

Usage:
    python3 apply_update.py <fiche_path.yaml> < update.yaml

Where update.yaml is a YAML document with the following structure:

    set:                                      # optional — fields to update directly
      business_context.guest: "Jean Dupont (CEO Acme)"
      business_context.reason: "Q2 2026 mission prospecting"
      tax_analysis.corporate_tax_deductibility.status: yes
      tax_analysis.corporate_tax_deductibility.reason: "Documented client meal, deductible reception expense."
    remove_alert_codes: [RECEIPT_INCOMPLETE]  # optional — alert codes to remove
    remove_info_to_complete: ["Nom et prénom de l'invité"]  # optional — items to remove (exact or substring match)
    additional_information:                   # additions to the enrichment block
      notes:
        - "Guest: Jean Dupont (CEO Acme Corp)"
        - "Purpose: Q2 2026 mission prospecting"
      resolutions:
        - alert_code: RECEIPT_INCOMPLETE
          resolution: "Guest and purpose documented → alert cleared"
          previous_corporate_tax_status: conditional
          new_corporate_tax_status: yes
    new_summary: "Text of the new summary if the enrichment warrants it."

The script preserves unmentioned fields, adds completion_date and provided_by
automatically, and writes the modified fiche in place.
"""

import sys
from datetime import date
from pathlib import Path

try:
    import yaml
except ImportError:
    print("Error: PyYAML module missing.", file=sys.stderr)
    sys.exit(1)


def set_nested(obj, dotted_key, value):
    """Set a nested key like 'a.b.c' = value in a dict, creating intermediate dicts."""
    parts = dotted_key.split(".")
    cur = obj
    for p in parts[:-1]:
        if p not in cur or not isinstance(cur[p], dict):
            cur[p] = {}
        cur = cur[p]
    cur[parts[-1]] = value


def apply_update(fiche_path: Path, update: dict):
    with open(fiche_path) as f:
        data = yaml.safe_load(f)

    # 1. Apply field setters
    for dotted, val in (update.get("set") or {}).items():
        set_nested(data, dotted, val)

    # 2. Remove alerts by code
    codes_to_remove = set(update.get("remove_alert_codes") or [])
    if codes_to_remove:
        data["alerts"] = [a for a in (data.get("alerts") or [])
                          if a.get("code") not in codes_to_remove]

    # 3. Remove info_to_complete (exact or substring match)
    items_to_remove = update.get("remove_info_to_complete") or []
    if items_to_remove and (data.get("info_to_complete") or []):
        kept = []
        for item in data["info_to_complete"]:
            # Some entries may have been parsed as dict (when YAML contains a ":" without
            # quotes). Normalize to string for matching.
            if isinstance(item, dict):
                item_str = " ".join(f"{k} {v}" for k, v in item.items())
            else:
                item_str = str(item)
            if not any(rm.lower() in item_str.lower() or item_str.lower() == rm.lower()
                       for rm in items_to_remove):
                kept.append(item)
        data["info_to_complete"] = kept

    # 4. Merge additional_information
    new_ai = update.get("additional_information") or {}
    if new_ai or update.get("set") or codes_to_remove or items_to_remove:
        existing = data.get("additional_information") or {}
        existing["completion_date"] = date.today().isoformat()
        existing.setdefault("provided_by", "Gérard Paligot")
        existing.setdefault("notes", [])
        existing.setdefault("resolutions", [])
        for note in new_ai.get("notes") or []:
            if note not in existing["notes"]:
                existing["notes"].append(note)
        for res in new_ai.get("resolutions") or []:
            existing["resolutions"].append(res)
        data["additional_information"] = existing

    # 5. New summary
    if update.get("new_summary"):
        data["summary"] = update["new_summary"]

    # Write back, preserving order via PyYAML default
    with open(fiche_path, "w") as f:
        yaml.dump(data, f, allow_unicode=True, default_flow_style=False, sort_keys=False)


def main():
    if len(sys.argv) != 2:
        print(__doc__, file=sys.stderr)
        sys.exit(1)
    fiche_path = Path(sys.argv[1])
    if not fiche_path.exists():
        print(f"File not found: {fiche_path}", file=sys.stderr)
        sys.exit(1)
    update_yaml = sys.stdin.read()
    if not update_yaml.strip():
        print("No update provided on stdin.", file=sys.stderr)
        sys.exit(1)
    update = yaml.safe_load(update_yaml) or {}
    apply_update(fiche_path, update)
    print(f"OK — fiche {fiche_path.name} updated.")


if __name__ == "__main__":
    main()
