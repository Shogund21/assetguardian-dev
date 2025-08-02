import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableTableHeader } from "./SortableTableHeader";
import { useSortedData } from "@/hooks/useSortedData";

interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  status: string;
  user_role: string;
  company_name?: string;
}

interface TechniciansTableProps {
  data: Technician[];
}

export const TechniciansTable = ({ data }: TechniciansTableProps) => {
  const { sortedData, sortConfig, handleSort } = useSortedData(data);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Technicians</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHeader
              sortKey="firstName"
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={handleSort}
            >
              Name
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="email"
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={handleSort}
            >
              Email
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="phone"
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={handleSort}
            >
              Phone
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="specialization"
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={handleSort}
            >
              Specialization
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="company_name"
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={handleSort}
            >
              Company
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="user_role"
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={handleSort}
            >
              Role
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
          {sortedData?.map((technician) => (
            <TableRow key={technician.id}>
              <TableCell>{`${technician.firstName} ${technician.lastName}`}</TableCell>
              <TableCell>{technician.email}</TableCell>
              <TableCell>{technician.phone}</TableCell>
              <TableCell>{technician.specialization}</TableCell>
              <TableCell>{technician.company_name || "No Company"}</TableCell>
              <TableCell>{technician.user_role || "technician"}</TableCell>
              <TableCell>{technician.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};