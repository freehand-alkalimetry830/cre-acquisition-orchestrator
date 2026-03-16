# Logging Protocol

## Purpose

All agents must log significant actions to enable monitoring, debugging, and audit trails. The dashboard reads these logs in real-time via a file watcher, providing operators with a live view of what every agent is doing across every deal. Without consistent logging, the orchestration system becomes opaque and undebuggable.

Logging is not optional. Every agent -- whether spawned by the master orchestrator or running as a sub-agent within a phase -- must follow this protocol exactly. The log format, categories, and file paths are standardized so the dashboard can parse and display them uniformly.

---

## Log Format

Every log entry follows this exact format:

```
[ISO-timestamp] [agent-name] [CATEGORY] message
```

**Rules:**
- **ISO-timestamp**: Full ISO 8601 format with timezone: `2025-01-15T14:32:07.000Z`
- **agent-name**: The agent's identifier exactly as defined in the orchestration config (e.g., `ownership-agent`, `zoning-agent`, `master-orchestrator`, `market-comp-agent`)
- **CATEGORY**: One of the five defined categories below, always UPPERCASE
- **message**: Free-text description of what happened. Should be specific and actionable -- not vague. Include relevant IDs, values, and context.

**Example:**
```
[2025-01-15T14:32:07.000Z] [ownership-agent] [ACTION] Starting ownership chain analysis for parcel 12-345-678
```

---

## Categories

### ACTION
The agent is performing a step in its workflow. Use this for every significant operation: starting a search, calling an API, reading a file, writing output, spawning a child agent.

**When to use:** The agent is *doing* something.

### FINDING
The agent discovered a data point, fact, or result that is relevant to the analysis. This is the core analytical output -- findings drive the final report.

**When to use:** The agent *found* something noteworthy (positive or negative).

### ERROR
Something went wrong. The agent encountered an exception, an API returned an error, a file was missing, data was malformed, or a dependency failed. Errors should include enough context to diagnose the problem.

**When to use:** An operation *failed* or produced unexpected results.

### DATA_GAP
The agent could not find data that it expected or needed. This is distinct from ERROR -- the operation succeeded, but the result was empty or insufficient. Data gaps affect analysis quality and should be flagged for human review.

**When to use:** Expected data was *missing* or *insufficient*, affecting analysis completeness.

### COMPLETE
The agent finished its work. This signals to the orchestrator (and the dashboard) that the agent's task is done. Include a summary of what was accomplished.

**When to use:** The agent has *finished* all of its assigned work.

---

## Log Location

All logs are stored under the deal's log directory:

```
data/logs/{deal-id}/{phase}.log
```

- **{deal-id}**: The unique identifier for the deal (e.g., `deal-2025-001`)
- **{phase}**: The phase of analysis (e.g., `phase-1-due-diligence`, `phase-2-underwriting`, `phase-3-risk`)

The master orchestrator maintains a consolidated log at:

```
data/logs/{deal-id}/master.log
```

The master log contains entries from the orchestrator itself plus key entries forwarded from child agents (typically FINDING, ERROR, DATA_GAP, and COMPLETE entries).

**File rules:**
- All log files are **append-only**. Never overwrite or truncate.
- If the log file does not exist, create it with the first entry.
- If the directory does not exist, create it before writing.

---

## When to Log

Agents must log in the following situations:

1. **After every significant action** -- Starting a search, querying a data source, reading/writing files, making calculations
2. **When data is found** -- Any discovery that will appear in the final analysis or affect scoring
3. **When data is NOT found** -- Missing records, empty search results, unavailable sources (log as DATA_GAP)
4. **On errors** -- Any exception, API failure, timeout, malformed data, or unexpected state
5. **On completion** -- When the agent finishes all assigned work
6. **When spawning child agents** -- Log the child agent's name, task, and parameters
7. **When a child agent completes** -- Log the child's final status and key outputs
8. **On checkpoint writes** -- Log when a checkpoint is saved (see checkpoint-protocol.md)

**Rule of thumb:** If an operator looking at the dashboard would want to know about it, log it.

---

## Implementation

Agents use the Write tool to append to the log file. The pattern is: read the existing log content, append the new entry, and write it back.

### Appending a Log Entry

