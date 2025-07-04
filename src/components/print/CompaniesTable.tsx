import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Company {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  created_at: string;
}

interface CompaniesTableProps {
  data: Company[];
}

export const CompaniesTable = ({ data }: CompaniesTableProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Companies</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>Contact Email</TableHead>
            <TableHead>Contact Phone</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Created Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((company) => (
            <TableRow key={company.id}>
              <TableCell>{company.name}</TableCell>
              <TableCell>{company.contact_email || "Not provided"}</TableCell>
              <TableCell>{company.contact_phone || "Not provided"}</TableCell>
              <TableCell>{company.address || "Not provided"}</TableCell>
              <TableCell>
                {company.created_at
                  ? new Date(company.created_at).toLocaleDateString()
                  : "Not set"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};