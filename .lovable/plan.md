

# Add Expanded Chiller Details Section to Equipment Detail Page

## Summary
Update `src/pages/EquipmentDetails.tsx` to broaden when the chiller section appears and add a manual toggle for non-chiller equipment.

## Current Behavior
The chiller section (health badge + details form) only shows when `equipment.type` contains "chiller".

## What Changes

### File: `src/pages/EquipmentDetails.tsx`

1. **Add `useState` import** for a manual toggle (`showChillerSection`).

2. **Add detection logic** -- a helper that checks (case-insensitive):
   - `equipment.type` contains "chill"
   - `equipment.name` contains "chill"
   - (No `category` column exists in the DB, so skip that check)

3. **Replace the current conditional block** (lines 128-138) with:
   - If auto-detected OR manually toggled on, show a titled section:
     - Section header: **"Chiller Details (Install Date, Life, Condition)"**
     - `ChillerHealthBadge` component
     - `ChillerDetailsForm` component (already bound to `installation_date`, `expected_life_years`, `condition_rating` -- columns confirmed to exist)
   - If NOT auto-detected, show a small button: **"Show Chiller Details"** to manually toggle the section on
   - When the section is visible and was manually toggled, show a **"Not a chiller? Hide this section"** link to toggle it back off

4. **DB columns already exist** (`installation_date`, `expected_life_years`, `condition_rating`), so no missing-column message is needed. The query on line 29 already selects them.

### No other files change.

## Where It Appears
On the Equipment Detail page (`/equipment/:id`), between the main equipment card/QR code row and the Filter Changes section -- same position as today, but now with a clear title and broader visibility rules.

