
import { Equipment } from "@/types/equipment";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableTableHeader } from "./SortableTableHeader";
import { useSortedData } from "@/hooks/useSortedData";

interface EquipmentTableProps {
  data: Equipment[];
}

export const EquipmentTable = ({ data }: EquipmentTableProps) => {
  const { sortedData, sortConfig, handleSort } = useSortedData(data);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Equipment List</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHeader
              sortKey="name"
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={handleSort}
            >
              Name
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="model"
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={handleSort}
            >
              Model
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="serial_number"
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={handleSort}
            >
              Serial Number
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="location"
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={handleSort}
            >
              Location
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="status"
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={handleSort}
            >
              Status
            </SortableTableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData?.map((equipment: Equipment) => (
            <TableRow key={equipment.id}>
              <TableCell>{equipment.name}</TableCell>
              <TableCell>{equipment.model}</TableCell>
              <TableCell>{equipment.serial_number}</TableCell>
              <TableCell>{equipment.location}</TableCell>
              <TableCell>{equipment.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
