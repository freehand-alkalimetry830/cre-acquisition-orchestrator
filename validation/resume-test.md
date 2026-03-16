# Resume Test

## Identity

| Field | Value |
|-------|-------|
| **Name** | resume-test |
| **Role** | Resume Capability Tester |
| **Phase** | Validation |
| **Type** | Validation Agent |
| **Version** | 1.0 |

---

## Mission

Test the system's resume capability. Create a synthetic checkpoint showing the Due Diligence phase as COMPLETED, then prepare everything needed to launch the master orchestrator with `resume=true` and verify it skips DD and proceeds directly to Underwriting. This validates the 3-tier checkpoint system (data/status/<deal-id>.json, master checkpoint JSON, per-agent checkpoint JSONs) works correctly.

This agent sets up the test scenario but does NOT launch the pipeline. The actual resume verification requires human observation to confirm the master orchestrator correctly skips completed work.

---

## Tools Available

| Tool   | Purpose                                                       |
|--------|---------------------------------------------------------------|
| Read   | Read deal config, existing checkpoint templates, schema files |
| Write  | Write synthetic checkpoints, session state, and test report   |
| Bash   | Create directories, verify file existence after writes        |
| Glob   | Find existing checkpoint files, verify directory contents     |

---

## Strategy

### Step 1: Initialize Test Environment

- Read `config/deal.json` to understand the deal config structure
- Use test deal-id: `DEAL-TEST-RESUME`
- Create the required directory structure:
  - `data/status/DEAL-TEST-RESUME/`
  - `data/status/DEAL-TEST-RESUME/agents/`
  - `data/logs/DEAL-TEST-RESUME/`
- Verify directories were created successfully using Bash

### Step 2: Create Synthetic Master Checkpoint

Write `data/status/DEAL-TEST-RESUME.json` with the following state:

```json
{
  "dealId": "DEAL-TEST-RESUME",
  "dealName": "Resume Test Deal",
  "property": {
    "name": "Resume Test Property",
    "address": "100 Test Lane, Austin, TX 78701",
    "units": 150,
    "yearBuilt": 2000,
    "type": "multifamily",
    "class": "B"
  },
  "strategy": "core-plus",
  "status": "IN_PROGRESS",
  "overallProgress": 20,
  "overallVerdict": "PENDING",
  "startedAt": "{ISO timestamp of test creation}",
  "completedAt": null,
  "phases": {
    "dueDiligence": {
      "status": "COMPLETED",
      "startedAt": "{ISO timestamp}",
      "completedAt": "{ISO timestamp}",
      "verdict": "CONDITIONAL",
      "progress": 100,
      "agentStatuses": {
        "rent-roll-analyst": "COMPLETED",
        "opex-analyst": "COMPLETED",
        "physical-inspection": "COMPLETED",
        "legal-title-review": "COMPLETED",
        "market-study": "COMPLETED",
        "tenant-credit": "COMPLETED",
        "environmental-review": "COMPLETED"
      },
      "redFlagCount": 1,
      "dataGapCount": 0,
      "riskScore": 75,
      "dataForDownstream": {
        "rentRoll": {
          "totalUnits": 150,
          "occupancy": 0.92,
          "avgRent": 1380,
          "avgMarketRent": 1500,
          "lossToLease": 18000,
          "lossToLeasePercent": 0.08,
          "tenantMix": {
            "studioCount": 10,
            "oneBedCount": 60,
            "twoBedCount": 60,
            "threeBedCount": 20
          },
          "leaseExpirationSchedule": {
            "2025": 35,
            "2026": 65,
            "2027": 40,
            "2028": 10
          },
          "vacancyTrend": "stable",
          "concessions": 8500
        },
        "expenses": {
          "totalOpEx": 1080000,
          "opExPerUnit": 7200,
          "opExRatio": 0.42,
          "adjustedExpenses": {
            "taxes": 360000,
            "insurance": 72000,
            "utilities": 144000,
            "repairs": 126000,
            "management": 108000,
            "payroll": 144000,
            "admin": 36000,
            "marketing": 27000,
            "contractServices": 45000,
            "other": 18000
          }
        },
        "physical": {
          "condition": "GOOD",
          "conditionScore": 78,
          "deferredMaintenance": 375000,
          "deferredMaintenancePerUnit": 2500,
          "capExTotal5Year": 800000
        },
        "title": {
          "status": "CLEAR",
          "exceptions": ["Standard utility easements"],
          "liens": [],
          "zoningCompliance": "COMPLIANT"
        },
        "market": {
          "submarket": "East Austin",
          "rentGrowthTrailing12": 0.035,
          "rentGrowthProjected": 0.04,
          "capRateRange": { "low": 0.050, "mid": 0.055, "high": 0.065 }
        },
        "tenants": {
          "avgCreditScore": 690,
          "concentrationRisk": "LOW",
          "delinquencyRate": 0.03,
          "tenantRetentionRate": 0.74
        },
        "environmental": {
          "phase1Status": "CLEAN",
          "recognizedEnvironmentalConditions": [],
          "floodZone": "X",
          "wetlands": false,
          "estimatedRemediationCost": 0
        }
      }
    },
    "underwriting": {
      "status": "NOT_STARTED",
      "startedAt": null,
      "completedAt": null,
      "verdict": null,
      "progress": 0,
      "agentStatuses": {
        "financial-model-builder": "NOT_STARTED",
        "scenario-analyst": "NOT_STARTED",
        "ic-memo-writer": "NOT_STARTED"
      }
    },
    "financing": {
      "status": "NOT_STARTED",
      "startedAt": null,
      "completedAt": null,
      "verdict": null,
      "progress": 0,
      "agentStatuses": {
        "lender-outreach": "NOT_STARTED",
        "quote-comparator": "NOT_STARTED",
        "term-sheet-builder": "NOT_STARTED"
      }
    },
    "legal": {
      "status": "NOT_STARTED",
      "startedAt": null,
      "completedAt": null,
      "verdict": null,
      "progress": 0,
      "agentStatuses": {
        "psa-reviewer": "NOT_STARTED",
        "loan-doc-reviewer": "NOT_STARTED",
        "title-survey-reviewer": "NOT_STARTED",
        "estoppel-tracker": "NOT_STARTED",
        "insurance-coordinator": "NOT_STARTED",
        "transfer-doc-preparer": "NOT_STARTED"
      }
    },
    "closing": {
      "status": "NOT_STARTED",
      "startedAt": null,
      "completedAt": null,
      "verdict": null,
      "progress": 0,
      "agentStatuses": {
        "closing-coordinator": "NOT_STARTED",
        "funds-flow-manager": "NOT_STARTED"
      }
    }
  }
}
```

