# Threshold Customization Guide

The file `config/thresholds.json` defines the investment criteria that determine whether a deal receives a PASS, FAIL, or CONDITIONAL verdict. This guide explains every threshold, what it controls, and how to adjust it for your investment strategy and market conditions.

---

## How Thresholds Work

Every threshold is checked during the final report validation. The master orchestrator compares actual deal metrics (computed by agents) against these thresholds to produce the Go/No-Go verdict.

- **PASS:** All primary criteria met, no dealbreakers
- **CONDITIONAL:** Some criteria marginal but no dealbreakers. Conditions listed in report.
- **FAIL:** Any dealbreaker present OR multiple primary criteria fail

---

## Primary Criteria

These are the core financial metrics that determine the verdict. All are checked during the final validation step.

### DSCR (Debt Service Coverage Ratio)

| Setting | Default | Description |
|---------|---------|-------------|
| `primaryCriteria.dscr.pass` | `1.25` | DSCR at or above this = PASS |
| `primaryCriteria.dscr.conditional` | `1.0` | DSCR between conditional and pass = CONDITIONAL |
| `primaryCriteria.dscr.fail` | `1.0` | DSCR below this = FAIL |

**What it controls:** Whether the property's NOI adequately covers annual debt service payments. A DSCR of 1.25 means NOI is 25% above debt service.

**Agents that check it:** financial-model-builder, scenario-analyst, quote-comparator

**Impact of changing:**
- Raising to 1.30+: More conservative, fewer deals pass, better downside protection
- Lowering to 1.15: Allows tighter deals through, common for value-add with near-term upside

---

### Cap Rate Spread

| Setting | Default | Description |
|---------|---------|-------------|
| `primaryCriteria.capRateSpread.pass` | `100` | Spread >= 100 bps = PASS |
| `primaryCriteria.capRateSpread.conditional` | `0` | Spread between 0 and 100 bps = CONDITIONAL |
| `primaryCriteria.capRateSpread.fail` | `0` | Negative spread = FAIL |

**What it controls:** The difference between the property cap rate and the debt rate, measured in basis points (bps). Positive spread means the property yields more than the cost of debt.

**Agents that check it:** financial-model-builder, ic-memo-writer, master orchestrator (final verdict)

**Impact of changing:**
- Raising to 150 bps: Only allows deals with significant positive leverage
- Lowering to 50 bps: Accepts thinner spreads, common in hot markets where cap rates are compressed

---

### Cash-on-Cash Return

| Setting | Default | Description |
|---------|---------|-------------|
| `primaryCriteria.cashOnCash.pass` | `0.08` | Cash-on-cash >= 8% = PASS |
| `primaryCriteria.cashOnCash.conditional` | `0.05` | Between 5% and 8% = CONDITIONAL |
| `primaryCriteria.cashOnCash.fail` | `0.05` | Below 5% = FAIL |

**What it controls:** Annual cash flow as a percentage of total equity invested. Measures how much cash the deal distributes to investors each year.

**Agents that check it:** financial-model-builder, scenario-analyst

**Impact of changing:**
- Raising to 10%: High cash flow requirement, filters for cash-flowing deals only
- Lowering to 6%: Allows lower-yielding deals with appreciation upside (common for core strategy)

---

### Debt Yield

| Setting | Default | Description |
|---------|---------|-------------|
| `primaryCriteria.debtYield.pass` | `0.09` | Debt yield >= 9% = PASS |
| `primaryCriteria.debtYield.conditional` | `0.07` | Between 7% and 9% = CONDITIONAL |
| `primaryCriteria.debtYield.fail` | `0.07` | Below 7% = FAIL |

**What it controls:** NOI divided by total loan amount. Measures how well the property covers the loan independent of interest rate. Lenders use this as a sizing constraint.

**Agents that check it:** financial-model-builder, lender-outreach (lender qualification)

**Impact of changing:**
- Raising to 10%: More conservative loan sizing, higher equity required
- Lowering to 8%: Standard for agency loans in strong markets

---

### LTV (Loan-to-Value)

| Setting | Default | Description |
|---------|---------|-------------|
| `primaryCriteria.ltv.maxPass` | `0.75` | LTV <= 75% = PASS |
| `primaryCriteria.ltv.maxConditional` | `0.80` | LTV between 75% and 80% = CONDITIONAL |
| `primaryCriteria.ltv.fail` | `0.80` | LTV above 80% = FAIL |

**What it controls:** Maximum loan amount as a percentage of property value. Higher LTV = more leverage = more risk.

