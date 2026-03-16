import type { DealCheckpoint } from '../../types/checkpoint'
import {
  fmtPct,
  safeNum,
  safeStr,
  safeBool,
  safeArr,
  safeObj,
  SectionHeading,
} from './ReportHelpers'
import EmptyPhaseState from './EmptyPhaseState'

interface PropertyOverviewProps {
  dealCheckpoint: DealCheckpoint
}

/* ------------------------------------------------------------------ */
/*  Detail Row helper                                                  */
/* ------------------------------------------------------------------ */

function DetailRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex justify-between py-2 border-b border-cre-border/30 last:border-b-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-white font-medium text-right">{children}</span>
    </div>
  )
}

export default function PropertyOverview({ dealCheckpoint }: PropertyOverviewProps) {
  const { property, phases } = dealCheckpoint

  /* Guard: need DD data */
  if (!phases?.due_diligence?.dataForDownstream) {
    return (
      <EmptyPhaseState
        sectionTitle="Property Overview"
        phaseName="Due Diligence"
      />
    )
  }

  /* ---------------------------------------------------------------- */
  /*  Safe data extraction                                             */
  /* ---------------------------------------------------------------- */
  const dd = safeObj(phases?.due_diligence?.dataForDownstream)

  const totalUnits = safeNum(property?.totalUnits)
  const yearBuilt = safeNum(dd.yearBuilt)
  const currentYear = new Date().getFullYear()
  const age = yearBuilt > 0 ? currentYear - yearBuilt : 0

  const occupancy = safeNum(dd.occupancy)
  const occupiedUnits = totalUnits > 0 && occupancy > 0
    ? Math.round(totalUnits * occupancy)
    : 0
  const vacantUnits = totalUnits - occupiedUnits

  const zoningCompliant = safeBool(dd.zoningCompliant)
  const zoning = safeStr(dd.zoning, '--')

  /* Address construction */
  const address = safeStr(property?.address, '')
  const city = safeStr(property?.city, '')
  const state = safeStr(property?.state, '')
  const zip = property?.zip || ''
  const fullAddress = [address, city, state].filter((p) => p && p !== '--').join(', ') + (zip ? ` ${zip}` : '')

  /* ---------------------------------------------------------------- */
  /*  Unit Mix data                                                    */
  /* ---------------------------------------------------------------- */
  const unitMix = safeArr(dd.unitMix).map((item) => safeObj(item))
  const avgInPlaceRent = safeNum(dd.avgInPlaceRent)
  const avgMarketRent = safeNum(dd.avgMarketRent)
  const lossToLeasePct = safeNum(dd.lossToLeasePct)

  /* Color utility for L2L column */
  function l2lColor(val: number): string {
    if (val >= 0.15) return 'text-cre-success'
    if (val >= 0.08) return 'text-cre-success/80'
    if (val >= 0.03) return 'text-cre-warning'
    return 'text-gray-400'
  }

  return (
    <section>
      <SectionHeading>Property Overview</SectionHeading>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ---------------------------------------------------------- */}
        {/*  Property Details (2-col key-value)                         */}
        {/* ---------------------------------------------------------- */}
        <div className="card">
          <h4 className="text-sm font-semibold text-white mb-3">Property Details</h4>

          <DetailRow label="Property Name">
            {safeStr(dd.propertyName, dealCheckpoint.dealName || '--')}
          </DetailRow>
          <DetailRow label="Address">
            {fullAddress || 'N/A'}
          </DetailRow>
          <DetailRow label="Total Units">
            <span className="font-mono tabular-nums">{property?.totalUnits != null ? totalUnits : '--'}</span>
          </DetailRow>
          <DetailRow label="Year Built">
            <span className="font-mono tabular-nums">
              {dd.yearBuilt != null ? yearBuilt : '--'}
              {age > 0 && (
                <span className="text-gray-500 text-xs ml-1">({age} yrs)</span>
              )}
            </span>
          </DetailRow>
          <DetailRow label="Construction">
            {safeStr(dd.construction)}
          </DetailRow>
          <DetailRow label="Current Owner">
            {safeStr(dd.currentOwner)}
          </DetailRow>
          <DetailRow label="Occupancy">
            <span className="font-mono tabular-nums">
              {dd.occupancy != null ? fmtPct(occupancy) : '--'}
              {occupiedUnits > 0 && (
                <span className="text-gray-500 text-xs ml-1">
                  ({occupiedUnits} occ / {vacantUnits} vac)
                </span>
              )}
            </span>
          </DetailRow>
          <DetailRow label="Zoning">
            {zoning}
            {zoning !== '--' && (
              <span
                className={`status-badge ml-2 ${
                  zoningCompliant
                    ? 'bg-cre-success/20 text-cre-success'
                    : 'bg-cre-warning/20 text-cre-warning'
                }`}
              >
                {zoningCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
              </span>
            )}
          </DetailRow>
        </div>

        {/* ---------------------------------------------------------- */}
        {/*  Unit Mix Table                                              */}
        {/* ---------------------------------------------------------- */}
        <div className="card">
          <h4 className="text-sm font-semibold text-white mb-3">Unit Mix</h4>

          {unitMix.length === 0 ? (
            <p className="text-sm text-gray-500">No unit mix data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cre-border text-xs text-gray-500 uppercase">
                    <th className="py-2 text-left font-medium px-2">Type</th>
                    <th className="py-2 text-right font-medium px-2">Units</th>
                    <th className="py-2 text-right font-medium px-2">In-Place Rent</th>
                    <th className="py-2 text-right font-medium px-2">Market Rent</th>
                    <th className="py-2 text-right font-medium px-2">L2L</th>
                  </tr>
                </thead>
                <tbody>
                  {unitMix.map((row, idx) => {
                    const l2l = safeNum(row.lossToLease)
                    return (
                      <tr
                        key={idx}
                        className="border-b border-cre-border/30"
                      >
                        <td className="py-2 px-2 text-gray-300">
                          {safeStr(row.type)}
                        </td>
                        <td className="py-2 px-2 text-right font-mono tabular-nums text-white">
                          {row.units != null ? safeNum(row.units) : '--'}
                        </td>
                        <td className="py-2 px-2 text-right font-mono tabular-nums text-white">
                          {row.inPlaceRent != null
                            ? `$${safeNum(row.inPlaceRent).toLocaleString('en-US')}`
                            : '--'}
                        </td>
                        <td className="py-2 px-2 text-right font-mono tabular-nums text-white">
                          {row.marketRent != null
                            ? `$${safeNum(row.marketRent).toLocaleString('en-US')}`
                            : '--'}
                        </td>
                        <td
                          className={`py-2 px-2 text-right font-mono tabular-nums font-semibold ${l2lColor(l2l)}`}
                        >
                          {row.lossToLease != null ? fmtPct(l2l) : '--'}
                        </td>
                      </tr>
                    )
                  })}

                  {/* TOTAL / AVG row */}
                  <tr className="bg-white/5 font-semibold border-t border-cre-border">
                    <td className="py-2 px-2 text-gray-200">TOTAL / AVG</td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums text-white">
                      {property?.totalUnits != null ? totalUnits : '--'}
                    </td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums text-white">
                      {dd.avgInPlaceRent != null
                        ? `$${avgInPlaceRent.toLocaleString('en-US')}`
                        : '--'}
                    </td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums text-white">
                      {dd.avgMarketRent != null
                        ? `$${avgMarketRent.toLocaleString('en-US')}`
                        : '--'}
                    </td>
                    <td
                      className={`py-2 px-2 text-right font-mono tabular-nums font-semibold ${l2lColor(lossToLeasePct)}`}
                    >
                      {dd.lossToLeasePct != null ? fmtPct(lossToLeasePct) : '--'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
