COMPLETENESS_PROMPT = """Check ONLY these required fields and report which are empty/null/missing:
Required fields: product_name, batch_lot, complaint_type, description, severity.
Ignore all other optional fields (strength, unit, dates, etc.).
Return JSON: {"missing_fields": ["field1", "field2"], "complete": false/true}"""

DUPLICATE_PROMPT = """Compare this complaint against the following existing complaints.
If a match is found on product_name AND batch_lot AND description similarity, flag it.
Return JSON: {"is_duplicate": true/false, "matched_complaint_id": null or id, "reason": "..."}"""

ROOTCAUSE_PROMPT = """Given the complaint description and assessment, suggest possible root causes using 5-Whys analysis.
Return JSON: {"root_cause": "...", "whys": ["Why1...", "Why2...", "Why3...", "Why4...", "Why5..."]}"""

CAPA_PROMPT = """Based on the complaint and root cause, recommend corrective and preventive actions.
Return JSON: {"corrective_actions": [...], "preventive_actions": [...], "deadline_days": N}"""

SUMMARY_PROMPT = """Write a one-paragraph executive summary of this complaint including:
product, batch, issue, severity, and next steps. Keep it under 100 words. Return as plain text."""

RISK_CLASSIFY_PROMPT = """Classify this complaint per ICH Q9 guidelines:
- Critical: direct patient harm risk
- Major: could impact product quality or regulatory compliance
- Minor: cosmetic or procedural issue only
Return JSON: {"ich_q9_classification": "Critical"/"Major"/"Minor", "rationale": "..."}"""