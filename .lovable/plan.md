
# Fix: Project Status Update Error

## Root Cause

The error `record "new" has no field "updated_at"` is caused by a **mismatch between a trigger function and the actual column name**:

| Component | Column Name |
|-----------|-------------|
| `projects` table | `updatedat` (no underscore) |
| `update_updated_at_column` trigger function | `NEW.updated_at` (with underscore) |

When you update a project's status, the trigger `update_projects_updatedat` fires and calls `update_updated_at_column()`, which tries to set `NEW.updated_at = now()` - but that column doesn't exist.

## Solution

Create a new trigger function specific to the projects table that uses the correct column name `updatedat`, then update the trigger to use it.

### Database Migration

```sql
-- Create a new trigger function for the projects table that uses the correct column name
CREATE OR REPLACE FUNCTION public.update_projects_updatedat_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updatedat = now();
    RETURN NEW;
END;
$function$;

-- Drop the existing trigger that uses the wrong function
DROP TRIGGER IF EXISTS update_projects_updatedat ON public.projects;

-- Create new trigger with the correct function
CREATE TRIGGER update_projects_updatedat
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_projects_updatedat_column();
```

### Technical Details

- The `set_project_status` function itself is correctly setting `updatedat = now()` in the UPDATE statement
- However, the trigger still fires and fails because it tries to access `NEW.updated_at`
- The fix creates a project-specific trigger function that uses the correct column name

### Alternative Option

If you prefer to standardize column naming across the application, you could also:
1. Rename the column from `updatedat` to `updated_at` 
2. Update all code references

However, this is a larger change that would affect multiple files. The trigger fix is the minimal, focused solution.

### Files to Change

| Change | Description |
|--------|-------------|
| Database Migration | Create new trigger function and update trigger |

No frontend code changes needed - the error is entirely in the database trigger.
