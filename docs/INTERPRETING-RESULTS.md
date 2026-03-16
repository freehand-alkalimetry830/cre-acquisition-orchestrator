# Interpreting Results

Guide to understanding the analysis outputs, verdicts, scores, and confidence levels produced by the CRE Acquisition Orchestration System.

---

## Verdict Meanings

Every phase and the overall pipeline produce one of three verdicts:

| Verdict | Meaning | Action |
|---------|---------|--------|
| **GO** | All phases pass, risk within tolerance for the deal's investment strategy, no dealbreakers detected. | Recommend proceeding to the next phase or to closing. |
| **CONDITIONAL GO** | Issues found but manageable with specific conditions. Some metrics fall in the "conditional" band rather than clear pass. | Proceed only after addressing the stated conditions. Review each condition and determine if mitigations are feasible within timeline and budget. |
| **NO-GO** | Critical issues detected, dealbreaker findings present, or multiple primary criteria fail simultaneously. | Recommend walking away from the deal. If the buyer still wishes to proceed, all dealbreaker items must be resolved and the pipeline should be re-run. |

### How Verdicts Are Determined

The master orchestrator aggregates phase verdicts using this logic:

1. **Any phase NO-GO** results in an overall NO-GO
2. **All phases GO** results in an overall GO
3. **Any mix of GO and CONDITIONAL GO** (with no NO-GO) results in an overall CONDITIONAL GO

Phase orchestrators determine their own verdicts by checking:
- Agent-level findings against `config/thresholds.json`
- Presence of any items from the `dealbreakers` list
- Number and severity of red flags vs. the `dueDiligence.maxRedFlags` threshold
- Strategy-specific thresholds from `strategyThresholds`

---

## Risk Score Interpretation

The system produces a composite risk score on a 0-100 scale. **Lower scores indicate higher risk.** This is a health score, not a danger score.

| Score Range | Risk Level | Typical Strategy | System Action |
|-------------|-----------|------------------|---------------|
| **90-100** | Low Risk | Core | Proceed with standard due diligence |
| **75-89** | Low-Medium Risk | Core-Plus | Proceed with enhanced due diligence |
| **60-74** | Medium Risk | Value-Add | Enhanced DD required, price adjustment likely needed |
| **40-59** | Medium-High Risk | Opportunistic | Significant concerns, major discount required |
| **0-39** | High Risk | Likely deal-breaker | Not recommended unless exceptional circumstances |

### Strategy-Risk Alignment

The risk score is evaluated against the deal's `investmentStrategy` from `config/deal.json`. A score of 65 might be acceptable for a value-add deal but would fail a core strategy:

| Strategy | Minimum Risk Score | Max High Risks | Max Medium Risks | Min DSCR |
|----------|-------------------|----------------|-----------------|----------|
| Core | 85 | 0 | 2 | 1.30 |
| Core-Plus | 75 | 1 | 3 | 1.20 |
| Value-Add | 60 | 2 | 5 | 1.00 |
| Opportunistic | 40 | 3 | 10 | 0.00 |

These thresholds are configured in `config/thresholds.json` under `strategyThresholds`.

---

## Phase-Specific Results

### Phase 1: Due Diligence

The DD phase runs 7 specialist agents. Each produces a structured report.

#### Agent Reports at a Glance

| Agent | What It Tells You | Key Metrics to Check |
|-------|-------------------|---------------------|
| **rent-roll-analyst** | Revenue validation, lease structure, market positioning | Physical/economic occupancy, loss-to-lease %, anomaly count, lease expiration clustering |
| **opex-analyst** | Operating expense reasonableness, per-unit costs | Expense ratio (target < 45%), per-unit OpEx, line-item anomalies, T-12 trend direction |
| **physical-inspection** | Property condition, deferred maintenance, capex needs | Total capex estimate, critical vs. deferred items, remaining useful life of major systems |
| **market-study** | Submarket fundamentals, comp analysis, demand drivers | Rent growth trend, vacancy trend, supply pipeline, rent comp spread |
| **environmental-review** | Environmental hazards, regulatory compliance | Phase I findings (RECs, CRECs, HRECs), UST status, flood zone, asbestos/lead |
| **legal-title-review** | Title quality, encumbrances, ownership chain | Number of title exceptions, easement impacts, lien status, chain of title gaps |
| **tenant-credit** | Tenant quality, concentration risk, payment history | Top tenant revenue share, delinquency rate, tenant diversity index |

