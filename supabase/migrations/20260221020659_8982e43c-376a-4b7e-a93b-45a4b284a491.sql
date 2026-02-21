ALTER TABLE public.equipment
  ADD COLUMN IF NOT EXISTS installation_date date,
  ADD COLUMN IF NOT EXISTS expected_life_years int DEFAULT 25,
  ADD COLUMN IF NOT EXISTS condition_rating int;