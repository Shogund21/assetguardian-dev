
# PDF Report Generation for Annual Chiller PM Inspections

## Overview

Add a PDF export feature for completed Annual Chiller PM inspections. The report will include comprehensive inspection data, risk assessment summary, automated findings, and recommended actions in a professional PDF format suitable for record-keeping and sharing with stakeholders.

---

## Architecture Approach

Since the project doesn't have a PDF generation library installed, we'll use a **browser-native approach** that combines:
1. HTML-based report rendering with print-optimized CSS
2. Browser's `window.print()` with PDF virtual printer
3. Alternative: Download as HTML/text for platforms without PDF printer

This approach:
- Requires no new dependencies
- Works across all browsers
- Follows the existing pattern in `usePrintHandler.ts` and `ExecutiveReportGenerator.tsx`
- Produces high-quality, printer-friendly output

---

## Components to Create

### 1. Data Hook: `useChillerPMReport.ts`
Fetches complete inspection data for a single Annual PM:
- Main PM record with equipment/technician details
- All sub-tables: refrigerant, oil, tubes (evap/cond), water quality, electrical, performance
- Findings with severity and recommended actions
- Calculated risk scores and health metrics

### 2. Report Generator: `ChillerPMReportGenerator.tsx`
Main component with:
- PM selection dropdown (completed inspections only)
- "Generate Report" button
- Preview/Print/Download controls
- Loading and empty states

### 3. Report Preview: `ChillerPMReportPreview.tsx`
Printable HTML layout (single or multi-page) containing:

**Page 1 - Summary**
- Header with company logo, report title, date
- Equipment info (name, model, serial, location)
- Inspection details (date, technician, year)
- Overall Risk Score gauge (0-100) with level badge
- Fleet health context (compared to average)

**Page 2 - Risk Assessment**
- Risk score breakdown by category
- Automated findings table with severity colors
- Recommended actions prioritized by urgency

**Page 3+ - Technical Details**
- Refrigerant inspection results
- Oil analysis summary
- Tube inspection (evaporator + condenser)
- Electrical check results
- Performance test metrics (efficiency, capacity)
- Water quality summary

### 4. PDF Export Service: `chillerPMReportService.ts`
Functions to:
- Format inspection data for display
- Generate print-optimized HTML
- Handle PDF export via print dialog

---

## File Changes

### New Files

| File | Purpose |
|------|---------|
| `src/hooks/useChillerPMReport.ts` | Fetch complete PM data for single inspection |
| `src/components/chiller-annuals/reports/ChillerPMReportGenerator.tsx` | Main report generation UI |
| `src/components/chiller-annuals/reports/ChillerPMReportPreview.tsx` | Printable report layout |
| `src/components/chiller-annuals/reports/ChillerPMReportSections.tsx` | Individual report sections |
| `src/services/chillerPMReportService.ts` | Report formatting and generation logic |

### Modified Files

| File | Change |
|------|--------|
| `src/pages/ChillerAnnuals.tsx` | Add "Export PDF" action to inspection cards |
| `src/components/chiller-annuals/reports/ExecutiveReportGenerator.tsx` | Add PDF export button (same pattern) |

---

## Technical Details

### Data Query Structure
```typescript
// useChillerPMReport.ts
const fetchCompletePM = async (pmId: string) => {
  const [pm, refrigerant, oil, tubes, waterSide, 
         waterQuality, electrical, performance, findings] = 
    await Promise.all([
      supabase.from('annual_chiller_pm').select('*, equipment:equipment_id(*), technician:technician_id(*)').eq('id', pmId),
      supabase.from('chiller_refrigerant_inspection').select('*').eq('annual_pm_id', pmId),
      supabase.from('chiller_oil_analysis').select('*').eq('annual_pm_id', pmId),
      supabase.from('chiller_tube_inspection').select('*').eq('annual_pm_id', pmId),
      supabase.from('chiller_water_side_inspection').select('*').eq('annual_pm_id', pmId),
      supabase.from('chiller_water_quality').select('*').eq('annual_pm_id', pmId),
      supabase.from('chiller_electrical_check').select('*').eq('annual_pm_id', pmId),
      supabase.from('chiller_performance_test').select('*').eq('annual_pm_id', pmId),
      supabase.from('chiller_annual_findings').select('*').eq('annual_pm_id', pmId),
    ]);
  
  return { pm, refrigerant, oil, tubes, waterSide, 
           waterQuality, electrical, performance, findings };
};
```

### Print-Optimized CSS
Following existing pattern in `usePrintHandler.ts`:
- Page break controls
- Print-safe colors (black text, white background)
- Hidden interactive elements
- Responsive tables with proper borders

### Report Sections Layout
```
┌─────────────────────────────────────────┐
│ ANNUAL CHILLER PM INSPECTION REPORT     │
│ Equipment: Main Plant Chiller           │
│ Date: January 15, 2025                  │
├─────────────────────────────────────────┤
│ RISK ASSESSMENT                         │
│ ┌─────────┐                             │
│ │   65    │  Risk Level: MEDIUM         │
│ │  /100   │  Trend: ▲ Increasing        │
│ └─────────┘                             │
├─────────────────────────────────────────┤
│ KEY FINDINGS                            │
│ ⚠ REF002: Refrigerant Leak Detected     │
│ ⚠ TUBE003: Evaporator >5% plugged       │
│ ℹ OIL001: Oil sample collected          │
├─────────────────────────────────────────┤
│ REFRIGERANT | OIL | TUBES | ELECTRICAL  │
│    [Detailed inspection data...]        │
├─────────────────────────────────────────┤
│ RECOMMENDED ACTIONS                     │
│ 1. IMMEDIATE: Repair shaft seal leak    │
│ 2. NEAR-TERM: Schedule tube cleaning    │
└─────────────────────────────────────────┘
```

---

## Integration Points

### From Inspection List (ChillerAnnuals.tsx)
- Add "Export PDF" button next to "View Details" on each inspection card
- Opens report generator with pre-selected PM ID

### From Reports Tab
- New "Individual Inspection Reports" section
- Dropdown to select any completed inspection
- Generate/Preview/Print/Download controls

---

## User Flow

1. User navigates to Chiller Annuals page
2. On any completed inspection card, clicks "Export PDF"
3. Report generator opens with that inspection selected
4. Preview shows formatted report
5. User clicks "Print" → opens browser print dialog
6. User selects "Save as PDF" or prints directly
7. Alternative: "Download" saves as HTML file

---

## Edge Cases Handled

- **No completed inspections**: Show empty state with guidance
- **Missing sub-inspection data**: Gracefully show "N/A" or skip section
- **Large reports**: Automatic page breaks between sections
- **Print dialog blocked**: Fallback to in-page print mode
- **Mobile users**: Responsive layout, simplified print view
