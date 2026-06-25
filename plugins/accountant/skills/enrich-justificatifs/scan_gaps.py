#!/usr/bin/env python3
"""Scan all receipt YAML fiches and identify gaps that need complementary info from Gérard.

Outputs a structured report grouped by theme, with file paths and current state of each gap.
Helps the enrich-justificatifs skill prioritize and batch its questions.
"""

import glob
import os
import sys
from collections import defaultdict

try:
    import yaml
except ImportError:
    print("Error: PyYAML module missing. Install with: pip3 install pyyaml", file=sys.stderr)
    sys.exit(1)

ROOT = "/Users/gpaligot/Documents/ai-agents/expert-accountant/receipts"


def classify_gap(fiche_data, rel_path):
    """Return a list of (theme, detail) tuples for the gaps found in a fiche."""
    gaps = []
    nature = fiche_data.get("nature") or {}
    # category values are French data (e.g. "restauration", "alimentation")
    category = nature.get("category", "")
    ctx = fiche_data.get("business_context") or {}
    alerts = fiche_data.get("alerts") or []
    infos = fiche_data.get("info_to_complete") or []
    business_link = (ctx.get("business_link") or "").lower()
    status = (fiche_data.get("tax_analysis") or {}).get("corporate_tax_deductibility", {}).get("status")

    alert_codes = [a.get("code") for a in alerts]
    alert_severities = [a.get("severity") for a in alerts]
    alert_msgs = " ".join((a.get("message") or "") for a in alerts).upper()

    # Client meal: restaurant + guest null + RECEIPT_INCOMPLETE
    if (category == "restauration"
            and "client" in business_link
            and ctx.get("guest") is None
            and "RECEIPT_INCOMPLETE" in alert_codes):
        gaps.append(("client-meal", "guest + purpose to document"))

    # Travel purpose: deplacement-* + reason null + RECEIPT_INCOMPLETE
    if (category.startswith("deplacement-")
            and (ctx.get("reason") in (None, "À documenter"))
            and "RECEIPT_INCOMPLETE" in alert_codes):
        gaps.append(("travel-purpose", "travel purpose to document"))

    # Iceland trip / double reimbursement
    if "POSSIBLE_DOUBLE_BILLING" in alert_codes:
        gaps.append(("iceland-trip-double-reimb", "check DDG reimbursement"))

    # Unusual equipment use: materiel-informatique + RECEIPT_INCOMPLETE alert info
    if (category == "materiel-informatique"
            and "RECEIPT_INCOMPLETE" in alert_codes):
        gaps.append(("equipment-usage", "business use to document"))

    # Suspicious supplies: LIKELY_PERSONAL_PURPOSE
    if "LIKELY_PERSONAL_PURPOSE" in alert_codes:
        gaps.append(("supplies-personal-suspect", "business use to confirm or remove"))

    # Coffee Mrs Paligot: Match + receipt in spouse's name
    if "Match" in (fiche_data.get("merchant") or {}).get("trade_name", ""):
        gaps.append(("coffee-mrs-paligot", "office vs personal share to arbitrate"))

    # Otera Sunday: merchant Otera + critical TAXPAYER_POSITION alert
    if ("otera" in (fiche_data.get("merchant") or {}).get("trade_name", "").lower()
            and any(a.get("code") == "TAXPAYER_POSITION" and a.get("severity") == "critical"
                    for a in alerts)):
        gaps.append(("taxpayer-position-otera-sunday", "keep or drop"))

    # Corrected invoice pending: critical with RECEIPT_INCOMPLETE/PARTIAL
    if (any(a.get("severity") == "critical" and a.get("code") in ("RECEIPT_INCOMPLETE", "RECEIPT_PARTIAL")
            for a in alerts)
            and "DOUBLON" not in alert_msgs):  # message text stays French
        gaps.append(("corrected-invoice-pending", "regularization status"))

    # Personal payment: PERSONAL_PAYMENT
    if "PERSONAL_PAYMENT" in alert_codes:
        gaps.append(("personal-payment", "CCA rebilling confirmed?"))

    # Duplicate to confirm
    if "DOUBLON" in alert_msgs:  # message text stays French
        gaps.append(("duplicate-to-confirm", "Tiime: a single entry?"))

    return gaps


def main():
    yaml_files = sorted(
        glob.glob(f"{ROOT}/2025-*/*.yaml") + glob.glob(f"{ROOT}/2026-*/*.yaml")
    )

    by_theme = defaultdict(list)
    no_gap = []
    parse_errors = []

    for fp in yaml_files:
        try:
            with open(fp) as f:
                data = yaml.safe_load(f)
        except Exception as e:
            parse_errors.append((fp, str(e)))
            continue
        rel = fp.replace(ROOT + "/", "")
        gaps = classify_gap(data, rel)
        if not gaps:
            no_gap.append(rel)
            continue
        for theme, detail in gaps:
            by_theme[theme].append((rel, detail))

    print("=" * 70)
    print("SCAN GAPS — receipt fiches with complementary info to provide")
    print("=" * 70)
    print(f"Total fiches scanned: {len(yaml_files)}")
    print(f"Fiches without gap: {len(no_gap)}")
    print(f"Fiches with at least one gap: {len(yaml_files) - len(no_gap) - len(parse_errors)}")
    if parse_errors:
        print(f"Parse errors: {len(parse_errors)}")
        for fp, err in parse_errors:
            print(f"  - {fp}: {err}")
    print()

    if not by_theme:
        print("No gap identified — all fiches are complete.")
        return

    print("Gaps grouped by theme:")
    print()
    theme_order = [
        "client-meal",
        "travel-purpose",
        "iceland-trip-double-reimb",
        "equipment-usage",
        "supplies-personal-suspect",
        "coffee-mrs-paligot",
        "taxpayer-position-otera-sunday",
        "corrected-invoice-pending",
        "personal-payment",
        "duplicate-to-confirm",
    ]
    for theme in theme_order:
        if theme not in by_theme:
            continue
        items = by_theme[theme]
        print(f"  [{len(items):3d}]  {theme}")
        for rel, detail in items:
            print(f"          • {rel} — {detail}")
        print()

    # Non-standard themes (in case classify_gap is extended)
    for theme, items in by_theme.items():
        if theme in theme_order:
            continue
        print(f"  [{len(items):3d}]  {theme} (non-standard theme)")
        for rel, detail in items:
            print(f"          • {rel} — {detail}")
        print()


if __name__ == "__main__":
    main()
