import type { DealCheckpoint } from '../../types/checkpoint'
import {
  PHASE_ORDER,
  PHASE_LABELS,
  verdictColor,
  verdictLabel,
  SectionHeading,
} from './ReportHelpers'

interface Props {
  dealCheckpoint: DealCheckpoint
}

export default function PipelineSummary({ dealCheckpoint }: Props) {
  const { phases } = dealCheckpoint

  /** Format a duration in milliseconds to a human-readable string. */
  function formatDuration(ms: number): string {
    const totalSeconds = Math.round(ms / 1000)
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    if (mins > 0) {
      return secs > 0 ? `${mins} min ${secs} sec` : `${mins} min`
    }
    return `${secs} sec`
  }

  /* Build phase row data */
  const phaseRows = PHASE_ORDER.map((key) => {
    const phase = phases?.[key]
    if (!phase) {
      return {
        key,
        label: PHASE_LABELS[key] || key,
        agentsStr: '--',
        startedStr: '--',
        durationStr: '--',
        verdict: null,
        completed: 0,
        total: 0,
      }
    }

    /* Agent counts from agentStatuses map (more accurate than agents object) */
    const agentStatuses = phase.agentStatuses || {}
    const statusValues = Object.values(agentStatuses)
    const phaseTotal = phase.agentStatuses != null
      ? statusValues.length
      : (phase.agents?.total ?? 0)
    const phaseCompleted = phase.agentStatuses != null
      ? statusValues.filter((s) => typeof s === 'string' && /^complete$/i.test(s)).length
      : (phase.agents?.completed ?? 0)

    /* Timestamps */
    const started = phase.startedAt ? new Date(phase.startedAt) : null
    const ended = phase.completedAt ? new Date(phase.completedAt) : null

    /* Format start time */
    const startedStr = started
      ? started.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : '--'

    /* Format duration */
    let durationStr = '--'
    if (started && ended) {
      durationStr = formatDuration(ended.getTime() - started.getTime())
    }

    const v = phase.verdict || phase.outputs?.phaseVerdict || null

    return {
      key,
      label: PHASE_LABELS[key] || key,
      agentsStr: `${phaseCompleted}/${phaseTotal}`,
      startedStr,
      durationStr,
      verdict: typeof v === 'string' ? v : null,
      completed: phaseCompleted,
      total: phaseTotal,
    }
  })

  /* Compute totals after map to avoid TypeScript narrowing issues in closures */
  let totalAgents = 0
  let completedAgents = 0
  const allTimestamps: number[] = []

  for (const key of PHASE_ORDER) {
    const phase = phases?.[key]
    if (!phase) continue
    const agentStatuses = phase.agentStatuses || {}
    const statusValues = Object.values(agentStatuses)
    totalAgents += phase.agentStatuses != null
      ? statusValues.length
      : (phase.agents?.total ?? 0)
    completedAgents += phase.agentStatuses != null
      ? statusValues.filter((s) => typeof s === 'string' && /^complete$/i.test(s)).length
      : (phase.agents?.completed ?? 0)
    if (phase.startedAt) allTimestamps.push(new Date(phase.startedAt).getTime())
    if (phase.completedAt) allTimestamps.push(new Date(phase.completedAt).getTime())
  }

  /* Overall duration string */
  let overallDuration = '--'
  if (allTimestamps.length >= 2) {
    const earliest = Math.min(...allTimestamps)
    const latest = Math.max(...allTimestamps)
    overallDuration = formatDuration(latest - earliest)
  }

  /* Report date */
  const reportDate = new Date(
    dealCheckpoint.lastUpdatedAt || Date.now()
  ).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <section className="space-y-4">
      <SectionHeading>Pipeline Execution Summary</SectionHeading>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cre-border text-xs text-gray-500 uppercase">
                <th className="py-2 text-left font-medium">Phase</th>
                <th className="py-2 text-center font-medium">Agents</th>
                <th className="py-2 text-center font-medium">Started</th>
                <th className="py-2 text-center font-medium">Duration</th>
                <th className="py-2 text-right font-medium">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {phaseRows.map((row) => (
                <tr
                  key={row.key}
                  className="border-b border-cre-border/30 last:border-b-0"
                >
                  <td className="py-2.5 text-gray-300 font-medium">{row.label}</td>
                  <td className="py-2.5 text-center font-mono tabular-nums text-gray-400">
                    {row.agentsStr}
                  </td>
                  <td className="py-2.5 text-center font-mono tabular-nums text-gray-500 text-xs">
                    {row.startedStr}
                  </td>
                  <td className="py-2.5 text-center font-mono tabular-nums text-gray-400">
                    {row.durationStr}
                  </td>
                  <td className="py-2.5 text-right">
                    <span className={`status-badge ${verdictColor(row.verdict)}`}>
                      {verdictLabel(row.verdict)}
                    </span>
                  </td>
                </tr>
              ))}

              {/* Total row */}
              <tr className="border-t-2 border-cre-border">
                <td className="py-2.5 text-gray-200 font-semibold">Total</td>
                <td className="py-2.5 text-center font-mono tabular-nums text-white font-semibold">
                  {completedAgents}/{totalAgents} complete
                </td>
                <td className="py-2.5 text-center text-gray-500">--</td>
                <td className="py-2.5 text-center font-mono tabular-nums text-white font-semibold">
                  {overallDuration}
                </td>
                <td className="py-2.5" />
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-cre-border/50 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Deal ID: <span className="font-mono">{dealCheckpoint.dealId || '--'}</span>
            </span>
            <span>Generated: {reportDate}</span>
          </div>
          <p className="text-xs text-gray-600 text-center">
            Generated by CRE Acquisition Orchestration System &mdash;{' '}
            {totalAgents} specialist agents across {PHASE_ORDER.length} phases
          </p>
        </div>
      </div>
    </section>
  )
}
