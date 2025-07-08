import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { ProjectList } from "@/components/projects/ProjectList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCompanyFilter } from "@/hooks/useCompanyFilter";
import { AuthTest } from "@/components/auth/AuthTest";
import { useAuthenticatedSupabase } from "@/hooks/useAuthenticatedSupabase";

const Projects = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { applyCompanyFilter } = useCompanyFilter();
  const { supabase: authSupabase, isReady } = useAuthenticatedSupabase();

  const { data: projects, isLoading, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      console.log("Fetching projects from Supabase...");
      try {
        let query = authSupabase
          .from("projects")
          .select("*");
        
        // Apply company filtering
        query = applyCompanyFilter(query);
        
        query = query.order("createdat", { ascending: false });
        
        const { data, error } = await query;

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
    enabled: isReady, // Wait for authenticated client to be ready
    refetchOnWindowFocus: true,
    staleTime: 1000,
  });

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      console.log("Updating project status:", { projectId, newStatus });
      
      const { error } = await authSupabase
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

  const handlePriorityChange = async (projectId: string, newPriority: string) => {
    try {
      console.log("Updating project priority:", { projectId, newPriority });
      
      const { error } = await authSupabase
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

  const handleDelete = async (projectId: string) => {
    try {
      console.log("Deleting project:", projectId);
      const { error } = await authSupabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        console.error("Error deleting project:", error);
        throw error;
      }

      await refetch();
      
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete project",
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

        <AuthTest />
        
        {isLoading ? (
          <div>Loading projects...</div>
        ) : (
          <ProjectList
            projects={projects || []}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onDelete={handleDelete}
          />
        )}
      </div>
    </Layout>
  );
};

export default Projects;