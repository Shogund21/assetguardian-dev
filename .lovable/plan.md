

# Update Chiller Equipment Type

## What This Does
Sets the `type` column to `'Chiller'` for the 7 equipment rows that are identified as chillers by name but currently have a `NULL` type value.

## SQL to Execute
```sql
UPDATE equipment
SET type = 'Chiller'
WHERE lower(name) LIKE '%chiller%'
  AND type IS NULL;
```

## Verification Query
After the update, run a confirmation query to return the count of updated rows and their names.

## Expected Result
- **7 rows updated** (the 7 chiller-named rows with NULL type)
- **3 rows unchanged** (Chiller System - Primary, Primary Chiller Unit, Secondary Chiller Unit -- these already have a non-null type)

## Technical Notes
- Uses the Supabase data insert/update tool (not a migration) since this is a data change, not a schema change.
- No other columns are modified.

