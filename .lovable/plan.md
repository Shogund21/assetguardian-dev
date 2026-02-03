
# Fix "New Annual PM" Button Navigation

## Problem
The "New Annual PM" button on the Chiller Annuals page (line 113-116) is missing an `onClick` handler. When clicked, nothing happens because the button has no navigation logic to take users to the inspection wizard.

## Root Cause
The Button component is rendered without any event handler:
```tsx
<Button className="flex items-center gap-2">
  <Plus className="h-4 w-4" />
  New Annual PM
</Button>
```

The wizard route `/chiller-annuals/wizard` exists and is properly configured in `App.tsx`, but no navigation is triggered when the button is clicked.

## Solution
Add navigation functionality to both the "New Annual PM" button in the header and the "Create First Inspection" button in the empty state.

## Changes Required

### File: `src/pages/ChillerAnnuals.tsx`

**1. Add useNavigate import (line 1-14):**
```tsx
import { useNavigate } from "react-router-dom";
```

**2. Add navigate hook inside component (after line 19):**
```tsx
const navigate = useNavigate();
```

**3. Update header "New Annual PM" button (line 113-116):**
```tsx
<Button 
  className="flex items-center gap-2"
  onClick={() => navigate("/chiller-annuals/wizard")}
>
  <Plus className="h-4 w-4" />
  New Annual PM
</Button>
```

**4. Update empty state "Create First Inspection" button (line 191-194):**
```tsx
<Button 
  className="mt-4" 
  variant="outline"
  onClick={() => navigate("/chiller-annuals/wizard")}
>
  <Plus className="h-4 w-4 mr-2" />
  Create First Inspection
</Button>
```

## Summary
| Change | Location | Description |
|--------|----------|-------------|
| Import | Line 10 | Add `useNavigate` from react-router-dom |
| Hook | Line 20 | Initialize `navigate` function |
| Header Button | Line 113-116 | Add `onClick` to navigate to wizard |
| Empty State Button | Line 191-194 | Add `onClick` to navigate to wizard |

This is a simple fix that connects the existing buttons to the already-implemented wizard route.
