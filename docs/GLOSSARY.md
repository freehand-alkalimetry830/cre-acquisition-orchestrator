# Glossary

Terminology reference for the CRE Acquisition Orchestration System. Divided into System Terms (how the software works) and CRE Terms (commercial real estate concepts used throughout the analysis).

---

## System Terms

### Agent
A self-contained AI unit that performs a specific analysis task. Each agent is defined by a markdown prompt file in the `agents/` directory. There are 21 specialist agents across 5 phases. Agents read input data, perform analysis, write checkpoints, and produce structured JSON output.
- **Referenced in**: `config/agent-registry.json`, all orchestrator files

### Checkpoint
A JSON file that records an agent's or phase's progress at a specific point. Enables resume-from-failure without re-running completed work. Written to `data/status/{deal-id}/agents/{agent-name}.json` for agents and `data/status/{deal-id}.json` for the master pipeline.
- **Referenced in**: Every agent's Checkpoint Protocol section, `skills/checkpoint-protocol.md`

### Child Agent
A sub-agent spawned at runtime by a specialist agent to handle batch processing. For example, the tenant-credit agent may spawn one child agent per tenant, and the scenario-analyst spawns 27 child agents (one per scenario). Child agents are not listed in the agent registry -- they are created dynamically via the Task tool.
- **Referenced in**: `agents/due-diligence/tenant-credit.md`, `agents/underwriting/scenario-analyst.md`, `agents/legal/estoppel-tracker.md`

### Confidence Level
A rating (HIGH, MEDIUM, LOW) assigned by each agent to indicate the reliability of its analysis based on data quality and completeness. HIGH means verified source documents; LOW means significant data gaps.
- **Referenced in**: Every agent's Confidence Scoring section, `config/thresholds.json`

### Data Gap
A piece of required data that was unavailable to an agent. Agents log data gaps, attempt workarounds, and flag affected output fields with uncertainty markers. The maximum allowed before escalation is configured in `config/thresholds.json` at `dueDiligence.maxDataGaps`.
- **Referenced in**: Every agent's Data Gap Handling section

### Deal Config
The `config/deal.json` file containing all property, financial, and timeline details for a specific acquisition. This is the primary input to the entire pipeline.
- **Referenced in**: `config/deal.json`, every agent's Input Data section

### Dealbreaker
A critical finding that warrants walking away from a deal. The definitive list is in `config/thresholds.json` under `dealbreakers`. Examples include active title disputes, environmental contamination, and structural failure requiring demolition.
- **Referenced in**: `config/thresholds.json`, every agent's Dealbreaker Detection section

### Master Orchestrator
The top-level coordinator that manages the entire 5-phase pipeline. It launches phase orchestrators in sequence, monitors progress, enforces phase dependencies, and produces the final verdict.
- **Referenced in**: `orchestrators/master-orchestrator.md`, `config/agent-registry.json`

### Orchestrator
A coordination agent that manages a group of specialist agents within a phase. There are 6 orchestrators: 1 master + 5 phase orchestrators (DD, UW, Financing, Legal, Closing). Orchestrators launch agents, collect results, write phase checkpoints, and synthesize phase-level verdicts.
- **Referenced in**: `orchestrators/` directory, `config/agent-registry.json`

### Phase
One of the 5 sequential stages of the acquisition pipeline: Due Diligence (1), Underwriting (2), Financing (3), Legal (4), Closing (5). Each phase has its own orchestrator and set of specialist agents.
- **Referenced in**: `orchestrators/master-orchestrator.md`, `config/thresholds.json`

### Phase Orchestrator
An orchestrator responsible for a single phase. It launches the phase's specialist agents (in parallel or sequentially based on dependencies), monitors their completion, handles failures, and produces a phase-level verdict and synthesis.
- **Referenced in**: `orchestrators/{phase}-orchestrator.md` files

### Pipeline
The complete end-to-end execution of all 5 phases for a single deal. A pipeline run produces checkpoints, logs, phase outputs, and a final report.
- **Referenced in**: `orchestrators/master-orchestrator.md`, `README.md`

### Resume Point
The specific checkpoint from which an agent or pipeline can restart after interruption. Each agent's Resume Protocol section defines how to load checkpoint data and skip completed work.
- **Referenced in**: Every agent's Resume Protocol section

