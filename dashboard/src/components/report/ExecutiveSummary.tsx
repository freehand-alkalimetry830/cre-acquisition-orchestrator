import type { DealCheckpoint } from '../../types/checkpoint'
import {
  fmt$,
  fmtPct,
  fmtX,
  safeNum,
  safeStr,
  safeBool,
  safeObj,
  MetricCard,
  SectionHeading,
} from './ReportHelpers'
import EmptyPhaseState from './EmptyPhaseState'

interface ExecutiveSummaryProps {
  dealCheckpoint: DealCheckpoint
}

export default function ExecutiveSummary({ dealCheckpoint }: ExecutiveSummaryProps) {
  const { dealName, property, phases } = dealCheckpoint

  /* Guard: need at least DD or UW data */
  if (!phases?.due_diligence?.dataForDownstream && !phases?.underwriting?.dataForDownstream) {
    return (
      <EmptyPhaseState
        sectionTitle="Executive Summary"
        phaseName="Due Diligence and Underwriting"
      />
    )
  }

  /* ---------------------------------------------------------------- */
  /*  Safe data extraction                                             */
  /* ---------------------------------------------------------------- */
  const dd = safeObj(phases?.due_diligence?.dataForDownstream)
  const uw = safeObj(phases?.underwriting?.dataForDownstream)
  const baseCase = safeObj(uw.baseCase)

  /* ---------------------------------------------------------------- */
  /*  Key metrics                                                      */
  /* ---------------------------------------------------------------- */
  const purchasePrice = safeNum(baseCase.purchasePrice, safeNum(property?.askingPrice))
  const totalBasis = safeNum(baseCase.totalBasis, purchasePrice)
  const totalUnits = safeNum(property?.totalUnits)
  const pricePerUnit = safeNum(
    dd.pricePerUnit,
    totalUnits > 0 ? purchasePrice / totalUnits : 0
  )
  const goingInCapRate = safeNum(baseCase.goingInCapRate)
  const stabilizedCapRate = safeNum(baseCase.stabilizedCapRate)
  const year1NOI = safeNum(baseCase.year1NOI)
  const stabilizedNOI = safeNum(baseCase.stabilizedNOI)
  const leveragedIRR = safeNum(baseCase.leveragedIRR)
  const equityMultiple = safeNum(baseCase.equityMultiple)
  const cashOnCash = safeNum(baseCase.cashOnCash)
  const equityRequired = safeNum(baseCase.equityRequired)
  const occupancy = safeNum(dd.occupancy)
  const lossToLeasePct = safeNum(dd.lossToLeasePct)
  const yearBuilt = safeNum(dd.yearBuilt)

  /* ---------------------------------------------------------------- */
  /*  Investment thesis data                                           */
  /* ---------------------------------------------------------------- */
  const lossToLease = safeNum(dd.lossToLease)
  const marketPPU = safeNum(dd.marketPPU)
  const discountPct =
    marketPPU > 0 && pricePerUnit > 0
      ? ((marketPPU - pricePerUnit) / marketPPU) * 100
      : 0
  const populationGrowth = safeNum(dd.populationGrowth)
  const supplyPipeline = safeStr(dd.supplyPipeline, 'moderate')
  const jurisdiction = safeStr(dd.jurisdiction, 'standard')
  const rentControl = safeBool(dd.rentControl)
  const renovationBudget = safeNum(dd.renovationBudget)
  const renovationPerUnit = safeNum(dd.renovationPerUnit)

  return (
    <section>
      <SectionHeading>Executive Summary</SectionHeading>

      {/* -------------------------------------------------------------- */}
      {/*  Metric cards grid (11 cards, 4 columns)                        */}
      {/* -------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Purchase Price"
          value={baseCase.purchasePrice != null || property?.askingPrice != null ? fmt$(purchasePrice) : '--'}
          accent
        />
        <MetricCard
          label="Total Basis"
          value={baseCase.totalBasis != null || baseCase.purchasePrice != null ? fmt$(totalBasis) : '--'}
        />
        <MetricCard
          label="Price / Unit"
          value={dd.pricePerUnit != null || (totalUnits > 0 && purchasePrice > 0) ? fmt$(pricePerUnit) : '--'}
          sub={property?.totalUnits != null ? `${totalUnits} units` : undefined}
        />
        <MetricCard
          label="Going-In Cap"
          value={baseCase.goingInCapRate != null ? fmtPct(goingInCapRate) : '--'}
        />
        <MetricCard
          label="Stabilized Cap"
          value={baseCase.stabilizedCapRate != null ? fmtPct(stabilizedCapRate) : '--'}
        />
        <MetricCard
          label="Year 1 NOI"
          value={baseCase.year1NOI != null ? fmt$(year1NOI) : '--'}
        />
        <MetricCard
          label="Stabilized NOI"
          value={baseCase.stabilizedNOI != null ? fmt$(stabilizedNOI) : '--'}
        />
        <MetricCard
          label="Levered IRR"
          value={baseCase.leveragedIRR != null ? fmtPct(leveragedIRR) : '--'}
          accent
        />
        <MetricCard
          label="Equity Multiple"
          value={baseCase.equityMultiple != null ? fmtX(equityMultiple) : '--'}
          accent
        />
        <MetricCard
          label="Cash-on-Cash"
          value={baseCase.cashOnCash != null ? fmtPct(cashOnCash) : '--'}
        />
        <MetricCard
          label="Equity Required"
          value={baseCase.equityRequired != null ? fmt$(equityRequired) : '--'}
          accent
        />
      </div>

      {/* Additional context row */}
      <div className="grid grid-cols-3 gap-3 mt-3">
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div className="text-lg font-bold font-mono tabular-nums text-white">
            {dd.occupancy != null ? fmtPct(occupancy) : '--'}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Occupancy</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div className="text-lg font-bold font-mono tabular-nums text-cre-success">
            {dd.lossToLeasePct != null ? fmtPct(lossToLeasePct) : '--'}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Loss-to-Lease</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <div className="text-lg font-bold font-mono tabular-nums text-white">
            {dd.yearBuilt != null ? yearBuilt : '--'}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Year Built</div>
        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/*  Investment thesis paragraph                                    */}
      {/* -------------------------------------------------------------- */}
      <div className="card mt-4">
        <h4 className="text-sm font-semibold text-white mb-2">Investment Thesis</h4>
        <p className="text-sm text-gray-300 leading-relaxed">
          {dealName || 'This property'} represents a compelling value-add acquisition of a{' '}
          {property?.totalUnits != null ? totalUnits : '--'}-unit Class B multifamily asset in the{' '}
          {safeStr(property?.city, '--')} growth market. The property is currently{' '}
          {dd.occupancy != null ? `${(occupancy * 100).toFixed(0)}%` : '--'} occupied with significant
          loss-to-lease of {dd.lossToLease != null ? fmt$(lossToLease) : dd.lossToLeasePct != null ? fmtPct(lossToLeasePct) : '--'} annually,
          indicating in-place rents substantially below market. At{' '}
          {dd.pricePerUnit != null || (totalUnits > 0 && purchasePrice > 0) ? fmt$(pricePerUnit) : '--'}/unit, the basis is well below the market
          comparable of {dd.marketPPU != null ? fmt$(marketPPU) : '--'}/unit, providing a{' '}
          {discountPct > 0 ? `${discountPct.toFixed(0)}%` : '--'} discount to replacement cost.
          The submarket benefits from{' '}
          {dd.populationGrowth != null ? fmtPct(populationGrowth) : '--'} annual population growth, a{' '}
          {supplyPipeline.toLowerCase()} supply pipeline, and{' '}
          {jurisdiction.toLowerCase()} regulatory environment
          {rentControl
            ? ' (note: rent control applies)'
            : ' with no rent control'}
          . The renovation program of{' '}
          {dd.renovationBudget != null ? fmt$(renovationBudget) : '--'} (
          {dd.renovationPerUnit != null ? fmt$(renovationPerUnit) : '--'}/unit) is expected to drive
          rents to market levels and stabilize NOI at{' '}
          {baseCase.stabilizedNOI != null ? fmt$(stabilizedNOI) : '--'}, generating a projected levered IRR of{' '}
          {baseCase.leveragedIRR != null ? fmtPct(leveragedIRR) : '--'} and{' '}
          {baseCase.equityMultiple != null ? fmtX(equityMultiple) : '--'} equity multiple over the five-year
          hold.
        </p>
      </div>
    </section>
  )
}
