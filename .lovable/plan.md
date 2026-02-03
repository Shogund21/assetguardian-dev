

# Implement Steps 7, 8, and 9 for Annual Chiller PM Wizard

## Overview

This plan implements the three remaining wizard steps that currently show "Coming soon":

| Step | Title | Purpose |
|------|-------|---------|
| 7 | Performance Test | Capture kW, tons, temperatures, and auto-calculate kW/ton efficiency |
| 8 | Findings & Photos | Document issues with photos, severity ratings, and recommended actions |
| 9 | Review & Submit | Display summary of all data with risk score before final submission |

---

## Step 7: Performance Test

### New File: `src/components/chiller-annuals/wizard/steps/Step7PerformanceTest.tsx`

This component captures operating performance data during inspection:

**Fields to capture:**

| Field | Type | Auto-Calculated |
|-------|------|-----------------|
| Test Date | date | No |
| Load % | number (0-100) | No |
| Chilled Water Supply Temp (F) | number | No |
| Chilled Water Return Temp (F) | number | No |
| Condenser Water Supply Temp (F) | number | No |
| Condenser Water Return Temp (F) | number | No |
| CHW Flow (GPM) | number | No |
| kW Input | number | No |
| Tons Actual | number | Yes (if flow & temps provided) |
| Tons Design | number | No |
| kW/ton | number | Yes (kW / tons) |
| Design kW/ton | number | No |
| Notes | text | No |

**Features:**
- Auto-calculate tons using formula: `flow * deltaT * 0.04165`
- Auto-calculate kW/ton when kW and tons are available
- Show efficiency comparison badge (actual vs design kW/ton)
- Display warning if efficiency degraded > 10% from design

**UI Components:**
- Card sections for Water Temps and Performance Metrics
- NumberStepper inputs for numeric fields
- Efficiency comparison display with color-coded badge
- Notes textarea

---

## Step 8: Findings & Photos

### New File: `src/components/chiller-annuals/wizard/steps/Step8Findings.tsx`

This component allows technicians to document issues discovered during inspection:

**Finding Structure (per `FindingData` type):**
- Issue Code (predefined codes + custom)
- Category (dropdown: Refrigerant, Oil, Tubes, Electrical, Controls, Mechanical, Water, Other)
- Description (text)
- Severity (Critical, High, Medium, Low)
- Recommended Action (text)
- Photos (using existing PhotoCapture component)

**Features:**
- Add/remove findings dynamically
- Pre-defined issue codes with auto-fill descriptions
- Severity selection with color indicators
- Photo attachment per finding (max 5 per finding)
- Display auto-generated findings from risk calculations (marked as "Auto-detected")
- Collapsible cards for each finding

**Issue Code Options:**
- REFRIG_LEAK - Refrigerant Leak Detected
- TUBE_PLUGS - Excessive Tube Plugging
- OIL_ACID - High Oil Acid Level
- VOLTAGE_IMBAL - Voltage Imbalance > 2%
- LOW_INSUL - Low Insulation Resistance
- BEARING_WEAR - Bearing Wear Detected
- CONTROL_FAULT - Controls Malfunction
- LEGIONELLA - Legionella Detected
- CORROSION - Corrosion Observed
- OTHER - Other (specify)

**UI Components:**
- Button to add new finding
- Collapsible Accordion for each finding
- Select dropdowns for category and severity
- Textarea for description and recommended action
- PhotoCapture component integration
- Delete button for each finding

### Update Hook: `src/hooks/useChillerWizardForm.ts`

Add new function to manage findings:

```typescript
const updateFindings = useCallback((findings: FindingData[]) => {
  setFormData(prev => ({
    ...prev,
    findings,
  }));
  setHasUnsavedChanges(true);
}, []);

const addFinding = useCallback((finding: FindingData) => {
  setFormData(prev => ({
    ...prev,
    findings: [...prev.findings, finding],
  }));
  setHasUnsavedChanges(true);
}, []);

const removeFinding = useCallback((findingId: string) => {
  setFormData(prev => ({
    ...prev,
    findings: prev.findings.filter(f => f.id !== findingId),
  }));
  setHasUnsavedChanges(true);
}, []);

const updateFinding = useCallback((findingId: string, updates: Partial<FindingData>) => {
  setFormData(prev => ({
    ...prev,
    findings: prev.findings.map(f => 
      f.id === findingId ? { ...f, ...updates } : f
    ),
  }));
  setHasUnsavedChanges(true);
}, []);
```

