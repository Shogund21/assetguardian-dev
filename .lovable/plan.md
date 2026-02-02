

# Mobile-First Inspection Workflow UI for Annual Chiller Maintenance

## Overview

This plan designs a step-by-step, mobile-optimized inspection workflow that prioritizes tap-based inputs over typing, supports offline data collection, and integrates with the existing risk scoring system. The workflow guides technicians through 9 sequential screens while allowing flexible navigation and section skipping with reason codes.

---

## Architecture: Step-by-Step Workflow Engine

```text
+----------------------------------+
|      ChillerInspectionWizard     |
|  (Main workflow orchestrator)    |
+----------------------------------+
              |
    +-------------------+
    | WizardStepContext |  (Current step, progress, skip reasons)
    +-------------------+
              |
    +-------------------+
    | OfflineFormStore  |  (IndexedDB for draft persistence)
    +-------------------+
              |
    +-------------------+
    |    Step Components |
    +-------------------+
              |
    +---------+---------+---------+---------+
    |         |         |         |         |
 Step 1    Step 2    Step 3   ...      Step 9
(Asset)  (Refrig)   (Oil)            (Review)
```

---

## Screen Flow Summary

| Step | Screen | Critical Fields | Can Skip? |
|------|--------|-----------------|-----------|
| 1 | Select Asset + Create PM | equipment_id, inspection_date, technician_id | No |
| 2 | Refrigerant Inspection | leak_detected, sight_glass_condition | Yes |
| 3 | Oil System | current_level_pct, sample_collected, acid_number | Yes |
| 4 | Tube Inspection | bundle_type, plugged_pct, test_method | Yes |
| 5 | Water Side + Quality | flow_rate_gpm, delta_t_f, pH, legionella_detected | Yes |
| 6 | Electrical | voltage readings, insulation_resistance, vibration_acceptable | Yes |
| 7 | Performance Test | kw_input, tons_actual, chw/cw temps | Yes |
| 8 | Findings + Photos | issue_code, severity, photo attachments | Yes |
| 9 | Review + Submit | Risk score display, action recommendation | No |

---

## Screen-by-Screen Design

### Screen 1: Select Asset + Create Annual PM

**Purpose**: Initialize the inspection by selecting equipment and creating the parent PM record.

**Layout** (Mobile):
```text
+------------------------------------------+
|  [<] Annual Chiller Inspection      [?]  |
+------------------------------------------+
| Progress: ●○○○○○○○○  Step 1 of 9         |
+------------------------------------------+
|                                          |
|  Select Chiller                          |
|  +------------------------------------+  |
|  | [Search icon] Search equipment...  |  |
|  +------------------------------------+  |
|  | ○ Chiller 1 - Building A           |  |
|  | ● Chiller 2 - Main Plant  ✓        |  |
|  | ○ Chiller 3 - Warehouse            |  |
|  +------------------------------------+  |
|                                          |
|  Inspection Date                         |
|  +------------------------------------+  |
|  | [📅]  Feb 2, 2026                  |  |
|  +------------------------------------+  |
|                                          |
|  Lead Technician                         |
|  +------------------------------------+  |
|  | [▼] Select technician...           |  |
|  +------------------------------------+  |
|                                          |
|  Operating Hours (at inspection)         |
|  +------------------------------------+  |
|  | [+]  12,450  [-]                   |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |          Start Inspection          |  |
|  +------------------------------------+  |
+------------------------------------------+
```

**Required Fields**:
| Field | Type | Validation | UI Component |
|-------|------|------------|--------------|
| equipment_id | uuid | Required | Radio list with search filter |
| inspection_date | date | Required, not future | Date picker |
| technician_id | uuid | Required | Select dropdown |
| operating_hours_at_inspection | int | Optional | Number stepper (+/-) |
| chiller_model | text | Auto-filled from equipment | Read-only display |
| chiller_serial | text | Auto-filled from equipment | Read-only display |

**Validation Rules**:
- Cannot proceed without selecting equipment
- Cannot proceed without selecting technician
- Inspection date cannot be in the future
- If equipment already has PM for current year, show warning dialog

