import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { ProjectList } from "@/components/projects/ProjectList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCompanyFilter } from "@/hooks/useCompanyFilter";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/hooks/useProjects";

const Projects = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { applyCompanyFilter } = useCompanyFilter();
  const { isAuthenticated, user } = useAuth();

  // Use the improved useProjects hook that includes secure delete functionality
  const { 
    projects, 
    loading: isLoading, 
    handleStatusChange, 
    handlePriorityChange, 
    handleDelete,
    isDeleting 
  } = useProjects();

  // Keep the old data fetching for status and priority updates only
  const { refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      console.log("Fetching projects from Supabase...");
      if (!isAuthenticated) {
        console.log('Projects: User not authenticated');
        return [];
      }
      
      try {
        const { data, error } = await supabase.rpc('get_projects_data', {
          p_company_id: null,
          p_limit: 1000,
          p_offset: 0,
          p_search: ''
        });

        if (error) {
          console.error("Supabase error fetching projects:", error);
          throw error;
        }

        console.log("Successfully fetched projects:", data);
        return data || [];
      } catch (error) {
        console.error("Error in queryFn:", error);
        throw error;
      }
    },
    enabled: isAuthenticated,
    refetchOnWindowFocus: true,
    staleTime: 1000,
  });

  // Status and priority updates still use direct Supabase calls
  const handleStatusChangeLocal = async (projectId: string, newStatus: string) => {
    try {
      console.log("Updating project status:", { projectId, newStatus });
      
      const { error } = await supabase
        .from("projects")
        .update({ 
          status: newStatus,
          updatedat: new Date().toISOString()
        })
        .eq("id", projectId);

      if (error) {
        console.error("Error updating project status:", error);
        throw error;
      }

      await refetch();
      
      toast({
        title: "Success",
        description: "Project status updated successfully",
      });
    } catch (error) {
      console.error("Error in handleStatusChange:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update project status",
      });
    }
  };

  const handlePriorityChangeLocal = async (projectId: string, newPriority: string) => {
    try {
      console.log("Updating project priority:", { projectId, newPriority });
      
      const { error } = await supabase
        .from("projects")
        .update({ 
          priority: newPriority,
          updatedat: new Date().toISOString()
        })
        .eq("id", projectId);

      if (error) {
        console.error("Error updating project priority:", error);
        throw error;
      }

      await refetch();
      
      toast({
        title: "Success",
        description: "Project priority updated successfully",
      });
    } catch (error) {
      console.error("Error in handlePriorityChange:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update project priority",
      });
    }
  };

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

        {/* Removed AuthTest as it was causing permission errors */}
        
        {isLoading ? (
          <div>Loading projects...</div>
        ) : (
          <ProjectList
            projects={projects || []}
            onStatusChange={handleStatusChangeLocal}
            onPriorityChange={handlePriorityChangeLocal}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </Layout>
  );
};

export default Projects;