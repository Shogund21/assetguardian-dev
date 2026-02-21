

# Fix: Include Maintenance Date Fields in Equipment Details Query

## Problem
The database has `lastMaintenance` and `nextMaintenance` populated for all chillers, but the `EquipmentDetails.tsx` page query does not include these columns in its `select()` call. The UI therefore always shows "No record" and "Not scheduled."

## Fix (single file change)

**File:** `src/pages/EquipmentDetails.tsx` (line 30)

Update the `.select()` string to add the two missing columns:

```
Before:
.select('id, name, model, serial_number, location, status, type, company_id, created_at, updated_at, installation_date, expected_life_years, condition_rating')

After:
.select('id, name, model, serial_number, location, status, type, company_id, created_at, updated_at, installation_date, expected_life_years, condition_rating, lastMaintenance, nextMaintenance')
```

Then update the Maintenance Schedule display section (~lines 97-109) to render the actual dates instead of hardcoded "No record" / "Not scheduled":

- **Last Maintenance:** Show `equipment.lastMaintenance` formatted as a readable date, or "No record" if null.
- **Next Maintenance:** Show `equipment.nextMaintenance` formatted as a readable date, or "Not scheduled" if null.

## No other changes needed
- The database already has the correct data for all equipment.
- The `Equipment` TypeScript type does not need changes since the Supabase query returns dynamic data.
- No migration or backend changes required.
