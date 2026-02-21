
# Add `calculated_at` Column to Chiller Risk Ranking

## What Already Exists
The `ChillerRiskRanking` component is fully built and integrated into `LocationsSection.tsx`. It displays chillers sorted by health score (worst first) with a location selector, "Recalculate All" button, and columns for name, health_score, risk_level, open_wo_count, and pm_compliance_pct.

## What Needs to Change
Add the **`calculated_at`** column to the table, which is the only field from the request not currently displayed.

## File: `src/components/equipment/ChillerRiskRanking.tsx`

1. Add `import { format } from "date-fns"` at the top
2. Add a `Calculated At` column header after `PM Compliance`
3. Add a table cell that formats `chiller.health?.calculated_at` using `format(new Date(...), "MMM d, yyyy h:mm a")`, or shows a dash if null

No other files need changes. No database changes required.
