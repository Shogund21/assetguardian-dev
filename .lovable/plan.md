

# Annual Chiller Maintenance & Risk Intelligence - Implementation Plan

## Overview

This plan creates a **completely separate module** for annual chiller inspections that runs alongside (not replacing) the existing daily/weekly maintenance system. The existing `hvac_maintenance_checks` table and all associated functionality remains **100% untouched**.

---

## Architecture: Isolation Strategy

```text
EXISTING SYSTEM (UNTOUCHED)                 NEW ANNUAL MODULE (ADDITIVE)
+---------------------------------+         +----------------------------------+
| hvac_maintenance_checks         |         | annual_chiller_pm                |
| - Daily/weekly checks           |    +--->| - Parent record for annual PM   |
| - All equipment types           |    |    +----------------------------------+
| - Current form/history UI       |    |              |
+---------------------------------+    |              v
                                       |    +----------------------------------+
        NO CHANGES                     |    | chiller_refrigerant_inspection   |
                                       |    | chiller_oil_analysis             |
+---------------------------------+    |    | chiller_tube_inspection          |
| equipment                       |----+    | chiller_water_side_inspection    |
| - Links to both systems         |         | chiller_water_quality            |
+---------------------------------+         | chiller_electrical_check         |
                                            | chiller_performance_test         |
                                            | chiller_annual_findings          |
                                            | chiller_finding_attachments      |
                                            +----------------------------------+
                                                        |
                                            +----------------------------------+
                                            | Reference Tables (New)           |
                                            | - chiller_ref_leak_locations     |
                                            | - chiller_ref_sight_glass_cond   |
                                            | - chiller_ref_starter_conditions |
                                            | - chiller_ref_risk_levels        |
                                            | - chiller_ref_issue_codes        |
                                            | - chiller_ref_tube_test_methods  |
                                            +----------------------------------+
```

---

## What Will NOT Change

| Existing Component | Status |
|-------------------|--------|
| `hvac_maintenance_checks` table | **Unchanged** |
| `MaintenanceCheckForm` / `MaintenanceCheckFormRefactored` | **Unchanged** |
| `MaintenanceHistory` component | **Unchanged** |
| `/maintenance-checks` page | **Unchanged** |
| All existing maintenance mappers/schemas | **Unchanged** |
| Equipment table structure | **Unchanged** |
| Sidebar navigation (existing items) | **Unchanged** |

---

## New Database Tables

### Reference Tables (6 Total)

#### 1. chiller_ref_leak_locations
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| code | text | NOT NULL, UNIQUE |
| label | text | NOT NULL |
| category | text | (compressor, piping, valve, etc.) |
| sort_order | int | default 0 |
| is_active | boolean | default true |

**Sample Values:** shaft_seal, suction_flange, discharge_flange, oil_drain, relief_valve, sight_glass

#### 2. chiller_ref_sight_glass_conditions
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| code | text | NOT NULL, UNIQUE |
| label | text | NOT NULL |
| severity_score | int | 1-5 scale for AI |
| sort_order | int | |

**Sample Values:** clear, bubbles_minor, bubbles_heavy, moisture_present, discolored

#### 3. chiller_ref_starter_conditions
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| code | text | NOT NULL, UNIQUE |
| label | text | NOT NULL |
| risk_score | int | 1-10 scale |

**Sample Values:** operational, worn_contacts, overheating, arc_damage, replacement_recommended

#### 4. chiller_ref_risk_levels
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| code | text | NOT NULL, UNIQUE (none, low, medium, high, critical) |
| label | text | NOT NULL |
| color_hex | text | For UI display |
| priority_weight | int | For scoring |

#### 5. chiller_ref_issue_codes
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| code | text | NOT NULL, UNIQUE (REF001, OIL002, etc.) |
| category | text | NOT NULL (refrigerant, oil, tubes, water, electrical, performance) |
| label | text | NOT NULL |
| description | text | |
| recommended_action | text | |
| default_risk_level | text | FK to risk_levels |

#### 6. chiller_ref_tube_test_methods
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| code | text | NOT NULL, UNIQUE |
| label | text | NOT NULL |

**Sample Values:** eddy_current, ultrasonic, visual, pressure_test, dye_penetrant

---

### Main Tables (10 Total)

