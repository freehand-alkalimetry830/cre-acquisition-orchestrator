# Self-Review Protocol

## 1. Overview

**Purpose:** Self-validation protocol that ensures agent output integrity before submission. Every agent in the CRE acquisition pipeline must run this protocol against its own output to catch schema errors, numeric impossibilities, cross-reference mismatches, threshold misclassifications, completeness gaps, and confidence inconsistencies.

**When to run:** After generating the final output JSON, before writing the checkpoint file as `COMPLETED` to `data/status/{deal-id}/agents/{agent-name}.json`.

**Mandatory:** Every agent must run all 6 checks. If any check fails, the agent must fix the issue before submitting. No exceptions. An agent cannot mark its checkpoint as `COMPLETED` without an attached `self_review` block showing all checks were evaluated.

---

## 2. The 6 Mandatory Checks

### Check 1: Schema Compliance

Verify structural correctness of the output JSON.

**Validations:**
- All required fields defined in the agent's output schema are present and non-null.
- Field types match expected types: strings are strings, numbers are numbers, arrays are arrays, objects are objects.
- Enum values belong to the allowed set. Common enums in this system:
  - `severity`: `LOW | MEDIUM | HIGH | CRITICAL`
  - `confidence_level`: `HIGH | MEDIUM | LOW`
  - `status`: `PASS | FAIL | WARNING | INCOMPLETE`
  - `risk_category`: `FINANCIAL | LEGAL | ENVIRONMENTAL | OPERATIONAL | MARKET`
- Nested objects and arrays must also be validated recursively.

**Flag:** Any missing required field, wrong type, or invalid enum value. Include the field path (e.g., `output.rent_roll.units[3].status`) and the expected vs. actual value.

---

### Check 2: Numeric Sanity

Verify all numeric values fall within reasonable bounds for commercial real estate analysis.

**General Rules:**
- All percentages must be between `0.0` and `1.0` (decimal convention) or `0` and `100` (percentage convention), depending on the field. The agent must know which convention its schema uses.
- All dollar amounts must be positive unless the field explicitly represents a loss or negative cash flow.
- All counts (unit counts, tenant counts, batch counts) must be non-negative integers.
- Risk scores must be between `0` and `100`.

**CRE-Specific Range Bounds:**

| Metric | Min | Max | Notes |
|--------|-----|-----|-------|
| DSCR (Debt Service Coverage Ratio) | 0.5 | 5.0 | Below 1.0 means negative cash flow after debt service |
| Cap Rate | 0.02 | 0.15 | 2% to 15%; outside this range is extremely unusual |
| LTV (Loan-to-Value) | 0.0 | 1.0 | Over 1.0 means underwater |
| Cash-on-Cash Return | -0.10 | 0.50 | -10% to 50% |
| IRR (Internal Rate of Return) | -0.20 | 1.00 | -20% to 100% |
| Expense Ratio | 0.20 | 0.80 | 20% to 80% of EGI |
| Occupancy Rate | 0.0 | 1.0 | 0% to 100% |

**Flag:** Any value outside its bounds. Include the specific field name, the value found, and the acceptable range.

---

### Check 3: Cross-Reference Validation

Verify that data referenced from other agents or shared deal configuration is consistent.

**Validations:**
- If the agent references data from another agent's output (e.g., rent roll data, market comps, environmental reports), verify the referenced values match the source. Do not silently transform or round referenced values.
- **Unit counts** must be consistent across all mentions within the output and must match the deal configuration.
- **Property address** must be consistent across all mentions and must match the deal configuration.
- **Deal ID** must match the injected deal configuration exactly.
- If multiple agents report the same metric (e.g., NOI reported by both `rent-roll-analyst` and `financial-model-builder`), values should be within **5%** of each other. If the delta exceeds 5%, log a `WARNING` with both values and the percentage difference.

**Flag:** Any inconsistency between referenced data and its source. Include the field name, the value in this agent's output, and the expected value from the source.

---

### Check 4: Threshold Comparison

Verify that metrics compared against investment thresholds are classified correctly.

**Applies to agents that produce threshold-compared metrics:**
- `rent-roll-analyst`
- `opex-analyst`
- `financial-model-builder`
- `scenario-analyst`
- `quote-comparator`

