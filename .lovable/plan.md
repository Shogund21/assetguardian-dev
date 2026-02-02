

# Add Oil Level and Compressor Vibration Checks for Chiller Maintenance

## Overview

Add two checks to the chiller maintenance form:
1. **Oil Level Status** - Already exists in the form but is not displayed in the maintenance details view
2. **Compressor Vibration** - New field that needs to be added throughout the system

---

## Current State

| Check | Form Field | Database Column | Details Display |
|-------|-----------|-----------------|-----------------|
| Oil Level Status | Exists (line 430-451) | `oil_level_status` (text) | Not shown for chillers |
| Compressor Vibration | Does not exist | Does not exist | N/A |

---

## Changes Required

### 1. Database Migration (New Column)

Add a new `compressor_vibration` column to store vibration readings:

```sql
ALTER TABLE hvac_maintenance_checks 
ADD COLUMN IF NOT EXISTS compressor_vibration text;

COMMENT ON COLUMN hvac_maintenance_checks.compressor_vibration IS 'Compressor vibration status: normal, slight, excessive';
```

---

### 2. Form Schema Update

**File:** `src/components/maintenance/form/hooks/schema/maintenanceFormSchema.ts`

Add new field for compressor vibration (around line 104, after other compressor fields):

```typescript
// Add to compressor fields section
compressor_vibration: z.string().optional(),
```

---

### 3. Compressor Form Fields Update

**File:** `src/components/maintenance/form/ComprehensiveChillerFields.tsx`

Add Compressor Vibration field after the Oil Level Status field (after line 524):

```typescript
<FormField
  control={form.control}
  name="compressor_vibration"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Compressor Vibration</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select vibration level" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="normal">Normal</SelectItem>
          <SelectItem value="slight">Slight Vibration</SelectItem>
          <SelectItem value="excessive">Excessive Vibration</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

### 4. Data Mapper Update

**File:** `src/components/maintenance/form/hooks/mappers/chillerDataMapper.ts`

Add mapping for the new field (in the compressor fields section around line 37):

```typescript
// Add to compressor fields
compressor_vibration: processField(values.compressor_vibration),
```

---

### 5. Details Display Update

**File:** `src/components/maintenance/details/EnhancedMaintenanceDetails.tsx`

Update the `getEquipmentConditions()` function to include both fields for chillers (around line 227):

```typescript
case 'chiller':
  addCondition("Evaporator Condition", check.evaporator_condition);
  addCondition("Condenser Condition", check.condenser_condition);
  addCondition("Compressor Condition", check.compressor_condition);
  addCondition("Motor Condition", check.motor_condition);
  addCondition("Control System", check.control_system_status);
  addCondition("Oil Level", check.oil_level_status);  // Add this line
  addCondition("Compressor Vibration", check.compressor_vibration);  // Add this line
  break;
```

---

## Summary of Files to Modify

| File | Change |
|------|--------|
| Database Migration | Add `compressor_vibration` column |
| `maintenanceFormSchema.ts` | Add `compressor_vibration` field |
| `ComprehensiveChillerFields.tsx` | Add Compressor Vibration form field in Compressor tab |
| `chillerDataMapper.ts` | Map `compressor_vibration` to database |
| `EnhancedMaintenanceDetails.tsx` | Display Oil Level and Compressor Vibration in conditions |

---

## Result

After implementation:
- Technicians can select Oil Level Status (already in form) and Compressor Vibration (new dropdown) when completing chiller maintenance
- Both fields will be visible when viewing completed maintenance check details
- Print/export will include both values

