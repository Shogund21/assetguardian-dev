import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Location {
  id: string;
  name: string;
  store_number: string;
  is_active: boolean;
  created_at: string;
}

interface LocationsTableProps {
  data: Location[];
}

export const LocationsTable = ({ data }: LocationsTableProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Locations</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Store Number</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((location) => (
            <TableRow key={location.id}>
              <TableCell>{location.name || "Unnamed Location"}</TableCell>
              <TableCell>{location.store_number}</TableCell>
              <TableCell>{location.is_active ? "Active" : "Inactive"}</TableCell>
              <TableCell>
                {location.created_at
                  ? new Date(location.created_at).toLocaleDateString()
                  : "Not set"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};