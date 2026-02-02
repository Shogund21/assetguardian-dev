
# Fix: Projects Not Updating

## Root Cause Confirmed

After analyzing the code, here's exactly what's happening:

| Operation | Handler Used | What It Updates | UI Source | Result |
|-----------|-------------|-----------------|-----------|--------|
| **Display** | - | - | `useProjects().projects` (useState) | ✓ Shows data |
| **Status Change** | `handleStatusChangeLocal` | TanStack Query cache | useState (different) | ❌ UI stale |
| **Priority Change** | `handlePriorityChangeLocal` | TanStack Query cache | useState (different) | ❌ UI stale |
| **Delete** | `handleDelete` from hook | `setProjects` (useState) | useState (same) | ✓ Works |

The status and priority handlers in `Projects.tsx` call `refetch()` on a TanStack Query that **is never used for display**. The UI shows data from `useProjects` which uses a separate `useState`.

## Solution: Consolidate to Single Data Source

### Changes Required

**1. `src/hooks/useProjects.ts`** - Switch to TanStack Query

Replace the `useState`/`useEffect` pattern with TanStack Query so there's one source of truth:

```typescript
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";
import { useAuth } from "@/hooks/useAuth";
import { useProjectMutations } from "./projects/useProjectMutations";

export const useProjects = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading: loading, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("createdat", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated,
  });

  const { handleStatusChange, handlePriorityChange, handleDelete, isDeleting } = 
    useProjectMutations(refetch);

  return { projects, loading, handleStatusChange, handlePriorityChange, handleDelete, isDeleting, refetch };
};
```

**2. `src/hooks/projects/useProjectMutations.ts`** - Accept refetch instead of state

```typescript
export const useProjectMutations = (refetch: () => Promise<any>) => {
  const { handleStatusChange } = useStatusMutation(refetch);
  const { handlePriorityChange } = usePriorityMutation(refetch);
  const { handleDelete, isDeleting } = useDeleteMutation(refetch);
  return { handleStatusChange, handlePriorityChange, handleDelete, isDeleting };
};
```

**3. `src/hooks/projects/mutations/useStatusMutation.ts`** - Call refetch after mutation

```typescript
export const useStatusMutation = (refetch: () => Promise<any>) => {
  const { toast } = useToast();

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const { error } = await supabase.rpc('set_project_status', {
        p_project_id: projectId,
        p_status: newStatus
      });
      if (error) throw error;
      await refetch();
      toast({ title: "Success", description: "Project status updated successfully" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update project status." });
    }
  };

  return { handleStatusChange };
};
```

**4. `src/hooks/projects/mutations/usePriorityMutation.ts`** - Same pattern

```typescript
export const usePriorityMutation = (refetch: () => Promise<any>) => {
  const { toast } = useToast();

  const handlePriorityChange = async (projectId: string, newPriority: string) => {
    try {
      const { error } = await supabase.rpc('set_project_priority', {
        p_project_id: projectId,
        p_priority: newPriority
      });
      if (error) throw error;
      await refetch();
      toast({ title: "Success", description: "Project priority updated successfully" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update project priority." });
    }
  };

  return { handlePriorityChange };
};
```

**5. `src/hooks/projects/mutations/useDeleteMutation.ts`** - Same pattern

```typescript
export const useDeleteMutation = (refetch: () => Promise<any>) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (projectId: string) => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.rpc('delete_project', { p_project_id: projectId });
      if (error) throw error;
      const response = data as { success: boolean; error?: string; message?: string };
      if (!response?.success) {
        toast({ variant: "destructive", title: "Delete Failed", description: response?.error || "Failed to delete" });
        return;
      }
      await refetch();
      toast({ title: "Success", description: response.message || "Project deleted successfully" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete project." });
    } finally {
      setIsDeleting(false);
    }
  };

  return { handleDelete, isDeleting };
};
```

**6. `src/pages/Projects.tsx`** - Remove duplicate query and local handlers

Remove the entire `useQuery` block (lines 30-62) and local handlers (lines 65-129). Use handlers directly from `useProjects`:

```typescript
const Projects = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { projects, loading: isLoading, handleStatusChange, handlePriorityChange, handleDelete, isDeleting } = useProjects();

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Button onClick={() => navigate("/add-project")} className="bg-[#1EAEDB] hover:bg-[#33C3F0] text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Project
          </Button>
        </div>
        {isLoading ? (
          <div>Loading projects...</div>
        ) : (
          <ProjectList
            projects={projects || []}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </Layout>
  );
};
```

**7. `src/components/projects/AddProjectForm.tsx`** - Invalidate query after adding

```typescript
import { useQueryClient } from "@tanstack/react-query";

// Inside component:
const queryClient = useQueryClient();

// After successful insert:
await queryClient.invalidateQueries({ queryKey: ["projects"] });
navigate("/projects");
```

## Summary

| File | Change |
|------|--------|
| `useProjects.ts` | Replace useState with TanStack Query |
| `useProjectMutations.ts` | Accept `refetch` function |
| `useStatusMutation.ts` | Call `refetch()` after mutation |
| `usePriorityMutation.ts` | Call `refetch()` after mutation |
| `useDeleteMutation.ts` | Call `refetch()` after mutation |
| `Projects.tsx` | Remove duplicate query, use hook handlers |
| `AddProjectForm.tsx` | Invalidate query after insert |

This ensures **one source of truth** (TanStack Query) and all mutations refresh the same cache that the UI displays from.
