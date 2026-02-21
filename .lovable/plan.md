

# Create `is_chiller_asset` Postgres Function

## Overview
Create a simple SQL helper function that determines whether an equipment row represents a chiller asset, based on the `type` column.

## Migration SQL

```sql
CREATE OR REPLACE FUNCTION public.is_chiller_asset(equipment_row public.equipment)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT lower(equipment_row.type) LIKE '%chiller%';
$$;
```

## Details
- **Function name**: `is_chiller_asset`
- **Parameter**: `equipment_row` of type `public.equipment` (a composite row type)
- **Returns**: `boolean` -- TRUE when `lower(type)` contains "chiller", FALSE otherwise
- **Volatility**: `STABLE` (no side effects, same result for same input within a transaction)
- **No tables are modified** -- this is a pure function creation only