#### 1. annual_chiller_pm (Parent Record)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | |
| equipment_id | uuid | FK to equipment, NOT NULL | Chiller being inspected |
| company_id | uuid | FK to companies | Multi-tenant |
| location_id | uuid | FK to locations | |
| technician_id | uuid | FK to technicians | Lead technician |
| inspection_year | int | NOT NULL | Year of annual inspection |
| inspection_date | timestamptz | NOT NULL | Actual inspection date |
| chiller_model | text | | Trane CVHE, Carrier 30HXC, etc. |
| chiller_serial | text | | |
| chiller_age_years | numeric(4,1) | | |
| operating_hours_at_inspection | int | | |
| status | text | default 'in_progress' | draft, in_progress, pending_review, completed |
| overall_risk_level | text | FK to risk_levels | |
| overall_risk_score | numeric(5,2) | | AI-computed 0-100 |
| requires_immediate_action | boolean | default false | |
| labor_hours_total | numeric(6,2) | | |
| parts_cost_total | numeric(10,2) | | |
| labor_cost_total | numeric(10,2) | | |
| notes | text | | |
| ai_analysis_json | jsonb | | AI prediction results |
| created_at | timestamptz | default now() | |
| updated_at | timestamptz | default now() | |

**Unique Constraint:** `(equipment_id, inspection_year)` - One annual PM per chiller per year

#### 2. chiller_refrigerant_inspection
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| annual_pm_id | uuid | FK to annual_chiller_pm, NOT NULL |
| refrigerant_type | text | R-134a, R-123, R-514A |
| charge_lbs | numeric(8,2) | Current charge weight |
| nameplate_charge_lbs | numeric(8,2) | Original nameplate |
| leak_detected | boolean | default false |
| leak_location_code | text | FK to leak_locations |
| leak_rate_oz_year | numeric(6,2) | Estimated annual leak rate |
| suction_pressure_psig | numeric(6,2) | |
| discharge_pressure_psig | numeric(6,2) | |
| subcooling_f | numeric(5,2) | |
| superheat_f | numeric(5,2) | |
| sight_glass_condition | text | FK to sight_glass_conditions |
| acid_test_passed | boolean | |
| risk_level | text | FK to risk_levels |

#### 3. chiller_oil_analysis
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| annual_pm_id | uuid | FK, NOT NULL |
| oil_type | text | POE, Mineral, etc. |
| current_level_pct | numeric(5,2) | 0-100% |
| oil_changed | boolean | |
| sample_collected | boolean | |
| viscosity_cst_40c | numeric(8,2) | |
| acid_number_mgkoh_g | numeric(6,3) | Total Acid Number |
| moisture_ppm | numeric(6,1) | |
| iron_ppm | numeric(6,1) | Wear metal |
| copper_ppm | numeric(6,1) | Wear metal |
| appearance | text | clear, hazy, dark, contaminated |
| oil_filter_replaced | boolean | |
| risk_level | text | FK to risk_levels |

#### 4. chiller_tube_inspection
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| annual_pm_id | uuid | FK, NOT NULL |
| bundle_type | text | 'evaporator' or 'condenser' |
| tube_count_total | int | |
| test_method | text | FK to tube_test_methods |
| tubes_plugged_total | int | |
| plugged_pct | numeric(5,2) | |
| min_wall_thickness_mils | numeric(5,1) | |
| wall_loss_pct | numeric(5,2) | |
| fouling_factor_measured | numeric(8,5) | hr-ft2-F/BTU |
| fouling_severity | text | none, light, moderate, heavy, severe |
| tubes_cleaned | boolean | |
| cleaning_method | text | mechanical, chemical, hydroblast |
| waterbox_condition | text | |
| risk_level | text | FK to risk_levels |

#### 5. chiller_water_side_inspection
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| annual_pm_id | uuid | FK, NOT NULL |
| water_loop | text | 'chilled_water' or 'condenser_water' |
| entering_water_temp_f | numeric(5,2) | |
| leaving_water_temp_f | numeric(5,2) | |
| delta_t_f | numeric(5,2) | |
| flow_rate_gpm | numeric(8,2) | |
| design_flow_gpm | numeric(8,2) | |
| pressure_drop_psig | numeric(6,2) | |
| strainer_cleaned | boolean | |
| isolation_valves_condition | text | |
| risk_level | text | FK to risk_levels |

