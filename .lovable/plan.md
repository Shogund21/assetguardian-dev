

# Fix and Run `calculate_chiller_health_scores()`

## Issue Found
The function failed with **"permission denied for table asset_health"** because:
- RLS is enabled on `asset_health` with only a SELECT policy for authenticated users
- The function runs as the calling user and has no INSERT/UPDATE permission through RLS

## Fix
Recreate the function with `SECURITY DEFINER` so it executes with the owner's privileges, bypassing RLS. This is the correct pattern for internal computation functions that need to write data. A `SET search_path TO 'public'` clause will be added for security best practice.

### Migration SQL

```sql
CREATE OR REPLACE FUNCTION public.calculate_chiller_health_scores()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  -- (same body as before, unchanged)
END;
$$;
```

## After the Fix
Run the function, then return:
- **10 lowest** health_score chillers with name, location, score, risk, open WOs, PM compliance
- **10 highest** health_score chillers with the same columns

## Why SECURITY DEFINER?
- The function is an internal batch computation, not called directly by end users
- It needs to INSERT/UPDATE `asset_health` which has RLS enabled
- This matches the pattern used by other privileged functions in the project (e.g., `set_work_order_company`, `approve_access_request_and_create_technician`)
