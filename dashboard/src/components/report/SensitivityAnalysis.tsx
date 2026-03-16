import type { DealCheckpoint } from '../../types/checkpoint'
import {
  fmtPct,
  fmtX,
  safeNum,
  safeStr,
  safeArr,
  safeObj,
  SectionHeading,
  StatCard,
} from './ReportHelpers'
import EmptyPhaseState from './EmptyPhaseState'

interface Props {
  dealCheckpoint: DealCheckpoint
}

export default function SensitivityAnalysis({ dealCheckpoint }: Props) {
  const { phases } = dealCheckpoint

  /* Guard: need UW data */
  if (!phases?.underwriting?.dataForDownstream) {
    return (
      <EmptyPhaseState
        sectionTitle="Sensitivity Analysis"
        phaseName="Underwriting"
      />
    )
  }

  const uw = (phases?.underwriting?.dataForDownstream || {}) as Record<string, unknown>
  const scenario = safeObj(uw.scenarioSummary)

  /* Variable matrix data */
  const variables = safeArr(scenario.variables) as Array<Record<string, unknown>>

  /* Scenario details */
  const bestDetail = safeObj(scenario.bestCaseDetail)
  const baseDetail = safeObj(scenario.baseCaseDetail)
  const worstDetail = safeObj(scenario.worstCaseDetail)

  /* Top-level metrics */
  const totalScenarios = safeNum(scenario.totalScenarios, 27)
  const passingScenarios = safeNum(scenario.passingScenarios, 0)
  const passRate = safeNum(scenario.passRate)
  const probabilityWeightedIRR = safeNum(scenario.probabilityWeightedIRR)
  const medianIRR = safeNum(scenario.medianIRR)
  const dscrRange = safeObj(scenario.dscrRange)
  const dscrMin = safeNum(dscrRange.min)
  const dscrMax = safeNum(dscrRange.max)
  const scenariosBelowDSCR1 = safeNum(scenario.scenariosBelowDSCR1)
  const scenariosBelowDSCR1Note = safeStr(scenario.scenariosBelowDSCR1Note, '')

  /* IRR range values */
  const worstIRR = safeNum(scenario.worstIRR)
  const baseIRR = safeNum(scenario.baseIRR)
  const bestIRR = safeNum(scenario.bestIRR)

  /* Most sensitive variable */
  const mostSensitiveVariable = safeStr(scenario.mostSensitiveVariable, 'N/A')
  const irrSpread = safeNum(scenario.irrSpread)

  /* Stress test note */
  const stressTestNote = safeStr(scenario.stressTestNote, '')

  /* Helper to position a marker on the IRR track. Range: -5% to 40% mapped to 0-100%. */
  function irrPosition(irr: number): number {
    return Math.max(0, Math.min(100, ((irr + 0.05) / 0.45) * 100))
  }

  return (
    <section className="space-y-5">
      <SectionHeading>Sensitivity Analysis</SectionHeading>

      {/* ---- Variable Matrix Table ---- */}
      <div className="card">
        <h4 className="text-sm font-semibold text-white mb-3">Variable Matrix</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cre-border text-xs text-gray-500 uppercase">
                <th className="py-2 text-left font-medium">Variable</th>
                <th className="py-2 text-center font-medium">Downside</th>
                <th className="py-2 text-center font-medium">Base</th>
                <th className="py-2 text-center font-medium">Upside</th>
              </tr>
            </thead>
            <tbody>
              {variables.length > 0 ? (
                variables.map((v, i) => (
                  <tr key={i} className="border-b border-cre-border/30 last:border-b-0">
                    <td className="py-2.5 text-gray-300 font-medium">
                      {safeStr(v.name, `Variable ${i + 1}`)}
                    </td>
                    <td className="py-2.5 text-center font-mono tabular-nums text-cre-danger">
                      {safeStr(v.downside, '--')}
                    </td>
                    <td className="py-2.5 text-center font-mono tabular-nums text-white">
                      {safeStr(v.base, '--')}
                    </td>
                    <td className="py-2.5 text-center font-mono tabular-nums text-cre-success">
                      {safeStr(v.upside, '--')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">
                    No variable data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Results Summary Cards ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Best Case */}
        <div className="card border-l-4 border-l-cre-success">
          <h4 className="text-xs font-semibold text-cre-success uppercase tracking-wider mb-3">
            Best Case
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">IRR</span>
              <span className="text-sm font-mono tabular-nums text-cre-success font-bold">
                {bestDetail.irr != null ? fmtPct(safeNum(bestDetail.irr)) : '--'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Equity Multiple</span>
              <span className="text-sm font-mono tabular-nums text-cre-success">
                {bestDetail.em != null ? fmtX(safeNum(bestDetail.em)) : '--'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">DSCR</span>
              <span className="text-sm font-mono tabular-nums text-cre-success">
                {bestDetail.dscr != null ? fmtX(safeNum(bestDetail.dscr)) : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Base Case */}
        <div className="card border-l-4 border-l-cre-accent">
          <h4 className="text-xs font-semibold text-cre-accent uppercase tracking-wider mb-3">
            Base Case
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">IRR</span>
              <span className="text-sm font-mono tabular-nums text-cre-accent font-bold">
                {baseDetail.irr != null ? fmtPct(safeNum(baseDetail.irr)) : '--'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Equity Multiple</span>
              <span className="text-sm font-mono tabular-nums text-cre-accent">
                {baseDetail.em != null ? fmtX(safeNum(baseDetail.em)) : '--'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">DSCR</span>
              <span className="text-sm font-mono tabular-nums text-cre-accent">
                {baseDetail.dscr != null ? fmtX(safeNum(baseDetail.dscr)) : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Worst Case */}
        <div className="card border-l-4 border-l-cre-danger">
          <h4 className="text-xs font-semibold text-cre-danger uppercase tracking-wider mb-3">
            Worst Case
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">IRR</span>
              <span className="text-sm font-mono tabular-nums text-cre-danger font-bold">
                {worstDetail.irr != null ? fmtPct(safeNum(worstDetail.irr)) : scenario.worstIRR != null ? fmtPct(worstIRR) : '--'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Equity Multiple</span>
              <span className="text-sm font-mono tabular-nums text-cre-danger">
                {worstDetail.em != null ? fmtX(safeNum(worstDetail.em)) : '--'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">DSCR</span>
              <span className="text-sm font-mono tabular-nums text-cre-danger">
                {worstDetail.dscr != null ? fmtX(safeNum(worstDetail.dscr)) : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ---- IRR Range Visualization ---- */}
      <div className="card">
        <h4 className="text-sm font-semibold text-white mb-4">IRR Range</h4>
        <div className="relative h-16 flex items-center px-2">
          {/* Track background */}
          <div className="absolute inset-x-2 h-2 bg-cre-border rounded-full" />

          {/* Range fill between worst and best */}
          {scenario.bestIRR != null && (
            <div
              className="absolute h-2 bg-cre-accent/40 rounded-full"
              style={{
                left: `calc(${irrPosition(worstIRR)}% + 8px - ${irrPosition(worstIRR) * 0.16}px)`,
                width: `calc(${irrPosition(bestIRR) - irrPosition(worstIRR)}%)`,
              }}
            />
          )}

          {/* Worst marker */}
          <div
            className="absolute flex flex-col items-center"
            style={{ left: `${irrPosition(worstIRR)}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-4 h-4 rounded-full bg-cre-danger border-2 border-cre-surface shadow-lg" />
            <span className="text-xs font-mono tabular-nums text-cre-danger mt-2 whitespace-nowrap">
              {fmtPct(worstIRR)}
            </span>
          </div>

          {/* Base marker */}
          <div
            className="absolute flex flex-col items-center z-10"
            style={{ left: `${irrPosition(baseIRR)}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-6 h-6 rounded-full bg-cre-accent border-2 border-cre-surface shadow-lg" />
            <span className="text-xs font-mono tabular-nums text-cre-accent font-bold mt-2 whitespace-nowrap">
              {fmtPct(baseIRR)}
            </span>
          </div>

          {/* Best marker */}
          <div
            className="absolute flex flex-col items-center"
            style={{ left: `${irrPosition(bestIRR)}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-4 h-4 rounded-full bg-cre-success border-2 border-cre-surface shadow-lg" />
            <span className="text-xs font-mono tabular-nums text-cre-success mt-2 whitespace-nowrap">
              {fmtPct(bestIRR)}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center mt-6 text-xs text-gray-500 px-2">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-cre-danger" />
            Worst
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-cre-accent" />
            Base
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-cre-success" />
            Best
          </span>
        </div>
      </div>

      {/* ---- Key Stats Row ---- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Scenarios Tested"
          value={String(totalScenarios)}
        />
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div className="text-lg font-bold font-mono tabular-nums text-white">
            {passingScenarios}/{totalScenarios}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Pass Rate ({scenario.passRate != null ? fmtPct(passRate) : '--'})
          </div>
          <div className="progress-bar h-1.5 mt-2">
            <div
              className={`progress-fill ${
                passRate >= 0.7
                  ? 'bg-cre-success'
                  : passRate >= 0.5
                    ? 'bg-cre-warning'
                    : 'bg-cre-danger'
              }`}
              style={{ width: `${(passRate || 0) * 100}%` }}
            />
          </div>
        </div>
        <StatCard
          label="Prob-Weighted IRR"
          value={scenario.probabilityWeightedIRR != null ? fmtPct(probabilityWeightedIRR) : '--'}
          color="text-cre-accent"
        />
        <StatCard
          label="Median IRR"
          value={scenario.medianIRR != null ? fmtPct(medianIRR) : '--'}
        />
        <StatCard
          label="DSCR Range"
          value={dscrRange.min != null && dscrRange.max != null ? `${fmtX(dscrMin)} - ${fmtX(dscrMax)}` : '--'}
        />
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div
            className={`text-lg font-bold font-mono tabular-nums ${
              scenariosBelowDSCR1 > 0 ? 'text-cre-warning' : 'text-cre-success'
            }`}
          >
            {scenariosBelowDSCR1}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Below DSCR 1.0x</div>
          {scenariosBelowDSCR1Note && (
            <div className="text-[10px] text-gray-600 mt-1 leading-tight">
              {scenariosBelowDSCR1Note}
            </div>
          )}
        </div>
      </div>

      {/* ---- Most Sensitive Variable Callout ---- */}
      <div className="card border-l-4 border-l-cre-warning bg-cre-warning/5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full bg-cre-warning/20 flex items-center justify-center">
            <span className="text-cre-warning text-sm font-bold">!</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Most Sensitive Variable</h4>
            <p className="text-sm text-gray-300 mt-1">
              <span className="text-cre-warning font-semibold">{mostSensitiveVariable}</span>
              {irrSpread > 0 && (
                <span className="text-gray-400">
                  {' '}
                  &mdash; IRR spread of{' '}
                  <span className="font-mono tabular-nums text-white">
                    {(irrSpread * 100).toFixed(1)} percentage points
                  </span>
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ---- Stress Test Note ---- */}
      {stressTestNote && (
        <div className="card bg-black/20 border-cre-border/50">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Stress Test Note
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed">{stressTestNote}</p>
        </div>
      )}
    </section>
  )
}
