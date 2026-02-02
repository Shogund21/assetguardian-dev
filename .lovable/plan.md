
# Fix: Maintenance Check Readings Not Displayed

## Problem Identified

When viewing a completed maintenance check, all the readings (temperature, pressure, motor data) show as "Not Checked" even though the data exists in the database.

### Root Cause

The `fetchMaintenanceChecks` function in `MaintenanceHistory.tsx` fetches ALL data from the database (using `SELECT *`), but then **only maps a tiny subset of fields** to the check object:

| What's Fetched | What's Mapped |
|----------------|---------------|
| All 50+ fields from database | Only ~15 fields |
| Temperature readings | ❌ Lost in transformation |
| Pressure readings | ❌ Lost in transformation |
| Motor data | ❌ Lost in transformation |
| Compressor data | ❌ Lost in transformation |

The database query at line 43-72 returns complete data, but the transformation at lines 92-133 explicitly constructs a new object with only these fields:
- `id`, `equipment_id`, `technician_id`, `check_date`, `status`, `equipment_type`, `notes`
- `equipment`, `technician`, `selectedLocation` (from JOINs)
- `air_filter_status`, `belt_condition`, `motor_condition`, `control_system_status`
- `maintenance_frequency`, `company_id`, `location_id`, `created_at`, `updated_at`

**All chiller readings (evaporator temps, condenser temps, compressor temps, motor amperage, etc.) are discarded.**

---

## Solution

Modify the data transformation to **spread all database fields** instead of manually cherry-picking a few fields. This ensures any field stored in the database will be available for display.

### Technical Changes

**File: `src/components/maintenance/MaintenanceHistory.tsx`**

Update the `transformedData` mapping (around line 89-133) to spread the entire `item` object and then override with the properly formatted relationship data:

**Current code (problematic):**
```typescript
const check: MaintenanceCheck = {
  id: item.id,
  equipment_id: item.equipment_id,
  technician_id: item.technician_id,
  // ... only a few fields explicitly listed
  air_filter_status: item.air_filter_status,
  belt_condition: item.belt_condition,
  motor_condition: item.motor_condition,
  control_system_status: item.control_system_status,
  // Missing: evaporator_leaving_water_temp, compressor_suction_temp, etc.
};
```

**Fixed code:**
```typescript
const check: MaintenanceCheck = {
  ...item, // Spread ALL database fields first
  // Override relationship objects with properly formatted versions
  equipment: item.equipment ? {
    name: item.equipment.name,
    location: item.equipment.location,
    type: item.equipment.type
  } : undefined,
  technician: item.technician ? {
    firstName: item.technician.firstName,
    lastName: item.technician.lastName
  } : undefined,
  location: item.location ? {
    name: item.location.name,
    store_number: item.location.store_number
  } : undefined,
};
```

This ensures:
1. All scalar fields from the database are preserved (temperatures, pressures, conditions, etc.)
2. Relationship objects (equipment, technician, location) are properly formatted to match the TypeScript interface
3. Any new fields added to the database will automatically be available in the UI

---

## Summary

| Change | Description |
|--------|-------------|
| `MaintenanceHistory.tsx` | Replace explicit field mapping with spread operator to include all fields |

This is a one-file fix that will immediately show all the chiller readings (and other equipment type readings) that are currently being lost during data transformation.
