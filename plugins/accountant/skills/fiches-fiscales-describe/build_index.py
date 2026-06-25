#!/usr/bin/env python3
"""Generate income-tax/_index.yaml — top-level index aggregating the 4 personal tax
document types (income-tax-notice, property-tax, pre-filled-return, credit-advance)
+ a reference to the payslips sub-index."""

import glob
import sys
from collections import defaultdict
from datetime import date

try:
    import yaml
except ImportError:
    print("Error: PyYAML module missing. Install with: pip3 install pyyaml", file=sys.stderr)
    sys.exit(1)

ROOT = "/Users/gpaligot/Documents/ai-agents/expert-accountant/income-tax"

# Mapping (subfolder, expected document_type, year key in the YAML, index key in _index.yaml)
SOURCES = [
    ("tax-notices", "income-tax-notice", "income_year", "income_tax_notice"),
    ("property-taxes", "property-tax", "tax_year", "property_tax"),
    ("pre-filled-returns", "pre-filled-return", "income_year", "pre_filled_return"),
    ("credit-advances", "credit-advance", "payment_year", "credit_advance"),
]


def load_payslips_summary():
    """Read payslips/_index.yaml and return a per-year aggregate ready to reference."""
    path = f"{ROOT}/payslips/_index.yaml"
    try:
        with open(path) as f:
            data = yaml.safe_load(f)
    except FileNotFoundError:
        return {}
    totals = data.get("household_totals") or {}
    return {
        int(year): {
            "total_taxable_net": t.get("taxable_net"),
            "total_wht": t.get("wht_total"),
            "payslips_total": t.get("payslips_total"),
            "detail": "payslips/_index.yaml",
        }
        for year, t in totals.items()
    }


def extract_summary(fp, doc_type, year_key):
    """Read a YAML and return (year, summary dict). Return (None, None) if invalid."""
    try:
        with open(fp) as f:
            data = yaml.safe_load(f)
    except Exception as e:
        return None, None, f"PARSE ERROR in {fp}: {e}"

    if data.get("document_type") != doc_type:
        return None, None, f"TYPE MISMATCH in {fp}: expected {doc_type}, found {data.get('document_type')}"

    year = data.get(year_key)
    if year is None:
        return None, None, f"MISSING {year_key} in {fp}"

    rel = fp.replace(ROOT + "/", "")
    alerts = data.get("alerts") or []
    n_critical = sum(1 for a in alerts if a.get("severity") == "critical")

    # Build the type-specific summary
    summary = {"file": rel, "critical_alerts": n_critical, "alerts_total": len(alerts)}

    if doc_type == "income-tax-notice":
        tax = data.get("taxation") or {}
        ind = data.get("indicators") or {}
        bal = data.get("balance") or {}
        summary.update({
            "income_year": data.get("income_year"),
            "reference_tax_income": ind.get("reference_tax_income"),
            "net_tax": tax.get("net_tax"),
            "wht_paid": bal.get("wht_withheld"),
            "balance": bal.get("balance_due"),
            "average_rate_pct": ind.get("average_tax_rate_pct"),
            "marginal_rate_pct": ind.get("marginal_tax_rate_pct"),
        })
    elif doc_type == "property-tax":
        due = data.get("due_payment") or {}
        summary.update({
            "total": due.get("amount_due"),
            "payment_deadline": due.get("payment_deadline"),
        })
    elif doc_type == "pre-filled-return":
        est = data.get("estimated_tax") or {}
        summary.update({
            "income_year": data.get("income_year"),
            "estimated_tax": est.get("net_tax"),
            "remaining_to_pay": est.get("remaining_amount_due"),
            "estimated_reference_tax_income": est.get("estimated_reference_tax_income"),
            "shares_count": est.get("shares_count"),
        })
    elif doc_type == "credit-advance":
        summary.update({
            "amount": data.get("advance_amount"),
            "disbursement_date": data.get("disbursement_date"),
            "credits_origin_year": data.get("credits_origin_year"),
        })

    return int(year), summary, None


def main():
    years = defaultdict(dict)
    errors = []
    critical_files = []
    n_items = 0

    for subfolder, doc_type, year_key, index_key in SOURCES:
        yaml_files = sorted(glob.glob(f"{ROOT}/{subfolder}/*.yaml"))
        for fp in yaml_files:
            year, summary, err = extract_summary(fp, doc_type, year_key)
            if err:
                errors.append(err)
                continue
            years[year][index_key] = summary
            n_items += 1
            if summary.get("critical_alerts", 0) > 0:
                critical_files.append(summary["file"])

    # Reference to payslips
    payslips = load_payslips_summary()
    for year, ps_summary in payslips.items():
        years[year]["household_payslips"] = ps_summary

    if errors:
        print("Parse errors encountered:", file=sys.stderr)
        for e in errors:
            print(f"  {e}", file=sys.stderr)

    index = {
        "meta": {
            "generation_date": date.today().isoformat(),
            "scope": "Personal tax documents, Paligot household (excl. EURL accounting)",
            "items_count": n_items,
            "parse_errors": len(errors),
            "schema_version": "1.0",
            "note": (
                "Top-level index covering income-tax-notice, property-tax, "
                "pre-filled-return, credit-advance, and referencing payslips/_index.yaml for salaries."
            ),
        },
        "years": {int(a): dict(years[a]) for a in sorted(years.keys())},
        "critical_alerts": sorted(set(critical_files)),
    }

    out_path = f"{ROOT}/_index.yaml"
    with open(out_path, "w") as f:
        f.write("# Top-level index of personal tax documents\n")
        f.write("# Generated automatically by fiches-fiscales-describe/build_index.py\n")
        f.write("# For the detail of a document, open the .yaml in the matching subfolder\n\n")
        yaml.dump(index, f, allow_unicode=True, default_flow_style=False, sort_keys=False)

    print(f"OK — {n_items} tax document(s) aggregated in {out_path}")
    for year in sorted(years.keys()):
        types_present = [k for k in years[year].keys() if k != "household_payslips"]
        print(f"   {year}: {len(types_present)} item(s) ({', '.join(types_present) or 'none beyond payslips'})")
    if critical_files:
        print(f"   {len(critical_files)} document(s) with a critical alert")


if __name__ == "__main__":
    main()
