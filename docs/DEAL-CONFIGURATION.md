# Deal Configuration Reference

Complete field-by-field reference for `config/deal.json`. This is the primary input file for every acquisition analysis.

---

## How to Use This File

1. Copy `config/deal-example.json` to `config/deal.json`
2. Replace example values with your deal data
3. All required fields must be populated before launching the pipeline
4. Optional fields improve analysis quality but are not blocking
5. Validate format against `config/deal-schema.json`

---

## Minimal Configuration

The absolute minimum fields required to launch the pipeline. The system will still run with only these fields, though analysis quality improves with more data.

```json
{
  "dealId": "DEAL-2025-001",
  "dealName": "Property Name",
  "property": {
    "address": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zip": "78701",
    "propertyType": "multifamily",
    "yearBuilt": 1995,
    "totalUnits": 150,
    "unitMix": {
      "types": [
        { "type": "1BR/1BA", "count": 80, "avgSqFt": 750, "marketRent": 1400, "inPlaceRent": 1300 },
        { "type": "2BR/2BA", "count": 70, "avgSqFt": 1050, "marketRent": 1800, "inPlaceRent": 1700 }
      ]
    }
  },
  "financials": {
    "askingPrice": 25000000,
    "currentNOI": 1750000,
    "inPlaceOccupancy": 0.94
  },
  "financing": {
    "targetLTV": 0.70,
    "estimatedRate": 0.055,
    "loanTerm": 10,
    "amortization": 30,
    "loanType": "Agency"
  },
  "investmentStrategy": "core-plus",
  "targetHoldPeriod": 5,
  "targetIRR": 0.15,
  "targetEquityMultiple": 1.8,
  "targetCashOnCash": 0.08,
  "seller": { "entity": "Seller Entity LLC" },
  "timeline": {
    "psaExecutionDate": "2025-06-01",
    "ddStartDate": "2025-06-01",
    "ddExpirationDate": "2025-07-15",
    "closingDate": "2025-09-01"
  }
}
```

---

## Field Reference by Section

### Top-Level Fields

| Field | Type | Required | Description | Valid Values | Example | Used By |
|-------|------|----------|-------------|-------------|---------|---------|
| `dealId` | string | **Yes** | Unique deal identifier | Format: `DEAL-YYYY-NNN` | `"DEAL-2025-001"` | All agents (file paths, logs, status) |
| `dealName` | string | **Yes** | Human-readable property name | 1-200 characters | `"Parkview Apartments"` | Reports, dashboard display |
| `investmentStrategy` | string | **Yes** | Investment strategy classification | `"core"`, `"core-plus"`, `"value-add"`, `"opportunistic"` | `"core-plus"` | All agents (sets risk tolerance and thresholds) |
| `targetHoldPeriod` | integer | **Yes** | Planned hold period | 1-30 years | `5` | financial-model-builder, scenario-analyst |
| `targetIRR` | number | **Yes** | Target Internal Rate of Return | 0.0-1.0 (decimal) | `0.15` (15%) | scenario-analyst, ic-memo-writer, final verdict |
| `targetEquityMultiple` | number | **Yes** | Target equity multiple | >= 1.0 | `1.8` (1.8x) | scenario-analyst, ic-memo-writer, final verdict |
| `targetCashOnCash` | number | **Yes** | Target cash-on-cash return | 0.0-1.0 (decimal) | `0.08` (8%) | financial-model-builder, final verdict |
| `notes` | string | No | Free-form deal notes | Any text | `"Seller motivated by 1031 exchange"` | Master orchestrator context |

### Property Section