**Error Handling**:
- No equipment available: Show "No chillers found" with link to equipment page
- Offline mode: Load cached equipment list from IndexedDB

---

### Screen 2: Refrigerant Inspection

**Purpose**: Document refrigerant system status, leak detection, and charge levels.

**Layout** (Mobile):
```text
+------------------------------------------+
|  [<] Refrigerant Inspection    [Skip ▼]  |
+------------------------------------------+
| Progress: ●●○○○○○○○  Step 2 of 9         |
+------------------------------------------+
|                                          |
|  Leak Detected?                          |
|  +------------------+------------------+ |
|  |       NO         |       YES        | |
|  |   [selected]     |                  | |
|  +------------------+------------------+ |
|                                          |
|  [Conditional: If YES]                   |
|  Leak Location                           |
|  +------------------------------------+  |
|  | ○ Shaft Seal                       |  |
|  | ○ Suction Flange                   |  |
|  | ○ Discharge Flange                 |  |
|  | ○ Relief Valve                     |  |
|  | ○ Other: ___________               |  |
|  +------------------------------------+  |
|                                          |
|  Sight Glass Condition                   |
|  +------------------------------------+  |
|  | ○ Clear        ○ Bubbles (Minor)   |  |
|  | ○ Bubbles (Heavy)  ○ Discolored    |  |
|  +------------------------------------+  |
|                                          |
|  Moisture Indicator                      |
|  +------------------------------------+  |
|  | 🟢 Green  |  🟡 Yellow  |  🔴 Red   | |
|  +------------------------------------+  |
|                                          |
|  Refrigerant Type                        |
|  +------------------------------------+  |
|  | [▼] R-134a                         |  |
|  +------------------------------------+  |
|                                          |
|  Charge (lbs)                            |
|  +------------------------------------+  |
|  |  Current: [____] Nameplate: 850    |  |
|  +------------------------------------+  |
|                                          |
|  Pressures (PSIG)                        |
|  +------------------+------------------+ |
|  | Suction: [____]  | Discharge:[____]| |
|  +------------------+------------------+ |
|                                          |
|  Acid Test Passed?                       |
|  +------------------+------------------+ |
|  |       YES        |       NO         | |
|  +------------------+------------------+ |
|                                          |
|  +------------------------------------+  |
|  |              Next Step              |  |
|  +------------------------------------+  |
+------------------------------------------+
```

**Required Fields**:
| Field | Type | UI Component | Critical? |
|-------|------|--------------|-----------|
| leak_detected | boolean | Toggle button pair (NO/YES) | Yes (blocks submit if null) |
| leak_location_code | enum | Radio list (conditional) | Yes if leak_detected |
| sight_glass_condition | enum | Radio grid | No |
| moisture_indicator_color | enum | Color button trio | No |
| refrigerant_type | enum | Select dropdown | No |
| charge_lbs | numeric | Number input with stepper | No |
| suction_pressure_psig | numeric | Number input | No |
| discharge_pressure_psig | numeric | Number input | No |
| acid_test_passed | boolean | Toggle button pair | No |

**Skip Reason Codes**:
- `not_applicable`: Equipment not running
- `deferred`: Will complete on follow-up visit
- `access_issue`: Cannot access components

---

### Screen 3: Oil System

**Purpose**: Document oil condition, sample collection, and lab results.

