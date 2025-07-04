import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SensorReading {
  id: string;
  equipment_id: string;
  sensor_type: string;
  value: number;
  unit: string;
  timestamp_utc: string;
  source: string;
}

interface SensorReadingsTableProps {
  data: SensorReading[];
}

export const SensorReadingsTable = ({ data }: SensorReadingsTableProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Sensor Readings</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Equipment ID</TableHead>
            <TableHead>Sensor Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((reading) => (
            <TableRow key={reading.id}>
              <TableCell>{reading.equipment_id}</TableCell>
              <TableCell>{reading.sensor_type}</TableCell>
              <TableCell>{reading.value}</TableCell>
              <TableCell>{reading.unit}</TableCell>
              <TableCell>
                {reading.timestamp_utc
                  ? new Date(reading.timestamp_utc).toLocaleString()
                  : "Not set"}
              </TableCell>
              <TableCell>{reading.source}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};