#### DD Red Flags

The system tracks red flags by category. The maximum allowed before triggering a NO-GO verdict is configured in `config/thresholds.json` at `dueDiligence.maxRedFlags` (default: 3). Critical categories that immediately trigger escalation:

- `environmental-contamination`
- `structural-failure`
- `title-defect`
- `zoning-violation`
- `flood-zone-uninsurable`

#### DD Data Gaps

Each agent reports data gaps when source documents are missing or incomplete. The maximum allowed is `dueDiligence.maxDataGaps` (default: 5). More gaps reduce overall confidence but do not automatically trigger a NO-GO unless they affect critical metrics.

---

### Phase 2: Underwriting

The underwriting phase builds a financial model and stress-tests it across 27 scenarios.

#### Reading the Financial Model

The **financial-model-builder** agent produces a base case pro forma. Key outputs:

| Metric | What It Means | Where to Find Threshold |
|--------|--------------|------------------------|
| **NOI** | Net Operating Income = Revenue - Operating Expenses (excludes debt service and capex) | `underwriting.baseCase.minNOI` |
| **Cap Rate** | NOI / Purchase Price. Measures unlevered yield. | `underwriting.baseCase.minCapRate` / `maxCapRate` |
| **IRR** | Internal Rate of Return. Time-weighted total return including sale proceeds. | `underwriting.minIRR` (default: 15%) |
| **Equity Multiple** | Total distributions / Total equity invested. A 2.0x means you doubled your money. | `underwriting.minEquityMultiple` (default: 1.8x) |
| **DSCR** | Debt Service Coverage Ratio = NOI / Annual Debt Service. Measures ability to pay the mortgage. | `primaryCriteria.dscr.pass` (default: 1.25x) |
| **Cash-on-Cash** | Annual cash flow after debt service / Total equity invested. Measures annual yield on equity. | `primaryCriteria.cashOnCash.pass` (default: 8%) |
| **LTV** | Loan-to-Value = Loan Amount / Property Value. Measures leverage. | `primaryCriteria.ltv.maxPass` (default: 75%) |
| **Debt Yield** | NOI / Loan Amount. Lender's yield measure independent of interest rate. | `primaryCriteria.debtYield.pass` (default: 9%) |

#### Scenario Analysis (27 Scenarios)

The **scenario-analyst** agent tests the deal across a 3x3x3 matrix:

- **3 Revenue scenarios**: Base, Upside (+5% rent growth), Downside (-10% occupancy)
- **3 Expense scenarios**: Base, Low (+2% growth), High (+5% growth)
- **3 Financing scenarios**: Base rate, Rate +100bps, Rate +200bps

This produces 27 combinations. The system evaluates how many pass all primary criteria:

| Pass Rate | Interpretation |
|-----------|---------------|
| 27/27 (100%) | Extremely robust deal, passes all stress tests |
| 22-26/27 (80-96%) | Strong deal, fails only extreme scenarios |
| 18-21/27 (67-78%) | Acceptable, but sensitive to adverse conditions |
| 14-17/27 (52-63%) | Marginal, significant downside risk |
| < 14/27 (< 52%) | Weak, likely fails under moderate stress |

The minimum passing threshold is configured at `underwriting.minScenariosPassingAll` (default: 18 of 27).

#### IC Memo

The **ic-memo-writer** synthesizes all findings into an Investment Committee memorandum. This is the primary human-readable deliverable, structured per the template at `templates/ic-memo-template.md`.

---

### Phase 3: Financing

The financing phase contacts lenders and compares quotes.

#### Comparing Lender Quotes

The **quote-comparator** agent produces a comparison matrix. When reviewing quotes, prioritize these factors in order:

