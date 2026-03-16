import { useMemo } from 'react'
import type { StoryEvent } from '../types/checkpoint'

interface StoryNarrativeProps {
  storyEvents: StoryEvent[]
}

function eventTone(kind: string): { dot: string; text: string } {
  if (kind === 'run_completed' || kind === 'phase_completed' || kind === 'agent_completed') {
    return { dot: 'bg-cre-success', text: 'text-cre-success' }
  }
  if (kind === 'agent_failed' || kind === 'phase_failed' || kind === 'run_error') {
    return { dot: 'bg-cre-danger', text: 'text-cre-danger' }
  }
  if (kind === 'decision_made' || kind === 'milestone') {
    return { dot: 'bg-cre-warning', text: 'text-cre-warning' }
  }
  return { dot: 'bg-cre-info', text: 'text-cre-info' }
}

function prettyTs(value: string): string {
  const t = Date.parse(value)
  if (!Number.isFinite(t)) return value
  return new Date(t).toLocaleTimeString('en-US', { hour12: false })
}

function eventLabel(event: StoryEvent): string {
  if (typeof event.title === 'string' && event.title.length > 0) return event.title
  if (typeof event.agent === 'string' && event.kind.startsWith('agent_')) {
    return `${event.agent} ${event.kind.replace('agent_', '').replace(/_/g, ' ')}`
  }
  if (typeof event.phaseLabel === 'string' && event.phaseLabel.length > 0) {
    return `${event.phaseLabel} ${event.kind.replace('phase_', '').replace(/_/g, ' ')}`
  }
  return event.kind.replace(/_/g, ' ')
}

export default function StoryNarrative({ storyEvents }: StoryNarrativeProps) {
  const orderedEvents = useMemo(() => {
    return [...storyEvents].sort((a, b) => a.seq - b.seq)
  }, [storyEvents])

  if (orderedEvents.length === 0) {
    return (
      <div className="card flex items-center justify-center h-64 text-center">
        <div>
          <p className="text-gray-400">Narrative timeline will appear once the run starts.</p>
          <p className="text-xs text-gray-600 mt-1">Milestones, decisions, and agent events stream live.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Story Timeline
      </h3>
      <div className="space-y-3">
        {orderedEvents.map((event) => {
          const tone = eventTone(event.kind)
          return (
            <div
              key={`${event.runId}-${event.seq}`}
              className="rounded-lg border border-cre-border bg-black/20 p-3"
            >
              <div className="flex items-center gap-2 text-xs mb-1">
                <span className={`inline-block w-2 h-2 rounded-full ${tone.dot}`} />
                <span className={`${tone.text} font-semibold uppercase tracking-wider`}>
                  {event.kind.replace(/_/g, ' ')}
                </span>
                <span className="text-gray-600 ml-auto">{prettyTs(event.ts)}</span>
              </div>
              <p className="text-sm text-gray-200">{eventLabel(event)}</p>
              {typeof event.subtitle === 'string' && event.subtitle.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">{event.subtitle}</p>
              )}
              {typeof event.summary === 'string' && event.summary.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">{event.summary}</p>
              )}
              <div className="flex gap-3 text-xs text-gray-600 mt-2 flex-wrap">
                {typeof event.phase === 'string' && event.phase.length > 0 && (
                  <span>Phase: {event.phase}</span>
                )}
                {typeof event.agent === 'string' && event.agent.length > 0 && (
                  <span>Agent: {event.agent}</span>
                )}
                {typeof event.verdict === 'string' && event.verdict.length > 0 && (
                  <span>Verdict: {event.verdict}</span>
                )}
                {typeof event.redFlagCount === 'number' && (
                  <span>Red flags: {event.redFlagCount}</span>
                )}
                {typeof event.dataGapCount === 'number' && (
                  <span>Data gaps: {event.dataGapCount}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
