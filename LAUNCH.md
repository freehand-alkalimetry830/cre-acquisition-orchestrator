# Launch Quick Reference

Copy-paste commands for the most common launch scenarios. For detailed procedures, see [docs/LAUNCH-PROCEDURES.md](docs/LAUNCH-PROCEDURES.md).

---

## Full Pipeline (New Deal - Step by Step Live)

```bash
# Terminal 1: Start dashboard watcher + UI
cd dashboard && npm run dev

# Then click "Start Live" in the dashboard (auto-resets old artifacts)
# UI default mode runs:
# node scripts/orchestrate.js --deal config/deal.json --scenario core-plus --agent-delay-ms 2000
```

## Full Pipeline (Fast Complete)

```bash
# Terminal 1: Start dashboard watcher + UI
cd dashboard && npm run dev

# Terminal 2: Fast non-visual completion run
node scripts/demo-run.js --deal config/deal.json --scenario core-plus --seed 42
```

---

## Resume Interrupted Pipeline

```bash
node scripts/orchestrate.js --deal config/deal.json --scenario value-add --seed 11 --resume
```

For targeted resume from a specific phase:

```bash
node scripts/orchestrate.js --deal config/deal.json --scenario value-add --seed 11 --resume --from-phase legal
```

---

## Failure Injection Demo

```bash
node scripts/demo-fail-injection.js --deal config/deal.json --scenario value-add --seed 11 --agent estoppel-tracker
```

---

## Deterministic Replay Check

```bash
node scripts/demo-replay.js --deal config/deal.json --scenario core-plus --seed 42
```

---

## Full System Test (Scenarios + Failure/Resume + Contracts)

```bash
node scripts/system-test.js
```

---

## Dashboard Only

```bash
cd dashboard && npm run dev
# Open http://localhost:5173
```

---

## Find Your Deal ID

```bash
cat data/status/<deal-id>.json
# or
ls data/status/
```

---

## Output Locations

| What | Where |
|------|-------|
| Final report | `data/reports/{deal-id}/final-report.md` |
| Phase reports | `data/reports/{deal-id}/{phase}-report.md` |
| Story events (NDJSON) | `data/status/{deal-id}/run-{run-id}-events.ndjson` |
| Document registry | `data/status/{deal-id}/run-{run-id}-documents.json` |
| Run manifest | `data/status/{deal-id}/run-{run-id}-manifest.json` |
| Logs | `data/logs/{deal-id}/master.log` |
| Checkpoint | `data/status/{deal-id}.json` |
| Session state | `data/status/<deal-id>.json` (project root) |

---

For detailed procedures (validation runs, single-phase execution, troubleshooting), see [docs/LAUNCH-PROCEDURES.md](docs/LAUNCH-PROCEDURES.md).

For your first deal, follow the step-by-step guide at [docs/FIRST-DEAL-GUIDE.md](docs/FIRST-DEAL-GUIDE.md).