**Layout** (Mobile):
```text
+------------------------------------------+
|  [<] Oil System                [Skip ▼]  |
+------------------------------------------+
| Progress: ●●●○○○○○○  Step 3 of 9         |
+------------------------------------------+
|                                          |
|  Oil Level                               |
|  +------------------------------------+  |
|  |         [========|--]  75%         |  |
|  +------------------------------------+  |
|  0%                                 100% |
|                                          |
|  Oil Type                                |
|  +------------------------------------+  |
|  | ○ POE  ○ Mineral  ○ Alkylbenzene   |  |
|  +------------------------------------+  |
|                                          |
|  Oil Appearance                          |
|  +------------------------------------+  |
|  | ○ Clear    ○ Hazy                  |  |
|  | ○ Dark     ○ Contaminated          |  |
|  +------------------------------------+  |
|                                          |
|  Sample Collected?                       |
|  +------------------+------------------+ |
|  |       NO         |       YES        | |
|  +------------------+------------------+ |
|                                          |
|  [Conditional: Lab Results Available]    |
|  Acid Number (mg KOH/g)                  |
|  +------------------------------------+  |
|  | [____] 0.05    [⚠ Threshold: 0.05] |  |
|  +------------------------------------+  |
|                                          |
|  Wear Metals (ppm)                       |
|  +------------+------------+------------+|
|  | Iron       | Copper     | Aluminum  ||
|  | [____]     | [____]     | [____]    ||
|  +------------+------------+------------+|
|                                          |
|  Oil Changed?                            |
|  +------------------+------------------+ |
|  |       NO         |       YES        | |
|  +------------------+------------------+ |
|                                          |
|  Oil Filter Replaced?                    |
|  +------------------+------------------+ |
|  |       NO         |       YES        | |
|  +------------------+------------------+ |
|                                          |
|  +------------------------------------+  |
|  |              Next Step              |  |
|  +------------------------------------+  |
+------------------------------------------+
```

**Required Fields**:
| Field | Type | UI Component | Triggers Risk? |
|-------|------|--------------|----------------|
| current_level_pct | numeric | Slider (0-100) | No |
| oil_type | enum | Radio buttons | No |
| appearance | enum | Radio grid | No |
| sample_collected | boolean | Toggle pair | No |
| acid_number_mgkoh_g | numeric | Number input | YES (+30 if > 0.05) |
| iron_ppm | numeric | Number input | No |
| copper_ppm | numeric | Number input | No |
| oil_changed | boolean | Toggle pair | No |
| oil_filter_replaced | boolean | Toggle pair | No |

**Auto-Calculations**:
- If acid_number > 0.05, show warning badge "HIGH ACID"

---

### Screen 4: Tube Inspection (Evaporator/Condenser)

**Purpose**: Document tube bundle condition with separate paths for evaporator and condenser.

**Layout** (Mobile):
```text
+------------------------------------------+
|  [<] Tube Inspection           [Skip ▼]  |
+------------------------------------------+
| Progress: ●●●●○○○○○  Step 4 of 9         |
+------------------------------------------+
|                                          |
|  Select Bundle                           |
|  +------------------+------------------+ |
|  |    EVAPORATOR    |    CONDENSER     | |
|  |   [selected]     |                  | |
|  +------------------+------------------+ |
|                                          |
|  [Tab: EVAPORATOR]                       |
|                                          |
|  Total Tubes: [____]  Plugged: [____]    |
|  Calculated: 3.5% plugged                |
|  +------------------------------------+  |
|  | [========|---------------] 3.5%    |  |
|  +------------------------------------+  |
|  Threshold: 5%  [✓ PASS]                 |
|                                          |
|  Test Method                             |
|  +------------------------------------+  |
|  | ○ Eddy Current   ○ Ultrasonic      |  |
|  | ○ Visual         ○ Pressure Test   |  |
|  +------------------------------------+  |
|                                          |
|  Wall Thickness (mils)                   |
|  +------------------+------------------+ |
|  | Min: [____]      | Avg: [____]      | |
|  +------------------+------------------+ |
|  Original: 49 mils                       |
|                                          |
|  Fouling Severity                        |
|  +------------------------------------+  |
|  | ○ None  ○ Light  ○ Moderate        |  |
|  | ○ Heavy  ○ Severe                  |  |
|  +------------------------------------+  |
|                                          |
|  Tubes Cleaned?                          |
|  +------------------+------------------+ |
|  |       NO         |       YES        | |
|  +------------------+------------------+ |
|                                          |
|  [If YES] Cleaning Method                |
|  +------------------------------------+  |
|  | ○ Mechanical  ○ Chemical  ○ Hydro  |  |
|  +------------------------------------+  |
|                                          |
|  Waterbox Condition                      |
|  +------------------------------------+  |
|  | ○ Good  ○ Fair  ○ Poor  ○ Repair   |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |        Add Condenser Data          |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |              Next Step              |  |
|  +------------------------------------+  |
+------------------------------------------+
```

