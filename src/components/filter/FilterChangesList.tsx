
import { useState } from "react";
import { useFilterChangesQuery } from "@/hooks/useFilterChangesQuery";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterChangeCard } from "./FilterChangeCard";
import FilterChangeDetailsDialog from "./FilterChangeDetailsDialog";
import FilterChangeFormDialog from "./FilterChangeFormDialog";
import { FilterChange } from "@/types/filterChanges";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface FilterChangesListProps {
  equipmentId?: string;
}

const FilterChangesList = ({ equipmentId }: FilterChangesListProps) => {
  const { data: filterChanges = [], isLoading, error } = useFilterChangesQuery({ equipmentId });
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFilterChange, setSelectedFilterChange] = useState<FilterChange | null>(null);

  const handleViewDetails = (id: string) => {
    const filterChange = filterChanges.find(fc => fc.id === id);
    if (filterChange) {
      setSelectedFilterChange(filterChange);
      setDetailsDialogOpen(true);
    }
  };

  const handleEdit = (id: string) => {
    const filterChange = filterChanges.find(fc => fc.id === id);
    if (filterChange) {
      setSelectedFilterChange(filterChange);
      setEditDialogOpen(true);
    }
  };


  if (error) {
    return (
      <Alert className="border-destructive/50 bg-destructive/5">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-destructive">
          Error loading filter changes: {error.message || 'Please check your permissions and try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))
      ) : filterChanges.length === 0 ? (
        <p className="text-muted-foreground text-center">No filter changes found.</p>
      ) : (
        filterChanges.map((filterChange) => (
          <FilterChangeCard
            key={filterChange.id}
            filterChange={filterChange}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
          />
        ))
      )}

      {selectedFilterChange && (
        <>
          <FilterChangeDetailsDialog
            filterChange={selectedFilterChange}
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
          />
          <FilterChangeFormDialog
            filterChange={selectedFilterChange}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
        </>
      )}
    </div>
  );
};

export default FilterChangesList;
