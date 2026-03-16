# Quick Start Guide

Get up and running with the CRE Acquisition Orchestrator in four steps.

---

## Prerequisites

Before you begin, ensure you have:

- [ ] Node.js v18+ installed
- [ ] Git (for cloning the repository)
- [ ] A modern web browser (Chrome recommended)
- [ ] Terminal/command line access

---

## Step 1: Configure Your Deal

Edit `config/deal.json` with your property details.

### Required Fields

```json
{
  "dealId": "DEAL-2026-001",
  "dealName": "Your Property Name",
  "property": {
    "address": "123 Main Street",
    "city": "Austin",
    "state": "TX",
    "zip": "78701",
    "propertyType": "multifamily",
    "yearBuilt": 2005,
    "totalUnits": 100
  },
  "financials": {
    "askingPrice": 15000000,
    "currentNOI": 900000,
    "inPlaceOccupancy": 0.92
  },
  "investmentStrategy": "value-add",
  "targetHoldPeriod": 5,
  "targetIRR": 0.15
}
```

### Sample Deals

For testing, use one of our pre-configured sample deals:

| Deal | File | Expected Result |
|------|------|-----------------|
| Parkview Apartments | `demo/deals/parkview.json` | CONDITIONAL |
| Riverside Gardens | `demo/deals/riverside-gardens.json` | PASS |
| Oakwood Terrace | `demo/deals/oakwood-terrace.json` | FAIL |

Copy a sample deal to `config/deal.json`:
```bash
cp demo/deals/riverside-gardens.json config/deal.json
```

---

## Step 2: Launch the Dashboard

Open a terminal and navigate to the dashboard directory:

```bash
cd cre-acquisition/dashboard
```

Install dependencies (first time only):

```bash
npm install
```

Start the dashboard:

```bash
npm run dev
```

The dashboard will be available at: **http://localhost:5173**

### What You'll See

- **Header**: Deal name and connection status
- **Pipeline View**: 5 phases with progress indicators
- **Tabs**: Pipeline, Agent Tree, Logs, Findings, Timeline

---

## Step 3: Run the Analysis

### Option A: Launch via Claude Code

In Claude Code, read and launch the master orchestrator:

```
Read the master orchestrator prompt from cre-acquisition/orchestrators/master-orchestrator.md
and launch it with the deal configuration from config/deal.json
```

### Option B: Launch Script (if available)

```bash
node scripts/launch-deal.js
```

### Monitoring Progress

Watch the dashboard as the pipeline executes:

1. **Due Diligence** (25% of progress) - 7 specialist agents analyze the property
2. **Underwriting** (20%) - Financial modeling and scenario analysis
3. **Financing** (20%) - Lender outreach and term comparison
4. **Legal** (25%) - Document review and closing preparation
5. **Closing** (10%) - Final readiness assessment

---

## Step 4: Review Results

### During Analysis

- **Logs Tab**: Real-time activity stream
- **Findings Tab**: Issues and metrics as they're discovered
- **Agent Tree Tab**: Hierarchical view of active agents

### After Completion

- **Final Report Tab**: Appears when analysis completes
- **Decision Card**: One-page executive summary
- **Full Report**: Detailed findings in `data/reports/{deal-id}/`

### Understanding the Verdict

| Verdict | Meaning |
|---------|---------|
| **PASS** | Deal meets all investment criteria. Proceed with acquisition. |
| **CONDITIONAL** | Deal is viable with specific conditions. Review and address conditions. |
| **FAIL** | Deal has dealbreakers or fails critical thresholds. Do not proceed. |

---

## Troubleshooting

### Dashboard won't connect

1. Verify the development server is running (`npm run dev`)
2. Check that port 5173 is not blocked
3. Try refreshing the browser

### Pipeline doesn't start

1. Verify `config/deal.json` is properly formatted
2. Check for required fields (dealId, dealName, property basics)
3. Review terminal output for error messages

### Analysis seems stuck

1. Check the Logs tab for recent activity
2. The system checkpoints progress - it can resume if interrupted
3. Some phases (like market research) may take time for web lookups

See [Known Issues](../known-issues.md) for detailed troubleshooting.

---

## Next Steps

- **Customize thresholds**: Edit `config/thresholds.json` for your investment criteria
- **Review documentation**: Full details in `docs/` directory
- **Run multiple deals**: Each deal runs independently
- **Schedule a demo**: See the system handle a live analysis

---

## Quick Reference

| Task | Command |
|------|---------|
| Start dashboard | `cd dashboard && npm run dev` |
| Copy sample deal | `cp demo/deals/riverside-gardens.json config/deal.json` |
| View logs | Dashboard → Logs tab |
| View results | Dashboard → Final Report tab |
| Resume interrupted | Pipeline resumes automatically from checkpoint |

**Dashboard URL**: http://localhost:5173

**Help**: See [FAQ](./faq.md) or [Troubleshooting](../../docs/TROUBLESHOOTING.md)