| Factor | Why It Matters | What to Look For |
|--------|---------------|-----------------|
| **All-in rate** | Total cost of debt (rate + fees amortized over expected hold) | Lowest blended cost, not just headline rate |
| **DSCR requirement** | Determines max loan amount | Lower DSCR requirement = more proceeds |
| **Prepayment structure** | Cost to exit early | Yield maintenance vs. defeasance vs. step-down. Yield maintenance is most expensive. |
| **Recourse** | Personal guarantee exposure | Non-recourse preferred; carve-outs for "bad acts" are standard |
| **Term vs. hold period** | Maturity risk if hold extends | Loan term should exceed planned hold period |
| **IO period** | Cash flow during renovation/stabilization | Longer IO = more cash flow for value-add execution |
| **Rate lock timing** | Interest rate risk | Earlier lock reduces risk but may cost more |

The system requires a minimum of 3 lender quotes (`financing.minLenderQuotes`).

#### Financing Thresholds

| Metric | Threshold | Source |
|--------|-----------|--------|
| Max LTV | 75% | `financing.maxLTV` |
| Min DSCR | 1.25x | `financing.minDSCR` |
| Max Interest Rate | 8.0% | `financing.maxInterestRate` |
| Min Loan Term | 5 years | `financing.minLoanTerm_years` |
| Max Origination Fee | 2.0% | `financing.maxOriginationFee_pct` |

---

### Phase 4: Legal

The legal phase reviews contracts, title, and prepares for closing.

#### PSA Risk Flags

The **psa-reviewer** agent identifies risk items in the Purchase & Sale Agreement:

| Risk Category | Examples | Severity |
|--------------|---------|----------|
| Deadline exposure | Short DD period, tight financing deadline | HIGH if < 30 days |
| Remedy limitations | Liquidated damages cap, specific performance waiver | MEDIUM-HIGH |
| Seller protections | Broad seller reps carve-outs, as-is provisions | MEDIUM |
| Contingency gaps | Missing financing contingency, inadequate title cure | HIGH |
| Deposit structure | Non-refundable day-1 deposits, accelerated hard money | HIGH |

#### Deadline Calendar

The PSA reviewer extracts all contractual deadlines into a calendar:
- DD expiration date
- Financing commitment deadline
- Title objection deadline
- Survey approval deadline
- Estoppel delivery deadline
- Closing date
- Post-closing obligations

#### Estoppel Tracking

The **estoppel-tracker** manages collection across all tenants (up to 200 sub-agents for large properties). Key metrics:
- **Return rate**: Minimum 80% required (`legal.estoppelReturnRate_min_pct`)
- **Variance threshold**: Discrepancies > 5% from rent roll trigger flags (`legal.maxEstoppelVariance_pct`)

#### Legal Document Requirements

All items in `legal.criticalDocuments` must be obtained:
- Title commitment
- Survey
- Estoppel certificates
- Insurance binders
- Loan documents

---

### Phase 5: Closing

The closing phase verifies readiness and manages funds flow.

#### Readiness Assessment

The **closing-coordinator** checks all pre-closing items from `closing.requiredPreClosingItems`:

| Item | What It Means |
|------|--------------|
| `title-clear` | All title exceptions resolved or accepted |
| `survey-approved` | Survey reviewed and approved by buyer and lender |
| `insurance-bound` | All required insurance policies bound and certificates issued |
| `loan-docs-signed` | Loan documents executed by all parties |
| `estoppels-collected` | Minimum return rate achieved, no material discrepancies |
| `funds-wired` | All parties' funds verified in escrow |

#### Pre-Closing Checklist

The closing coordinator produces a pass/fail checklist. **All items must pass** for a GO verdict. Any single failure results in CONDITIONAL GO (if fixable before closing) or NO-GO (if unfixable).

#### Funds Flow

The **funds-flow-manager** produces a detailed funds flow memo showing:
- Sources (buyer equity, lender proceeds)
- Uses (purchase price, closing costs, reserves, prorations)
- Wire instructions for all parties
- Required approvals from: buyer, seller, lender, title company

