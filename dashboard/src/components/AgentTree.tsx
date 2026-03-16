import React, { useState } from 'react'
import type { DealCheckpoint, AgentCheckpoint } from '../types/checkpoint'
import AgentCard from './AgentCard'

interface AgentTreeProps {
  dealCheckpoint: DealCheckpoint
  agentCheckpoints: Map<string, AgentCheckpoint>
}

const PHASE_ORDER = [
  'due-diligence',
  'due_diligence',
  'dueDiligence',
  'underwriting',
  'financing',
  'legal',
  'closing',
]

const PHASE_DISPLAY_NAMES: Record<string, string> = {
  'due-diligence': 'Due Diligence',
  'due_diligence': 'Due Diligence',
  'dueDiligence': 'Due Diligence',
  underwriting: 'Underwriting',
  financing: 'Financing',
  legal: 'Legal',
  closing: 'Closing',
}

function StatusDot({ status }: { status: string }) {
  const colorClass =
    status === 'complete'
      ? 'bg-cre-success'
      : status === 'running'
      ? 'bg-cre-info'
      : status === 'failed'
      ? 'bg-cre-danger'
      : status === 'skipped'
      ? 'bg-gray-500'
      : 'bg-gray-600'

  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${colorClass} flex-shrink-0`}
    />
  )
}

function AgentNode({
  agent,
  isSelected,
  onClick,
}: {
  agent: AgentCheckpoint
  isSelected: boolean
  onClick: () => void
}) {
  const progressPercent = Math.round(agent.progress * 100)

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm w-full text-left transition-colors ${
        isSelected
          ? 'bg-cre-accent/20 text-cre-accent'
          : 'hover:bg-cre-surface/60 text-gray-300'
      }`}
    >
      <StatusDot status={agent.status} />
      <span className="flex-1 truncate">{agent.agentName}</span>
      <span className="text-xs text-gray-500 tabular-nums">{progressPercent}%</span>
    </button>
  )
}

export default function AgentTree({ dealCheckpoint, agentCheckpoints }: AgentTreeProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    new Set(PHASE_ORDER)
  )
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  const togglePhase = (phaseKey: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev)
      if (next.has(phaseKey)) {
        next.delete(phaseKey)
      } else {
        next.add(phaseKey)
      }
      return next
    })
  }

  // Group agents by phase
  const agentsByPhase = new Map<string, AgentCheckpoint[]>()
  for (const [, agent] of agentCheckpoints) {
    const phase = agent.phase || 'unknown'
    if (!agentsByPhase.has(phase)) {
      agentsByPhase.set(phase, [])
    }
    agentsByPhase.get(phase)!.push(agent)
  }

  const orderedPhases = PHASE_ORDER.filter(
    (key) => key in dealCheckpoint.phases || agentsByPhase.has(key)
  )
  const extraPhases = [...agentsByPhase.keys()].filter(
    (key) => !PHASE_ORDER.includes(key) && key !== 'unknown'
  )
  const allPhases = [...orderedPhases, ...extraPhases]

  const selectedAgentData = selectedAgent
    ? agentCheckpoints.get(selectedAgent) || null
    : null

  return (
    <div className="flex gap-4">
      {/* Tree panel */}
      <div className="card flex-1 min-w-0 max-w-md">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Agent Hierarchy
        </h3>

        {/* Master orchestrator */}
        <div className="mb-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium text-white bg-cre-accent/10">
            <StatusDot status={dealCheckpoint.status} />
            <span>Master Orchestrator</span>
          </div>
        </div>

        {/* Phases */}
        <div className="space-y-1 ml-4 border-l border-cre-border pl-3">
          {allPhases.map((phaseKey) => {
            const phaseInfo = dealCheckpoint.phases[phaseKey]
            const agents = agentsByPhase.get(phaseKey) || []
            const isExpanded = expandedPhases.has(phaseKey)
            const displayName =
              PHASE_DISPLAY_NAMES[phaseKey] ||
              phaseInfo?.name ||
              phaseKey

            return (
              <div key={phaseKey}>
                {/* Phase orchestrator node */}
                <button
                  onClick={() => togglePhase(phaseKey)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium w-full text-left hover:bg-cre-surface/60 text-gray-200"
                >
                  <span className="text-gray-500 w-4 text-center text-xs">
                    {isExpanded ? '\u25BC' : '\u25B6'}
                  </span>
                  <StatusDot status={phaseInfo?.status || 'pending'} />
                  <span className="flex-1">{displayName}</span>
                  <span className="text-xs text-gray-600">
                    {agents.length} agent{agents.length !== 1 ? 's' : ''}
                  </span>
                </button>

                {/* Specialist agents */}
                {isExpanded && agents.length > 0 && (
                  <div className="ml-6 border-l border-cre-border/50 pl-2 space-y-0.5 mt-0.5">
                    {agents.map((agent) => (
                      <React.Fragment key={agent.agentName}>
                        <AgentNode
                          agent={agent}
                          isSelected={selectedAgent === agent.agentName}
                          onClick={() =>
                            setSelectedAgent(
                              selectedAgent === agent.agentName
                                ? null
                                : agent.agentName
                            )
                          }
                        />
                        {/* Child agents */}
                        {agent.childAgents && agent.childAgents.length > 0 && (
                          <div className="ml-6 border-l border-cre-border/30 pl-2 space-y-0.5">
                            {agent.childAgents.map((child) => (
                              <div
                                key={child.taskId}
                                className="flex items-center gap-2 px-3 py-1 text-xs text-gray-500"
                              >
                                <StatusDot status={child.status} />
                                <span className="truncate">{child.agentName}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {isExpanded && agents.length === 0 && (
                  <div className="ml-6 pl-2 text-xs text-gray-600 py-1">
                    No agents reported yet
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 min-w-0">
        {selectedAgentData ? (
          <AgentCard agent={selectedAgentData} />
        ) : (
          <div className="card flex items-center justify-center h-64 text-gray-500">
            Select an agent to view details
          </div>
        )}
      </div>
    </div>
  )
}