**Agents that check it:** lender-outreach, quote-comparator, financial-model-builder

**Impact of changing:**
- Lowering to 0.70: More conservative, requires more equity but better downside protection
- Raising to 0.80: Agency programs allow this in some cases, but increases risk exposure

---

## Secondary Criteria

These provide additional context and nuance. They influence the risk score and confidence but do not directly trigger FAIL verdicts on their own.

### Occupancy Benchmarks

| Setting | Default | Description |
|---------|---------|-------------|
| `secondaryCriteria.occupancy.strong` | `0.95` | Excellent occupancy |
| `secondaryCriteria.occupancy.acceptable` | `0.90` | Normal range |
| `secondaryCriteria.occupancy.concern` | `0.85` | Below market, needs investigation |
| `secondaryCriteria.occupancy.distressed` | `0.80` | Significant vacancy, risk factor |

**Agents that check it:** rent-roll-analyst, market-study

---

### Expense Ratio Benchmarks

| Setting | Default | Description |
|---------|---------|-------------|
| `secondaryCriteria.expenseRatio.excellent` | `0.40` | Very efficient operations |
| `secondaryCriteria.expenseRatio.good` | `0.45` | Well-managed |
| `secondaryCriteria.expenseRatio.acceptable` | `0.50` | Industry average |
| `secondaryCriteria.expenseRatio.concern` | `0.55` | Above average, may need attention |

**Agents that check it:** opex-analyst, financial-model-builder

---

### Rent-to-Market Benchmarks

| Setting | Default | Description |
|---------|---------|-------------|
| `secondaryCriteria.rentToMarket.upside` | `0.90` | In-place rents 10%+ below market (upside opportunity) |
| `secondaryCriteria.rentToMarket.atMarket` | `1.0` | At market rents |
| `secondaryCriteria.rentToMarket.aboveMarket` | `1.05` | 5% above market (rent correction risk) |
| `secondaryCriteria.rentToMarket.overpriced` | `1.10` | 10%+ above market (significant risk) |

**Agents that check it:** rent-roll-analyst, market-study

---

### Cap Rate Benchmarks

| Setting | Default | Description |
|---------|---------|-------------|
| `secondaryCriteria.capRate.strong` | `0.07` | Strong yield |
| `secondaryCriteria.capRate.acceptable` | `0.055` | Market rate |
| `secondaryCriteria.capRate.marginal` | `0.045` | Below average |
| `secondaryCriteria.capRate.fail` | `0.04` | Too low for most strategies |

**Agents that check it:** financial-model-builder, ic-memo-writer

---

## Dealbreakers

Automatic FAIL regardless of financial metrics. If any of these conditions are found, the verdict is FAIL.

| Dealbreaker | Description |
|-------------|-------------|
| Active title dispute or lis pendens | Legal claim against the property |
| Property in bankruptcy estate | Cannot close clean title |
| Dissolved entity ownership | Seller cannot legally convey |
| Active environmental contamination (unquantified) | Unknown cleanup cost |
| Demolition order or condemnation | Property condemned by authority |
| Criminal activity nexus | Property associated with criminal enterprise |
| Fraud in title chain | Title chain compromised |
| DSCR below 0.80 without clear value-add thesis | Cannot service debt even with adjustments |
| Structural failure requiring demolition | Building not salvageable |
| Uninsurable property condition | Cannot obtain required insurance |

**To add custom dealbreakers:** Add strings to the `dealbreakers` array. Each string is checked against agent findings.

**To remove dealbreakers:** Remove strings from the array. Proceed with caution -- these exist for safety.

---

## Risk Score Ranges

The system computes a composite risk score from 0-100. These ranges determine the risk classification.

| Range | Score | Default Action | Agents |
|-------|-------|---------------|--------|
| Low Risk | 90-100 | Proceed with standard DD | risk-scoring skill |
| Low-Medium Risk | 75-89 | Proceed with enhanced DD | risk-scoring skill |
| Medium Risk | 60-74 | Enhanced DD required, price adjustment likely | risk-scoring skill |
| Medium-High Risk | 40-59 | Significant concerns, major discount required | risk-scoring skill |
| High Risk | 0-39 | Not recommended | risk-scoring skill |

---

## Strategy-Specific Thresholds

Different investment strategies have different tolerance levels. These override the primary criteria for strategy-specific evaluation.

### Core

