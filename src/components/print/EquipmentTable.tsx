
import { Equipment } from "@/types/equipment";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EquipmentTableProps {
  data: Equipment[];
}

export const EquipmentTable = ({ data }: EquipmentTableProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Equipment List</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Serial Number</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</Table

</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((equipment: Equipment) => (
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