### Risk Score
A composite score from 0-100 measuring the deal's overall risk level. Higher scores indicate lower risk (it is a health score). Calculated by the `skills/risk-scoring.md` skill and evaluated against `config/thresholds.json` strategy thresholds.
- **Referenced in**: `skills/risk-scoring.md`, `config/thresholds.json`

### Deal Status Checkpoint
The `data/status/<deal-id>.json` file. A machine-readable summary of the current pipeline status, including build progress, active deal information, phase results, and key metrics. Updated by the master orchestrator.
- **Referenced in**: `data/status/<deal-id>.json`, `orchestrators/master-orchestrator.md`

### Specialist Agent
One of the 21 agents that performs a specific analysis task (e.g., rent-roll-analyst, psa-reviewer, funds-flow-manager). Distinguished from orchestrators (which coordinate) and child agents (which are spawned dynamically).
- **Referenced in**: `config/agent-registry.json`, `agents/` directory

### Task Tool
The Claude Code runtime mechanism used to spawn agents. Orchestrators use `Task(subagent_type="general-purpose", prompt=<agent prompt + context>)` to launch specialist agents. Agents use the Task tool to spawn child agents for batch processing.
- **Referenced in**: Every orchestrator and agent that spawns sub-agents

### Threshold
A configured numeric boundary used for pass/fail/conditional evaluation of metrics. All thresholds are defined in `config/thresholds.json` and organized by category (primary criteria, secondary criteria, strategy-specific, phase-specific).
- **Referenced in**: `config/thresholds.json`, every agent's Threshold Cross-Check section

### Uncertainty Flag
A marker attached to a specific output field indicating the data quality is less than fully verified. Types: `estimated`, `assumed`, `unverified`, `stale_data`, `interpolated`. Stored in the agent's `uncertainty_flags` output array.
- **Referenced in**: Every agent's Data Gap Handling section, output JSON schemas

### Verdict
The final recommendation produced by a phase or the overall pipeline. One of three values: GO (proceed), CONDITIONAL GO (proceed with conditions), NO-GO (walk away). Determined by comparing findings against thresholds.
- **Referenced in**: `config/thresholds.json`, orchestrator synthesis logic

---

## CRE Terms

### ADA (Americans with Disabilities Act)
Federal law requiring accessible design in commercial properties. Non-compliance can result in lawsuits and mandatory retrofits.
- **Referenced in**: `agents/due-diligence/physical-inspection.md`, `agents/legal/psa-reviewer.md`

### Agency (Fannie Mae / Freddie Mac)
Government-sponsored enterprises that provide standardized multifamily mortgage products. Agency loans typically offer the best rates and terms for stabilized properties.
- **Referenced in**: `config/deal.json` (financing.loanType), `agents/financing/lender-outreach.md`, `skills/lender-criteria.md`

### Bridge Loan
Short-term financing (1-3 years) used for transitional properties that do not yet qualify for permanent financing. Higher rate but more flexible underwriting.
- **Referenced in**: `config/deal.json` (financing.loanType), `agents/financing/lender-outreach.md`, `skills/lender-criteria.md`

### Cap Rate (Capitalization Rate)
NOI divided by purchase price (or property value). Measures the unlevered yield of a property. A 6% cap rate means the property generates 6% annual return before financing.
- **Referenced in**: `config/thresholds.json` (secondaryCriteria.capRate), `agents/underwriting/financial-model-builder.md`, `skills/underwriting-calc.md`

### CapEx (Capital Expenditures)
Major property improvements or replacements (roof, HVAC, parking lot) that are capitalized rather than expensed. Distinguished from operating expenses.
- **Referenced in**: `config/deal.json` (financials.capExBudget), `agents/due-diligence/physical-inspection.md`

### CMBS (Commercial Mortgage-Backed Securities)
Loans that are securitized and sold to investors. Offer competitive rates but less flexibility than portfolio loans. Prepayment via defeasance.
- **Referenced in**: `config/deal.json` (financing.loanType), `agents/financing/lender-outreach.md`, `skills/lender-criteria.md`

