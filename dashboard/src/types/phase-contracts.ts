// ---------------------------------------------------------------------------
// Phase contracts: typed dataForDownstream interfaces for each phase.
// Derived from the orchestrator markdown specifications in orchestrators/*.md
// ---------------------------------------------------------------------------

// ========================= Due Diligence =========================

export interface DDRentRollData {
  totalUnits: number
  occupancy: number
  avgRent: number
  avgMarketRent: number
  lossToLease: number
  lossToLeasePercent: number
  tenantMix: {
    studioCount: number
    oneBedCount: number
    twoBedCount: number
    threeBedCount: number
  }
  leaseExpirationSchedule: Record<string, number>
  vacancyTrend: number[]
  concessions: string[]
}

export interface DDExpensesData {
  totalOpEx: number
  opExPerUnit: number
  opExRatio: number
  anomalies: string[]
  oneTimeItems: string[]
  adjustedExpenses: {
    taxes: number
    insurance: number
    utilities: number
    repairs: number
    management: number
    payroll: number
    admin: number
    marketing: number
    contractServices: number
    other: number
  }
  benchmarkComparison: Record<string, unknown>
}

export interface DDPhysicalData {
  condition: 'GOOD' | 'FAIR' | 'POOR' | 'UNKNOWN'
  conditionScore: number
  deferredMaintenance: number
  deferredMaintenancePerUnit: number
  capExNeeds: string[]
  capExTotal5Year: number
  majorIssues: string[]
  systemAges: {
    roof: { age: number; remainingLife: number }
    hvac: { age: number; remainingLife: number }
    plumbing: { age: number; remainingLife: number }
    electrical: { age: number; remainingLife: number }
  }
  immediateRepairs: string[]
}

export interface DDTitleData {
  status: 'CLEAR' | 'ISSUES' | 'UNKNOWN'
  exceptions: string[]
  liens: string[]
  easements: string[]
  zoningCompliance: 'COMPLIANT' | 'NON_COMPLIANT' | 'CONDITIONAL'
  surveyIssues: string[]
  encumbrances: string[]
}

export interface DDMarketData {
  submarket: string
  submarketClass: string
  rentGrowthTrailing12: number
  rentGrowthProjected: number
  capRateRange: {
    low: number
    mid: number
    high: number
  }
  supplyPipeline: {
    unitsUnderConstruction: number
    unitsPlanned: number
    deliveryTimeline: string[]
  }
  demandDrivers: string[]
  employmentGrowth: number
  populationGrowth: number
  medianHouseholdIncome: number
  rentToIncomeRatio: number
  comparableProperties: Record<string, unknown>[]
}

export interface DDTenantsData {
  creditSummary: string
  avgCreditScore: number
  concentrationRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'
  topTenantExposure: number
  leaseExpirations: {
    year1: number
    year2: number
    year3: number
    year4: number
    year5: number
  }
  delinquencyRate: number
  tenantRetentionRate: number
}

export interface DDEnvironmentalData {
  phase1Status: 'CLEAN' | 'RECS' | 'FURTHER_ACTION' | 'NOT_COMPLETED'
  recognizedEnvironmentalConditions: string[]
  recommendations: string[]
  risks: string[]
  floodZone: string
  wetlands: boolean
  estimatedRemediationCost: number
  regulatoryCompliance: 'COMPLIANT' | 'NON_COMPLIANT'
}

export interface DueDiligenceDownstream {
  rentRoll: DDRentRollData
  expenses: DDExpensesData
  physical: DDPhysicalData
  title: DDTitleData
  market: DDMarketData
  tenants: DDTenantsData
  environmental: DDEnvironmentalData
}

// ========================= Underwriting =========================

export interface UWBaseCaseData {
  purchasePrice: number
  totalBasis: number
  goingInCapRate: number
  year1NOI: number
  stabilizedNOI: number
  leveragedIRR: number
  equityMultiple: number
  equityRequired: number
  debtRequest: number
  targetLTV: number
  targetDSCR: number
}

export interface UWScenarioSummary {
  baseIRR: number
  worstIRR: number
  bestIRR: number
  medianIRR: number
  passRate: number
  dscrRange: { min: number; max: number }
}

export interface UWDebtSizing {
  requestedLoanAmount: number
  maxLTV: number
  constrainingMetric: 'LTV' | 'DSCR'
  interestRate: number
  term: number
  amortization: number
  ioPeriod: number
}

export interface UWCapExBudget {
  total5Year: number
  yearlySchedule: number[]
  immediateNeeds: number
}

export interface UnderwritingDownstream {
  baseCase: UWBaseCaseData
  scenarioSummary: UWScenarioSummary
  debtSizing: UWDebtSizing
  capExBudget: UWCapExBudget
  icMemoPath: string
  modelPath: string
  scenarioMatrixPath: string
  verdict: string
  conditions: string[]
}

// ========================= Financing =========================

