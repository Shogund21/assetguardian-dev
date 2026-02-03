

# Update Customer Manual Documentation for Annual Chiller Maintenance Module

## Overview

This plan adds comprehensive documentation for the newly implemented **Annual Chiller Maintenance & Risk Intelligence** module to the customer manual tab. The documentation will cover the dashboard, analytics, executive reporting, and inspection wizard features.

---

## Changes Required

### 1. Create New Documentation File

**File**: `public/docs/chiller-annual-maintenance.md`

This comprehensive guide will cover:

**Table of Contents:**
- Overview & Introduction
- Accessing the Module
- Chiller Health Dashboard
  - Fleet Health Overview (KPI Cards)
  - Health Score by Asset
  - Tube Loss Trend Analysis
  - Refrigerant Analytics & Leak Heatmap
  - Efficiency Trend (kW/ton)
  - High Risk Asset Identification
  - Vendor Accountability Summary
- Annual Inspection Wizard
  - Step-by-step inspection process (9 steps)
  - Mobile usage guidelines
- Executive Reporting
  - Report generation
  - Print/export options
  - Understanding the executive summary
- Best Practices
- Troubleshooting

---

### 2. Update DocumentationSection Component

**File**: `src/components/settings/sections/DocumentationSection.tsx`

Add the new chiller annuals documentation to the `documentationLinks` array:

```typescript
{
  title: "Annual Chiller Maintenance",
  description: "Complete guide for annual chiller inspections, risk intelligence, and executive reporting.",
  icon: Gauge, // or appropriate icon
  path: "/docs/chiller-annual-maintenance.md",
}
```

---

### 3. Update Maintenance Checks Documentation

**File**: `public/docs/maintenance-checks.md`

Add a section referencing the specialized Annual Chiller Maintenance module:

```markdown
## Specialized Maintenance Modules

### Annual Chiller Maintenance & Risk Intelligence
For water-cooled chillers requiring comprehensive annual inspections, 
use the dedicated **Annual Chiller Maintenance** module. This specialized 
system provides:
- 16 structured inspection categories
- Risk scoring and health metrics
- Multi-year trend analysis
- Executive reporting capabilities

Access via: Main Menu → Chiller Annuals

For detailed guidance, see the [Annual Chiller Maintenance Guide](/docs/chiller-annual-maintenance.md).
```

---

### 4. Update Predictive Maintenance Documentation

**File**: `public/docs/predictive-maintenance.md`

Add a reference to the chiller-specific analytics available in the Annual Chiller module:

```markdown
### Annual Chiller Inspections

For comprehensive annual chiller assessments with multi-year trending, 
use the dedicated **Annual Chiller Maintenance** module which provides:
- Tube loss % trending with threshold alerts
- Refrigerant loss tracking with leak heatmaps
- kW/ton efficiency degradation analysis
- Risk scoring and executive reporting

This module is designed for annual water-cooled chiller inspections 
and complements the routine predictive maintenance readings.
```

---

## New Documentation Content Summary

The new `chiller-annual-maintenance.md` file will include approximately 400-500 lines covering:

| Section | Content |
|---------|---------|
| Overview | Purpose of annual inspections, module capabilities, target equipment |
| Dashboard Guide | Detailed explanation of all 7 dashboard components with screenshots descriptions |
| Inspection Wizard | Step-by-step guide through all 9 inspection steps with field explanations |
| Executive Reports | How to generate, interpret, and share executive summaries |
| Best Practices | Recommended workflows, data quality tips, timing guidelines |
| Troubleshooting | Common issues and solutions |

---

## Technical Details

### Files to Create:
- `public/docs/chiller-annual-maintenance.md` - New comprehensive documentation (approx. 450 lines)

### Files to Modify:
- `src/components/settings/sections/DocumentationSection.tsx` - Add new documentation link
- `public/docs/maintenance-checks.md` - Add reference to chiller annuals module
- `public/docs/predictive-maintenance.md` - Add reference to chiller analytics

### Import Changes:
- Add `Gauge` icon import from `lucide-react` in DocumentationSection.tsx

---

## Documentation Structure

```text
Customer Manual Documentation
├── Equipment Management
├── Maintenance Checks (updated with cross-reference)
├── Project Management
├── Technician Management
├── Predictive Maintenance (updated with cross-reference)
├── Annual Chiller Maintenance (NEW)  ← Primary addition
├── Settings Management
├── Authentication Guide
├── Mobile Usage Guide
└── Administrator Features
```

