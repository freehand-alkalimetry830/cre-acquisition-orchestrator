import { SectionHeading } from './ReportHelpers'

interface EmptyPhaseStateProps {
  /** The display name of the report section, e.g. "Executive Summary" */
  sectionTitle: string
  /** Which phase(s) this section depends on */
  phaseName: string
  /** Optional override for the status message */
  message?: string
}

/**
 * Reusable empty state component for report sections that depend on
 * a specific pipeline phase having completed and produced data.
 */
export default function EmptyPhaseState({
  sectionTitle,
  phaseName,
  message,
}: EmptyPhaseStateProps) {
  return (
    <section>
      <SectionHeading>{sectionTitle}</SectionHeading>
      <div className="card flex flex-col items-center justify-center py-10 text-center">
        <div className="text-3xl text-gray-600 mb-3">--</div>
        <h4 className="text-sm font-semibold text-gray-400 mb-1">
          No Data Available
        </h4>
        <p className="text-xs text-gray-500 max-w-sm">
          {message ||
            `The ${phaseName} phase has not produced data yet. This section will populate once that phase completes.`}
        </p>
      </div>
    </section>
  )
}
