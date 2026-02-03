

# Fix Annual Chiller PM Wizard Issues

## Overview

This plan addresses four issues reported by the user in the Annual Chiller PM wizard:

1. **Add R-11 to refrigerant type list** - Simple addition to the REFRIGERANT_TYPES array
2. **Treatment Vendor input not working** - The field uses NumberStepper (a numeric-only component) instead of a text Input
3. **Step 6 shows "Coming Soon"** - The Electrical step (Step 6) needs to be implemented
4. **Submit button doesn't save to database** - The wizard only saves to IndexedDB (offline storage) but never syncs to Supabase

---

## Issue 1: Add R-11 to Refrigerant Type List

**File**: `src/components/chiller-annuals/wizard/steps/Step2Refrigerant.tsx`

**Current** (lines 51-60):
```typescript
const REFRIGERANT_TYPES = [
  'R-134a',
  'R-123',
  'R-1233zd',
  'R-514A',
  'R-22',
  'R-410A',
  'R-407C',
  'Other',
];
```

**Change**: Add `'R-11'` to the list (typically between R-123 and R-1233zd for logical ordering of older CFC/HCFC types).

---

## Issue 2: Fix Treatment Vendor Input

**File**: `src/components/chiller-annuals/wizard/steps/Step5WaterSystem.tsx`

**Problem**: The Treatment Vendor field (lines 212-221) incorrectly uses `NumberStepper` component which is designed for numeric input only. Text input is being ignored.

**Current Code**:
```tsx
{/* Treatment Vendor */}
<div className="space-y-2">
  <Label>Treatment Vendor</Label>
  <NumberStepper
    value={null}
    onChange={() => {}}  // Empty handler - nothing happens!
    showButtons={false}
    placeholder="Enter vendor name..."
  />
</div>
```

**Fix**: Replace `NumberStepper` with a standard `Input` component and wire it to `updateWaterQuality`:

```tsx
{/* Treatment Vendor */}
<div className="space-y-2">
  <Label>Treatment Vendor</Label>
  <Input
    value={quality.treatment_vendor || ''}
    onChange={(e) => updateWaterQuality('treatment_vendor', e.target.value)}
    placeholder="Enter vendor name..."
    className="min-h-[48px]"
  />
</div>
```

**Import needed**: Add `Input` to the imports from `@/components/ui/input`.

---

## Issue 3: Implement Step 6 - Electrical Inspection

**File**: `src/components/chiller-annuals/wizard/ChillerInspectionWizard.tsx`

**Problem**: Steps 6-9 all show "Coming soon" placeholder (lines 121-129).

**Solution**: Create a new `Step6Electrical.tsx` component and render it in the wizard.

### New File: `src/components/chiller-annuals/wizard/steps/Step6Electrical.tsx`

This component will capture electrical inspection data for the main motor (and optionally oil pump/VFD):

| Field | Type | Component |
|-------|------|-----------|
| Voltage L1-L2 | number | NumberStepper |
| Voltage L2-L3 | number | NumberStepper |
| Voltage L3-L1 | number | NumberStepper |
| Voltage Imbalance % | number (auto-calculated) | Display badge |
| Amperage L1, L2, L3 | number | NumberStepper |
| Insulation Resistance | number (MΩ) | NumberStepper |
| Vibration Acceptable | boolean | ToggleButtonPair |
| Starter Condition | select | Select dropdown |
| Notes | text | Textarea |

The component will:
- Display a tabbed interface for Main Motor (required), Oil Pump (optional), VFD (optional)
- Auto-calculate voltage imbalance % using the existing `calculateVoltageImbalance` utility
- Show risk warning if voltage imbalance > 2% (+20 risk points)
- Show risk warning if insulation resistance < 1 MΩ (+20 risk points)

### Update Wizard to Render Step 6

**File**: `src/components/chiller-annuals/wizard/ChillerInspectionWizard.tsx`

Add import and render case for Step 6:

```tsx
import { Step6Electrical } from './steps/Step6Electrical';

// In renderStep():
case 6:
  return (
    <Step6Electrical
      formData={formData}
      updateElectrical={updateElectrical}
    />
  );
```

---

## Issue 4: Submit Button Not Saving to Supabase

**Root Cause**: The current submit flow only saves to IndexedDB (offline storage) via `saveDraft()`. There is no sync service that uploads the data to Supabase's `annual_chiller_pm` table.

**Current Flow**:
```
Submit Button → saveDraft() → IndexedDB only → Navigate away
```

**Required Flow**:
```
Submit Button → saveDraft() → syncToSupabase() → annual_chiller_pm table → Navigate away
```

### Solution: Create a Sync Service

**New File**: `src/services/chillerSyncService.ts`