Closing cost variance must stay within 5% of estimates (`closing.maxClosingCostVariance_pct`).

---

## Confidence Levels

Every agent assigns a confidence level to its analysis:

| Level | Meaning | Basis | How to Treat |
|-------|---------|-------|-------------|
| **HIGH** | Analysis based on verified source documents with cross-referenced data | Complete data available, no significant assumptions, multiple sources validate findings | Rely on findings for decision-making |
| **MEDIUM** | Most data available but some assumptions or interpolated values used | 1-2 data gaps filled with benchmarks or estimates, minor cross-reference gaps | Acceptable for decision-making but note the assumptions. Consider ordering additional data if time permits. |
| **LOW** | Significant data gaps, multiple assumptions, limited cross-referencing | Major source documents unavailable, heavy reliance on estimates and industry benchmarks | Treat with caution. Additional data collection strongly recommended before committing capital. |

### How Confidence Propagates

- Phase confidence is the **lowest** confidence of any critical agent in that phase
- Overall confidence is the **lowest** phase confidence across all phases
- A single LOW-confidence critical agent can reduce the entire pipeline's confidence to LOW

---

## Uncertainty Flags

Agents tag individual data points with uncertainty flags when the data quality is less than fully verified.

### Flag Types

| Reason | Meaning | Recommended Action |
|--------|---------|-------------------|
| `estimated` | Value calculated from indirect data or industry benchmarks | Verify with actual source document when available |
| `assumed` | Value assumed based on deal context or typical market conditions | Confirm assumption with seller, broker, or independent research |
| `unverified` | Data provided by seller but not independently confirmed | Order independent verification (appraisal, inspection, audit) |
| `stale_data` | Data is older than 6 months and may not reflect current conditions | Request updated data from seller or conduct fresh research |
| `interpolated` | Value derived by interpolating between known data points | Acceptable for estimates; verify for critical metrics |

### When to Seek Additional Data

Seek additional data before proceeding when:

1. **Any critical agent** has confidence level LOW
2. **More than 3 uncertainty flags** appear on primary criteria metrics (DSCR, IRR, CoC, LTV)
3. **Dealbreaker-adjacent findings** have uncertainty flags (e.g., environmental status is "unverified")
4. **The scenario pass rate** is near the threshold (18-20 of 27) and key inputs are flagged as estimated
5. **Financing quotes** are based on estimated NOI rather than verified T-12 data

### Reading Uncertainty Flags in Output

Each uncertainty flag appears in the agent's output JSON:

```json
{
  "uncertainty_flags": [
    {
      "field_name": "market_rent_2br",
      "reason": "interpolated",
      "impact": "Affects loss-to-lease calculation and revenue projections in underwriting"
    }
  ]
}
```

The `impact` field explains which downstream analyses are affected. Use this to trace how a single data gap ripples through the pipeline.

---

## Quick Reference: Reading the Final Report

The final report at `data/reports/{deal-id}/final-report.md` follows the template at `templates/report-template.md`. Here is how to scan it efficiently:

1. **Start with the Executive Summary** -- Overall verdict, risk score, and key metrics
2. **Check the Dealbreaker Section** -- Any items here are non-negotiable
3. **Review Phase Verdicts** -- Look for any CONDITIONAL or NO-GO phases
4. **Scan Red Flags by Severity** -- HIGH flags first, then MEDIUM
5. **Check Scenario Pass Rate** -- How robust is the deal under stress?
6. **Review Confidence and Data Gaps** -- Are findings reliable enough for a capital commitment?
7. **Read Conditions** -- For CONDITIONAL GO, what must be resolved?

---

## Cross-References

- Threshold definitions: [Threshold Customization](THRESHOLD-CUSTOMIZATION.md)
- Deal configuration fields: [Deal Configuration](DEAL-CONFIGURATION.md)
- Agent details and outputs: [Agent Development](AGENT-DEVELOPMENT.md)
- CRE terminology: [Glossary](GLOSSARY.md)