### CoC (Cash-on-Cash Return)
Annual cash flow after debt service divided by total equity invested. Measures the annual yield on the cash you put in.
- **Referenced in**: `config/thresholds.json` (primaryCriteria.cashOnCash), `agents/underwriting/financial-model-builder.md`, `skills/underwriting-calc.md`

### DD (Due Diligence)
The investigative phase where the buyer examines the property, finances, legal status, and market conditions before committing to purchase.
- **Referenced in**: `orchestrators/due-diligence-orchestrator.md`, all DD agents in `agents/due-diligence/`

### Debt Fund
Private lending entities that provide bridge or transitional financing. Higher rates than agency but more flexible on property condition and occupancy.
- **Referenced in**: `agents/financing/lender-outreach.md`, `skills/lender-criteria.md`

### Defeasance
A prepayment mechanism for CMBS loans where the borrower substitutes U.S. Treasury securities for the loan collateral, allowing the loan to be retired.
- **Referenced in**: `agents/financing/quote-comparator.md`, `skills/lender-criteria.md`

### DSCR (Debt Service Coverage Ratio)
NOI divided by annual debt service (mortgage payments). Measures the property's ability to cover its mortgage. Lenders typically require 1.20-1.30x minimum.
- **Referenced in**: `config/thresholds.json` (primaryCriteria.dscr), `agents/underwriting/financial-model-builder.md`, `skills/underwriting-calc.md`

### EGI (Effective Gross Income)
Gross Potential Rent minus vacancy loss, concessions, and bad debt, plus other income. Represents the realistic total income a property generates.
- **Referenced in**: `agents/due-diligence/rent-roll-analyst.md`, `agents/underwriting/financial-model-builder.md`, `skills/underwriting-calc.md`

### Equity Multiple
Total distributions returned to investors divided by total equity invested. A 2.0x equity multiple means investors received double their original investment.
- **Referenced in**: `config/thresholds.json` (underwriting.minEquityMultiple), `config/deal.json` (targetEquityMultiple), `agents/underwriting/financial-model-builder.md`

### Estoppel (Estoppel Certificate)
A signed document from a tenant confirming the terms of their lease (rent, deposit, lease dates, landlord obligations). Used to verify the rent roll at closing.
- **Referenced in**: `agents/legal/estoppel-tracker.md`, `config/thresholds.json` (legal.estoppelReturnRate_min_pct)

### GPR (Gross Potential Rent)
The total rent a property would generate if 100% occupied at market rents. Represents the theoretical maximum rental income.
- **Referenced in**: `agents/due-diligence/rent-roll-analyst.md`, `skills/underwriting-calc.md`

### IC Memo (Investment Committee Memorandum)
A comprehensive document presenting the deal analysis, financial projections, risks, and recommendation to the investment committee for approval.
- **Referenced in**: `agents/underwriting/ic-memo-writer.md`, `templates/ic-memo-template.md`

### IRR (Internal Rate of Return)
The annualized total return on investment accounting for the time value of money. Includes cash flows during hold plus sale proceeds.
- **Referenced in**: `config/thresholds.json` (underwriting.minIRR), `config/deal.json` (targetIRR), `agents/underwriting/financial-model-builder.md`, `skills/underwriting-calc.md`

### Lis Pendens
A public notice filed in county records indicating pending litigation affecting a property's title. A dealbreaker in `config/thresholds.json`.
- **Referenced in**: `config/thresholds.json` (dealbreakers), `agents/due-diligence/legal-title-review.md`

### LOI (Letter of Intent)
A non-binding preliminary agreement outlining the basic terms of a proposed acquisition before the formal PSA is negotiated.
- **Referenced in**: `config/deal.json` (timeline.loiDate)

### Loss-to-Lease
The difference between current in-place rents and market rents. Represents the revenue upside available by raising rents to market levels as leases renew.
- **Referenced in**: `agents/due-diligence/rent-roll-analyst.md`, `skills/underwriting-calc.md`

### LTV (Loan-to-Value)
Loan amount divided by property value. Measures leverage. A 75% LTV means the lender finances 75% and the buyer provides 25% equity.
- **Referenced in**: `config/thresholds.json` (primaryCriteria.ltv), `config/deal.json` (financing.targetLTV), `agents/underwriting/financial-model-builder.md`