**Required Fields**:
| Field | Type | UI Component | Triggers Risk? |
|-------|------|--------------|----------------|
| bundle_type | enum | Toggle tabs | Required |
| tube_count_total | int | Number input | No |
| tubes_plugged_total | int | Number input | No |
| plugged_pct | numeric | Auto-calculated + progress bar | YES (+30 if > 5%) |
| test_method | enum | Radio grid | No |
| min_wall_thickness_mils | numeric | Number input | No |
| wall_loss_pct | numeric | Auto-calculated | YES (+25 if > 20%) |
| fouling_severity | enum | Radio buttons | No |
| tubes_cleaned | boolean | Toggle pair | No |
| cleaning_method | enum | Radio buttons (conditional) | No |
| waterbox_condition | enum | Radio buttons | No |

**Auto-Calculations**:
```text
plugged_pct = (tubes_plugged_total / tube_count_total) * 100
wall_loss_pct = ((original_wall_thickness - min_wall_thickness) / original_wall_thickness) * 100
```

---

### Screen 5: Water Side + Water Quality

**Purpose**: Document water flow parameters and water chemistry.

**Layout** (Mobile):
```text
+------------------------------------------+
|  [<] Water System              [Skip ▼]  |
+------------------------------------------+
| Progress: ●●●●●○○○○  Step 5 of 9         |
+------------------------------------------+
|                                          |
|  Select Water Loop                       |
|  +------------------+------------------+ |
|  |  CHILLED WATER   | CONDENSER WATER  | |
|  +------------------+------------------+ |
|                                          |
|  --- FLOW & TEMPERATURES ---             |
|                                          |
|  Flow Rate (GPM)                         |
|  +------------------+------------------+ |
|  | Actual: [____]   | Design: 2400     | |
|  +------------------+------------------+ |
|                                          |
|  Water Temps (°F)                        |
|  +------------------+------------------+ |
|  | Entering: [____] | Leaving: [____]  | |
|  +------------------+------------------+ |
|  Calculated ΔT: 10.5°F                   |
|                                          |
|  Strainer Cleaned?                       |
|  +------------------+------------------+ |
|  |       NO         |       YES        | |
|  +------------------+------------------+ |
|                                          |
|  --- WATER QUALITY ---                   |
|                                          |
|  pH Level                                |
|  +------------------------------------+  |
|  |         [========|--]  7.8         |  |
|  +------------------------------------+  |
|  6.5                                 9.0 |
|                                          |
|  Conductivity (μmhos)                    |
|  +------------------------------------+  |
|  | [________]                         |  |
|  +------------------------------------+  |
|                                          |
|  Legionella Detected?                    |
|  +------------------+------------------+ |
|  |       NO         |  ⚠️ YES         | |
|  +------------------+------------------+ |
|  [Warning: +40 risk points if YES]       |
|                                          |
|  Within Treatment Spec?                  |
|  +------------------+------------------+ |
|  |       NO         |       YES        | |
|  +------------------+------------------+ |
|                                          |
|  +------------------------------------+  |
|  |              Next Step              |  |
|  +------------------------------------+  |
+------------------------------------------+
```

**Required Fields**:
| Field | Type | UI Component | Triggers Risk? |
|-------|------|--------------|----------------|
| water_loop | enum | Toggle tabs | Required |
| flow_rate_gpm | numeric | Number input | No |
| entering_water_temp_f | numeric | Number input | No |
| leaving_water_temp_f | numeric | Number input | No |
| strainer_cleaned | boolean | Toggle pair | No |
| ph | numeric | Slider with labels (6.5-9.0) | No |
| conductivity_umhos | numeric | Number input | No |
| legionella_detected | boolean | Toggle pair with warning | YES (+40 if true) |
| within_spec | boolean | Toggle pair | No |