| Field | Type | Required | Description | Valid Values | Example | Used By |
|-------|------|----------|-------------|-------------|---------|---------|
| `property.address` | string | **Yes** | Street address | Non-empty string | `"4200 SE Division Street"` | environmental-review, market-study, legal-title-review |
| `property.city` | string | **Yes** | City name | Non-empty string | `"Portland"` | market-study, environmental-review |
| `property.state` | string | **Yes** | State abbreviation | Two uppercase letters | `"OR"` | All DD agents, legal agents |
| `property.zip` | string | **Yes** | ZIP code | 5-digit string (preserves leading zeros) | `"97202"` | market-study, environmental-review |
| `property.county` | string | No | County name | Any string | `"Multnomah"` | legal-title-review, environmental-review |
| `property.propertyType` | string | **Yes** | Property classification | `"multifamily"`, `"office"`, `"retail"`, `"industrial"` | `"multifamily"` | All agents (determines specialization) |
| `property.yearBuilt` | integer | **Yes** | Construction year | 1800-2030 | `1988` | environmental-review, physical-inspection, capex estimation |
| `property.totalUnits` | integer | **Yes** | Total unit count | >= 1 | `200` | All agents (per-unit metrics baseline) |
| `property.totalSqFt` | integer | No | Total rentable square footage | >= 1 | `180000` | market-study (price/SF comps) |
| `property.avgUnitSqFt` | integer | No | Average unit size in SF | >= 1 | `900` | market-study, rent comps |
| `property.stories` | integer | No | Number of stories/floors | 1-100 | `3` | physical-inspection, insurance-coordinator |
| `property.buildings` | integer | No | Number of buildings | >= 1 | `8` | physical-inspection |
| `property.parking.type` | string | No | Parking type | `"surface"`, `"covered"`, `"garage"`, `"street"`, `"mixed"`, `"none"` | `"surface"` | physical-inspection, market-study |
| `property.parking.spaces` | integer | No | Total parking spaces | >= 0 | `250` | market-study (parking ratio analysis) |
| `property.amenities` | array | No | List of amenities | Array of strings | `["pool", "fitness center"]` | market-study (comp positioning) |

### Unit Mix Section

| Field | Type | Required | Description | Valid Values | Example | Used By |
|-------|------|----------|-------------|-------------|---------|---------|
| `property.unitMix.types` | array | **Yes** | Array of unit type objects | At least 1 entry | See below | rent-roll-analyst, financial-model-builder |
| `types[].type` | string | **Yes** | Unit type label | Non-empty string | `"1BR/1BA"` | rent-roll-analyst |
| `types[].count` | integer | **Yes** | Number of units of this type | >= 1 | `80` | rent-roll-analyst, financial-model-builder |
| `types[].avgSqFt` | integer | **Yes** | Average square footage | >= 1 | `750` | rent-roll-analyst, market-study |
| `types[].marketRent` | number | **Yes** | Monthly market rent (USD) | >= 0 | `1500` | rent-roll-analyst (loss-to-lease calc) |
| `types[].inPlaceRent` | number | **Yes** | Monthly in-place rent (USD) | >= 0 | `1400` | rent-roll-analyst, financial-model-builder |

**Important:** The sum of all `types[].count` values should equal `property.totalUnits`.

### Financials Section

| Field | Type | Required | Description | Valid Values | Example | Used By |
|-------|------|----------|-------------|-------------|---------|---------|
| `financials.askingPrice` | number | **Yes** | Purchase price (USD) | > 0 | `32000000` | All agents (per-unit price, cap rate, returns) |
| `financials.pricePerUnit` | number | No | Price per unit (USD) | >= 0 | `160000` | market-study (auto-calculated if omitted) |
| `financials.currentNOI` | number | **Yes** | Trailing 12-month NOI (USD) | Any number | `2063700` | financial-model-builder, scenario-analyst |
| `financials.proFormaNOI` | number | No | Projected stabilized NOI (USD) | >= 0 | `2400000` | financial-model-builder (value-add upside) |
| `financials.inPlaceOccupancy` | number | **Yes** | Current physical occupancy | 0.0-1.0 | `0.93` | rent-roll-analyst, financial-model-builder |
| `financials.marketOccupancy` | number | No | Submarket stabilized occupancy | 0.0-1.0 | `0.95` | market-study, scenario-analyst |
| `financials.trailingT12Revenue` | number | No | T-12 gross revenue (USD) | >= 0 | `3571200` | opex-analyst (expense ratio calc) |
| `financials.trailingT12Expenses` | number | No | T-12 operating expenses (USD) | >= 0 | `1507500` | opex-analyst |
| `financials.capExBudget` | number | No | Capital expenditure budget (USD) | >= 0 | `500000` | physical-inspection, financial-model-builder |
| `financials.renovationBudget` | number | No | Renovation budget (USD) | >= 0 | `2000000` | financial-model-builder (value-add) |
| `financials.estimatedClosingCosts` | number | No | Estimated closing costs (USD) | >= 0 | `480000` | closing-coordinator, funds-flow-manager |

**Note:** All monetary values are plain numbers in USD. No dollar signs, commas, or formatting. Example: `32000000` not `$32,000,000`.

### Financing Section