#### 6. chiller_water_quality
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| annual_pm_id | uuid | FK, NOT NULL |
| water_loop | text | 'chilled_water', 'condenser_water', 'makeup' |
| sample_date | date | |
| ph | numeric(4,2) | 6.5-9.0 typical |
| conductivity_umhos | numeric(8,1) | |
| total_dissolved_solids_ppm | numeric(8,1) | |
| bacteria_count_cfu_ml | numeric(10,0) | |
| legionella_detected | boolean | |
| langelier_saturation_index | numeric(4,2) | |
| within_spec | boolean | |
| risk_level | text | FK to risk_levels |

#### 7. chiller_electrical_check
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| annual_pm_id | uuid | FK, NOT NULL |
| component | text | 'main_motor', 'oil_pump', 'purge', 'controls', 'vfd' |
| voltage_l1_l2 | numeric(6,1) | |
| voltage_l2_l3 | numeric(6,1) | |
| voltage_l3_l1 | numeric(6,1) | |
| voltage_imbalance_pct | numeric(5,2) | |
| amperage_l1 | numeric(7,2) | |
| amperage_l2 | numeric(7,2) | |
| amperage_l3 | numeric(7,2) | |
| insulation_resistance_megohms | numeric(8,2) | Megger test |
| vibration_ips_de | numeric(6,3) | Drive end |
| vibration_acceptable | boolean | |
| starter_condition | text | FK to starter_conditions |
| risk_level | text | FK to risk_levels |

#### 8. chiller_performance_test
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| annual_pm_id | uuid | FK, NOT NULL |
| test_date | timestamptz | |
| load_pct | numeric(5,2) | % of design capacity |
| chilled_water_supply_f | numeric(5,2) | |
| chilled_water_return_f | numeric(5,2) | |
| condenser_water_supply_f | numeric(5,2) | |
| condenser_water_return_f | numeric(5,2) | |
| kw_input | numeric(8,2) | |
| tons_actual | numeric(8,2) | |
| tons_design | numeric(8,2) | |
| kw_per_ton | numeric(6,3) | Efficiency |
| cop | numeric(5,2) | Coefficient of Performance |
| meets_design_capacity | boolean | |
| meets_design_efficiency | boolean | |
| degradation_since_last_year_pct | numeric(5,2) | For trending |
| risk_level | text | FK to risk_levels |

#### 9. chiller_annual_findings
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| annual_pm_id | uuid | FK, NOT NULL |
| finding_number | int | Sequential within PM |
| issue_code | text | FK to issue_codes |
| category | text | refrigerant, oil, tubes, etc. |
| description | text | NOT NULL |
| severity | text | FK to risk_levels, NOT NULL |
| is_repeat_finding | boolean | default false |
| prior_finding_id | uuid | FK to self (for trending) |
| recommended_action | text | |
| status | text | default 'open' |
| estimated_cost | numeric(10,2) | |
| ai_confidence_score | numeric(5,2) | If AI-detected |
| created_at | timestamptz | |

#### 10. chiller_finding_attachments
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| finding_id | uuid | FK to chiller_annual_findings, NOT NULL |
| file_name | text | NOT NULL |
| file_path | text | NOT NULL (Storage bucket path) |
| file_type | text | NOT NULL |
| is_primary | boolean | default false |
| caption | text | |
| uploaded_by | uuid | FK to technicians |
| uploaded_at | timestamptz | default now() |

---

## Database Indexes

```sql
-- Performance indexes for year-over-year trending
CREATE INDEX idx_annual_pm_equipment_year ON annual_chiller_pm(equipment_id, inspection_year);
CREATE INDEX idx_annual_pm_company ON annual_chiller_pm(company_id);
CREATE INDEX idx_annual_pm_risk ON annual_chiller_pm(overall_risk_level);
CREATE INDEX idx_findings_pm ON chiller_annual_findings(annual_pm_id);
CREATE INDEX idx_findings_status ON chiller_annual_findings(status);
CREATE INDEX idx_attachments_finding ON chiller_finding_attachments(finding_id);
```

---

## Storage Bucket

