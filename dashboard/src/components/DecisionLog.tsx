import { useMemo } from 'react'
import type { StoryEvent } from '../types/checkpoint'

interface DecisionLogProps {
  storyEvents: StoryEvent[]
}

function prettyTs(value: string): string {
  const ts = Date.parse(value)
  if (!Number.isFinite(ts)) return value
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false })
}

export default function DecisionLog({ storyEvents }: DecisionLogProps) {
  const decisions = useMemo(() => {
    return storyEvents
      .filter((event) => event.kind === 'decision_made')
      .sort((a, b) => a.seq - b.seq)
  }, [storyEvents])

  if (decisions.length === 0) {
    return (
      <div className="card flex items-center justify-center h-64 text-center">
        <div>
          <p className="text-gray-400">No decisions logged yet.</p>
          <p className="text-xs text-gray-600 mt-1">
            Verdict and gating rationale will appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Decision Ribbon
      </h3>
      <div className="space-y-3">
        {decisions.map((decision) => (
          <div key={`${decision.runId}-${decision.seq}`} className="rounded-lg border border-cre-border bg-black/20 p-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="status-badge bg-cre-warning/20 text-cre-warning">Decision</span>
              {typeof decision.phase === 'string' && (
                <span className="text-gray-500">{decision.phase}</span>
              )}
              <span className="text-gray-600 ml-auto">{prettyTs(decision.ts)}</span>
            </div>
            <p className="text-sm text-gray-200 mt-1">
              {typeof decision.title === 'string' ? decision.title : 'Decision'}
            </p>
            {typeof decision.rationale === 'string' && decision.rationale.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">{decision.rationale}</p>
            )}
            {Array.isArray(decision.inputs) && decision.inputs.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Inputs</p>
                <ul className="mt-1 space-y-1">
                  {decision.inputs.map((input, idx) => (
                    <li key={idx} className="text-xs text-gray-400">
                      - {input}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(decision.impact) && decision.impact.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Impact</p>
                <ul className="mt-1 space-y-1">
                  {decision.impact.map((item, idx) => (
                    <li key={idx} className="text-xs text-gray-400">
                      - {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
