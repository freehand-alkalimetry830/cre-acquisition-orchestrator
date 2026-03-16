# Dashboard Setup

Guide to installing, configuring, and using the real-time monitoring dashboard for the CRE Acquisition Orchestration System.

---

## Overview

The dashboard provides real-time visibility into pipeline execution:

- **Phase progress**: Visual progress bars for each of the 5 phases
- **Agent status**: Per-agent status indicators (pending, running, complete, failed)
- **Log viewer**: Live log stream from all agents with filtering
- **Report viewer**: Read final reports and IC memos directly in the browser
- **Real-time updates**: WebSocket connection pushes updates as agents write checkpoints

The dashboard consists of two components:
1. **Vite dev server** (port 5173): Serves the React frontend
2. **Watcher process** (port 8080): Monitors checkpoint/log files and pushes updates via WebSocket

---

## First-Time Setup

### Prerequisites

- Node.js 18+ installed
- npm 9+ installed

See [Prerequisites](PREREQUISITES.md) for full software requirements.

### Install Dependencies

```bash
cd dashboard
npm install
```

This installs all frontend dependencies (React, Vite, Tailwind CSS) and the watcher dependencies.

---

## Starting the Dashboard

```bash
cd dashboard
npm run dev
```

This single command starts both:
- The Vite development server on **port 5173**
- The file watcher on **port 8080**

You should see output similar to:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/

  Watcher: Monitoring data/status/ for changes
  Watcher: WebSocket server started on port 8080
```

---

## Accessing the Dashboard

Open your browser and navigate to:

```
http://localhost:5173
```

The dashboard loads immediately and attempts to connect to the watcher via WebSocket at `ws://localhost:8080`.

### Connection Status

The dashboard displays a connection indicator:
- **Green dot / "Connected"**: WebSocket is active, receiving real-time updates
- **Red dot / "Disconnected"**: WebSocket lost, data is stale. Refresh the browser or restart the watcher.

---

## Features

### Phase Progress View

The main view shows all 5 phases in the pipeline:

| Phase | Agents | Description |
|-------|--------|-------------|
| Due Diligence | 7 | Property analysis, market study, environmental, title |
| Underwriting | 3 | Financial model, scenarios, IC memo |
| Financing | 3 | Lender outreach, quote comparison, term sheet |
| Legal | 6 | PSA review, title/survey, estoppels, loan docs, insurance, transfer docs |
| Closing | 2 | Closing coordination, funds flow |

Each phase shows:
- Progress bar (0-100%)
- Agent count (completed / total)
- Phase verdict (once complete): GO, CONDITIONAL, NO-GO
- Duration timer

### Agent Status Panel

Click on any phase to expand the agent detail panel:

| Status | Icon | Meaning |
|--------|------|---------|
| Pending | Gray circle | Agent has not started yet |
| Running | Blue spinner | Agent is actively executing |
| Complete | Green check | Agent finished successfully |
| Failed | Red X | Agent encountered an error |

Each agent entry shows:
- Agent name
- Current status
- Last checkpoint ID (if running)
- Confidence level (if complete)
- Duration

### Log Viewer

The log viewer panel shows real-time log output from all agents:

- **Filter by phase**: Select a specific phase to see only its logs
- **Filter by category**: Toggle ACTION, FINDING, ERROR, DATA_GAP, COMPLETE
- **Search**: Free-text search across all log entries
- **Auto-scroll**: Automatically scrolls to the latest entry (toggle on/off)

Log entries are color-coded:
- ACTION: Default text
- FINDING: Blue
- ERROR: Red
- DATA_GAP: Orange
- COMPLETE: Green

### Report Viewer

Once the pipeline completes, view generated reports directly in the dashboard:

- **Final Report**: The comprehensive deal analysis report
- **IC Memo**: The Investment Committee memorandum
- **Phase Outputs**: Individual phase output summaries

---

## Port Configuration

### Changing the Vite Dev Server Port (Default: 5173)

If port 5173 conflicts with another process, edit `dashboard/vite.config.ts`:

```typescript
export default defineConfig({
  // ...
  server: {
    port: 3000,  // Change to desired port
  },
})
```

Then access the dashboard at `http://localhost:3000`.

### Changing the Watcher Port (Default: 8080)

If port 8080 conflicts, edit `dashboard/watcher/index.js`:

```javascript
const WS_PORT = 8080;  // Change to desired port
```

You must also update the WebSocket URL in the frontend. Edit `dashboard/src/config.ts` (or equivalent):

```typescript
export const WS_URL = 'ws://localhost:8080';  // Match the new watcher port
```

After changing ports, restart the dashboard: stop the process and run `npm run dev` again.

---

## Multi-Browser Support

The dashboard works in all modern browsers:

| Browser | Supported | Notes |
|---------|-----------|-------|
| Chrome | Yes | Recommended. Best developer tools for debugging. |
| Firefox | Yes | Full support. |
| Edge | Yes | Full support (Chromium-based). |
| Safari | Yes | WebSocket support confirmed. |

Multiple browser windows can connect to the same dashboard simultaneously. All receive the same real-time updates.

---

## Stopping the Dashboard

Press `Ctrl+C` in the terminal where `npm run dev` is running. This stops both the Vite server and the file watcher.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Blank page at localhost:5173 | Vite dev server not running | Run `cd dashboard && npm run dev` |
| "Cannot find module" error | Dependencies not installed | Run `cd dashboard && npm install` |
| Port 5173 in use | Another process occupying the port | Kill the process or change the port (see above) |
| Port 8080 in use | Another process occupying the port | Kill the process or change the port (see above) |
| "Disconnected" status | Watcher crashed or was not started | Restart with `npm run dev` |
| Phase progress stuck at 0% | Watcher cannot find checkpoint files | Verify `data/status/{deal-id}.json` exists. Check that the watcher's watch path matches your data directory. |
| Log viewer empty | Pipeline has not started yet | Logs appear only after agents begin executing. Launch the pipeline first. |
| Stale data after pipeline re-run | Browser cache showing old data | Hard refresh (Ctrl+Shift+R) or clear browser cache |
| Watcher shows file change events but UI doesn't update | WebSocket message format mismatch | Check browser console for errors. Ensure watcher and frontend versions match. |

### Checking Watcher Health

Open the browser developer console (F12) and look for WebSocket messages:

```
WebSocket connected to ws://localhost:8080
Received: { type: "checkpoint", phase: "due-diligence", ... }
```

If you see connection errors, the watcher may not be running or the port may be blocked.

---

## Running in Production Mode

For a production build (optimized, no hot reload):

```bash
cd dashboard
npm run build
```

This outputs static files to `dashboard/dist/`. Serve them with any static file server. Note that the watcher still needs to run separately for real-time updates.

---

## Cross-References

- Software prerequisites: [Prerequisites](PREREQUISITES.md)
- Full troubleshooting: [Troubleshooting](TROUBLESHOOTING.md)
- Understanding dashboard data: [Interpreting Results](INTERPRETING-RESULTS.md)
- System architecture: [Architecture](ARCHITECTURE.md)
