

# One-Time Data Cleanup: Set `type = 'Chiller'` for Chiller Equipment

## What This Does
Updates all equipment rows where `type IS NULL` and the name contains "chiller" (case-insensitive), setting their `type` to `'Chiller'`.

## SQL to Execute (via Supabase data tool)

```sql
UPDATE equipment
SET type = 'Chiller'
WHERE type IS NULL
  AND lower(name) LIKE '%chiller%';
```

## Verification Query

After the update, run:

```sql
SELECT id, name, location, type
FROM equipment
WHERE lower(name) LIKE '%chiller%'
ORDER BY name;
```

This confirms all chiller-named rows now have `type = 'Chiller'` and reports the updated rows with their id, name, location, and type.

## Scope
- Only affects rows where `type IS NULL` -- rows with an existing type value are untouched.
- No frontend or schema changes needed.