```
Step 1: Read the existing log file (if it exists)
Step 2: Construct the new log entry using the standard format
Step 3: Append the new entry to the existing content (add a newline)
Step 4: Write the full content back to the file
```

If the file does not exist yet, skip Step 1 and write the new entry as the file's first content.

### Example Log Entries

**ACTION examples:**
```
[2025-01-15T14:32:07.000Z] [ownership-agent] [ACTION] Starting ownership chain analysis for parcel 12-345-678
[2025-01-15T14:32:09.000Z] [ownership-agent] [ACTION] Querying county recorder database for deed history
[2025-01-15T14:32:15.000Z] [master-orchestrator] [ACTION] Spawning zoning-agent for deal deal-2025-001 with parcel 12-345-678
[2025-01-15T14:33:01.000Z] [underwriting-agent] [ACTION] Calculating NOI using provided rent roll and expense data
```

**FINDING examples:**
```
[2025-01-15T14:32:12.000Z] [ownership-agent] [FINDING] Property transferred 3 times in last 5 years -- potential flip pattern detected
[2025-01-15T14:34:00.000Z] [zoning-agent] [FINDING] Property zoned R-4 (High Density Residential), allows multifamily up to 50 units
[2025-01-15T14:35:22.000Z] [environmental-agent] [FINDING] No EPA Superfund sites within 1-mile radius
[2025-01-15T14:36:10.000Z] [market-comp-agent] [FINDING] Comparable sale: 123 Main St sold for $125,000/unit on 2024-11-03, 5.2% cap rate
```

**ERROR examples:**
```
[2025-01-15T14:32:20.000Z] [ownership-agent] [ERROR] County recorder API returned 503 Service Unavailable -- will retry in 30 seconds
[2025-01-15T14:33:45.000Z] [environmental-agent] [ERROR] Failed to parse EPA ECHO response: unexpected JSON structure at field 'facilities'
[2025-01-15T14:35:00.000Z] [master-orchestrator] [ERROR] zoning-agent failed after 3 retries -- marking as failed, proceeding with available data
```

**DATA_GAP examples:**
```
[2025-01-15T14:32:25.000Z] [ownership-agent] [DATA_GAP] No deed records found prior to 2005 -- ownership chain incomplete before that date
[2025-01-15T14:34:30.000Z] [financial-agent] [DATA_GAP] No T-12 operating statement provided -- using pro forma estimates only
[2025-01-15T14:36:00.000Z] [market-comp-agent] [DATA_GAP] Only 2 comparable sales found within 1-mile radius (minimum 3 preferred) -- expanding search to 3 miles
```

**COMPLETE examples:**
```
[2025-01-15T14:33:00.000Z] [ownership-agent] [COMPLETE] Ownership analysis finished. Found 3 transfers, 1 active lien, no title disputes. Risk score: LOW (15/100)
[2025-01-15T14:40:00.000Z] [master-orchestrator] [COMPLETE] Phase 1 due diligence complete. 5/6 agents succeeded, 1 failed (environmental-agent). Overall phase status: COMPLETE_WITH_GAPS
```

### Full Append Pattern (Pseudocode)

```
// To log an entry:
1. existing_content = Read("data/logs/{deal-id}/{phase}.log")
   // If file doesn't exist, existing_content = ""

2. new_entry = "[{ISO_TIMESTAMP}] [{AGENT_NAME}] [{CATEGORY}] {message}"

3. updated_content = existing_content + "\n" + new_entry
   // If existing_content is empty: updated_content = new_entry

4. Write("data/logs/{deal-id}/{phase}.log", updated_content)
```

---

## Dashboard Integration

The dashboard's file watcher monitors log files under `data/logs/`. When a log file is modified, the dashboard reads the new entries and displays them in the **LogStream** component in real-time.

### Color Coding

The dashboard applies the following color coding based on the log category:

| Category   | Color  | Hex Code  | Meaning                        |
|------------|--------|-----------|--------------------------------|
| FINDING    | Green  | `#4CAF50` | Discovery or data point found  |
| ERROR      | Red    | `#F44336` | Something went wrong           |
| DATA_GAP   | Yellow | `#FFC107` | Missing data affects analysis  |
| ACTION     | Blue   | `#2196F3` | Agent performing a step        |
| COMPLETE   | White  | `#FFFFFF` | Agent finished its work        |

### Dashboard Parsing

