import type { DealCheckpoint } from '../../types/checkpoint'
import {
  fmtFull$,
  fmtPct,
  safeNum,
  safeStr,
  safeArr,
  safeObj,
  SectionHeading,
} from './ReportHelpers'
import EmptyPhaseState from './EmptyPhaseState'

interface ProFormaProps {
  dealCheckpoint: DealCheckpoint
}

/* ------------------------------------------------------------------ */
/*  Row-level line items for the pro forma table                       */
/* ------------------------------------------------------------------ */

const PRO_FORMA_LINES: Array<{
  key: string
  label: string
  bold?: boolean
  colored?: boolean
  negative?: boolean
}> = [
  { key: 'grossPotentialRent', label: 'Gross Potential Rent' },
  { key: 'vacancyLoss', label: 'Vacancy Loss', negative: true },
  { key: 'lossToLease', label: 'Loss-to-Lease', negative: true },
  { key: 'creditLoss', label: 'Credit Loss', negative: true },
  { key: 'otherIncome', label: 'Other Income' },
  { key: 'effectiveGrossIncome', label: 'Effective Gross Income', bold: true },
  { key: 'totalOperatingExpenses', label: 'Total Operating Expenses', negative: true },
  { key: 'netOperatingIncome', label: 'Net Operating Income', bold: true, colored: true },
  { key: 'debtService', label: 'Debt Service', negative: true },
  { key: 'cashFlowAfterDS', label: 'Cash Flow After DS', bold: true, colored: true },
]

