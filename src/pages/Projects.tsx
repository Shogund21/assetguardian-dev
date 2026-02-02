import Layout from "@/components/Layout";
import { ProjectList } from "@/components/projects/ProjectList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";

const Projects = () => {
  const navigate = useNavigate();

  const { 
    projects, 
    loading: isLoading, 
    handleStatusChange, 
    handlePriorityChange, 
    handleDelete,
    isDeleting 
  } = useProjects();

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Button
            onClick={() => navigate("/add-project")}
            className="bg-[#1EAEDB] hover:bg-[#33C3F0] text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Project
          </Button>
        </div>
        
        {isLoading ? (
          <div>Loading projects...</div>
        ) : (
          <ProjectList
            projects={projects || []}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </Layout>
  );
};

export default Projects;