The dashboard parses each log line using the standard format to extract:
- **Timestamp** -- displayed in local time, used for sorting and filtering
- **Agent name** -- used for filtering by agent and grouping related entries
- **Category** -- used for color coding and filtering by severity
- **Message** -- displayed as the log entry text

Entries that do not match the standard format are displayed as-is with a grey color and a parsing warning icon.

### Real-Time Updates

The file watcher polls log files every 2 seconds. New entries appear in the LogStream within 2-4 seconds of being written. The dashboard supports filtering by:
- Deal ID
- Phase
- Agent name
- Category (e.g., show only ERRORs and DATA_GAPs)
- Time range

---

## How Agents Use This Skill

### When to Read

- **ALL agents** (mandatory): Every agent in the orchestration system must read this document before performing any work. The logging protocol defines the exact format, categories, and file paths that every log entry must follow. An agent that does not follow this protocol produces logs that the dashboard cannot parse and operators cannot read.
- **Dashboard watcher** (mandatory for parsing): The dashboard's file watcher depends on the exact log format specified here. Any deviation from the format (missing brackets, wrong category name, non-ISO timestamp) will cause the entry to display with a parsing warning. The dashboard developer must understand this protocol to build correct parsing logic.

### What to Cross-Reference

- **Log file path against phase name from checkpoint protocol**: The log file path follows the pattern `data/logs/{deal-id}/{phase}.log`, where `{phase}` matches the phase names defined in the checkpoint protocol (e.g., `phase-1-due-diligence`, `phase-2-underwriting`). Cross-reference the phase names to ensure the log file goes to the correct location. An agent logging to the wrong phase file creates confusion in the dashboard and makes debugging harder.
- **Log categories against the 5 standard categories**: Every log entry must use exactly one of the five categories: `ACTION`, `FINDING`, `ERROR`, `DATA_GAP`, `COMPLETE`. These are uppercase and enclosed in square brackets. Cross-reference your log entries against these categories to ensure consistency. Non-standard categories (e.g., `WARNING`, `INFO`, `DEBUG`) are not recognized by the dashboard parser.
- **Agent name against the agent registry**: The `[agent-name]` field in the log entry must exactly match the agent's identifier as defined in `config/agent-registry.json`. Using a different name (e.g., `ownership` instead of `ownership-agent`) breaks the dashboard's agent filtering and makes it impossible to trace log entries back to their source agent.

### How to Apply

- **Every agent logs to the phase log file**: All agents within a phase write to the same log file at `data/logs/{deal-id}/{phase}.log`. This consolidates all activity for a phase into a single chronological stream that operators can follow in the dashboard.
- **Use the exact format**: Every entry must follow `[ISO-timestamp] [agent-name] [CATEGORY] message`. No exceptions. The timestamp must be full ISO 8601 with timezone (e.g., `2025-01-15T14:32:07.000Z`). The agent name and category must be in square brackets. The message is free-text but should be specific and actionable.
- **Log at every required trigger point**: Log after every significant action (ACTION), when data is discovered (FINDING), when operations fail (ERROR), when expected data is missing (DATA_GAP), and when the agent finishes all work (COMPLETE). Also log when spawning child agents and when checkpoints are written. If an operator would want to know about it, log it.

### Common Mistakes

- **Using non-standard log categories**: Categories like `WARNING`, `INFO`, `STATUS`, or `DEBUG` are not recognized by the dashboard. The only valid categories are `ACTION`, `FINDING`, `ERROR`, `DATA_GAP`, and `COMPLETE`. Using a non-standard category causes the dashboard to display the entry with a parsing warning icon and grey color, making it easy for operators to miss important information.
- **Logging to agent-specific files instead of the phase log**: Agents must log to `data/logs/{deal-id}/{phase}.log`, not to a file named after the agent (e.g., `data/logs/deal-2025-001/ownership-agent.log`). Agent-specific log files fragment the activity stream and prevent the dashboard from showing a unified timeline. The agent name is already embedded in each log entry, so filtering by agent is possible from the phase log.
- **Not including agent name in log entries**: Every log entry must include `[agent-name]` as the second bracketed field. Without it, operators cannot tell which agent produced the entry when reading the phase log. This is especially critical when multiple agents run in parallel within the same phase -- their entries interleave in the log file, and the agent name is the only way to distinguish them.
