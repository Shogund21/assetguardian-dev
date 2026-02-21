

# Add Columns to Equipment Table

## Current State
The `equipment` table has 12 columns. None of the requested columns exist.

## Migration SQL

```sql
ALTER TABLE public.equipment
  ADD COLUMN IF NOT EXISTS installation_date date,
  ADD COLUMN IF NOT EXISTS expected_life_years int DEFAULT 25,
  ADD COLUMN IF NOT EXISTS condition_rating int;
```

## Columns to Be Added

| Column | Type | Default | Nullable |
|--------|------|---------|----------|
| `installation_date` | `date` | none | yes |
| `expected_life_years` | `int` | `25` | yes |
| `condition_rating` | `int` | none | yes |

## Notes
- No existing columns are modified or removed
- `IF NOT EXISTS` ensures safety if re-run
- The TypeScript types file (`src/integrations/supabase/types.ts`) is auto-generated from Supabase and will update automatically after the migration
- The `Equipment` interface in `src/types/equipment.ts` should be updated to include the new fields for use in the UI

