
# Remove Unused KPI Cards from Annual Chiller Dashboard

## Overview

Remove the "Total Chillers" and "No Backup" metric cards from the FleetHealthOverview component. These metrics don't add value:
- **Total Chillers** just counts equipment, not inspection status
- **No Backup** is hardcoded to 0 (never implemented)

Keep only the three meaningful KPIs:
1. **Avg Health Score** - Fleet-wide health based on inspections
2. **High Risk** - Count of chillers needing attention
3. **Next Due** - Upcoming inspection date

---

## Changes

### File: `src/components/chiller-annuals/dashboard/FleetHealthOverview.tsx`

**Remove:**
- Lines 51-65: Total Chillers card
- Lines 105-121: No Backup card
- Unused imports: `Thermometer`, `Shield` icons

**Update:**
- Grid layout from `grid-cols-2 md:grid-cols-5` to `grid-cols-1 md:grid-cols-3`
- Loading skeleton from 5 items to 3 items

---

## Result

The dashboard will show a cleaner 3-card layout:

| Avg Health Score | High Risk | Next Due |
|------------------|-----------|----------|
| Fleet-wide % | Count needing attention | Upcoming date |

This focuses on actionable metrics derived from actual inspection data.