| Field | Type | Required | Description | Valid Values | Example | Used By |
|-------|------|----------|-------------|-------------|---------|---------|
| `financing.targetLTV` | number | **Yes** | Target Loan-to-Value ratio | 0.0-1.0 | `0.70` (70%) | lender-outreach, quote-comparator, financial-model-builder |
| `financing.estimatedRate` | number | **Yes** | Estimated interest rate | 0.0-1.0 | `0.0565` (5.65%) | financial-model-builder, scenario-analyst |
| `financing.loanTerm` | integer | **Yes** | Loan term in years | 1-40 | `10` | lender-outreach, financial-model-builder |
| `financing.amortization` | integer | **Yes** | Amortization period in years | 0-40 (0 = IO) | `30` | financial-model-builder |
| `financing.loanType` | string | **Yes** | Loan type/source | `"Agency"`, `"CMBS"`, `"Bank"`, `"Bridge"`, `"Life Company"`, `"HUD"` | `"Agency"` | lender-outreach (determines lender pool) |
| `financing.interestOnly` | boolean | No | Has IO period? | `true` / `false` | `true` | financial-model-builder |
| `financing.ioPeriod` | integer | No | IO period in years | 0-10 | `2` | financial-model-builder |

### Seller Section

| Field | Type | Required | Description | Valid Values | Example | Used By |
|-------|------|----------|-------------|-------------|---------|---------|
| `seller.entity` | string | **Yes** | Seller's legal entity name | Non-empty string | `"Portland Realty Holdings LLC"` | psa-reviewer, transfer-doc-preparer, closing-coordinator |
| `seller.name` | string | No | Seller contact name | Any string | `"Robert Chen"` | Context for agents |
| `seller.broker` | string | No | Listing broker name | Any string | `"Michael Torres"` | Context for agents |
| `seller.brokerFirm` | string | No | Listing broker firm | Any string | `"Summit Realty Group"` | Context for agents |
| `seller.motivations` | array | No | Seller motivations | Array of strings | `["portfolio rebalancing", "1031 exchange"]` | ic-memo-writer, negotiation context |

### Buyer Section (Optional)

| Field | Type | Required | Description | Valid Values | Example | Used By |
|-------|------|----------|-------------|-------------|---------|---------|
| `buyer.entity` | string | No | Buyer's legal entity name | Any string | `"Pacific NW Capital Partners LLC"` | psa-reviewer, transfer-doc-preparer |
| `buyer.contactName` | string | No | Primary buyer contact | Any string | `"Sarah Williams"` | closing-coordinator |
| `buyer.contactEmail` | string | No | Buyer contact email | Valid email | `"swilliams@example.com"` | closing-coordinator |
| `buyer.contactPhone` | string | No | Buyer contact phone | Any string | `"503-555-0142"` | closing-coordinator |

### Earnest Money Section (Optional)

| Field | Type | Required | Description | Valid Values | Example | Used By |
|-------|------|----------|-------------|-------------|---------|---------|
| `earnestMoney.initialDeposit` | number | No | Initial deposit (USD) | >= 0 | `500000` | psa-reviewer, closing-coordinator |
| `earnestMoney.initialDepositTiming` | string | No | When initial deposit is due | Any string | `"Day 1 (PSA execution)"` | psa-reviewer |
| `earnestMoney.additionalDeposit` | number | No | Additional deposit (USD) | >= 0 | `500000` | psa-reviewer |
| `earnestMoney.additionalDepositTiming` | string | No | When additional deposit is due | Any string | `"DD expiration"` | psa-reviewer |
| `earnestMoney.totalEarnestMoney` | number | No | Total earnest money (USD) | >= 0 | `1000000` | closing-coordinator, funds-flow-manager |
| `earnestMoney.goesHardDate` | string | No | Non-refundable date | `YYYY-MM-DD` | `"2025-03-01"` | psa-reviewer, closing-coordinator |

### Timeline Section

| Field | Type | Required | Description | Valid Values | Example | Used By |
|-------|------|----------|-------------|-------------|---------|---------|
| `timeline.psaExecutionDate` | string | **Yes** | PSA execution date | `YYYY-MM-DD` | `"2025-01-15"` | All agents (anchor date) |
| `timeline.ddStartDate` | string | **Yes** | DD start date | `YYYY-MM-DD` | `"2025-01-15"` | DD orchestrator |
| `timeline.ddExpirationDate` | string | **Yes** | DD expiration date | `YYYY-MM-DD` | `"2025-03-01"` | DD orchestrator, psa-reviewer |
| `timeline.closingDate` | string | **Yes** | Scheduled closing date | `YYYY-MM-DD` | `"2025-04-15"` | closing-coordinator, funds-flow-manager |
| `timeline.loiDate` | string | No | LOI submission date | `YYYY-MM-DD` | `"2025-01-05"` | Context only |
| `timeline.financingCommitmentDeadline` | string | No | Financing commitment deadline | `YYYY-MM-DD` | `"2025-03-15"` | financing-orchestrator |
| `timeline.extensionOptions` | array | No | Available extensions | See below | See below | psa-reviewer |

