import type { DealCheckpoint } from '../../types/checkpoint'
import {
  fmtPct,
  fmt$,
  safeNum,
  safeStr,
  safeObj,
  SectionHeading,
  StatCard,
} from './ReportHelpers'
import EmptyPhaseState from './EmptyPhaseState'

interface MarketAnalysisProps {
  dealCheckpoint: DealCheckpoint
}

/* ------------------------------------------------------------------ */
/*  Info Card - narrative section with header                           */
/* ------------------------------------------------------------------ */

function InfoCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="card">
      <h4 className="text-sm font-semibold text-cre-accent mb-2 uppercase tracking-wider">
        {title}
      </h4>
      <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
    </div>
  )
}

export default function MarketAnalysis({ dealCheckpoint }: MarketAnalysisProps) {
  const { phases } = dealCheckpoint

  /* Guard: need DD data */
  if (!phases?.due_diligence?.dataForDownstream) {
    return (
      <EmptyPhaseState
        sectionTitle="Market Analysis"
        phaseName="Due Diligence"
      />
    )
  }

  /* ---------------------------------------------------------------- */
  /*  Safe data extraction                                             */
  /* ---------------------------------------------------------------- */
  const dd = safeObj(phases?.due_diligence?.dataForDownstream)
  const mkt = safeObj(dd.marketDetail)
  const uwDownstream = safeObj(phases?.underwriting?.dataForDownstream as Record<string, unknown>)
  const uwBaseCase = safeObj(uwDownstream.baseCase)

  /* Top-level DD market fields (fallback from marketDetail) */
  const msaPopulation = safeNum(mkt.msaPopulation, safeNum(dd.msaPopulation))
  const populationGrowth = safeNum(mkt.populationGrowth, safeNum(dd.populationGrowth))
  const popGrowthRank = safeStr(mkt.populationGrowthRank, safeStr(dd.populationGrowthRank, ''))
  const jobGrowth = safeNum(mkt.jobGrowth, safeNum(dd.jobGrowth))
  const unemployment = safeNum(mkt.unemployment, safeNum(dd.unemployment))
  const marketVacancy = safeNum(mkt.marketVacancy, safeNum(dd.marketVacancy))
  const subjectVacancy = safeNum(dd.occupancy) > 0 ? 1 - safeNum(dd.occupancy) : 0

  /* Pricing comparisons */
  const subjectPPU = safeNum(dd.pricePerUnit)
  const marketPPU = safeNum(dd.marketPPU, safeNum(mkt.marketPPU))
  const discountPct =
    marketPPU > 0 && subjectPPU > 0
      ? ((marketPPU - subjectPPU) / marketPPU) * 100
      : 0
  const subjectCap = safeNum(dd.goingInCapRate, safeNum(uwBaseCase.goingInCapRate))
  const marketCapRange = safeStr(mkt.marketCapRateRange, safeStr(dd.marketCapRateRange, '--'))

  /* Narrative fields */
  const supplyDelivered2025 = safeNum(mkt.supplyDelivered2025, safeNum(dd.supplyDelivered2025))
  const supplyForecast2026 = safeStr(mkt.supplyForecast2026, safeStr(dd.supplyForecast2026, ''))
  const absorptionNote = safeStr(mkt.absorptionNote, safeStr(dd.absorptionNote, ''))
  const supplyPipeline = safeStr(dd.supplyPipeline, '')

  const cycleDescription = safeStr(mkt.marketCycle, safeStr(dd.marketCycle, ''))
  const concessionRate = safeNum(mkt.concessionRate, safeNum(dd.concessionRate))
  const concessionNote = safeStr(mkt.concessionNote, safeStr(dd.concessionNote, ''))

  const rentGrowthTrailing = safeNum(mkt.rentGrowthTrailing, safeNum(dd.rentGrowthTrailing))
  const rentGrowthForecast2026 = safeStr(mkt.rentGrowthForecast2026, safeStr(dd.rentGrowthForecast2026, ''))
  const rentGrowthLongTerm = safeNum(mkt.rentGrowthLongTerm, safeNum(dd.rentGrowthLongTerm))
  const rentGrowthForecast = safeNum(dd.rentGrowthForecast)

  const jurisdiction = safeStr(dd.jurisdiction, '')
  const jurisdictionNote = safeStr(mkt.sb38Note, safeStr(dd.sb38Note, ''))

  /* Color for subject vacancy vs market */
  const subjectBelowMarket = marketVacancy > 0 && subjectVacancy < marketVacancy
  const subjectVacancyColor = subjectBelowMarket ? 'text-cre-success' : 'text-cre-warning'

  /* Format population */
  function fmtPop(n: number): string {
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
    if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`
    return n.toLocaleString('en-US')
  }

  return (
    <section>
      <SectionHeading>Market Analysis</SectionHeading>

      {/* -------------------------------------------------------------- */}
      {/*  Market Stats Grid (6-col)                                      */}
      {/* -------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <StatCard
          label="MSA Population"
          value={mkt.msaPopulation != null || dd.msaPopulation != null ? fmtPop(msaPopulation) : '--'}
        />
        <StatCard
          label="Population Growth"
          value={mkt.populationGrowth != null || dd.populationGrowth != null ? `${fmtPct(populationGrowth)}/yr` : '--'}
          color="text-cre-success"
        />
        <StatCard
          label="Job Growth"
          value={mkt.jobGrowth != null || dd.jobGrowth != null ? `${fmtPct(jobGrowth)} YoY` : '--'}
          color="text-cre-success"
        />
        <StatCard
          label="Unemployment"
          value={mkt.unemployment != null || dd.unemployment != null ? fmtPct(unemployment) : '--'}
        />
        <StatCard
          label="Market Vacancy"
          value={mkt.marketVacancy != null || dd.marketVacancy != null ? fmtPct(marketVacancy) : '--'}
        />
        <StatCard
          label="Subject Vacancy"
          value={dd.occupancy != null ? fmtPct(subjectVacancy) : '--'}
          color={subjectVacancyColor}
        />
      </div>

      {popGrowthRank && (
        <p className="text-xs text-gray-500 mb-4 -mt-2 text-center">
          {popGrowthRank}
        </p>
      )}

      {/* -------------------------------------------------------------- */}
      {/*  Pricing Comparison (side-by-side cards)                        */}
      {/* -------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* PPU Comparison */}
        <div className="card">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Price Per Unit Comparison
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold font-mono tabular-nums text-cre-accent">
                {dd.pricePerUnit != null ? fmt$(subjectPPU) : '--'}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Subject PPU</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold font-mono tabular-nums text-white">
                {mkt.marketPPU != null || dd.marketPPU != null ? fmt$(marketPPU) : '--'}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Market PPU</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold font-mono tabular-nums ${discountPct > 0 ? 'text-cre-success' : 'text-gray-400'}`}>
                {discountPct > 0 ? `${discountPct.toFixed(0)}%` : '--'}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Discount</div>
            </div>
          </div>
        </div>

        {/* Cap Rate Comparison */}
        <div className="card">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Cap Rate Comparison
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold font-mono tabular-nums text-cre-accent">
                {subjectCap ? fmtPct(subjectCap) : '--'}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Subject Cap</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold font-mono tabular-nums text-white">
                {marketCapRange}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Market Cap</div>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/*  Narrative Info Cards                                           */}
      {/* -------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Supply Pipeline */}
        <InfoCard title="Supply Pipeline">
          {supplyDelivered2025 > 0 && (
            <p className="mb-1">
              <span className="text-gray-500">Delivered 2025: </span>
              {supplyDelivered2025.toLocaleString('en-US')} units
            </p>
          )}
          {supplyForecast2026 && (
            <p className="mb-1">
              <span className="text-gray-500">Forecast 2026: </span>
              {supplyForecast2026}
            </p>
          )}
          {absorptionNote && (
            <p className="mb-1">
              <span className="text-gray-500">Absorption: </span>
              {absorptionNote}
            </p>
          )}
          {supplyPipeline && !supplyDelivered2025 && !supplyForecast2026 && (
            <p>{supplyPipeline}</p>
          )}
          {!supplyPipeline && !supplyDelivered2025 && !supplyForecast2026 && (
            <p className="text-gray-500">No supply pipeline data available.</p>
          )}
        </InfoCard>

        {/* Market Cycle */}
        <InfoCard title="Market Cycle">
          {cycleDescription && <p className="mb-1">{cycleDescription}</p>}
          {concessionRate > 0 && (
            <p className="mb-1">
              <span className="text-gray-500">Concession Rate: </span>
              {fmtPct(concessionRate)}
            </p>
          )}
          {concessionNote && (
            <p className="text-gray-500 text-xs mt-1">{concessionNote}</p>
          )}
          {!cycleDescription && !concessionRate && (
            <p className="text-gray-500">No market cycle data available.</p>
          )}
        </InfoCard>

        {/* Rent Growth */}
        <InfoCard title="Rent Growth">
          {rentGrowthTrailing !== 0 && (
            <p className="mb-1">
              <span className="text-gray-500">Trailing: </span>
              {fmtPct(rentGrowthTrailing)}/yr
            </p>
          )}
          {rentGrowthForecast2026 && (
            <p className="mb-1">
              <span className="text-gray-500">2026 Forecast: </span>
              {rentGrowthForecast2026}
            </p>
          )}
          {rentGrowthLongTerm !== 0 && (
            <p className="mb-1">
              <span className="text-gray-500">Long-Term: </span>
              {fmtPct(rentGrowthLongTerm)}/yr
            </p>
          )}
          {!rentGrowthTrailing && !rentGrowthForecast2026 && rentGrowthForecast > 0 && (
            <p>
              <span className="text-gray-500">Forecast: </span>
              {fmtPct(rentGrowthForecast)}/yr
            </p>
          )}
          {!rentGrowthTrailing && !rentGrowthForecast2026 && !rentGrowthForecast && (
            <p className="text-gray-500">No rent growth data available.</p>
          )}
        </InfoCard>

        {/* Jurisdiction */}
        <InfoCard title="Jurisdiction">
          {jurisdiction && (
            <p className="mb-1">
              <span
                className={`status-badge mr-2 ${
                  jurisdiction.toLowerCase().includes('landlord')
                    ? 'bg-cre-success/20 text-cre-success'
                    : 'bg-cre-warning/20 text-cre-warning'
                }`}
              >
                {jurisdiction.toUpperCase()}
              </span>
            </p>
          )}
          {jurisdictionNote && (
            <p className="mt-1">{jurisdictionNote}</p>
          )}
          {!jurisdiction && !jurisdictionNote && (
            <p className="text-gray-500">No jurisdiction data available.</p>
          )}
        </InfoCard>
      </div>
    </section>
  )
}