This service will:
1. Take the form data from IndexedDB
2. Transform it into the database schema format
3. Insert/upsert into `annual_chiller_pm` table
4. Insert related data into child tables (`chiller_refrigerant_inspection`, `chiller_oil_analysis`, `chiller_tube_inspection`, `chiller_water_side`, `chiller_water_quality`, `chiller_electrical_check`, `chiller_performance_test`)
5. Mark the draft as synced

```typescript
interface ChillerSyncService {
  syncDraft(draftId: string, companyId: string): Promise<{success: boolean, pmId?: string, error?: string}>;
}
```

### Update Submit Handler

**File**: `src/components/chiller-annuals/wizard/ChillerInspectionWizard.tsx`

Update `handleSubmit` to:
1. Save draft to IndexedDB
2. Sync to Supabase
3. Invalidate React Query cache so the dashboard refreshes
4. Navigate back

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { chillerSyncService } from '@/services/chillerSyncService';
import { useCompany } from '@/contexts/CompanyContext';
import { useToast } from '@/hooks/use-toast';

// Inside component:
const queryClient = useQueryClient();
const { currentCompany } = useCompany();
const { toast } = useToast();

const handleSubmit = async () => {
  try {
    // Save locally first
    await saveDraft();
    
    // Sync to Supabase
    if (currentCompany?.id) {
      const result = await chillerSyncService.syncDraft(draftId, currentCompany.id);
      
      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Sync Failed",
          description: result.error || "Failed to save to server. Data is saved locally.",
        });
        return;
      }
      
      // Invalidate queries to refresh dashboard
      queryClient.invalidateQueries({ queryKey: ['annual-chiller-pms'] });
      queryClient.invalidateQueries({ queryKey: ['chiller-fleet-health'] });
    }
    
    toast({
      title: "Success",
      description: "Annual inspection saved successfully.",
    });
    
    onComplete?.();
    navigate('/chiller-annuals');
  } catch (error) {
    console.error('Submit error:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to submit inspection. Please try again.",
    });
  }
};
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/chiller-annuals/wizard/steps/Step6Electrical.tsx` | Electrical inspection step UI |
| `src/services/chillerSyncService.ts` | Sync IndexedDB drafts to Supabase |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/chiller-annuals/wizard/steps/Step2Refrigerant.tsx` | Add R-11 to REFRIGERANT_TYPES array |
| `src/components/chiller-annuals/wizard/steps/Step5WaterSystem.tsx` | Replace NumberStepper with Input for treatment_vendor |
| `src/components/chiller-annuals/wizard/ChillerInspectionWizard.tsx` | Import Step6, render it, update handleSubmit with sync logic |

---

## Technical Details

### Sync Service Database Mapping

The sync service will map `ChillerWizardFormData` to the following tables:

| Form Section | Target Table |
|--------------|--------------|
| Root fields (equipment_id, date, technician) | `annual_chiller_pm` |
| `formData.refrigerant` | `chiller_refrigerant_inspection` |
| `formData.oil` | `chiller_oil_analysis` |
| `formData.tubes.evaporator` | `chiller_tube_inspection` (bundle_type='evaporator') |
| `formData.tubes.condenser` | `chiller_tube_inspection` (bundle_type='condenser') |
| `formData.water.chilled_water` | `chiller_water_side` (water_loop='chilled_water') |
| `formData.water.condenser_water` | `chiller_water_side` (water_loop='condenser_water') |
| `formData.water.quality` | `chiller_water_quality` |
| `formData.electrical.main_motor` | `chiller_electrical_check` (component='main_motor') |
| `formData.performance` | `chiller_performance_test` |
| `formData.findings` | `chiller_annual_finding` |

The service will use upsert logic to handle both new inspections and resuming drafts.

### Risk Score Calculation

The sync service will also calculate the overall risk score before saving:

```typescript
let riskScore = 0;
if (formData.refrigerant.leak_detected) riskScore += 25;
if (evaporatorPluggedPct > 5 || condenserPluggedPct > 5) riskScore += 30;
if (oilAcidNumber > 0.05) riskScore += 30;
if (voltageImbalance > 2) riskScore += 20;
if (insulationResistance < 1) riskScore += 20;
if (legionellaDetected) riskScore += 40;
// ... etc based on memory context

const riskLevel = riskScore <= 30 ? 'low' : riskScore <= 60 ? 'medium' : 'high';
```

---

## Summary

| Issue | Root Cause | Solution |
|-------|------------|----------|
| R-11 missing | Not in array | Add to REFRIGERANT_TYPES |
| Vendor input broken | Wrong component (NumberStepper vs Input) | Replace with Input |
| Step 6 "Coming soon" | Not implemented | Create Step6Electrical component |
| Submit not saving | No Supabase sync | Create chillerSyncService, update handleSubmit |

