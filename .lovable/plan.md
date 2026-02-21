

# Edit Chiller Details Form on Equipment Detail Page

## What This Adds
A new card on the equipment detail page -- visible only for chiller-type equipment -- with an editable form for chiller-specific fields plus a "Recalculate Health Score" button that triggers the health scoring function.

## Changes

### 1. New Component: `ChillerDetailsForm`
**File:** `src/components/equipment/ChillerDetailsForm.tsx`

A self-contained form component that:
- Accepts `equipmentId`, current `installation_date`, `expected_life_years`, and `condition_rating` as props
- Uses controlled state for each field
- **Date picker** using the existing Shadcn Calendar + Popover pattern (with `pointer-events-auto`)
- **Number input** for expected life years (default 25)
- **Dropdown (Select)** for condition rating with labels: 1 Excellent, 2 Good, 3 Fair, 4 Poor, 5 Critical
- **Save button** that updates the `equipment` table via Supabase and invalidates the query cache
- **"Recalculate Health Score" button** (shown after save) that calls `supabase.rpc('calculate_chiller_health_scores')` and refreshes the health data
- Displays current health score and risk level badge from `asset_health` table

### 2. Update Equipment Details Page
**File:** `src/pages/EquipmentDetails.tsx`

- Expand the equipment query `.select()` to include `installation_date`, `expected_life_years`, `condition_rating`, and `type`
- Add a chiller type check: `equipment.type?.toLowerCase().includes('chiller')`
- When true, render `<ChillerDetailsForm>` below the existing equipment card
- Add a query for `asset_health` data for this equipment to show current health badge

### 3. Health Score Badge
Displayed within the chiller form card showing:
- Current health score (0-100)
- Risk level with color coding (critical = red, high = orange, medium = yellow, low = green)
- Last calculated timestamp

## Technical Details

### Equipment Query Update
```typescript
.select('id, name, model, serial_number, location, status, type, company_id, created_at, updated_at, installation_date, expected_life_years, condition_rating')
```

### Save Logic
```typescript
await supabase
  .from('equipment')
  .update({
    installation_date: date,
    expected_life_years: years,
    condition_rating: rating,
  })
  .eq('id', equipmentId);
```

### Recalculate Logic
```typescript
await supabase.rpc('calculate_chiller_health_scores');
// Then refetch asset_health for this equipment
```

### Asset Health Query
```typescript
const { data: healthData } = useQuery({
  queryKey: ['asset_health', id],
  queryFn: async () => {
    const { data } = await supabase
      .from('asset_health')
      .select('*')
      .eq('equipment_id', id)
      .maybeSingle();
    return data;
  },
  enabled: isChiller,
});
```

### Condition Rating Options
| Value | Label |
|-------|-------|
| 1 | Excellent |
| 2 | Good |
| 3 | Fair |
| 4 | Poor |
| 5 | Critical |

## Files Modified
- `src/pages/EquipmentDetails.tsx` -- add chiller fields to query, conditionally render form
- `src/components/equipment/ChillerDetailsForm.tsx` -- new component with form + health badge

## No Database Changes Required
All columns (`installation_date`, `expected_life_years`, `condition_rating`) already exist on the `equipment` table. The `asset_health` table and `calculate_chiller_health_scores()` RPC are already in place.

