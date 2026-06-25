#!/usr/bin/env python3
"""Generate _index.yaml from all the YAML fiches in the YYYY/<person>/ subfolders."""

import glob
import os
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "_lib"))
from config import resolve_workspace  # noqa: E402

try:
    import yaml
except ImportError:
    print("Error: PyYAML module missing. Install with: pip3 install pyyaml", file=sys.stderr)
    sys.exit(1)

ROOT = str(resolve_workspace() / "income-tax" / "payslips")


def detect_missing_months(payslips):
    """Detect the missing months for a person × year from the cumulative totals.

    Sort by month, then check for each payslip that:
        current_cumulative ≈ previous_cumulative + current_month_amount
    If the gap is significant (> 5 €), estimate the missing months by dividing
    the gap by the average payslip amount.
    """
    payslips_sorted = sorted(payslips, key=lambda b: b["month"])
    missing = []
    prev_cumul = 0.0
    seen_months = set()
    for b in payslips_sorted:
        seen_months.add(b["month"])
        expected_cumul = prev_cumul + b["taxable_net"]
        actual_cumul = b["cumulative_taxable_net"]
        gap = actual_cumul - expected_cumul
        if gap > 5:
            mean_payslip = b["taxable_net"]
            if mean_payslip > 0:
                est_missing = round(gap / mean_payslip)
                missing.append({
                    "before_month": b["month"],
                    "estimated_count": est_missing,
                    "gap_eur": round(gap, 2),
                })
        prev_cumul = actual_cumul
    return missing


def main():
    yaml_files = sorted(glob.glob(f"{ROOT}/*/*/*.yaml"))
    if not yaml_files:
        print("No YAML fiche found under YYYY/<person>/", file=sys.stderr)
        sys.exit(1)

    # year → person_key → list of payslips
    bucket = defaultdict(lambda: defaultdict(list))
    employers_by_person_year = defaultdict(set)
    critical_files = []
    errors = []

    for fp in yaml_files:
        try:
            with open(fp) as f:
                data = yaml.safe_load(f)
        except Exception as e:
            errors.append(f"PARSE ERROR in {fp}: {e}")
            continue

        rel = fp.replace(ROOT + "/", "")
        person_key = (data.get("person") or {}).get("key", "unknown")
        period = data.get("period") or {}
        year = period.get("fiscal_year")
        month = period.get("calendar_month")
        if year is None or month is None:
            errors.append(f"MISSING fiscal_year/calendar_month in {fp}")
            continue

        amounts = data.get("monthly_amounts") or {}
        ytd = data.get("year_to_date") or {}
        emp = data.get("employer") or {}

        gross = float(amounts.get("gross") or 0)
        tn = float(amounts.get("taxable_net") or 0)
        wht = float(amounts.get("wht_withheld") or 0)
        cumul_tn = float(ytd.get("taxable_net") or 0)

        alerts = data.get("alerts") or []
        n_critical = sum(1 for a in alerts if a.get("severity") == "critical")
        n_total = len(alerts)
        if n_critical > 0:
            critical_files.append(rel)

        bucket[year][person_key].append({
            "month": month,
            "file": rel,
            "gross": gross,
            "taxable_net": tn,
            "wht": wht,
            "cumulative_taxable_net": cumul_tn,
            "alerts": n_total,
        })
        employers_by_person_year[(year, person_key)].add(emp.get("name") or "unknown")

    if errors:
        print("Parse errors encountered:", file=sys.stderr)
        for e in errors:
            print(f"  {e}", file=sys.stderr)

    def r(x):
        return round(x, 2)

    years_out = {}
    household_totals = {}
    for year in sorted(bucket.keys()):
        years_out[int(year)] = {}
        hh_tn = 0.0
        hh_wht = 0.0
        hh_count = 0
        for person in sorted(bucket[year].keys()):
            slips = bucket[year][person]
            missing = detect_missing_months(slips)
            total_gross = sum(b["gross"] for b in slips)
            total_tn = sum(b["taxable_net"] for b in slips)
            total_wht = sum(b["wht"] for b in slips)
            # The real total = max(sum of payslips, last observed cumulative) — the
            # cumulative is more reliable if some payslips are missing.
            last_cumul_tn = max((b["cumulative_taxable_net"] for b in slips), default=0)
            base_tax = max(total_tn, last_cumul_tn)
            hh_tn += base_tax
            hh_wht += total_wht
            hh_count += len(slips)
            years_out[int(year)][person] = {
                "employers": sorted(employers_by_person_year[(year, person)]),
                "months_covered": len(slips),
                "missing_payslips": missing,
                "total_gross_present_payslips": r(total_gross),
                "total_taxable_net_present_payslips": r(total_tn),
                "total_taxable_net_last_payslip_cumulative": r(last_cumul_tn),
                "retained_tax_base": r(base_tax),
                "total_wht": r(total_wht),
                "payslips": [
                    {
                        "month": b["month"],
                        "file": b["file"],
                        "gross": r(b["gross"]),
                        "taxable_net": r(b["taxable_net"]),
                        "wht": r(b["wht"]),
                        "alerts": b["alerts"],
                    }
                    for b in sorted(slips, key=lambda x: x["month"])
                ],
            }
        household_totals[int(year)] = {
            "taxable_net": r(hh_tn),
            "wht_total": r(hh_wht),
            "payslips_total": hh_count,
        }

    index = {
        "meta": {
            "generation_date": date.today().isoformat(),
            "scope": "Payslips Paligot tax household (Gérard + Aurore)",
            "payslips_count": len(yaml_files) - len(errors),
            "parse_errors": len(errors),
            "schema_version": "1.0",
            "note": (
                "retained_tax_base = max(sum of payslips, last observed cumulative). "
                "If some payslips are missing, the last cumulative is more reliable."
            ),
        },
        "years": years_out,
        "household_totals": household_totals,
        "critical_alerts": sorted(set(critical_files)),
    }

    out_path = f"{ROOT}/_index.yaml"
    with open(out_path, "w") as f:
        f.write("# Aggregated payslips index — basis for the income-tax return\n")
        f.write("# Generated automatically by build_index.py\n")
        f.write("# For the detail of a payslip, open the .yaml in YYYY/<person>/\n\n")
        yaml.dump(index, f, allow_unicode=True, default_flow_style=False, sort_keys=False)

    print(f"OK — {len(yaml_files) - len(errors)} payslips aggregated in {out_path}")
    for year, t in household_totals.items():
        print(f"   {year}: household taxable_net {t['taxable_net']:.2f} € | WHT {t['wht_total']:.2f} € | {t['payslips_total']} payslips")
    if critical_files:
        print(f"   {len(critical_files)} fiche(s) with a critical alert")


if __name__ == "__main__":
    main()
