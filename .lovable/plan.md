

# Update README and Customer Manual with Chiller Details Section Changes

## Summary
Update two files to document the new "Chiller Details" section on the Equipment Detail page, including the auto-detection logic and manual toggle feature.

## Changes

### 1. File: `README.md`

Add a new bullet point under the **Equipment Management** section (around line 27-35) describing the chiller details feature:

- Add after the existing equipment management bullets:
  - **Chiller Details Section**: Auto-detected chiller equipment displays installation date, expected life years, and condition rating fields. Non-chiller equipment can manually toggle the section via a "Show Chiller Details" button.

### 2. File: `public/docs/equipment-management.md`

Add a new subsection under **Advanced Features** (after line 94) titled **Chiller Details (Install Date, Life, Condition)** covering:

- **What it is**: A dedicated section on the Equipment Detail page for managing chiller lifecycle data.
- **Auto-Detection**: The section appears automatically when the equipment name or type contains "chill" (case-insensitive).
- **Manual Toggle**: For non-chiller equipment, a "Show Chiller Details" button reveals the section. A "Not a chiller? Hide this section" link hides it again.
- **Editable Fields**:
  - Installation Date (date picker)
  - Expected Life Years (number input)
  - Condition Rating (1-5 dropdown)
- **Health Score**: A `ChillerHealthBadge` displays calculated health based on these values.
- **Location on page**: Between the main equipment card/QR code row and the Filter Changes section.

### No other files change.

## Technical Details
- `README.md`: Insert ~2 lines around line 35.
- `public/docs/equipment-management.md`: Insert ~25 lines as a new subsection after line 94.

