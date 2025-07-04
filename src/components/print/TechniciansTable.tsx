import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Technicians</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((technician) => (
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