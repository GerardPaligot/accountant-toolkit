#!/usr/bin/env python3
"""Generate _index.yaml from all the YAML fiches in the YYYY-MM/ subfolders."""

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


def main():
    yaml_files = sorted(
        glob.glob(f"{ROOT}/2025-*/*.yaml") + glob.glob(f"{ROOT}/2026-*/*.yaml")
    )
    if not yaml_files:
        print("No YAML fiche found in the YYYY-MM/ subfolders", file=sys.stderr)
        sys.exit(1)

    per_month = defaultdict(lambda: {"count": 0, "incl_tax": 0.0, "excl_tax": 0.0,
                                     "vat_recov": 0.0, "categories": defaultdict(int)})
    per_category = defaultdict(lambda: {"count": 0, "incl_tax": 0.0, "vat_recov": 0.0})
    per_merchant = defaultdict(lambda: {"count": 0, "incl_tax": 0.0})
    alerts_by_code = defaultdict(int)
    alerts_by_severity = defaultdict(int)
    critical_files = []
    total_incl, total_excl, total_vat = 0.0, 0.0, 0.0
    deduct = defaultdict(int)
    duplicates = []
    errors = []

    for fp in yaml_files:
        try:
            with open(fp) as f:
                data = yaml.safe_load(f)
        except Exception as e:
            errors.append(f"PARSE ERROR in {fp}: {e}")
            continue

        rel = fp.replace(ROOT + "/", "")
        month = rel.split("/")[0]
        cat = (data.get("nature") or {}).get("category", "unknown")
        amounts = data.get("amounts") or {}
        incl = float(amounts.get("total_incl_tax") or 0)
        excl = float(amounts.get("total_excl_tax") or 0)
        currency = amounts.get("currency", "EUR")
        if currency != "EUR":
            incl, excl = 0, 0  # Foreign currencies excluded from totals

        ta = data.get("tax_analysis") or {}
        vat_recov = float((ta.get("vat_deductibility") or {}).get("recoverable_amount") or 0)
        status = (ta.get("corporate_tax_deductibility") or {}).get("status", "unknown")
        deduct[status] += 1

        is_duplicate = False
        is_credit = incl < 0
        for alert in (data.get("alerts") or []):
            code = alert.get("code")
            sev = alert.get("severity")
            msg = (alert.get("message") or "").upper()
            if code:
                alerts_by_code[code] += 1
            if sev:
                alerts_by_severity[sev] += 1
            # message text stays French → match the French token "DOUBLON"
            if code == "RECEIPT_PARTIAL" and "DOUBLON" in msg:
                is_duplicate = True
            if sev == "critical":
                critical_files.append(rel)
        if is_duplicate:
            duplicates.append(rel)

        per_month[month]["count"] += 1
        per_month[month]["incl_tax"] += incl
        per_month[month]["excl_tax"] += excl
        per_month[month]["vat_recov"] += vat_recov
        per_month[month]["categories"][cat] += 1
        per_category[cat]["count"] += 1
        per_category[cat]["incl_tax"] += incl
        per_category[cat]["vat_recov"] += vat_recov
        merchant = (data.get("merchant") or {}).get("name", "unknown")
        per_merchant[merchant]["count"] += 1
        per_merchant[merchant]["incl_tax"] += incl

        if not is_duplicate and not is_credit:
            total_incl += incl
            total_excl += excl
            total_vat += vat_recov

    if errors:
        print("Parse errors encountered:", file=sys.stderr)
        for e in errors:
            print(f"  {e}", file=sys.stderr)

    def r(x):
        return round(x, 2)

    from datetime import date
    index = {
        "meta": {
            "generation_date": date.today().isoformat(),
            "scope": "Receipts Gérard Paligot EURL — financial year 01/11/2025 → 31/12/2026",
            "entries_count": len(yaml_files) - len(errors),
            "parse_errors": len(errors),
            "schema_version": "1.0",
        },
        "global_totals": {
            "gross_incl_tax_eur": r(sum(m["incl_tax"] for m in per_month.values())),
            "net_incl_tax_eur_after_dups_credits": r(total_incl),
            "net_excl_tax_eur": r(total_excl),
            "recoverable_vat_eur_net": r(total_vat),
            "note": "Duplicates and credit notes excluded from net. Non-EUR currencies excluded from totals.",
        },
        "corporate_tax_deductibility_breakdown": dict(deduct),
        "by_month": {
            m: {
                "entries": d["count"],
                "incl_tax_eur": r(d["incl_tax"]),
                "excl_tax_eur": r(d["excl_tax"]),
                "recoverable_vat_eur": r(d["vat_recov"]),
                "categories": dict(d["categories"]),
            }
            for m, d in sorted(per_month.items())
        },
        "by_category": {
            c: {"entries": d["count"], "incl_tax_eur": r(d["incl_tax"]),
                "recoverable_vat_eur": r(d["vat_recov"])}
            for c, d in sorted(per_category.items(), key=lambda x: -x[1]["incl_tax"])
        },
        "top_15_merchants_by_incl_tax": {
            m: {"entries": d["count"], "incl_tax_eur": r(d["incl_tax"])}
            for m, d in sorted(per_merchant.items(), key=lambda x: -x[1]["incl_tax"])[:15]
        },
        "alerts_by_code": dict(sorted(alerts_by_code.items(), key=lambda x: -x[1])),
        "alerts_by_severity": dict(alerts_by_severity),
        "entries_with_critical_alert": sorted(set(critical_files)),
        "duplicates_do_not_count": sorted(duplicates),
    }

    out_path = f"{ROOT}/_index.yaml"
    with open(out_path, "w") as f:
        f.write("# Aggregated index of receipt analyses\n")
        f.write("# Generated automatically by build_index.py\n")
        f.write("# For the detail of a fiche, open the .yaml in the YYYY-MM subfolder\n\n")
        yaml.dump(index, f, allow_unicode=True, default_flow_style=False, sort_keys=False)

    print(f"OK — {len(yaml_files) - len(errors)} fiches aggregated in {out_path}")
    print(f"   Net incl. tax: {total_incl:.2f} € | Recoverable VAT: {total_vat:.2f} €")
    print(f"   Critical alerts: {alerts_by_severity['critical']} | Warnings: {alerts_by_severity['warning']} | Duplicates: {len(set(duplicates))}")


if __name__ == "__main__":
    main()
