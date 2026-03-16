# Agent Development

Guide for adding new agents or modifying existing agents in the CRE Acquisition Orchestration System.

---

## Agent Anatomy

Every agent markdown file must include all 19 sections listed below. This structure ensures consistent behavior, proper state management, and reliable orchestrator integration.

### Required Sections

| # | Section | Purpose |
|---|---------|---------|
| 1 | **Identity Table** | Name, Role, Phase, Type, Version in a markdown table |
| 2 | **Mission** | One-paragraph description of what the agent does and why |
| 3 | **Tools Available** | Table of tools the agent can use (Task, Read, Write, WebSearch, etc.) |
| 4 | **Input Data** | Table of data sources the agent requires, with specific data points |
| 5 | **Strategy** | Numbered steps (Step 1, Step 2, ...) describing the agent's analysis procedure |
| 6 | **Output Format** | Complete JSON schema of the agent's output, with all fields documented |
| 7 | **Checkpoint Protocol** | Table of checkpoint IDs, triggers, and data saved at each checkpoint |
| 8 | **Logging Protocol** | Log format, log levels, and specific events to log |
| 9 | **Resume Protocol** | How the agent resumes from a checkpoint after interruption |
| 10 | **Runtime Parameters** | Parameters injected by the orchestrator at launch (deal-id, paths, resume flag) |
| 11 | **Tool Usage Patterns** | Concrete examples of how the agent uses each tool (Read patterns, Write patterns, WebSearch patterns) |
| 12 | **Error Recovery** | Table of error types, recovery actions, and max retries |
| 13 | **Data Gap Handling** | 5-step protocol for when required data is unavailable |
| 14 | **Output Location** | Table mapping each output type to its file path and format |
| 15 | **Dealbreaker Detection** | List of dealbreakers this agent monitors for, with detection criteria |
| 16 | **Confidence Scoring** | Rubric for HIGH/MEDIUM/LOW confidence assignment |
| 17 | **Downstream Data Contract** | Exact key paths, types, and descriptions of data this agent provides to downstream agents |
| 18 | **Self-Review** | 6-point checklist the agent runs before finalizing output |
| 19 | **Self-Validation Checks** | Table of fields with valid ranges and conditions that trigger flags |

### Section Details

#### 1. Identity Table

```markdown
## Identity

| Field | Value |
|-------|-------|
| **Name** | {agent-name} |
| **Role** | {Phase} Specialist -- {Brief Role Description} |
| **Phase** | {1-5} -- {Phase Name} |
| **Type** | General-purpose Task agent |
| **Version** | 1.0 |
```

The `Name` field must match the key used in `config/agent-registry.json`.

#### 2. Mission

A single paragraph explaining what the agent does, what it analyzes, and what decisions it informs. Should be specific enough that another developer can understand the agent's scope without reading the full strategy.

#### 3. Tools Available

Table listing every tool the agent may use. Standard tools include:

| Tool | Purpose |
|------|---------|
| Task | Spawn child agents for batch processing |
| TaskOutput | Collect results from child agents |
| Read | Read deal config, input data, and skill files |
| Write | Write analysis output and checkpoint files |
| WebSearch | Research market data, comps, regulations |
| WebFetch | Retrieve data from specific URLs |

Only list tools the agent actually uses.

#### 4. Input Data

Table with columns: Source, Data Points. Each row describes one input source and the specific fields the agent needs from it.

#### 5. Strategy

