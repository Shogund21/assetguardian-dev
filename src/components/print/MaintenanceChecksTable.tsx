import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MaintenanceCheck {
  id: string;
  equipment_id: string;
  check_date: string;
  status: string;
  technician_id: string;
  equipment_type: string;
  notes: string;
}

interface MaintenanceChecksTableProps {
  data: MaintenanceCheck[];
}

export const MaintenanceChecksTable = ({ data }: MaintenanceChecksTableProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Maintenance Checks</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Check Date</TableHead>
            <TableHead>Equipment Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Technician ID</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((check) => (
            <TableRow key={check.id}>
              <TableCell>
                {check.check_date
                  ? new Date(check.check_date).toLocaleDateString()
                  : "Not set"}
              </TableCell>
              <TableCell>{check.equipment_type || "N/A"}</TableCell>
              <TableCell>{check.status}</TableCell>
              <TableCell>{check.technician_id || "Unassigned"}</TableCell>
              <TableCell>{check.notes || "No notes"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};