### Mezzanine (Mezzanine Debt)
A subordinate loan that sits between the senior mortgage and the borrower's equity. Higher cost than senior debt, used to reduce equity requirements.
- **Referenced in**: `agents/financing/lender-outreach.md`, `skills/lender-criteria.md`

### NOI (Net Operating Income)
Total property revenue minus operating expenses. Excludes debt service, capital expenditures, and depreciation. The fundamental measure of property income.
- **Referenced in**: `config/deal.json` (financials.currentNOI), `agents/underwriting/financial-model-builder.md`, `skills/underwriting-calc.md`

### OpEx (Operating Expenses)
The recurring costs of operating a property: property taxes, insurance, utilities, management fees, maintenance, payroll, administrative costs. Excludes debt service and capex.
- **Referenced in**: `agents/due-diligence/opex-analyst.md`, `config/thresholds.json` (secondaryCriteria.expenseRatio)

### Phase I ESA (Phase I Environmental Site Assessment)
An environmental report examining the history and current condition of a property for evidence of contamination. Required by lenders. Does not involve soil sampling (that is Phase II).
- **Referenced in**: `agents/due-diligence/environmental-review.md`, `config/agent-registry.json`

### Phase II ESA (Phase II Environmental Site Assessment)
A follow-up environmental study that involves physical sampling (soil, groundwater, air) to confirm or deny contamination identified in Phase I.
- **Referenced in**: `agents/due-diligence/environmental-review.md`

### PILOT (Payment In Lieu Of Taxes)
A negotiated agreement where a property owner pays a reduced amount instead of standard property taxes, often for affordable housing or economic development projects.
- **Referenced in**: `agents/due-diligence/opex-analyst.md`

### Pro Forma
A projected financial statement showing expected future performance, typically for the hold period. Includes assumptions about rent growth, expense growth, occupancy, and exit cap rate.
- **Referenced in**: `config/deal.json` (financials.proFormaNOI), `agents/underwriting/financial-model-builder.md`, `templates/report-template.md`

### PSA (Purchase and Sale Agreement)
The binding contract between buyer and seller defining all terms of the acquisition: price, timeline, contingencies, representations, and closing procedures.
- **Referenced in**: `agents/legal/psa-reviewer.md`, `config/deal.json` (timeline.psaExecutionDate)

### Rent Roll
A detailed listing of every unit in a property showing tenant name, unit number, lease dates, monthly rent, deposit, and occupancy status. The primary source document for revenue analysis.
- **Referenced in**: `agents/due-diligence/rent-roll-analyst.md`, `config/agent-registry.json`

### Survey
A legal document showing the property boundaries, easements, encroachments, improvements, and flood zone designation. Required by lenders and title companies.
- **Referenced in**: `agents/legal/title-survey-reviewer.md`, `config/thresholds.json` (legal.criticalDocuments)

### T-12 (Trailing Twelve Months)
The most recent 12 months of actual financial performance (revenue and expenses). Used as the basis for underwriting rather than projections.
- **Referenced in**: `config/deal.json` (financials.trailingT12Revenue, trailingT12Expenses), `agents/due-diligence/opex-analyst.md`

### Title Commitment
A document from the title company listing the conditions under which they will insure the property's title. Lists all exceptions (easements, liens, encumbrances).
- **Referenced in**: `agents/due-diligence/legal-title-review.md`, `agents/legal/title-survey-reviewer.md`, `config/thresholds.json` (legal.maxTitleExceptions)

### UST (Underground Storage Tank)
A buried tank previously used for fuel or chemical storage. Can indicate environmental contamination risk if not properly decommissioned.
- **Referenced in**: `agents/due-diligence/environmental-review.md`

### Yield Maintenance
A prepayment penalty calculated to make the lender whole for the interest income they would have received over the remaining loan term. The most expensive prepayment structure.
- **Referenced in**: `config/thresholds.json` (financing.maxPrepaymentPenalty), `agents/financing/quote-comparator.md`

---

## Cross-References

- How these terms appear in results: [Interpreting Results](INTERPRETING-RESULTS.md)
- Threshold definitions using these metrics: [Threshold Customization](THRESHOLD-CUSTOMIZATION.md)
- Deal configuration fields: [Deal Configuration](DEAL-CONFIGURATION.md)
- Agent details: [Agent Development](AGENT-DEVELOPMENT.md)