export interface FinancingBestQuote {
  lenderName: string
  category: 'agency' | 'cmbs' | 'bank' | 'bridge'
  interestRate: number
  ltv: number
  loanAmount: number
  dscr: number
  loanTerm_years: number
  amortization_years: number
  interestOnly_months: number
  originationFee_pct: number
  prepaymentPenalty: string
  recourse: 'full' | 'partial' | 'non-recourse'
  estimatedClosingTimeline_days: number
  reserveRequirements: {
    taxReserve: number
    insuranceReserve: number
    replacementReserve: number
    operatingReserve: number
  }
  specialConditions: string[]
}

export interface FinancingLenderComparison {
  totalQuotesReceived: number
  totalLendersContacted: number
  quotesByCategory: {
    agency: number
    cmbs: number
    bank: number
    bridge: number
  }
  rateRange: { low: number; high: number }
  ltvRange: { low: number; high: number }
  allQuotes: Record<string, unknown>[]
}

export interface FinancingRecommendedTerms {
  loanAmount: number
  equityRequired: number
  annualDebtService: number
  monthlyPayment: number
  effectiveRate: number
  totalInterestCost: number
  totalClosingCosts: number
  breakEvenOccupancy: number
}

export interface FinancingTotalCost {
  interestCost_total: number
  originationFee_total: number
  otherFees_total: number
  totalCost: number
  effectiveAnnualRate: number
  costPerUnit: number
  weightedAverageCostOfCapital: number
}

export interface FinancingLenderCondition {
  condition: string
  requiredBy: string
  deadline: string
  status: 'PENDING' | 'MET' | 'WAIVED'
  impact: string
}

export interface FinancingExecutionTimeline {
  applicationDate: string
  expectedApprovalDate: string
  commitmentLetterDate: string
  loanDocDraftDate: string
  expectedClosingDate: string
  rateLockExpiration: string
  milestones: string[]
}

export interface FinancingDealImpact {
  dscrAtRecommendedLTV: number
  cashOnCashReturn: number
  irrImpactBps: number
  debtYield: number
  equityMultipleImpact: number
}

export interface FinancingDownstream {
  bestQuote: FinancingBestQuote
  lenderComparison: FinancingLenderComparison
  recommendedTerms: FinancingRecommendedTerms
  totalCostOfCapital: FinancingTotalCost
  lenderConditions: FinancingLenderCondition[]
  executionTimeline: FinancingExecutionTimeline
  dealImpact: FinancingDealImpact
}

// ========================= Legal =========================

export interface LegalPSAStatus {
  reviewStatus: 'REVIEWED' | 'PENDING'
  purchasePrice: number
  earnestMoney: number
  contingencyDeadlines: {
    ddPeriod: string
    financing: string
    titleCure: string
    closingDate: string
  }
  assignmentProvisions: 'assignable' | 'consent-required' | 'prohibited'
  closingConditions: string[]
  redFlags: string[]
  defaultRemedies: string
}

export interface LegalTitleStatus {
  status: 'CLEAR' | 'CLOUDED' | 'EXCEPTIONS_NOTED'
  titleCompany: string
  commitmentNumber: string
  exceptionCount: number
  exceptions: string[]
  curativeItems: string[]
  curativeItemsResolved: number
  curativeItemsPending: number
  requiredEndorsements: string[]
  endorsementsObtained: string[]
}

export interface LegalSurveyStatus {
  surveyDate: string
  surveyor: string
  encroachments: string[]
  easements: string[]
  setbackViolations: string[]
  floodZoneDesignation: string
  totalIssues: number
  resolvedIssues: number
}

export interface LegalEstoppelBatch {
  batchNumber: number
  startUnit: number
  endUnit: number
  sent: number
  received: number
  outstanding: number
  discrepancies: string[]
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED'
}

export interface LegalEstoppelStatus {
  totalUnits: number
  estoppelsSent: number
  estoppelsReceived: number
  returnRate: number
  returnRateThreshold: number
  discrepancyCount: number
  maxVariance: number
  maxVarianceThreshold: number
  batches: LegalEstoppelBatch[]
  rentDiscrepancies: string[]
  leaseTermDiscrepancies: string[]
}

export interface LegalLoanDocStatus {
  reviewStatus: 'REVIEWED' | 'PENDING' | 'NOT_STARTED'
  lender: string
  loanAmount: number
  interestRate: number
  loanTerm: number
  keyCovenants: string[]
  guarantyType: string
  prepaymentProvisions: string
  reserveRequirements: string[]
  issuesFound: string[]
  redFlags: string[]
}

export interface LegalInsuranceCoverage {
  status: 'bound' | 'pending' | 'not-started' | 'not-applicable'
  carrier: string
  limit: number
  premium: number
}