| Threshold | Value | Meaning |
|-----------|-------|---------|
| `minDSCR` | `1.30` | Higher debt coverage required |
| `maxHighRisks` | `0` | Zero high-risk findings allowed |
| `maxMediumRisks` | `2` | At most 2 medium-risk findings |
| `minRiskScore` | `85` | Must be low-risk |

**Profile:** Stabilized, institutional-quality assets. Lowest risk tolerance, highest quality requirements.

### Core-Plus

| Threshold | Value | Meaning |
|-----------|-------|---------|
| `minDSCR` | `1.20` | Standard debt coverage |
| `maxHighRisks` | `1` | At most 1 high-risk finding |
| `maxMediumRisks` | `3` | At most 3 medium-risk findings |
| `minRiskScore` | `75` | Low-medium risk acceptable |

**Profile:** Stable assets with light value-add opportunity. Moderate risk tolerance.

### Value-Add

| Threshold | Value | Meaning |
|-----------|-------|---------|
| `minDSCR` | `1.0` | Breakeven debt coverage acceptable |
| `maxHighRisks` | `2` | Up to 2 high-risk findings |
| `maxMediumRisks` | `5` | Up to 5 medium-risk findings |
| `minRiskScore` | `60` | Medium risk acceptable |

**Profile:** Assets requiring significant repositioning. Higher risk tolerance justified by upside potential.

### Opportunistic

| Threshold | Value | Meaning |
|-----------|-------|---------|
| `minDSCR` | `0.0` | No minimum (may be pre-stabilization) |
| `maxHighRisks` | `3` | Up to 3 high-risk findings |
| `maxMediumRisks` | `10` | Up to 10 medium-risk findings |
| `minRiskScore` | `40` | Medium-high risk acceptable |

**Profile:** Distressed or development deals. Highest risk tolerance, relies on execution capability.

---

## Phase-Specific Thresholds

### Due Diligence Phase

| Threshold | Default | Description |
|-----------|---------|-------------|
| `dueDiligence.maxRedFlags` | `3` | Max red flags before phase = CONDITIONAL |
| `dueDiligence.maxDataGaps` | `5` | Max data gaps before phase = CONDITIONAL |
| `dueDiligence.minAgentsComplete` | `5` | Min agents that must finish (of 7) |
| `dueDiligence.minCriticalAgentsComplete` | `4` | Min critical agents that must finish (of 6) |
| `dueDiligence.criticalRedFlagCategories` | See list | Categories that trigger immediate concern |
| `dueDiligence.criticalAgents` | See list | Agents that must complete for phase to pass |
| `dueDiligence.agentTimeouts.default_minutes` | `30` | Default agent timeout |
| `dueDiligence.agentTimeouts.market-study_minutes` | `45` | Market study gets extra time (web research) |
| `dueDiligence.agentTimeouts.environmental-review_minutes` | `45` | Environmental gets extra time (database lookups) |

**Critical red flag categories:** `environmental-contamination`, `structural-failure`, `title-defect`, `zoning-violation`, `flood-zone-uninsurable`

**Critical agents:** `rent-roll-analyst`, `opex-analyst`, `environmental-review`, `legal-title-review`

### Underwriting Phase

| Threshold | Default | Description |
|-----------|---------|-------------|
| `underwriting.minIRR` | `0.15` | Minimum IRR for base case to pass |
| `underwriting.minEquityMultiple` | `1.8` | Minimum equity multiple |
| `underwriting.minDSCR` | `1.25` | Minimum DSCR |
| `underwriting.minCashOnCash` | `0.08` | Minimum stabilized cash-on-cash |
| `underwriting.maxLTV` | `0.75` | Maximum LTV |
| `underwriting.minScenariosPassingAll` | `18` | Min scenarios passing all criteria (of 27) |
| `underwriting.totalScenarios` | `27` | Total scenario count (3x3x3 matrix) |
| `underwriting.stressTest.maxVacancyRate` | `0.15` | Worst-case vacancy in stress test |
| `underwriting.stressTest.maxExpenseRatio` | `0.55` | Worst-case expense ratio |
| `underwriting.stressTest.maxInterestRate` | `0.08` | Worst-case interest rate |

### Financing Phase

| Threshold | Default | Description |
|-----------|---------|-------------|
| `financing.maxLTV` | `0.75` | Maximum acceptable LTV from lenders |
| `financing.minDSCR` | `1.25` | Minimum DSCR at loan terms |
| `financing.maxInterestRate` | `0.08` | Maximum acceptable interest rate |
| `financing.minLoanTerm_years` | `5` | Minimum acceptable loan term |
| `financing.maxOriginationFee_pct` | `0.02` | Maximum origination fee (2%) |
| `financing.minLenderQuotes` | `3` | Minimum quotes to collect |
| `financing.maxPrepaymentPenalty` | `"yield-maintenance"` | Maximum prepayment penalty type |
| `financing.agentTimeouts.lender-outreach_minutes` | `60` | Lender outreach gets extra time |

