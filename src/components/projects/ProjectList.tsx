import { Project } from "@/types/project";
import { ProjectCard } from "./ProjectCard";

interface ProjectListProps {
  projects: Project[];
  onStatusChange: (projectId: string, newStatus: string) => Promise<void>;
  onPriorityChange: (projectId: string, newPriority: string) => Promise<void>;
  onDelete: (projectId: string) => Promise<void>;
  isDeleting?: boolean;
}

export const ProjectList = ({ 
  projects,
  onStatusChange,
  onPriorityChange,
  onDelete,
  isDeleting = false
}: ProjectListProps) => {
  console.log("ProjectList rendering with projects:", projects);

  if (!projects?.length) {
    return <div className="text-center text-gray-500">No projects found.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => {
        console.log("Rendering project:", project);
        return (
          <ProjectCard
            key={project.id}
            project={project}
            onStatusChange={onStatusChange}
            onPriorityChange={onPriorityChange}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        );
      })}
    </div>
  );
};