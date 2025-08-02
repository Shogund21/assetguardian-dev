import { Project } from "@/types/project";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableTableHeader } from "./SortableTableHeader";
import { useSortedData } from "@/hooks/useSortedData";

interface ProjectsTableProps {
  data: Project[];
}

export const ProjectsTable = ({ data }: ProjectsTableProps) => {
  const { sortedData, sortConfig, handleSort } = useSortedData(data);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Projects List</h2>
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
              sortKey="status"
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={handleSort}
            >
              Status
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="priority"
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={handleSort}
            >
              Priority
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
              sortKey="startdate"
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={handleSort}
            >
              Start Date
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="enddate"
              currentSortKey={sortConfig.key}
              sortDirection={sortConfig.direction}
              onSort={handleSort}
            >
              End Date
            </SortableTableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData?.map((project: Project) => (
            <TableRow key={project.id}>
              <TableCell>{project.name}</TableCell>
              <TableCell>{project.status}</TableCell>
              <TableCell>{project.priority}</TableCell>
              <TableCell>{project.location}</TableCell>
              <TableCell>
                {project.startdate
                  ? new Date(project.startdate).toLocaleDateString()
                  : "Not set"}
              </TableCell>
              <TableCell>
                {project.enddate
                  ? new Date(project.enddate).toLocaleDateString()
                  : "Not set"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};