### Legal Phase

| Threshold | Default | Description |
|-----------|---------|-------------|
| `legal.maxOpenViolations` | `0` | No open code violations allowed |
| `legal.maxTitleExceptions` | `5` | Max title exceptions before concern |
| `legal.requiredInsuranceCoverage` | See list | Required insurance types |
| `legal.estoppelReturnRate_min_pct` | `0.80` | Min 80% of estoppels returned |
| `legal.maxEstoppelVariance_pct` | `0.05` | Max 5% variance from rent roll |
| `legal.maxPendingLitigation` | `0` | No pending litigation allowed |
| `legal.agentTimeouts.estoppel-tracker_minutes` | `90` | Estoppel tracking gets longest timeout |

**Required insurance:** `general-liability`, `property`, `umbrella`, `flood`

### Closing Phase

| Threshold | Default | Description |
|-----------|---------|-------------|
| `closing.requiredPreClosingItems` | See list | All items must be resolved |
| `closing.maxClosingCostVariance_pct` | `0.05` | Max 5% variance from estimated costs |
| `closing.requiredFundsFlowApprovals` | See list | All parties must approve |
| `closing.postClosingDeadline_days` | `30` | Days for post-closing items |

**Required pre-closing items:** `title-clear`, `survey-approved`, `insurance-bound`, `loan-docs-signed`, `estoppels-collected`, `funds-wired`

**Required approvals:** `buyer`, `seller`, `lender`, `title-company`

---

## Market Adjustment Guidance

### Hot Market (High Demand, Compressed Cap Rates)

When cap rates are compressed and competition is fierce:

```json
{
  "primaryCriteria": {
    "capRateSpread": { "pass": 50, "conditional": -25, "fail": -25 },
    "cashOnCash": { "pass": 0.06, "conditional": 0.04, "fail": 0.04 }
  },
  "secondaryCriteria": {
    "capRate": { "strong": 0.055, "acceptable": 0.045, "marginal": 0.04, "fail": 0.035 }
  }
}
```

**Rationale:** In competitive markets, lower absolute returns are acceptable because appreciation expectations are higher and vacancy risk is lower.

### Distressed Market (High Vacancy, Softening Rents)

When the market is stressed or declining:

```json
{
  "primaryCriteria": {
    "dscr": { "pass": 1.40, "conditional": 1.20, "fail": 1.20 },
    "cashOnCash": { "pass": 0.10, "conditional": 0.07, "fail": 0.07 }
  },
  "secondaryCriteria": {
    "occupancy": { "strong": 0.90, "acceptable": 0.85, "concern": 0.80, "distressed": 0.75 }
  },
  "underwriting": {
    "stressTest": {
      "maxVacancyRate": 0.20,
      "maxExpenseRatio": 0.60,
      "maxInterestRate": 0.09
    }
  }
}
```

**Rationale:** Distressed markets require higher margins of safety. Tighter DSCR requirements protect against further decline. Wider stress test ranges ensure the deal survives continued deterioration.

### Rising Rate Environment

When interest rates are climbing:

```json
{
  "primaryCriteria": {
    "capRateSpread": { "pass": 75, "conditional": 0, "fail": 0 }
  },
  "financing": {
    "maxInterestRate": 0.09
  },
  "underwriting": {
    "stressTest": {
      "maxInterestRate": 0.10
    }
  }
}
```

**Rationale:** When rates are rising, accept tighter spreads today but stress test against higher future rates.

---

## Editing Thresholds

1. Open `config/thresholds.json` in your editor
2. Modify only the values you want to change
3. Save the file before launching the pipeline
4. The master orchestrator reads thresholds at startup

```bash
code config/thresholds.json
```

**Do not change the structure** (key names, nesting). Only change numeric values, strings in arrays, or add/remove items from arrays like `dealbreakers`.

---

## See Also

- [DEAL-CONFIGURATION.md](DEAL-CONFIGURATION.md) -- Deal input fields that produce the metrics compared against thresholds
- [ARCHITECTURE.md](ARCHITECTURE.md) -- How agents use thresholds in the pipeline
- [FIRST-DEAL-GUIDE.md](FIRST-DEAL-GUIDE.md) -- Running your first deal with default thresholds