**Auto-Calculations**:
```text
delta_t_f = leaving_water_temp_f - entering_water_temp_f
```

---

### Screen 6: Electrical

**Purpose**: Document motor electrical readings and safety checks.

**Layout** (Mobile):
```text
+------------------------------------------+
|  [<] Electrical Check          [Skip ▼]  |
+------------------------------------------+
| Progress: ●●●●●●○○○  Step 6 of 9         |
+------------------------------------------+
|                                          |
|  Component                               |
|  +------------------------------------+  |
|  | ○ Main Motor  ○ Oil Pump  ○ VFD    |  |
|  +------------------------------------+  |
|                                          |
|  --- VOLTAGE READINGS ---                |
|                                          |
|  3-Phase Voltage (V)                     |
|  +----------+----------+----------+      |
|  |  L1-L2   |  L2-L3   |  L3-L1   |      |
|  | [_____]  | [_____]  | [_____]  |      |
|  +----------+----------+----------+      |
|                                          |
|  Calculated Imbalance: 0.57%             |
|  +------------------------------------+  |
|  | [==|--------------------] 0.57%    |  |
|  +------------------------------------+  |
|  Threshold: 2%  [✓ PASS]                 |
|                                          |
|  --- AMPERAGE READINGS ---               |
|                                          |
|  3-Phase Amps                            |
|  +----------+----------+----------+      |
|  |    L1    |    L2    |    L3    |      |
|  | [_____]  | [_____]  | [_____]  |      |
|  +----------+----------+----------+      |
|                                          |
|  --- MOTOR HEALTH ---                    |
|                                          |
|  Insulation Resistance (MΩ)              |
|  +------------------------------------+  |
|  | [________]  Min required: 1 MΩ     |  |
|  +------------------------------------+  |
|                                          |
|  Vibration Acceptable?                   |
|  +------------------+------------------+ |
|  |       YES        |       NO         | |
|  +------------------+------------------+ |
|                                          |
|  Starter Condition                       |
|  +------------------------------------+  |
|  | ○ Operational  ○ Worn Contacts     |  |
|  | ○ Overheating  ○ Needs Replace     |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |              Next Step              |  |
|  +------------------------------------+  |
+------------------------------------------+
```

**Required Fields**:
| Field | Type | UI Component | Triggers Risk? |
|-------|------|--------------|----------------|
| component | enum | Radio buttons | Required |
| voltage_l1_l2 | numeric | Number input | No |
| voltage_l2_l3 | numeric | Number input | No |
| voltage_l3_l1 | numeric | Number input | No |
| voltage_imbalance_pct | numeric | Auto-calculated + bar | YES (+20 if > 2%) |
| amperage_l1/l2/l3 | numeric | Number inputs | No |
| insulation_resistance_megohms | numeric | Number input | YES (+20 if < 1) |
| vibration_acceptable | boolean | Toggle pair | No |
| starter_condition | enum | Radio grid | No |

**Auto-Calculations**:
```text
avg_voltage = (L1L2 + L2L3 + L3L1) / 3
max_deviation = MAX(|L1L2 - avg|, |L2L3 - avg|, |L3L1 - avg|)
voltage_imbalance_pct = (max_deviation / avg_voltage) * 100
```

---

### Screen 7: Performance Test

**Purpose**: Document operating efficiency and capacity measurements.