export interface LegalInsuranceStatus {
  overallStatus: 'ALL_BOUND' | 'GAPS_IDENTIFIED' | 'PENDING'
  coverages: {
    generalLiability: LegalInsuranceCoverage
    property: LegalInsuranceCoverage
    umbrella: LegalInsuranceCoverage
    flood: LegalInsuranceCoverage
    environmental: LegalInsuranceCoverage
  }
  lenderRequirementsMet: boolean
  coverageGaps: string[]
}

export interface LegalTransferDocStatus {
  overallReadiness: 'READY' | 'DRAFT' | 'PENDING' | 'NOT_STARTED'
  documents: {
    deed: 'ready' | 'draft' | 'pending'
    billOfSale: 'ready' | 'draft' | 'pending'
    assignmentOfLeases: 'ready' | 'draft' | 'pending'
    tenantNotifications: 'ready' | 'draft' | 'pending'
    entityAuthorization: 'ready' | 'draft' | 'pending'
    firpta: 'ready' | 'draft' | 'pending'
    transferTax: 'ready' | 'draft' | 'pending'
  }
  firptaCompliance: 'compliant' | 'withholding-required'
  entityDocsComplete: boolean
}

export interface LegalClosingChecklistStatus {
  preClosingItems: { completed: number; total: number }
  closingDayItems: { completed: number; total: number }
  postClosingItems: { identified: number; total: number }
  criticalPathItems: string[]
}

export interface LegalDownstream {
  psaStatus: LegalPSAStatus
  titleStatus: LegalTitleStatus
  surveyStatus: LegalSurveyStatus
  estoppelStatus: LegalEstoppelStatus
  loanDocStatus: LegalLoanDocStatus
  insuranceStatus: LegalInsuranceStatus
  transferDocStatus: LegalTransferDocStatus
  closingChecklistStatus: LegalClosingChecklistStatus
  openViolations: number
  pendingLitigation: number
  phaseVerdict: string
  conditions: string[]
}

// ========================= Closing =========================

export interface ClosingProrations {
  taxProration: number
  insuranceProration: number
  rentProration: number
  utilityProration: number
  netProrationsToSeller: number
  netProrationsToBuyer: number
}

export interface ClosingCredits {
  securityDeposits: number
  repairEscrow: number
  otherCredits: number
  totalCredits: number
}

export interface ClosingCosts {
  titleInsurance: number
  recordingFees: number
  transferTaxes: number
  attorneyFees: number
  brokerCommissions: number
  lenderFees: number
  escrowFees: number
  surveyFees: number
  inspectionFees: number
  otherCosts: number
  totalClosingCosts: number
  closingCostVariance_pct: number
}

export interface ClosingNetFunds {
  fromBuyer: number
  fromLender: number
  toSeller: number
  toTitleCompany: number
}

export interface ClosingEscrowReserves {
  taxEscrow: number
  insuranceEscrow: number
  replacementReserve: number
  operatingReserve: number
  totalReserves: number
}

export interface ClosingPostClosingItem {
  item: string
  responsibleParty: string
  deadline: string
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE'
}

export interface ClosingRecordingInfo {
  county: string
  state: string
  deedType: string
  recordingNumber: string
  recordingDate: string
  bookPage: string
}

export interface ClosingTransactionParty {
  entity: string
  signatories?: string[]
  contact?: string
  name?: string
  agent?: string
  fileNumber?: string
}

export interface ClosingDownstream {
  closingDate: string
  closingVenue: string
  purchasePrice: number
  loanAmount: number
  equityRequired: number
  prorations: ClosingProrations
  credits: ClosingCredits
  closingCosts: ClosingCosts
  netFundsRequired: ClosingNetFunds
  escrowReserves: ClosingEscrowReserves
  postClosingItems: ClosingPostClosingItem[]
  recordingInfo: ClosingRecordingInfo
  transactionParties: {
    buyer: ClosingTransactionParty
    seller: ClosingTransactionParty
    lender: ClosingTransactionParty
    titleCompany: ClosingTransactionParty
    escrowAgent: ClosingTransactionParty
  }
}

// ========================= Union Type =========================

/**
 * Union of all phase downstream data contracts.
 * Used as the type for PhaseInfo.dataForDownstream.
 *
 * At runtime, the shape depends on which phase produced the data:
 * - due_diligence  -> DueDiligenceDownstream
 * - underwriting   -> UnderwritingDownstream
 * - financing      -> FinancingDownstream
 * - legal          -> LegalDownstream
 * - closing        -> ClosingDownstream
 */
export type PhaseDownstreamData =
  | DueDiligenceDownstream
  | UnderwritingDownstream
  | FinancingDownstream
  | LegalDownstream
  | ClosingDownstream

/**
 * Map from phase key to its typed downstream data contract.
 * Useful for discriminated access when the phase key is known.
 */
export interface PhaseDownstreamMap {
  due_diligence: DueDiligenceDownstream
  underwriting: UnderwritingDownstream
  financing: FinancingDownstream
  legal: LegalDownstream
  closing: ClosingDownstream
}