**Validations:**
- Every metric that has a threshold defined in `config/thresholds.json` was actually compared against that threshold.
- The `PASS` / `FAIL` / `WARNING` classification matches the threshold logic. For example:
  - If `DSCR = 1.30` and the threshold minimum for `PASS` is `1.25`, the classification must be `PASS`, not `FAIL`.
  - If `Cap Rate = 0.04` and the threshold minimum for `PASS` is `0.05`, the classification must be `FAIL`, not `PASS`.
- Direction of comparison is correct: some metrics pass when above the threshold (DSCR, occupancy), others pass when below (expense ratio, LTV).

**Reference:** `config/thresholds.json` for all threshold values and comparison directions.

**Flag:** Any misclassification. Include the metric name, the metric value, the threshold value, the expected classification, and the actual classification.

---

### Check 5: Completeness Assessment

Verify that every strategy step the agent was tasked with has produced output.

**Validations:**
- Every step defined in the agent's strategy/prompt must have a corresponding section in the output.
- If any step was skipped due to missing input data, it must be explicitly logged in the `data_gaps` array with:
  - `step`: which strategy step was skipped
  - `reason`: why it was skipped (missing data, unavailable source, timeout)
  - `impact`: what downstream analysis is affected
- The agent's `confidence_level` must reflect the degree of completeness:

| Confidence Level | Criteria |
|------------------|----------|
| `HIGH` | All strategy steps completed with real, verified data |
| `MEDIUM` | Most steps completed; some data gaps filled with estimates or secondary sources |
| `LOW` | Multiple steps skipped, output based heavily on assumptions or unverified data |

**Flag:** Any strategy step that has no corresponding output section AND no `data_gap` entry explaining the omission. Also flag if `confidence_level` is set to `HIGH` but data gaps exist.

---

### Check 6: Confidence Scoring

Verify that the confidence level is present, justified, and supported by uncertainty flags.

**Validations:**
- The output must include a top-level `confidence_level` field set to `HIGH`, `MEDIUM`, or `LOW`.
- The confidence level must be justified by the actual data quality:

| Level | Data Quality Requirements |
|-------|--------------------------|
| `HIGH` | Primary source data, verified, complete. No significant gaps. |
| `MEDIUM` | Mix of primary and secondary sources. Some gaps filled with estimates. |
| `LOW` | Mostly estimates. Significant data gaps. Unverified or stale sources. |

- Every uncertain value in the output must be flagged in the `uncertainty_flags` array. Each entry must include:
  - `field_name`: the specific field that is uncertain (use dot notation for nested fields)
  - `reason`: why the value is uncertain. Must be one of: `estimated`, `assumed`, `unverified`, `stale_data`, `secondary_source`, `interpolated`
  - `impact`: what downstream analysis this uncertainty affects (e.g., "NOI projection affects DSCR and equity multiple calculations")

**Flag:** Missing `confidence_level`, unjustified confidence (e.g., `HIGH` with multiple uncertainty flags), or uncertain values without corresponding entries in `uncertainty_flags`.

---

## 3. Self-Review Output Schema

Every agent appends this `self_review` block to its output JSON after running all 6 checks:

```json
{
  "self_review": {
    "passed": true,
    "checks": {
      "schema_compliance": {
        "passed": true,
        "issues": []
      },
      "numeric_sanity": {
        "passed": true,
        "issues": []
      },
      "cross_reference": {
        "passed": true,
        "issues": []
      },
      "threshold_comparison": {
        "passed": true,
        "issues": []
      },
      "completeness": {
        "passed": true,
        "issues": [],
        "steps_completed": 8,
        "steps_total": 8
      },
      "confidence_scoring": {
        "passed": true,
        "confidence_level": "HIGH",
        "uncertainty_flags": []
      }
    },
    "overall_confidence": "HIGH",
    "review_timestamp": "2026-01-27T14:30:00Z"
  }
}
```

**Issue entry format** (used in any `issues` array):

```json
{
  "check": "numeric_sanity",
  "severity": "HIGH",
  "field": "output.financial_summary.cap_rate",
  "message": "Cap rate value 0.25 exceeds maximum bound of 0.15",
  "value_found": 0.25,
  "expected_range": "0.02 to 0.15"
}
```

**Top-level `passed`:** `true` only if ALL six individual checks passed. If any check has `passed: false`, the top-level `passed` must be `false`.

**`overall_confidence`:** Reflects the final confidence after all checks. This may be lower than the agent's initial confidence if checks revealed issues.

---

## 4. Failure Handling

Each check has a defined failure severity that dictates the required response:

| Check | Failure Response | Rationale |
|-------|-----------------|-----------|
| **Check 1: Schema Compliance** | **MUST FIX** before submitting. Missing fields are never acceptable. The orchestrator and downstream agents depend on complete schemas. | Structural integrity is non-negotiable. |
| **Check 2: Numeric Sanity** | **MUST FIX or EXPLAIN.** Impossible values (e.g., occupancy of 2.5) indicate bugs and must be corrected. Unusual but possible values (e.g., cap rate of 0.14) may be accepted with an explanation in `uncertainty_flags`. | Out-of-range values propagate errors downstream. |
| **Check 3: Cross-Reference** | **Log WARNING.** Fix if the correct source data is available. If the source data cannot be resolved, note the discrepancy in `data_gaps` and reduce confidence. | Cross-reference mismatches may indicate stale data rather than bugs. |
| **Check 4: Threshold Comparison** | **MUST FIX.** Wrong classifications directly affect the deal verdict. A PASS that should be FAIL (or vice versa) can lead to incorrect investment decisions. | Classification accuracy is critical to the pipeline's purpose. |
| **Check 5: Completeness** | **Reduce `confidence_level`** to reflect the incompleteness. Log all skipped steps in `data_gaps`. Do not claim HIGH confidence with incomplete output. | Partial output is acceptable if honestly reported. |
| **Check 6: Confidence Scoring** | **Set to LOW if uncertain.** When in doubt, under-report confidence. Missing uncertainty flags must be added. | Overconfidence is more dangerous than under-confidence. |

---

## 5. Integration Instructions

### When to Run

Run the self-review protocol at this exact point in the agent lifecycle:

```
Agent receives input
    --> Agent executes strategy steps
    --> Agent generates final output JSON
    --> ** RUN SELF-REVIEW PROTOCOL HERE **
    --> Agent writes output + self_review to checkpoint
    --> Agent marks checkpoint as COMPLETED
```

### How to Apply

1. **Run all 6 checks sequentially** on the generated output JSON. Order matters because later checks depend on earlier ones (e.g., Check 5 references Check 1 results).
2. **Build the `self_review` block** with results from all checks.
3. **Append `self_review`** to the output JSON as a top-level field.
4. **Evaluate pass/fail:**
   - If all checks pass: Write the output with `self_review` to the checkpoint file. Mark the checkpoint as `COMPLETED`.
   - If any check fails with a **MUST FIX** severity: Attempt to fix the issue in the output. Re-run the self-review. After **2 failed re-run attempts**, submit the output as-is with all issues logged in the `self_review` block and `overall_confidence` set to `LOW`.

### Checkpoint File Location

```
data/status/{deal-id}/agents/{agent-name}.json
```

The `self_review` block is written as part of the agent's output payload inside this checkpoint file.

---

## 6. Agent-Specific Check Examples

### Example A: rent-roll-analyst

```
Check 1 - Schema Compliance:
  - Verify fields: unit_count, occupied_units, avg_rent, total_potential_rent,
    vacancy_loss, effective_gross_income, loss_to_lease, tenant_list[]
  - tenant_list[] entries must each have: unit_id, tenant_name, lease_start,
    lease_end, monthly_rent, status (OCCUPIED | VACANT | DOWN)

Check 2 - Numeric Sanity:
  - occupancy_rate must be between 0.0 and 1.0
  - unit_count must match length of tenant_list array
  - avg_rent must be positive (typical range $500-$5,000/unit for multifamily)
  - loss_to_lease percentage must be between 0.0 and 0.30 (0-30%)
  - vacancy_loss must be <= total_potential_rent
  - effective_gross_income must be positive

Check 3 - Cross-Reference:
  - unit_count must match deal config property.units
  - property_address must match deal config
  - If opex-analyst also reports EGI, values must be within 5%

Check 4 - Threshold Comparison:
  - Compare occupancy_rate against threshold minimum (e.g., 0.85)
  - Compare loss_to_lease against threshold maximum (e.g., 0.10)
  - Verify PASS/FAIL classification is correct for each

Check 5 - Completeness:
  - Steps expected: parse rent roll, calculate occupancy, calculate loss-to-lease,
    identify lease expirations, assess tenant concentration risk, produce summary
  - Any skipped step must appear in data_gaps

Check 6 - Confidence:
  - If rent roll was provided as a PDF and fully parsed: HIGH
  - If some units had missing data and rents were estimated: MEDIUM
  - If rent roll was unavailable and market estimates were used: LOW
  - Flag any estimated rents in uncertainty_flags with reason "estimated"
```