**Layout** (Mobile):
```text
+------------------------------------------+
|  [<] Performance Test          [Skip ▼]  |
+------------------------------------------+
| Progress: ●●●●●●●○○  Step 7 of 9         |
+------------------------------------------+
|                                          |
|  Test Date                               |
|  +------------------------------------+  |
|  | [📅]  Feb 2, 2026  @ 14:30         |  |
|  +------------------------------------+  |
|                                          |
|  Load %                                  |
|  +------------------------------------+  |
|  |         [========|--]  75%         |  |
|  +------------------------------------+  |
|  0%                                 100% |
|                                          |
|  --- WATER TEMPERATURES ---              |
|                                          |
|  Chilled Water (°F)                      |
|  +------------------+------------------+ |
|  | Supply: [_____]  | Return: [_____]  | |
|  +------------------+------------------+ |
|  ΔT: 10.5°F                              |
|                                          |
|  Condenser Water (°F)                    |
|  +------------------+------------------+ |
|  | Supply: [_____]  | Return: [_____]  | |
|  +------------------+------------------+ |
|                                          |
|  CHW Flow (GPM): [________]              |
|                                          |
|  --- EFFICIENCY METRICS ---              |
|                                          |
|  kW Input                                |
|  +------------------------------------+  |
|  | [________]                         |  |
|  +------------------------------------+  |
|                                          |
|  Tons (Actual)                           |
|  +------------------------------------+  |
|  | [________]  or [Calculate from ΔT] |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |  CALCULATED: 0.553 kW/ton          |  |
|  |  Design: 0.520 kW/ton              |  |
|  |  Variance: +6.3%  [✓ OK]           |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |              Next Step              |  |
|  +------------------------------------+  |
+------------------------------------------+
```

**Required Fields**:
| Field | Type | UI Component | Triggers Risk? |
|-------|------|--------------|----------------|
| test_date | datetime | Date-time picker | No |
| load_pct | numeric | Slider (0-100) | No |
| chilled_water_supply_f | numeric | Number input | No |
| chilled_water_return_f | numeric | Number input | No |
| condenser_water_supply_f | numeric | Number input | No |
| condenser_water_return_f | numeric | Number input | No |
| chw_flow_gpm | numeric | Number input | No |
| kw_input | numeric | Number input | No |
| tons_actual | numeric | Number input OR auto-calc | No |
| kw_per_ton | numeric | Auto-calculated | YES (+15 if >10% YoY) |

**Auto-Calculations**:
```text
chw_delta_t_f = chilled_water_return_f - chilled_water_supply_f
tons_actual = chw_flow_gpm * chw_delta_t_f * 0.04165
kw_per_ton = kw_input / tons_actual
degradation_pct = ((current_kw_per_ton - prior_year_kw_per_ton) / prior_year_kw_per_ton) * 100
```

---

### Screen 8: Findings + Photos

**Purpose**: Document issues discovered with photo evidence.

**Layout** (Mobile):
```text
+------------------------------------------+
|  [<] Findings & Photos         [Skip ▼]  |
+------------------------------------------+
| Progress: ●●●●●●●●○  Step 8 of 9         |
+------------------------------------------+
|                                          |
|  [Auto-Generated Findings from Risk]     |
|  +------------------------------------+  |
|  | ⚠️ REF002 - Refrigerant Leak       |  |
|  |    Severity: HIGH                  |  |
|  |    [Edit] [+ Add Photo]            |  |
|  +------------------------------------+  |
|  | ⚠️ OIL002 - High Acid Number       |  |
|  |    Severity: HIGH                  |  |
|  |    [Edit] [+ Add Photo]            |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |      + Add Manual Finding          |  |
|  +------------------------------------+  |
|                                          |
|  [Add Finding Modal]                     |
|  +------------------------------------+  |
|  | Issue Code                         |  |
|  | [▼] Select from list...            |  |
|  |                                    |  |
|  | Category: Refrigerant              |  |
|  |                                    |  |
|  | Severity                           |  |
|  | ○ Low  ○ Medium  ○ High  ○ Critical|  |
|  |                                    |  |
|  | Description                        |  |
|  | [________________________]         |  |
|  | [________________________]         |  |
|  |                                    |  |
|  | Photos                             |  |
|  | +------+ +------+ +------+         |  |
|  | |[📷]  | |[img] | |[+]   |         |  |
|  | |Take  | |      | |Add   |         |  |
|  | +------+ +------+ +------+         |  |
|  |                                    |  |
|  | Recommended Action                 |  |
|  | [________________________]         |  |
|  |                                    |  |
|  | [         Save Finding         ]   |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |              Next Step              |  |
|  +------------------------------------+  |
+------------------------------------------+
```

