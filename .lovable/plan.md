

# Create `ChillerHealthBadge` Component

## Overview
A dedicated, visually rich health badge component that displays all `asset_health` metrics for a chiller. It handles loading, empty state (with a "Calculate Now" button), and the full data display.

## New File
**`src/components/equipment/ChillerHealthBadge.tsx`**

### Props
```text
equipmentId: string
```

### Data Fetching
- Uses `useQuery` with key `["asset_health", equipmentId]` to fetch from `asset_health` where `equipment_id = equipmentId` using `.maybeSingle()`
- Reuses the same query key as `ChillerDetailsForm` so they share cache

### States

**Loading:** Skeleton placeholders inside the card.

**No Data (empty state):** Message "No health score calculated yet" with a "Calculate Now" button that calls `supabase.rpc('calculate_chiller_health_scores')` then refetches.

**Data Present:** A card with:
- **Large health score** number front and center (big text, e.g. `text-4xl font-bold`)
- **Risk level badge** next to it, color-coded using the same `RISK_COLORS` map from `ChillerDetailsForm` (critical=red, high=orange, medium=yellow, low=green)
- **Metric grid** (2x3 or responsive) showing:
  - Age (years) with label
  - Open Work Orders count
  - Corrective WOs (12m) count
  - PM Compliance % (formatted with `%` suffix)
  - Calculated At (formatted date/time via `date-fns` `format`)

### UI Pattern
Uses existing `Card`, `CardHeader`, `CardContent`, `Badge`, `Button`, `Skeleton` components. Follows the same styling conventions as `ChillerDetailsForm`.

## Update Equipment Details Page
**`src/pages/EquipmentDetails.tsx`**

- Import `ChillerHealthBadge`
- Render it inside the chiller conditional block, **above** `ChillerDetailsForm`, so users see the health overview first before the edit form

```text
{equipment.type?.toLowerCase().includes('chiller') && (
  <>
    <ChillerHealthBadge equipmentId={equipment.id} />
    <ChillerDetailsForm ... />
  </>
)}
```

## Technical Details

### Risk Color Map
| Level | Background | Text | Border |
|-------|-----------|------|--------|
| critical | red-100 | red-800 | red-300 |
| high | orange-100 | orange-800 | orange-300 |
| medium | yellow-100 | yellow-800 | yellow-300 |
| low | green-100 | green-800 | green-300 |

### Metric Display
Each metric shown as a small card/stat block:
- Label in muted small text
- Value in semibold text
- PM compliance formatted as `XX.X%`
- Age formatted to 1 decimal (`X.X yrs`)
- Calculated at formatted as `MMM d, yyyy h:mm a`

## Files Changed
- `src/components/equipment/ChillerHealthBadge.tsx` -- new component
- `src/pages/EquipmentDetails.tsx` -- import and render above the form

## No Database Changes Required

