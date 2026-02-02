
# Fix: Scrolling and Print/Export for Maintenance Check Details

## Issues Identified

| Issue | Root Cause |
|-------|------------|
| Cannot scroll to see all details | `ScrollArea` lacks explicit height, and `DialogContent` uses `overflow-hidden` which clips content |
| No print/export functionality | Missing buttons and print handler in the dialog |

---

## Solution Overview

Update the `EnhancedMaintenanceDetails` component to:
1. Fix the scrolling by properly structuring the dialog with a flexible height layout
2. Add Print and Export buttons in the dialog header/footer

---

## Technical Changes

### File: `src/components/maintenance/details/EnhancedMaintenanceDetails.tsx`

**1. Add Required Imports**

```typescript
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
```

**2. Fix DialogContent Layout**

Update the `DialogContent` structure to use flex layout with proper height constraints:

```typescript
<DialogContent className="max-w-4xl h-[90vh] flex flex-col overflow-hidden">
  {/* Header - Fixed at top */}
  <DialogHeader className="flex-shrink-0 pb-4 border-b">
    {/* ... existing header content ... */}
  </DialogHeader>

  {/* Tabs with Scrollable Content */}
  <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
    <TabsList className="flex-shrink-0 grid w-full grid-cols-4">
      {/* ... tab triggers ... */}
    </TabsList>

    {/* Scrollable area for tab content */}
    <ScrollArea className="flex-1 mt-4">
      <div className="pr-4"> {/* Padding for scrollbar */}
        {/* ... TabsContent elements ... */}
      </div>
    </ScrollArea>
  </Tabs>

  {/* Footer - Fixed at bottom */}
  <DialogFooter className="flex-shrink-0 pt-4 border-t">
    <Button variant="outline" onClick={handlePrint}>
      <Printer className="mr-2 h-4 w-4" />
      Print
    </Button>
    <Button variant="outline" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export PDF
    </Button>
  </DialogFooter>
</DialogContent>
```

**3. Add Print Handler**

Add a print function that creates a print-friendly version of the maintenance check:

```typescript
const handlePrint = () => {
  const printContent = document.createElement('div');
  printContent.innerHTML = `
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h1 { font-size: 24px; margin-bottom: 10px; }
      .header-info { margin-bottom: 20px; color: #666; }
      .section { margin-bottom: 20px; }
      .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
      .reading-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
      .status-badge { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
      .good { background: #dcfce7; color: #166534; }
      .warning { background: #fef9c3; color: #854d0e; }
      .critical { background: #fee2e2; color: #991b1b; }
      @media print { body { padding: 0; } }
    </style>
    <h1>${getEquipmentName()}</h1>
    <div class="header-info">
      <p>Location: ${getLocationName()}</p>
      <p>Technician: ${getTechnicianName()}</p>
      <p>Date: ${format(new Date(check.check_date || ""), "MMM dd, yyyy 'at' h:mm a")}</p>
      <p>Status: ${check.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}</p>
      <p>Equipment Type: ${check.equipment_type?.toUpperCase() || 'N/A'}</p>
    </div>
    <!-- Readings section -->
    <div class="section">
      <div class="section-title">Readings</div>
      ${readings.map(r => `<div class="reading-row"><span>${r.label}</span><span>${formatFieldValue(r.value, r.label.toLowerCase())}</span></div>`).join('')}
    </div>
    <!-- Conditions section -->
    <div class="section">
      <div class="section-title">Equipment Conditions</div>
      ${conditions.map(c => `<div class="reading-row"><span>${c.label}</span><span class="status-badge ${c.status}">${formatFieldValue(c.value, c.label.toLowerCase())}</span></div>`).join('')}
    </div>
    <!-- Notes section -->
    ${check.notes ? `<div class="section"><div class="section-title">Notes</div><p>${check.notes}</p></div>` : ''}
    ${check.maintenance_recommendations ? `<div class="section"><div class="section-title">Recommendations</div><p>${check.maintenance_recommendations}</p></div>` : ''}
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Maintenance Check - ${getEquipmentName()}</title></head><body>${printContent.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }
};

const handleExport = () => {
  // For now, use print to PDF (browser's built-in PDF export)
  handlePrint();
};
```

---

## Summary of Changes

| Location | Change |
|----------|--------|
| Line 284 | Change `max-h-[90vh] overflow-hidden` to `h-[90vh] flex flex-col overflow-hidden` |
| Line 285-331 | Wrap `DialogHeader` with `flex-shrink-0` to prevent compression |
| Line 333-351 | Add `flex-1 flex flex-col min-h-0` to `Tabs` container |
| Line 353-517 | Wrap `ScrollArea` properly with explicit `flex-1` height |
| After line 517 | Add `DialogFooter` with Print and Export buttons |
| New function | Add `handlePrint()` and `handleExport()` functions |

This will enable:
- Proper scrolling through all maintenance check details
- Print button to generate a printer-friendly version
- Export button (uses browser's Print to PDF functionality)
