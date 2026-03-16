# Document Extraction Report

**Generated**: 2026-02-01 12:00:00 UTC
**Deal**: Parkview Apartments
**Deal ID**: parkview-2026-001

---

## Documents Processed

| File | Type | Confidence | Fields Extracted |
|------|------|------------|------------------|
| rent-roll-sample.csv | Rent Roll | 95% | 11 fields (36 units) |
| t12-financials-sample.csv | T12 Financials | 95% | 25 fields |
| offering-memo-sample.md | Offering Memo | 90% | 45 fields |

**Total Documents**: 3
**Overall Confidence**: 92%

---

## Data Completeness

### Required Fields (8/8 = 100%)
| Field | Source | Status |
|-------|--------|--------|
| Property Address | OM | ✅ Extracted |
| City/State/ZIP | OM | ✅ Extracted |
| Total Units | OM + Rent Roll | ✅ Extracted (200) |
| Asking Price | OM | ✅ Extracted ($32,000,000) |
| Year Built | OM | ✅ Extracted (1998) |
| Current NOI | T12 | ✅ Extracted ($1,976,500) |
| Occupancy | OM | ✅ Extracted (93%) |
| Unit Mix | OM + Rent Roll | ✅ Extracted (4 types) |

### Important Fields (6/6 = 100%)
| Field | Source | Status |
|-------|--------|--------|
| T12 Revenue | T12 | ✅ $3,414,000 |
| T12 Expenses | T12 | ✅ $1,437,500 |
| Expense Breakdown | T12 | ✅ 10 categories |
| Market Rents | OM + RR | ✅ By unit type |
| In-Place Rents | OM + RR | ✅ By unit type |
| Seller Info | OM | ✅ Complete |

### Optional Fields (12/15 = 80%)
| Field | Source | Status |
|-------|--------|--------|
| Amenities | OM | ✅ 9 community, 10 unit |
| Parking Details | OM | ✅ 320 spaces |
| Construction Type | OM | ✅ Wood frame |
| Lot Size | OM | ✅ 12.5 acres |
| Zoning | OM | ✅ MF-3 |
| Flood Zone | OM | ✅ Zone X |
| Renovation Budget | OM | ✅ $2,500,000 |
| Broker Info | OM | ✅ Apex Capital Markets |
| Timeline | OM | ✅ Complete |
| Pro Forma | OM | ✅ Years 1, 3, 5 |
| PCA Report | - | ❌ Not provided |
| Phase I ESA | - | ❌ Not provided |
| Title Commitment | - | ❌ Not provided |

---

## Cross-Validation Results

### Unit Count
| Source | Value | Status |
|--------|-------|--------|
| Offering Memo | 200 | ✅ |
| Rent Roll (sample) | 36 | ⚠️ Partial |
| **Reconciliation** | Using OM value (200) | ✅ |

### Financial Metrics
| Metric | T12 | OM | Variance | Status |
|--------|-----|-----|----------|--------|
| GPR | $3,600,000 | $3,864,000* | 7% | ⚠️ OM uses market rent |
| EGI | $3,414,000 | $3,414,000 | 0% | ✅ Match |
| Expenses | $1,437,500 | $1,437,500 | 0% | ✅ Match |
| NOI | $1,976,500 | $1,976,500 | 0% | ✅ Match |

*OM GPR based on market rents, T12 uses actual in-place

### Cap Rate Verification
- Asking Price: $32,000,000
- NOI: $1,976,500
- Calculated Cap Rate: 6.18%
- OM Stated Cap Rate: 6.18%
- **Status**: ✅ Verified

---

## Conflicts Detected

**None** - All data sources are consistent.

---

## Data Gaps

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| No Phase I ESA | HIGH | Required for financing - request from seller |
| No PCA/Inspection | HIGH | Required for DD - schedule inspection |
| No Title Commitment | MEDIUM | Request from title company |
| Rent Roll Partial | LOW | Full rent roll may be in data room |

---

## Extracted Data Summary

### Property
- **Name**: Parkview Apartments
- **Address**: 4200 Parkview Drive, Austin, TX 78745
- **Units**: 200 | **SF**: 180,000 | **Year Built**: 1998

### Financials
- **Asking Price**: $32,000,000 ($160,000/unit)
- **Current NOI**: $1,976,500
- **Going-In Cap**: 6.18%
- **Expense Ratio**: 42.1%

### Unit Mix
| Type | Count | Market Rent | In-Place | Loss-to-Lease |
|------|-------|-------------|----------|---------------|
| 1BR/1BA | 80 | $1,350 | $1,225 | 9.3% |
| 2BR/1BA | 40 | $1,600 | $1,450 | 9.4% |
| 2BR/2BA | 60 | $1,800 | $1,650 | 8.3% |
| 3BR/2BA | 20 | $2,100 | $1,900 | 9.5% |

### Value-Add Budget
- Interior Renovations: $2,000,000 ($10,000/unit)
- Exterior/Common: $500,000
- **Total**: $2,500,000

---

## Output Files

| File | Location |
|------|----------|
| Deal Configuration | `config/deal.json` |
| This Report | `documents/extraction-report.md` |

---

## Ready for Pipeline: ✅ YES

The extracted data is sufficient to run the acquisition pipeline.

**Recommended Actions Before Pipeline:**
1. Review `config/deal.json` for accuracy
2. Adjust financing assumptions if needed
3. Note data gaps for DD phase attention

**To Run Pipeline:**
```bash
claude "Run the CRE acquisition pipeline for parkview-2026-001"
```