export default function ProForma({ dealCheckpoint }: ProFormaProps) {
  const { phases } = dealCheckpoint

  /* Guard: need UW data */
  if (!phases?.underwriting?.dataForDownstream) {
    return (
      <EmptyPhaseState
        sectionTitle="5-Year Pro Forma"
        phaseName="Underwriting"
      />
    )
  }

  /* ---------------------------------------------------------------- */
  /*  Safe data extraction                                             */
  /* ---------------------------------------------------------------- */
  const uw = safeObj(phases?.underwriting?.dataForDownstream)
  const dd = safeObj(phases?.due_diligence?.dataForDownstream)

  const proForma = safeArr(uw.proForma).map((item) => safeObj(item))
  const proFormaAssumptions = safeStr(uw.proFormaAssumptions, '')

  const opexBreakdown = safeArr(dd.opexBreakdown).map((item) => safeObj(item))
  const opexBenchmark = safeStr(dd.opexBenchmark, '')

  const returnMetrics = safeArr(uw.returnMetrics).map((item) => safeObj(item))
  const exitAnalysis = safeObj(uw.exitAnalysis)

  /* ---------------------------------------------------------------- */
  /*  Format helpers for pro forma                                     */
  /* ---------------------------------------------------------------- */

  /* Determine IO vs Amort note for debt service */
  function debtServiceNote(yearObj: Record<string, unknown>): string {
    const note = safeStr(yearObj.debtServiceNote, '')
    if (note) return ` (${note})`
    return ''
  }

  return (
    <section className="space-y-6">
      {/* ============================================================ */}
      {/*  1. FIVE-YEAR PRO FORMA TABLE                                */}
      {/* ============================================================ */}
      <div>
        <SectionHeading>5-Year Pro Forma</SectionHeading>

        {proForma.length === 0 ? (
          <div className="card">
            <p className="text-sm text-gray-500">No pro forma data available.</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cre-border text-xs text-gray-500 uppercase">
                  <th className="py-2 text-left font-medium px-2 min-w-[180px]">
                    Line Item
                  </th>
                  {proForma.map((_, idx) => (
                    <th
                      key={idx}
                      className="py-2 text-right font-medium px-2 min-w-[120px]"
                    >
                      Year {idx + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRO_FORMA_LINES.map((line) => {
                  const hasData = proForma.some(
                    (yr) => yr[line.key] !== undefined && yr[line.key] !== null
                  )
                  if (!hasData) return null

                  return (
                    <tr
                      key={line.key}
                      className={[
                        'border-b border-cre-border/30',
                        line.bold ? 'bg-white/[0.03]' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <td
                        className={`py-2 px-2 text-gray-300 ${
                          line.bold ? 'font-semibold' : ''
                        }`}
                      >
                        {line.label}
                        {line.key === 'debtService' && proForma.length > 0 && (
                          <span className="text-xs text-gray-500 ml-1">
                            {debtServiceNote(proForma[0])}
                          </span>
                        )}
                      </td>
                      {proForma.map((yr, idx) => {
                        const val = safeNum(yr[line.key])
                        const displayNeg = line.negative && val > 0
                        return (
                          <td
                            key={idx}
                            className={[
                              'py-2 px-2 text-right font-mono tabular-nums',
                              line.bold ? 'font-semibold' : '',
                              line.colored
                                ? val >= 0
                                  ? 'text-cre-success'
                                  : 'text-cre-danger'
                                : 'text-white',
                              displayNeg ? 'text-gray-400' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {yr[line.key] !== undefined
                              ? displayNeg
                                ? `(${fmtFull$(val)})`
                                : fmtFull$(val)
                              : '--'}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Assumptions */}
            {proFormaAssumptions && (
              <div className="mt-3 pt-3 border-t border-cre-border/30">
                <p className="text-xs text-gray-500">
                  <span className="uppercase tracking-wider font-semibold">Assumptions: </span>
                  {proFormaAssumptions}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/*  2. OPERATING EXPENSE BREAKDOWN                               */}
      {/* ============================================================ */}
      <div>
        <SectionHeading>Operating Expense Breakdown</SectionHeading>

        {opexBreakdown.length === 0 ? (
          <div className="card">
            <p className="text-sm text-gray-500">No operating expense data available.</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cre-border text-xs text-gray-500 uppercase">
                  <th className="py-2 text-left font-medium px-2">Category</th>
                  <th className="py-2 text-right font-medium px-2">Annual</th>
                  <th className="py-2 text-right font-medium px-2">Per Unit</th>
                  <th className="py-2 text-right font-medium px-2">% of Revenue</th>
                </tr>
              </thead>
              <tbody>
                {opexBreakdown.map((row, idx) => {
                  const isTotal =
                    safeStr(row.category, '').toUpperCase().includes('TOTAL')
                  return (
                    <tr
                      key={idx}
                      className={[
                        'border-b border-cre-border/30',
                        isTotal ? 'bg-white/5 font-semibold border-t border-cre-border' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <td className="py-2 px-2 text-gray-300">
                        {safeStr(row.category)}
                      </td>
                      <td className="py-2 px-2 text-right font-mono tabular-nums text-white">
                        {row.annual != null ? fmtFull$(safeNum(row.annual)) : '--'}
                      </td>
                      <td className="py-2 px-2 text-right font-mono tabular-nums text-white">
                        {row.perUnit != null ? fmtFull$(safeNum(row.perUnit)) : '--'}
                      </td>
                      <td className="py-2 px-2 text-right font-mono tabular-nums text-white">
                        {row.pctRevenue != null ? fmtPct(safeNum(row.pctRevenue)) : '--'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {opexBenchmark && (
              <div className="mt-3 pt-3 border-t border-cre-border/30">
                <p className="text-xs text-gray-500">
                  <span className="uppercase tracking-wider font-semibold">Benchmark: </span>
                  {opexBenchmark}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/*  3. RETURN METRICS TABLE                                      */}
      {/* ============================================================ */}
      <div>
        <SectionHeading>Return Metrics</SectionHeading>

        {returnMetrics.length === 0 ? (
          <div className="card">
            <p className="text-sm text-gray-500">No return metrics data available.</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cre-border text-xs text-gray-500 uppercase">
                  <th className="py-2 text-left font-medium px-2">Metric</th>
                  <th className="py-2 text-right font-medium px-2">Value</th>
                  <th className="py-2 text-right font-medium px-2">Threshold</th>
                  <th className="py-2 text-right font-medium px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {returnMetrics.map((row, idx) => {
                  const pass = safeStr(row.status, '').toUpperCase() === 'PASS' ||
                    row.pass === true
                  return (
                    <tr
                      key={idx}
                      className="border-b border-cre-border/30 last:border-b-0"
                    >
                      <td className="py-2 px-2 text-gray-300">
                        {safeStr(row.metric, safeStr(row.name))}
                      </td>
                      <td className="py-2 px-2 text-right font-mono tabular-nums text-white font-semibold">
                        {safeStr(row.value)}
                      </td>
                      <td className="py-2 px-2 text-right font-mono tabular-nums text-gray-500">
                        {safeStr(row.threshold)}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <span
                          className={`status-badge ${
                            pass
                              ? 'bg-cre-success/20 text-cre-success'
                              : 'bg-cre-danger/20 text-cre-danger'
                          }`}
                        >
                          {pass ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/*  4. EXIT ANALYSIS                                             */}
      {/* ============================================================ */}
      <div>
        <SectionHeading>Exit Analysis</SectionHeading>

        <div className="card">
          {Object.keys(exitAnalysis).length === 0 ? (
            <p className="text-sm text-gray-500">No exit analysis data available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
              <ExitRow
                label="Year 5 NOI"
                value={exitAnalysis.year5NOI != null ? fmtFull$(safeNum(exitAnalysis.year5NOI)) : '--'}
              />
              <ExitRow
                label="Exit Cap Rate"
                value={exitAnalysis.exitCapRate != null ? fmtPct(safeNum(exitAnalysis.exitCapRate)) : '--'}
              />
              <ExitRow
                label="Exit Value"
                value={exitAnalysis.exitValue != null ? fmtFull$(safeNum(exitAnalysis.exitValue)) : '--'}
                highlight
              />
              <ExitRow
                label="Selling Costs (3%)"
                value={exitAnalysis.sellingCosts != null ? `(${fmtFull$(safeNum(exitAnalysis.sellingCosts))})` : '--'}
              />
              <ExitRow
                label="Loan Balance at Exit"
                value={exitAnalysis.loanBalanceAtExit != null ? `(${fmtFull$(safeNum(exitAnalysis.loanBalanceAtExit))})` : '--'}
              />
              <ExitRow
                label="Net Sale Proceeds"
                value={exitAnalysis.netSaleProceeds != null ? fmtFull$(safeNum(exitAnalysis.netSaleProceeds)) : '--'}
                highlight
              />
              <ExitRow
                label="Total Equity Invested"
                value={exitAnalysis.totalEquityInvested != null ? fmtFull$(safeNum(exitAnalysis.totalEquityInvested)) : '--'}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Exit Analysis key-value row                                        */
/* ------------------------------------------------------------------ */

function ExitRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between py-2 border-b border-cre-border/30 last:border-b-0">
      <span className={`text-sm ${highlight ? 'text-gray-200 font-semibold' : 'text-gray-400'}`}>
        {label}
      </span>
      <span
        className={`text-sm font-mono tabular-nums ${
          highlight ? 'text-cre-accent font-bold' : 'text-white'
        }`}
      >
        {value}
      </span>
    </div>
  )
}