**Extension options format:**
```json
{
  "type": "dd",
  "days": 15,
  "cost": 50000,
  "description": "Due diligence extension - 15 days for additional $50K"
}
```
Valid `type` values: `"dd"`, `"closing"`, `"financing"`.

### Key Metrics Section (Optional, Pre-Calculated)

| Field | Type | Required | Description | Example | Used By |
|-------|------|----------|-------------|---------|---------|
| `keyMetrics.inPlaceCapRate` | number | No | NOI / asking price | `0.0645` | Quick reference |
| `keyMetrics.proFormaCapRate` | number | No | Pro forma NOI / asking price | `0.075` | Quick reference |
| `keyMetrics.grossRentMultiplier` | number | No | Price / annual gross rent | `8.33` | Quick reference |
| `keyMetrics.expenseRatio` | number | No | Expenses / revenue | `0.422` | Quick reference |
| `keyMetrics.debtServiceCoverageRatio` | number | No | NOI / annual debt service | `1.45` | Quick reference |
| `keyMetrics.breakEvenOccupancy` | number | No | Occupancy to cover debt+expenses | `0.82` | Quick reference |
| `keyMetrics.pricePerSqFt` | number | No | Price / total SF | `177.78` | Quick reference |
| `keyMetrics.rentPerSqFt` | number | No | Monthly rent / SF | `1.78` | Quick reference |
| `keyMetrics.lossToLease` | number | No | (Market - InPlace) / Market | `0.068` | Quick reference |
| `keyMetrics.grossPotentialRent` | number | No | Annual GPR at 100% and market rents | `3840000` | Quick reference |

These metrics are for your quick reference. The system recalculates all metrics from raw deal data during analysis.

### Renovation Section (Optional)

| Field | Type | Required | Description | Example | Used By |
|-------|------|----------|-------------|---------|---------|
| `renovation.totalBudget` | number | No | Total renovation budget (USD) | `2000000` | financial-model-builder |
| `renovation.perUnitBudget` | number | No | Per-unit renovation budget (USD) | `10000` | financial-model-builder |
| `renovation.scope` | string | No | High-level scope description | `"Interior upgrades + exterior refresh"` | physical-inspection |
| `renovation.interiorScope` | array | No | Interior items | `["countertops", "appliances", "flooring"]` | physical-inspection |
| `renovation.exteriorScope` | array | No | Exterior items | `["paint", "landscaping", "signage"]` | physical-inspection |
| `renovation.commonAreaScope` | array | No | Common area items | `["clubhouse renovation", "pool resurfacing"]` | physical-inspection |
| `renovation.timelineMonths` | integer | No | Renovation timeline (months) | `18` | financial-model-builder |
| `renovation.phasingStrategy` | string | No | Phasing approach | `"Roll units on turnover over 18 months"` | financial-model-builder |

### Risk Factors (Optional)

| Field | Type | Required | Description | Example | Used By |
|-------|------|----------|-------------|---------|---------|
| `riskFactors` | array | No | Known risk factors | `["deferred maintenance", "rent control risk"]` | All agents (contextual awareness) |

---

## Full Configuration Example

For a fully populated example with all fields filled in with realistic values, see:

```
config/deal-example.json
```

Additional strategy-specific examples:

```
config/examples/core-plus-multifamily.json
config/examples/opportunistic-multifamily.json
```

---

## Validation

To validate your `deal.json` against the schema:

1. The schema file is at `config/deal-schema.json`
2. Use any JSON Schema validator (VS Code has built-in support)
3. The master orchestrator also validates required fields at pipeline startup

Common validation errors:
- Missing required fields (dealId, dealName, property.totalUnits, etc.)
- State not uppercase two-letter (`"or"` should be `"OR"`)
- ZIP code as number instead of string (`97202` should be `"97202"`)
- Dates not in ISO format (`"01/15/2025"` should be `"2025-01-15"`)
- Occupancy/rates as percentages instead of decimals (`93` should be `0.93`)
