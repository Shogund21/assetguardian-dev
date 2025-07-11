import { Project } from "@/types/project";
import { ProjectHeader } from "./card/ProjectHeader";
import { ProjectDetails } from "./card/ProjectDetails";
import { ProjectControls } from "./card/ProjectControls";
import { useState } from "react";
import { EditDescriptionDialog } from "./EditDescriptionDialog";
import { useProjectCard } from "@/hooks/projects/useProjectCard";

interface ProjectCardProps {
  project: Project;
  onStatusChange: (projectId: string, newStatus: string) => Promise<void>;
  onPriorityChange: (projectId: string, newPriority: string) => Promise<void>;
  onDelete: (projectId: string) => Promise<void>;
  isDeleting?: boolean;
}

export const ProjectCard = ({ 
  project, 
  onStatusChange, 
  onPriorityChange,
  onDelete,
  isDeleting = false
}: ProjectCardProps) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const {
    currentStatus,
    description,
    handleStatusChange,
    handlePriorityChange,
    handleDescriptionUpdate,
  } = useProjectCard({
    project,
    onStatusChange,
    onPriorityChange
  });

  return (
    <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
      <ProjectHeader 
        name={project.name}
        onDelete={() => onDelete(project.id)}
        isDeleting={isDeleting}
      />
      <div className="mt-4 space-y-2">
        <ProjectControls
          status={currentStatus}
          priority={project.priority}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
        />
        <ProjectDetails
          description={description}
          location={project.location}
          startdate={project.startdate}
          enddate={project.enddate}
          onEditDescription={() => setIsEditingDescription(true)}
        />
      </div>
      <EditDescriptionDialog
        isOpen={isEditingDescription}
        onClose={() => setIsEditingDescription(false)}
        currentDescription={description}
        onSave={handleDescriptionUpdate}
      />
    </div>
  );
};