**Required Fields**:
| Field | Type | UI Component | Required? |
|-------|------|--------------|-----------|
| issue_code | enum | Searchable select | Yes for new findings |
| severity | enum | Radio buttons | Yes |
| description | text | Textarea (max 500 chars) | Yes |
| photos | file[] | Camera/gallery picker | No |
| recommended_action | text | Text input | No |

**Photo Upload Flow**:
1. Tap camera icon to open device camera
2. Tap gallery icon to select from photos
3. Photos stored locally in IndexedDB until sync
4. Each photo gets caption field
5. Mark one photo as "primary" for the finding

---

### Screen 9: Review + Submit

**Purpose**: Final review showing risk score, red flags, and recommended action.

**Layout** (Mobile):
```text
+------------------------------------------+
|  [<] Review & Submit                     |
+------------------------------------------+
| Progress: ●●●●●●●●●  Step 9 of 9         |
+------------------------------------------+
|                                          |
|  +------------------------------------+  |
|  |         RISK SCORE: 55             |  |
|  |                                    |  |
|  |    +------------------------+      |  |
|  |    |████████████░░░░░░░░░░░|      |  |
|  |    +------------------------+      |  |
|  |    0     30     60     100         |  |
|  |                                    |  |
|  |    Risk Level: CRITICAL 🔴         |  |
|  +------------------------------------+  |
|                                          |
|  Recommended Action                      |
|  +------------------------------------+  |
|  | ⚠️ CRITICAL: Take chiller offline  |  |
|  |    for repair                      |  |
|  +------------------------------------+  |
|                                          |
|  Red Flags                               |
|  +------------------------------------+  |
|  | 🔴 Refrigerant Leak (+25)          |  |
|  | 🔴 Oil Acid Fail (+30)             |  |
|  +------------------------------------+  |
|                                          |
|  Score Breakdown                         |
|  +------------------------------------+  |
|  | Refrigerant Leak     +25           |  |
|  | Tube Plugs            0            |  |
|  | Oil Acid             +30           |  |
|  | Voltage Imbalance     0            |  |
|  | Efficiency             0           |  |
|  +------------------------------------+  |
|                                          |
|  Sections Completed                      |
|  +------------------------------------+  |
|  | ✓ Refrigerant  ✓ Oil  ✓ Tubes      |  |
|  | ✓ Water  ✓ Electrical  ✓ Perf      |  |
|  | ⚠ Findings (2 open)                |  |
|  +------------------------------------+  |
|                                          |
|  Sections Skipped                        |
|  +------------------------------------+  |
|  | None                               |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |      Submit Inspection              |  |
|  |    (Requires: Leak + Severity)     |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |      Save as Draft                  |  |
|  +------------------------------------+  |
+------------------------------------------+
```

**Validation Before Submit**:
| Validation Rule | Blocks Submit? |
|-----------------|----------------|
| Equipment not selected | Yes |
| Technician not selected | Yes |
| No inspection date | Yes |
| Leak detected but no location | Yes |
| Critical findings with no photo | Warning only |
| All sections skipped | Yes (at least 1 required) |

**Submit Actions**:
1. If online: Sync to Supabase immediately
2. If offline: Store in IndexedDB, show sync indicator
3. Update `annual_chiller_pm.status` to `pending_review`
4. Save calculated risk score to `overall_risk_score`
5. Auto-generate findings from red flags if not already present

---

## Offline Capability

### Data Storage (IndexedDB)

**New Stores for Chiller Annuals**:
```text
chiller_annual_drafts
  - id: string (UUID)
  - equipment_id: string
  - created_at: string
  - updated_at: string
  - current_step: number (1-9)
  - form_data: object (all inspection data)
  - synced: boolean
  - skip_reasons: object { step_number: reason_code }

chiller_annual_photos
  - id: string (UUID)
  - draft_id: string (FK to drafts)
  - finding_number: number
  - photo_blob: Blob
  - caption: string
  - is_primary: boolean
  - synced: boolean
```

