

# Chiller Risk Ranking Section on Location/Store Page

## Overview
Add a "Chiller Risk Ranking" section to the Locations settings page. Since there is no dedicated location detail page, this will appear below the existing location management table. Users select a location from a dropdown, and the component displays all chillers at that location sorted by lowest health score first.

## How It Works

The `equipment` table stores location as a **text field** (e.g., "Main Office Building", "806"). The `locations` table has `name` and `store_number`. The component will:
1. Fetch all locations for the dropdown
2. When a location is selected, query equipment where `type` contains "chiller" AND `location` matches the selected location's `name` or `store_number`
3. Join with `asset_health` to get health scores, then sort by lowest score first

## New File
**`src/components/equipment/ChillerRiskRanking.tsx`**

A self-contained component with:
- **Location selector** dropdown populated from the `locations` table
- **Chiller table** showing: equipment name, health_score, risk_level (color-coded badge), open_wo_count, pm_compliance_pct
- Sorted by lowest `health_score` first
- **"Recalculate All" button** that calls `supabase.rpc('calculate_chiller_health_scores')` then refreshes the data
- **Loading state** with skeletons
- **Empty states**: no location selected, no chillers at location, no health data yet

### Data Fetching Strategy
```text
Step 1: Fetch all chiller equipment at the selected location
  SELECT id, name, type, location FROM equipment
  WHERE lower(type) LIKE '%chiller%'
  AND (location = selectedLocationName OR location = selectedStoreNumber)

Step 2: Fetch asset_health for those equipment IDs
  SELECT * FROM asset_health
  WHERE equipment_id IN (chiller_ids)

Step 3: Merge and sort by health_score ascending (worst first)
```

### Table Columns
| Column | Source | Format |
|--------|--------|--------|
| Name | equipment.name | Text |
| Health Score | asset_health.health_score | Number, bold |
| Risk Level | asset_health.risk_level | Color-coded badge |
| Open WOs | asset_health.open_wo_count | Number |
| PM Compliance | asset_health.pm_compliance_pct | XX.X% |

### Risk Level Colors
Same pattern as `ChillerHealthBadge`:
- critical: red background
- high: orange background
- medium: yellow background
- low: green background

## Updated File
**`src/components/settings/sections/LocationsSection.tsx`**

Import and render `ChillerRiskRanking` below the existing location management card.

```text
<LocationsSection>
  <Card> ... Location Management (existing) ... </Card>
  <ChillerRiskRanking />   <-- new
</LocationsSection>
```

## No Database Changes Required
All data already exists in `equipment`, `asset_health`, and `locations` tables. The `calculate_chiller_health_scores()` RPC is already deployed with `SECURITY DEFINER`.