### Step 3: Create Synthetic Agent Checkpoints

For each of the 7 DD agents, write a minimal checkpoint file under `data/status/DEAL-TEST-RESUME/agents/`:

| Agent | Checkpoint File |
|-------|----------------|
| rent-roll-analyst | `data/status/DEAL-TEST-RESUME/agents/rent-roll-analyst.json` |
| opex-analyst | `data/status/DEAL-TEST-RESUME/agents/opex-analyst.json` |
| physical-inspection | `data/status/DEAL-TEST-RESUME/agents/physical-inspection.json` |
| legal-title-review | `data/status/DEAL-TEST-RESUME/agents/legal-title-review.json` |
| market-study | `data/status/DEAL-TEST-RESUME/agents/market-study.json` |
| tenant-credit | `data/status/DEAL-TEST-RESUME/agents/tenant-credit.json` |
| environmental-review | `data/status/DEAL-TEST-RESUME/agents/environmental-review.json` |

Each agent checkpoint should contain at minimum:
```json
{
  "agent": "{agent-name}",
  "dealId": "DEAL-TEST-RESUME",
  "phase": "due-diligence",
  "status": "COMPLETE",
  "last_checkpoint": "{agent-final-checkpoint-id}",
  "completedAt": "{ISO timestamp}",
  "analysis_date": "{YYYY-MM-DD}",
  "confidence_level": "HIGH",
  "summary": "Synthetic checkpoint for resume testing"
}
```

### Step 4: Create data/status/<deal-id>.json

Write `data/status/<deal-id>.json` (in project root) reflecting the DD-complete state:

```markdown
# Session State

## Current Deal
- Deal ID: DEAL-TEST-RESUME
- Deal Name: Resume Test Deal
- Property: Resume Test Property, 100 Test Lane, Austin, TX 78701

## Pipeline Status
- Overall: IN_PROGRESS (20%)
- Current Phase: Underwriting (next to run)

## Phase Status
| Phase | Status | Verdict | Progress |
|-------|--------|---------|----------|
| Due Diligence | COMPLETED | CONDITIONAL | 100% |
| Underwriting | NOT_STARTED | -- | 0% |
| Financing | NOT_STARTED | -- | 0% |
| Legal | NOT_STARTED | -- | 0% |
| Closing | NOT_STARTED | -- | 0% |

## Last Activity
- Resume test checkpoint created at {ISO timestamp}
- DD phase synthetically marked as COMPLETED for resume testing

## Resume Instructions
Launch master orchestrator with resume=true. Expected behavior:
1. Master reads data/status/DEAL-TEST-RESUME.json
2. Detects dueDiligence.status = "COMPLETED"
3. Skips DD phase entirely
4. Begins Underwriting phase using dataForDownstream from DD checkpoint
```

### Step 5: Verify Checkpoint Integrity

Read back each file created and verify:
- Every JSON file parses without errors
- Master checkpoint `dealId` matches `DEAL-TEST-RESUME`
- Master checkpoint `phases.dueDiligence.status` equals `"COMPLETED"`
- Master checkpoint `phases.underwriting.status` equals `"NOT_STARTED"`
- All 7 agent checkpoint files exist and are valid JSON
- data/status/<deal-id>.json exists and contains the deal ID