### Offline Workflow:
1. On wizard start: Cache equipment list and reference data
2. Auto-save to IndexedDB on every field change
3. Resume from last step if app closes
4. Show offline indicator in header
5. Queue photos for upload when online
6. Sync entire inspection when connectivity restored

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/chiller-annuals/wizard/ChillerInspectionWizard.tsx` | Main wizard orchestrator |
| `src/components/chiller-annuals/wizard/WizardProgress.tsx` | Progress bar component |
| `src/components/chiller-annuals/wizard/WizardNavigation.tsx` | Back/Next/Skip buttons |
| `src/components/chiller-annuals/wizard/SkipReasonDialog.tsx` | Skip reason selection dialog |
| `src/components/chiller-annuals/wizard/steps/Step1AssetSelection.tsx` | Screen 1 |
| `src/components/chiller-annuals/wizard/steps/Step2Refrigerant.tsx` | Screen 2 |
| `src/components/chiller-annuals/wizard/steps/Step3OilSystem.tsx` | Screen 3 |
| `src/components/chiller-annuals/wizard/steps/Step4TubeInspection.tsx` | Screen 4 |
| `src/components/chiller-annuals/wizard/steps/Step5WaterSystem.tsx` | Screen 5 |
| `src/components/chiller-annuals/wizard/steps/Step6Electrical.tsx` | Screen 6 |
| `src/components/chiller-annuals/wizard/steps/Step7Performance.tsx` | Screen 7 |
| `src/components/chiller-annuals/wizard/steps/Step8Findings.tsx` | Screen 8 |
| `src/components/chiller-annuals/wizard/steps/Step9Review.tsx` | Screen 9 |
| `src/components/chiller-annuals/wizard/components/ToggleButtonPair.tsx` | Reusable YES/NO toggle |
| `src/components/chiller-annuals/wizard/components/NumberStepper.tsx` | +/- number input |
| `src/components/chiller-annuals/wizard/components/PhotoCapture.tsx` | Camera/gallery picker |
| `src/components/chiller-annuals/wizard/components/RiskScoreDisplay.tsx` | Score visualization |
| `src/hooks/useChillerWizardForm.ts` | Form state management hook |
| `src/hooks/useChillerOfflineStorage.ts` | IndexedDB operations hook |
| `src/services/chillerOfflineService.ts` | Offline storage service |

---

## Validation Summary

### Fields That Block Submission (Critical):
1. `equipment_id` - Must select a chiller
2. `inspection_date` - Must have valid date
3. `technician_id` - Must assign lead technician
4. `leak_detected` - Must answer YES or NO
5. `leak_location_code` - Required if leak detected
6. At least 1 section must be completed (cannot skip all)

### Fields That Trigger Risk Score:
| Field | Condition | Points | Red Flag |
|-------|-----------|--------|----------|
| `leak_detected` | = true | +25 | REFRIGERANT_LEAK |
| `plugged_pct` | > 5% | +30 | TUBE_PLUGS_EXCEEDED |
| `acid_number_mgkoh_g` | > 0.05 | +30 | OIL_ACID_FAIL |
| `voltage_imbalance_pct` | > 2% | +20 | VOLTAGE_IMBALANCE |
| `kw_per_ton` YoY | > 10% increase | +15 | EFFICIENCY_DEGRADED |
| `legionella_detected` | = true | +40 | LEGIONELLA_DETECTED |
| `insulation_resistance_megohms` | < 1 | +20 | LOW_INSULATION |
| `wall_loss_pct` | > 20% | +25 | TUBE_WALL_LOSS_CRITICAL |

---

## Error Handling

| Scenario | User Message | Recovery Action |
|----------|--------------|-----------------|
| No chillers in equipment list | "No chillers found. Add equipment first." | Link to Equipment page |
| Duplicate annual PM for year | "This chiller already has a 2026 inspection. Continue editing?" | Open existing or create new |
| Photo upload fails | "Photo saved locally. Will upload when online." | Queue in IndexedDB |
| Form validation error | Field-specific inline error message | Highlight field, scroll to it |
| Sync fails after submit | "Inspection saved offline. Will sync automatically." | Show in OfflineIndicator |
| Session expired | "Please log in again to continue." | Save draft, redirect to login |

