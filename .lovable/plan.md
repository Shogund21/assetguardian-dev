

# Fix: Add Oil Level Status Mapping for Chiller Maintenance

## Problem Identified

The `oil_level_status` field exists in the form for chillers, but it's **not being saved to the database** because:

| Component | Status |
|-----------|--------|
| Form Schema | ✅ Exists |
| Form Field | ✅ Exists in ComprehensiveChillerFields.tsx |
| Details Display | ✅ Added in previous change |
| **Data Mapper** | ❌ **Missing from chillerDataMapper.ts** |

The `standardEquipmentMapper.ts` includes `oil_level_status` (line 24), but it **skips chillers** (line 10). The `chillerDataMapper.ts` handles all chiller-specific mappings but doesn't include `oil_level_status`.

---

## Solution

Add `oil_level_status` to the chiller data mapper.

---

## Technical Change

**File:** `src/components/maintenance/form/hooks/mappers/chillerDataMapper.ts`

Add the oil level status mapping in the compressor fields section (after line 37):

```typescript
// Compressor fields
compressor_suction_temp: processNumberField(values.evap_sat_rfgt_temp),
compressor_discharge_temp: processNumberField(values.compressor_refrigerant_discharge_temp),
compressor_suction_pressure: processNumberField(values.evap_rfgt_pressure),
compressor_discharge_pressure: processNumberField(values.cond_rfgt_pressure),
compressor_superheat: processNumberField(values.differential_refrigerant_pressure),
compressor_subcooling: processNumberField(values.cond_sat_rfgt_temp),
compressor_oil_pressure: processNumberField(values.oil_differential_pressure),
compressor_oil_temp: processNumberField(values.oil_tank_pressure),
compressor_condition: processField(values.compressor_running_status),
compressor_vibration: processField(values.compressor_vibration),
oil_level_status: processField(values.oil_level_status),  // <-- ADD THIS LINE
```

---

## Summary

| File | Change |
|------|--------|
| `chillerDataMapper.ts` | Add `oil_level_status: processField(values.oil_level_status)` to compressor fields section |

This single-line fix ensures the oil level status selected in the chiller maintenance form is properly saved to the database.