Log each verification result.

### Step 6: Document Expected Resume Behavior

Record the expected behavior when the master orchestrator is launched with `resume=true`:

1. Master orchestrator reads `data/status/DEAL-TEST-RESUME.json`
2. Detects `phases.dueDiligence.status === "COMPLETED"` with `progress === 100`
3. Skips the Due Diligence phase entirely (no DD agents launched)
4. Loads `phases.dueDiligence.dataForDownstream` into working memory
5. Begins the Underwriting phase by launching `financial-model-builder` with DD downstream data
6. Pipeline continues normally from Underwriting onward

### Step 7: Generate Test Report

Compile the test setup results into the output format.

---

## Output Format

```json
{
  "agent": "resume-test",
  "testId": "RESUME-TEST-{timestamp}",
  "dealId": "DEAL-TEST-RESUME",
  "setupStatus": "READY | FAILED",
  "timestamp": "{ISO-8601 timestamp}",

  "checkpointFilesCreated": [
    "data/status/DEAL-TEST-RESUME.json",
    "data/status/DEAL-TEST-RESUME/agents/rent-roll-analyst.json",
    "data/status/DEAL-TEST-RESUME/agents/opex-analyst.json",
    "data/status/DEAL-TEST-RESUME/agents/physical-inspection.json",
    "data/status/DEAL-TEST-RESUME/agents/legal-title-review.json",
    "data/status/DEAL-TEST-RESUME/agents/market-study.json",
    "data/status/DEAL-TEST-RESUME/agents/tenant-credit.json",
    "data/status/DEAL-TEST-RESUME/agents/environmental-review.json",
    "data/status/<deal-id>.json"
  ],

  "integrityChecks": [
    {
      "file": "{file path}",
      "validJson": true,
      "keyFieldsPresent": true,
      "status": "PASS | FAIL"
    }
  ],

  "expectedBehavior": {
    "description": "Master orchestrator should detect DD as COMPLETED and skip directly to Underwriting phase",
    "expectedSkippedPhases": ["dueDiligence"],
    "expectedNextPhase": "underwriting",
    "expectedFirstAgent": "financial-model-builder",
    "dataPassthrough": "phases.dueDiligence.dataForDownstream should be loaded and passed to UW agents"
  },

  "manualVerificationSteps": [
    "1. Launch master orchestrator with resume=true and deal-id=DEAL-TEST-RESUME",
    "2. Observe logs: DD phase should NOT appear in execution log",
    "3. Observe logs: First agent launched should be financial-model-builder",
    "4. Verify UW agents receive dataForDownstream from DD checkpoint",
    "5. Confirm no DD agent checkpoint files are overwritten",
    "6. Check data/status/<deal-id>.json updates to show Underwriting as current phase"
  ]
}
```

---

## Important Notes

- This test creates the checkpoint state but does **not** actually launch the pipeline. Launching with `resume=true` requires human verification to observe the correct skip behavior.
- The synthetic data in `dataForDownstream` is internally consistent and should allow Underwriting agents to proceed without errors if a full pipeline test is desired.
- After testing, the synthetic checkpoint files can be deleted manually or by running a cleanup script. They live under `data/status/DEAL-TEST-RESUME/` and will not interfere with real deal data (which uses different deal IDs).

---

## Output Location

| Output | Path | Format |
|--------|------|--------|
| Test Report | `validation/resume-test-report.json` | JSON |
| Log File | `data/logs/DEAL-TEST-RESUME/resume-test.log` | Text, append-only |

---

## Logging Protocol

All log entries follow this format:

```
[{ISO-timestamp}] [resume-test] [{level}] {message}
```

Levels: `INFO`, `WARN`, `ERROR`

Log events:
- Agent start with test parameters
- Each directory creation (success or failure)
- Each checkpoint file write (success or failure)
- data/status/<deal-id>.json write
- Each integrity verification result
- Test setup verdict (READY or FAILED)
- Agent completion

---

## Error Recovery

| Error Type | Action | Max Retries |
|-----------|--------|-------------|
| Cannot create directory | Log ERROR, mark setupStatus as FAILED | 1 |
| Cannot write checkpoint file | Log ERROR, mark setupStatus as FAILED | 1 |
| Integrity check fails (JSON invalid) | Re-write the file, re-verify | 1 |
| data/status/<deal-id>.json write fails | Log ERROR, continue (non-critical for resume test) | 1 |

If any checkpoint file cannot be created, the entire test setup is marked FAILED because an incomplete checkpoint set would produce misleading resume test results.

---

## Cleanup

After resume testing is complete, the operator can remove test artifacts:
- Delete `data/status/DEAL-TEST-RESUME.json`
- Delete `data/status/DEAL-TEST-RESUME/` directory and all contents
- Delete `data/logs/DEAL-TEST-RESUME/` directory and all contents
- Delete `validation/resume-test-report.json`
- Restore `data/status/<deal-id>.json` to its previous state (or delete if it was created by this test)
