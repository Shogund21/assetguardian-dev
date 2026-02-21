

# Create `asset_health` Table

## Current State
The `asset_health` table does not exist in the database.

## Migration SQL

```sql
CREATE TABLE IF NOT EXISTS public.asset_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid UNIQUE NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  health_score int NOT NULL,
  risk_level text NOT NULL,
  age_years numeric,
  pm_compliance_pct numeric,
  open_wo_count int DEFAULT 0,
  corrective_wo_12m_count int DEFAULT 0,
  calculated_at timestamptz DEFAULT now()
);

-- Enable RLS (follows project convention)
ALTER TABLE public.asset_health ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read asset health data
CREATE POLICY "Authenticated users can view asset health"
  ON public.asset_health FOR SELECT
  TO authenticated
  USING (true);
```

## Columns

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `equipment_id` | `uuid` | UNIQUE, NOT NULL, FK -> `equipment(id)` ON DELETE CASCADE |
| `health_score` | `int` | NOT NULL |
| `risk_level` | `text` | NOT NULL |
| `age_years` | `numeric` | nullable |
| `pm_compliance_pct` | `numeric` | nullable |
| `open_wo_count` | `int` | default 0 |
| `corrective_wo_12m_count` | `int` | default 0 |
| `calculated_at` | `timestamptz` | default `now()` |

## Notes
- `equipment_id` has a UNIQUE constraint so each equipment item has at most one health record
- CASCADE delete ensures cleanup when equipment is removed
- RLS is enabled with a read policy for authenticated users, matching project conventions
- The auto-generated `src/integrations/supabase/types.ts` will update after migration

