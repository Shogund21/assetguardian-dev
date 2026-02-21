-- Chillers: Jan 23, 2026
UPDATE equipment
SET "lastMaintenance" = '2026-01-23'
WHERE "lastMaintenance" IS NULL
  AND lower(name) LIKE '%chiller%';

-- Everything else: Feb 6, 2023
UPDATE equipment
SET "lastMaintenance" = '2023-02-06'
WHERE "lastMaintenance" IS NULL;