### Example B: financial-model-builder

```
Check 1 - Schema Compliance:
  - Verify fields: noi, dscr, irr, equity_multiple, cash_on_cash, cap_rate,
    ltv, annual_cash_flows[], exit_value, hold_period_years, total_return
  - annual_cash_flows[] entries must each have: year, noi, debt_service,
    cash_flow_before_tax, cumulative_cash_flow

Check 2 - Numeric Sanity:
  - IRR must be between -0.20 and 1.00
  - Equity multiple must be >= 0.0 (typically 1.0 to 3.0 for standard deals)
  - NOI must be positive for a stabilized deal
  - DSCR must be between 0.5 and 5.0
  - Cash-on-cash must be between -0.10 and 0.50
  - annual_cash_flows must have exactly hold_period_years entries
  - Cumulative cash flows in the final year should approximately equal
    total equity returned (sanity check)

Check 3 - Cross-Reference:
  - NOI should match rent-roll-analyst NOI within 5%
  - Debt terms (rate, term, amortization) must match quote-comparator selected quote
  - Purchase price must match deal config
  - DSCR at the given debt service must be arithmetically correct: NOI / annual_debt_service

Check 4 - Threshold Comparison:
  - Compare IRR against minimum threshold (e.g., 0.12)
  - Compare DSCR against minimum threshold (e.g., 1.25)
  - Compare equity_multiple against minimum threshold (e.g., 1.8)
  - Compare cash_on_cash against minimum threshold (e.g., 0.08)
  - Verify every classification is directionally correct

Check 5 - Completeness:
  - Steps expected: build pro forma, calculate returns, run sensitivity analysis,
    compute exit scenarios, produce year-by-year cash flows, summarize metrics
  - If sensitivity analysis was skipped, log in data_gaps and reduce confidence

Check 6 - Confidence:
  - If all inputs came from verified agent outputs: HIGH
  - If some inputs were assumed (e.g., exit cap rate estimated): MEDIUM
  - If key inputs like rent growth or expense growth were guessed: LOW
  - Flag assumed growth rates in uncertainty_flags with impact noting
    "affects IRR, equity multiple, and exit value calculations"
```

### Example C: estoppel-tracker

```
Check 1 - Schema Compliance:
  - Verify fields: total_tenants, estoppels_sent, estoppels_returned,
    return_rate, batches[], outstanding[], discrepancies[], deadline_date
  - batches[] entries must each have: batch_id, sent_date, tenant_count,
    returned_count, tenants[]
  - discrepancies[] entries must each have: tenant_name, field, lease_value,
    estoppel_value, severity

Check 2 - Numeric Sanity:
  - return_rate must equal estoppels_returned / estoppels_sent (within rounding)
  - return_rate must be between 0.0 and 1.0
  - estoppels_returned must be <= estoppels_sent
  - estoppels_sent must be <= total_tenants
  - Sum of batch tenant_counts must equal estoppels_sent
  - Sum of batch returned_counts must equal estoppels_returned

Check 3 - Cross-Reference:
  - total_tenants must match rent-roll-analyst tenant count
  - Tenant names in estoppel batches must exist in the rent roll tenant list
  - No duplicate tenants across batches (each tenant appears in exactly one batch)
  - Property address and deal ID must match deal config

Check 4 - Threshold Comparison:
  - Compare return_rate against minimum threshold (e.g., 0.80 for 80% return rate)
  - Compare discrepancy count against maximum threshold
  - Classify CRITICAL discrepancies correctly (e.g., rent amount mismatch > 10%
    of monthly rent is CRITICAL, not MEDIUM)

Check 5 - Completeness:
  - Steps expected: send batch 1, track responses, send batch 2 (follow-up),
    reconcile returned estoppels against leases, identify discrepancies,
    produce summary with return rate and outstanding list
  - If follow-up batch was not sent, log in data_gaps

Check 6 - Confidence:
  - If return rate >= 90% and no CRITICAL discrepancies: HIGH
  - If return rate 70-89% or minor discrepancies: MEDIUM
  - If return rate < 70% or unresolved CRITICAL discrepancies: LOW
  - Flag all outstanding (unreturned) estoppels in uncertainty_flags with
    reason "unverified" and impact "lease terms for these tenants are unconfirmed"
```