Numbered steps (### Step 1, ### Step 2, ...) with detailed instructions for each analysis phase. Each step should be specific enough to reproduce the analysis. Include:
- What data to read
- What calculations to perform
- What searches to run
- What thresholds to check
- What to write at each stage

#### 6. Output Format

A complete JSON schema wrapped in a code block. Every field must be present with:
- Field name
- Type (number, string, array, object)
- Example value or placeholder
- Enum values where applicable (e.g., `"HIGH | MEDIUM | LOW"`)

#### 7. Checkpoint Protocol

Table with columns: Checkpoint ID, Trigger, Data Saved. Use a consistent ID prefix based on the agent name (e.g., `RR-CP-01` for rent-roll-analyst). Checkpoints should be placed after each major strategy step.

#### 8. Logging Protocol

Define the log format, log file path, and specific events to log. All agents use the standard format:
```
[{ISO-timestamp}] [{agent-name}] [{level}] {message}
```

#### 9. Resume Protocol

Step-by-step instructions for how the agent resumes after interruption:
1. Read checkpoint file
2. Identify last successful checkpoint
3. Load checkpoint data
4. Resume from next step
5. Log the resume event
6. Re-validate loaded data

#### 10. Runtime Parameters

Table of parameters the orchestrator injects: deal-id, checkpoint-path, log-path, resume flag, deal-config, upstream-data (if sequential).

#### 11. Tool Usage Patterns

Concrete examples showing exactly how the agent uses each tool. Include file paths, search queries, and write targets.

#### 12. Error Recovery

Table with columns: Error Type, Action, Max Retries. Cover: input not found, malformed data, web search failures, calculation errors, checkpoint write failures.

#### 13. Data Gap Handling

The standard 5-step protocol:
1. Log the gap
2. Attempt workaround (alternate sources, benchmarks)
3. Note assumption
4. Mark in output (uncertainty_flags, dataGaps arrays)
5. Continue analysis with reduced confidence

#### 14. Output Location

Table with columns: Output, Path, Format. Include the agent checkpoint file, the phase log, and any report contributions.

#### 15. Dealbreaker Detection

List the specific dealbreakers from `config/thresholds.json` that this agent is responsible for detecting. Include detection criteria and escalation steps.

#### 16. Confidence Scoring

Rubric mapping data quality to HIGH/MEDIUM/LOW confidence. Include the JSON structure for confidence output.

#### 17. Downstream Data Contract

Table with columns: Key Path, Type, Description. These are the exact fields that downstream agents and orchestrators read from this agent's output. Changing these fields is a breaking change.

#### 18. Self-Review

Reference to the 6-point self-review protocol from `skills/self-review-protocol.md`:
1. Schema Compliance
2. Numeric Sanity
3. Cross-Reference Validation
4. Threshold Comparison
5. Completeness Assessment
6. Confidence Scoring

#### 19. Self-Validation Checks

Table with columns: Field, Valid Range, Flag If. Lists specific numeric bounds and consistency checks for the agent's output fields.

---

## Adding a New Agent

### Step 1: Copy an Existing Agent as Template

Choose the closest existing agent to your new one and copy its markdown file:

```
Copy: agents/{phase}/{existing-agent}.md
  To: agents/{phase}/{new-agent-name}.md
```

Recommended templates by phase:
- Due Diligence: `agents/due-diligence/rent-roll-analyst.md` (most complete example)
- Underwriting: `agents/underwriting/financial-model-builder.md`
- Financing: `agents/financing/lender-outreach.md`
- Legal: `agents/legal/psa-reviewer.md`
- Closing: `agents/closing/closing-coordinator.md`

### Step 2: Fill In All 19 Sections

Work through each section, replacing the template content:

1. **Identity**: Set the agent's unique name, role, and phase number
2. **Mission**: Write a clear one-paragraph mission
3. **Tools Available**: List only the tools this agent needs
4. **Input Data**: Define exactly what data the agent requires
5. **Strategy**: Write detailed step-by-step analysis procedure
6. **Output Format**: Design the complete JSON output schema
7. **Checkpoint Protocol**: Place checkpoints after each major step
8. **Logging Protocol**: Use the standard format with agent-specific events
9. **Resume Protocol**: Follow the standard resume pattern
10. **Runtime Parameters**: Use standard parameters (deal-id, paths, resume)
11. **Tool Usage Patterns**: Write concrete examples for each tool
12. **Error Recovery**: Cover all failure modes with recovery actions
13. **Data Gap Handling**: Use the standard 5-step protocol
14. **Output Location**: Set correct file paths for the agent's phase
15. **Dealbreaker Detection**: List applicable dealbreakers from thresholds.json
16. **Confidence Scoring**: Use the standard HIGH/MEDIUM/LOW rubric
17. **Downstream Data Contract**: Define the exact fields downstream agents need
18. **Self-Review**: Reference the standard self-review protocol
19. **Self-Validation Checks**: Set valid ranges for all numeric output fields

### Step 3: Register the Agent

Add the agent to `config/agent-registry.json` with all 6 required fields:

```json
"{new-agent-name}": {
  "file": "agents/{phase}/{new-agent-name}.md",
  "inputs": ["config/deal.json", "other input sources"],
  "outputs": ["output description 1", "output description 2"],
  "phase": "{phase-name}",
  "critical": true,
  "dependencies": ["upstream-agent-1", "upstream-agent-2"]
}
```

Field definitions:
| Field | Type | Description |
|-------|------|-------------|
| `file` | string | Path to the agent's markdown prompt file |
| `inputs` | string[] | Data sources the agent requires |
| `outputs` | string[] | What the agent produces |
| `phase` | string | Phase name: `due-diligence`, `underwriting`, `financing`, `legal`, `closing` |
| `critical` | boolean | If true, phase cannot complete without this agent. If false, phase can complete with reduced confidence. |
| `dependencies` | string[] | Agent names that must complete before this agent can start. Empty array for parallel agents. |

### Step 4: Update the Phase Orchestrator

Edit the relevant phase orchestrator at `orchestrators/{phase}-orchestrator.md`:

1. Add the new agent to the orchestrator's agent list
2. Specify whether the agent runs in parallel or sequentially
3. Define what data the orchestrator passes to the new agent
4. Define how the orchestrator reads the new agent's output
5. Update the phase synthesis logic to incorporate the new agent's findings

### Step 5: Add Threshold Entries

If the agent produces scored metrics that need pass/fail evaluation:

1. Open `config/thresholds.json`
2. Add threshold entries under the appropriate phase section
3. Define `pass`, `conditional`, and `fail` values
4. Document the units and description

### Step 6: Test with Synthetic Data

1. Create test input data in `validation/test-deal.json` (add fields if needed)
2. Run the agent individually by reading its prompt and launching as a Task:
   ```
   Read agents/{phase}/{new-agent-name}.md
   Read config/deal.json (or validation/test-deal.json)
   Launch as Task(prompt=<agent prompt + deal config>)
   ```
3. Verify the output:
   - All 19 sections are functional
   - Output JSON matches the defined schema
   - Checkpoints are written correctly
   - Logs follow the standard format
   - Self-validation checks pass
4. Run the full phase orchestrator to verify integration
5. Run the full pipeline to verify end-to-end

---

## Modifying an Existing Agent

### Safe Changes (No Orchestrator Update Required)

These changes are contained within the agent and do not affect other components:

| Change | What to Do | Risk |
|--------|-----------|------|
| Adjust strategy steps | Edit the Strategy section | Low -- agent-internal logic |
| Add/modify anomaly thresholds | Edit the strategy step that performs anomaly detection | Low -- changes detection sensitivity |
| Update self-validation ranges | Edit the Self-Validation Checks table | Low -- changes output validation |
| Fix a bug in analysis logic | Edit the relevant strategy step | Low -- improves accuracy |
| Add a new uncertainty flag type | Add to the Data Gap Handling section | Low -- more granular reporting |
| Update web search queries | Edit Tool Usage Patterns | Low -- may affect data quality |
| Adjust confidence rubric | Edit Confidence Scoring section | Low -- changes confidence classification |
| Add a new checkpoint | Add to Checkpoint Protocol table and strategy | Low -- more granular resume points |

### Changes Requiring Orchestrator Updates

These changes affect how the orchestrator interacts with the agent:

| Change | What Else to Update | Risk |
|--------|-------------------|------|
| New input data requirement | Update `inputs` in agent-registry.json; update orchestrator to provide the data | Medium -- orchestrator must supply new data |
| New output field used by other agents | Update Downstream Data Contract; update consuming agents and orchestrator | High -- breaking change for downstream |
| Remove an output field | Check all downstream consumers before removing | High -- may break downstream agents |
| Change agent name | Update agent-registry.json, orchestrator references, checkpoint paths | High -- breaks all references |
| Change phase assignment | Move file, update registry, update both old and new orchestrators | High -- structural change |
| Change from parallel to sequential (or vice versa) | Update orchestrator launch logic and dependency list | Medium -- affects phase timing |
| Add a new dependency | Update `dependencies` in agent-registry.json; update orchestrator launch order | Medium -- affects execution order |

### Testing Changes Safely

To test agent changes without affecting the live pipeline:

1. **Create a test deal**: Copy `validation/test-deal.json` with your modifications
2. **Run the agent in isolation**: Launch only the modified agent with test data
3. **Compare outputs**: Diff the new output against a known-good baseline
4. **Run the phase**: Launch the phase orchestrator with test data
5. **Run the full pipeline**: Only after phase-level testing passes

### Version Management

When making significant changes to an agent:

1. Update the `Version` field in the Identity table (e.g., 1.0 to 1.1)
2. Add a note to the Mission section explaining what changed
3. If the output schema changed, update the version in the output JSON

---

## Agent Design Principles

### Do

- Keep each strategy step focused on one task
- Place checkpoints after every significant computation
- Log findings and data gaps explicitly
- Use benchmarks from `skills/` as fallbacks, never as primary data
- Design the output schema to be self-documenting (descriptive field names)
- Include uncertainty flags for any estimated or assumed values
- Test with both complete and incomplete input data

### Do Not

- Combine multiple unrelated analyses into a single strategy step
- Skip checkpoints to save time (resume reliability depends on them)
- Assume input data is always available or correct
- Hard-code thresholds (use `config/thresholds.json`)
- Produce output fields that no downstream agent consumes (remove dead fields)
- Modify files outside the agent's designated output paths

---

## Reference: Existing Agents by Phase

### Due Diligence (7 agents)

| Agent | Critical | Dependencies |
|-------|----------|-------------|
| rent-roll-analyst | Yes | None (parallel) |
| opex-analyst | Yes | None (parallel) |
| physical-inspection | Yes | None (parallel) |
| market-study | Yes | None (parallel) |
| environmental-review | Yes | None (parallel) |
| legal-title-review | Yes | None (parallel) |
| tenant-credit | No | rent-roll-analyst |

### Underwriting (3 agents)

| Agent | Critical | Dependencies |
|-------|----------|-------------|
| financial-model-builder | Yes | All 7 DD agents |
| scenario-analyst | Yes | financial-model-builder |
| ic-memo-writer | Yes | financial-model-builder, scenario-analyst |

### Financing (3 agents)

| Agent | Critical | Dependencies |
|-------|----------|-------------|
| lender-outreach | Yes | None (phase-level dependency on UW) |
| quote-comparator | Yes | lender-outreach |
| term-sheet-builder | Yes | quote-comparator |

### Legal (6 agents)

| Agent | Critical | Dependencies |
|-------|----------|-------------|
| psa-reviewer | Yes | None (parallel) |
| title-survey-reviewer | Yes | None (parallel) |
| estoppel-tracker | Yes | None (parallel) |
| loan-doc-reviewer | Yes | None (parallel) |
| insurance-coordinator | No | None (parallel) |
| transfer-doc-preparer | No | None (parallel) |

### Closing (2 agents)

| Agent | Critical | Dependencies |
|-------|----------|-------------|
| closing-coordinator | Yes | All 6 legal agents |
| funds-flow-manager | Yes | closing-coordinator |

---

## Cross-References

- Agent registry: `config/agent-registry.json`
- Threshold definitions: `config/thresholds.json` and [Threshold Customization](THRESHOLD-CUSTOMIZATION.md)
- Skills referenced by agents: `skills/` directory
- System architecture: [Architecture](ARCHITECTURE.md)
- Result interpretation: [Interpreting Results](INTERPRETING-RESULTS.md)
- Glossary: [Glossary](GLOSSARY.md)