---

## Step 9: Review & Submit

### New File: `src/components/chiller-annuals/wizard/steps/Step9Review.tsx`

This component displays a comprehensive summary before final submission:

**Sections:**
1. **Asset Information** - Equipment name, date, technician
2. **Risk Score** - Using RiskScoreDisplay component with breakdown
3. **Section Summaries** - Collapsible accordions for each completed step:
   - Refrigerant: leak status, pressures, type
   - Oil: level, appearance, acid number
   - Tubes: plugged %, wall loss %, cleaning status
   - Water: temps, quality, treatment vendor
   - Electrical: voltage imbalance, insulation resistance
   - Performance: kW/ton, efficiency comparison
4. **Findings** - List of all documented findings with severity badges
5. **Skipped Steps** - List any skipped steps with reasons

**Features:**
- Calculate and display final risk score using `chillerRiskCalculator`
- Show red flags prominently at top if any critical issues
- Accordion sections allow drilling into details
- Edit buttons to jump back to specific steps
- Final confirmation checkbox before submit

**UI Components:**
- RiskScoreDisplay component for risk visualization
- Accordion for section summaries
- Badge components for statuses and severities
- Alert component for red flags/warnings
- Button to navigate back to any step for editing

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/chiller-annuals/wizard/steps/Step7PerformanceTest.tsx` | Performance test data capture |
| `src/components/chiller-annuals/wizard/steps/Step8Findings.tsx` | Findings and photo documentation |
| `src/components/chiller-annuals/wizard/steps/Step9Review.tsx` | Final review and submission screen |

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useChillerWizardForm.ts` | Add `updateFindings`, `addFinding`, `removeFinding`, `updateFinding` functions |
| `src/components/chiller-annuals/wizard/ChillerInspectionWizard.tsx` | Import and render Step7, Step8, Step9 components; remove "Coming soon" placeholder |

---

## Technical Details

### ChillerInspectionWizard.tsx Changes

Update the `renderStep()` function:

```tsx
import { Step7PerformanceTest } from './steps/Step7PerformanceTest';
import { Step8Findings } from './steps/Step8Findings';
import { Step9Review } from './steps/Step9Review';

// In renderStep():
case 7:
  return (
    <Step7PerformanceTest
      formData={formData}
      updatePerformance={updatePerformance}
    />
  );
case 8:
  return (
    <Step8Findings
      formData={formData}
      updateFindings={updateFindings}
      addFinding={addFinding}
      removeFinding={removeFinding}
      updateFinding={updateFinding}
    />
  );
case 9:
  return (
    <Step9Review
      formData={formData}
      goToStep={goToStep}
      getStepStatus={getStepStatus}
    />
  );
```

### Risk Score Calculation for Review

Import and use the risk calculator service:

```typescript
import { calculateRiskScore } from '@/services/chillerRiskCalculator';

// In Step9Review:
const riskResult = useMemo(() => 
  calculateRiskScore(formData), 
  [formData]
);
```

### Finding Photo Integration

Each finding can have photos attached using the existing PhotoCapture component:

```tsx
<PhotoCapture
  photos={finding.photos}
  onChange={(photos) => updateFinding(finding.id, { photos })}
  maxPhotos={5}
/>
```

---

## Summary

| Step | Implementation | Key Features |
|------|---------------|--------------|
| 7 | Performance Test | Auto-calc kW/ton, efficiency comparison |
| 8 | Findings | Photo capture, severity ratings, issue codes |
| 9 | Review | Risk score display, section summaries, final check |

All three steps follow the existing UI patterns established in Steps 1-6, using the same components (NumberStepper, ToggleButtonPair, Card, etc.) for consistency.