Create a new bucket for annual chiller attachments:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('chiller-annual-attachments', 'chiller-annual-attachments', false);
```

---

## New Files to Create

### Frontend Components

| File | Purpose |
|------|---------|
| `src/pages/ChillerAnnuals.tsx` | Main page for annual chiller PM |
| `src/components/chiller-annuals/AnnualChillerForm.tsx` | Multi-step form for annual PM |
| `src/components/chiller-annuals/AnnualChillerHistory.tsx` | List of past annual inspections |
| `src/components/chiller-annuals/AnnualChillerDetails.tsx` | View completed annual PM |
| `src/components/chiller-annuals/tabs/RefrigerantInspectionTab.tsx` | Refrigerant form section |
| `src/components/chiller-annuals/tabs/OilAnalysisTab.tsx` | Oil analysis form section |
| `src/components/chiller-annuals/tabs/TubeInspectionTab.tsx` | Tube inspection form section |
| `src/components/chiller-annuals/tabs/WaterSideTab.tsx` | Water side inspection section |
| `src/components/chiller-annuals/tabs/WaterQualityTab.tsx` | Water quality section |
| `src/components/chiller-annuals/tabs/ElectricalCheckTab.tsx` | Electrical check section |
| `src/components/chiller-annuals/tabs/PerformanceTestTab.tsx` | Performance test section |
| `src/components/chiller-annuals/tabs/FindingsTab.tsx` | Findings with photo uploads |
| `src/components/chiller-annuals/RiskScoreCard.tsx` | Risk visualization component |
| `src/components/chiller-annuals/TrendingChart.tsx` | Year-over-year comparison charts |
| `src/types/chillerAnnual.ts` | TypeScript types for annual PM |
| `src/hooks/useChillerAnnualPM.ts` | Data fetching hook |
| `src/hooks/useChillerReferenceData.ts` | Hook for reference tables |

### Services

| File | Purpose |
|------|---------|
| `src/services/chillerAnnualService.ts` | CRUD operations for annual PM |
| `src/services/chillerRiskCalculator.ts` | Risk score calculation logic |

---

## Navigation Update

Add new item to `src/components/sidebar/SidebarNav.tsx`:

```typescript
{
  title: "Chiller Annuals",
  url: "/chiller-annuals",
  icon: Calendar, // or a custom icon
},
```

Add route to `src/App.tsx`:

```typescript
<Route path="/chiller-annuals" element={
  <ProtectedRoute>
    <ChillerAnnuals />
  </ProtectedRoute>
} />
```

---

## RLS Policies

All new tables will follow existing patterns with company-scoped access:

```sql
ALTER TABLE annual_chiller_pm ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company's annual PMs"
  ON annual_chiller_pm FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM technicians WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert annual PMs for their company"
  ON annual_chiller_pm FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM technicians WHERE user_id = auth.uid()
  ));

-- Similar policies for all child tables
```

---

## AI Extensibility Points

| Feature | Field/Table |
|---------|------------|
| Risk score prediction | `annual_chiller_pm.ai_analysis_json` |
| Finding confidence | `chiller_annual_findings.ai_confidence_score` |
| Trending analysis | `(equipment_id, inspection_year)` composite key |
| Severity scoring | Reference tables with `severity_score`, `risk_score` |
| Fleet comparison | Query by `company_id` across all chillers |

---

## Implementation Phases

### Phase 1: Database Foundation
1. Create migration with all 16 tables (6 reference + 10 main)
2. Seed reference tables with standard values
3. Set up RLS policies
4. Create storage bucket

### Phase 2: TypeScript Types
1. Create comprehensive types in `src/types/chillerAnnual.ts`
2. Update Supabase types (auto-generated)

### Phase 3: Core UI Components
1. Create page structure
2. Implement form with tabs for each inspection type
3. Build history/list view
4. Add details view

### Phase 4: Integration
1. Add navigation item
2. Add route
3. Connect to equipment page (link to annual history)

---

## Summary

This implementation creates a **completely parallel system** for annual chiller maintenance that:

- Leaves all existing daily/weekly maintenance functionality **untouched**
- Uses separate tables with clear `chiller_` prefix naming
- Adds a new navigation item and page
- Supports AI-ready structured data with numeric/boolean/enum fields
- Enables year-over-year trending via `(equipment_id, inspection_year)` keys
- Includes photo attachments linked to specific findings

The existing `/maintenance-checks` page and all its components continue to work exactly as before.

