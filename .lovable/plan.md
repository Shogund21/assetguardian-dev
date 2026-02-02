
# Fix Sidebar Overlapping Content on ChillerAnnuals Page

## Problem
The sidebar is positioned as `fixed left-0` with `w-48` (192px width), but the main content in ChillerAnnuals.tsx doesn't have any left margin or padding to account for this. This causes the sidebar to cover the left portion of the main content area.

## Root Cause
Looking at the code:
- `Sidebar.tsx` (line 44-48): Uses `fixed left-0 top-0 z-30 h-screen w-48`
- `DesktopLayout.tsx` (line 27): Correctly uses `pl-6 md:pl-48` on SidebarInset
- `ChillerAnnuals.tsx` (line 100): Only uses `className="flex-1"` without any left padding

## Solution
Update `ChillerAnnuals.tsx` to match the layout pattern used in `DesktopLayout.tsx` by adding left padding to account for the fixed sidebar width.

## Changes Required

### File: `src/pages/ChillerAnnuals.tsx`

**Line 100** - Add left padding to SidebarInset:

```tsx
// Before:
<SidebarInset className="flex-1">

// After:
<SidebarInset className="flex-1 pl-6 md:pl-48">
```

This matches the pattern used in DesktopLayout.tsx which correctly handles the fixed sidebar offset.

## Alternative Approach (Recommended)
Instead of duplicating layout logic, ChillerAnnuals should use the existing `CustomLayout` component like other pages do (Index.tsx uses it). This would:
1. Ensure consistent layout across all pages
2. Automatically handle mobile vs desktop layouts
3. Include the standard header with Asset Guardian branding

### File: `src/pages/ChillerAnnuals.tsx`

Refactor to use CustomLayout:

```tsx
// Remove these imports:
- import Sidebar from "@/components/Sidebar";
- import { SidebarInset } from "@/components/ui/sidebar";

// Add this import:
+ import CustomLayout from "@/components/CustomLayout";

// Change the return statement from:
return (
  <div className="flex min-h-screen w-full bg-background">
    <Sidebar />
    <SidebarInset className="flex-1">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* content */}
      </div>
    </SidebarInset>
  </div>
);

// To:
return (
  <CustomLayout>
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* content */}
    </div>
  </CustomLayout>
);
```

## Summary
| Approach | Pros | Cons |
|----------|------|------|
| Quick fix (add `pl-48`) | Simple, single line change | Duplicates layout logic |
| Use CustomLayout | Consistent, handles mobile/desktop, includes header | Slightly more code change |

I recommend the CustomLayout approach for consistency with other pages in the application.
