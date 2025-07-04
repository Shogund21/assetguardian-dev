import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FilterChange {
  id: string;
  equipment_id: string;
  filter_type: string;
  filter_size: string;
  installation_date: string;
  due_date: string;
  status: string;
  notes: string;
}

interface FilterChangesTableProps {
  data: FilterChange[];
}

export const FilterChangesTable = ({ data }: FilterChangesTableProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Filter Changes</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Filter Type</TableHead>
            <TableHead>Filter Size</TableHead>
            <TableHead>Installation Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((filter) => (
            <TableRow key={filter.id}>
              <TableCell>{filter.filter_type}</TableCell>
              <TableCell>{filter.filter_size}</TableCell>
              <TableCell>
                {filter.installation_date
                  ? new Date(filter.installation_date).toLocaleDateString()
                  : "Not set"}
              </TableCell>
              <TableCell>
                {filter.due_date
                  ? new Date(filter.due_date).toLocaleDateString()
                  : "Not set"}
              </TableCell>
              <TableCell>{filter.status}</TableCell>
              <TableCell>{filter.notes || "No notes"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};