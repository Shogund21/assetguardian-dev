import { ChevronUp, ChevronDown } from 'lucide-react';
import { TableHead } from '@/components/ui/table';
import { SortDirection } from '@/hooks/useSortedData';
import { cn } from '@/lib/utils';

interface SortableTableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  currentSortKey: string;
  sortDirection: SortDirection;
  onSort: (key: string) => void;
  className?: string;
}

export const SortableTableHeader = ({
  children,
  sortKey,
  currentSortKey,
  sortDirection,
  onSort,
  className
}: SortableTableHeaderProps) => {
  const isActive = currentSortKey === sortKey;

  return (
    <TableHead 
      className={cn(
        "cursor-pointer select-none hover:bg-muted/50 transition-colors print:cursor-default print:hover:bg-transparent",
        className
      )}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {children}
        <div className="flex flex-col print:hidden">
          <ChevronUp 
            className={cn(
              "h-3 w-3 transition-colors",
              isActive && sortDirection === 'asc' 
                ? "text-foreground" 
                : "text-muted-foreground/50"
            )}
          />
          <ChevronDown 
            className={cn(
              "h-3 w-3 -mt-1 transition-colors",
              isActive && sortDirection === 'desc' 
                ? "text-foreground" 
                : "text-muted-foreground/50"
            )}
          />
        </div>
      </div>
    </TableHead>
  );
};