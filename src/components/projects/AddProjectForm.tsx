import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectBasicInfo } from "./form/ProjectBasicInfo";
import { ProjectStatusInfo } from "./form/ProjectStatusInfo";
import { ProjectDates } from "./form/ProjectDates";
import { FormActions } from "./form/FormActions";
import { projectFormSchema, type ProjectFormValues } from "./types";

export const AddProjectForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "Not Started",
      startdate: "",
      enddate: "",
      priority: "Medium",
      location: "",
    },
  });

  const onSubmit = async (values: ProjectFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("projects").insert({
        name: values.name,
        description: values.description,
        status: values.status,
        startdate: values.startdate || null,
        enddate: values.enddate || null,
        priority: values.priority,
        location: values.location,
        createdat: new Date().toISOString(),
        updatedat: new Date().toISOString(),
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Project added successfully",
      });
      
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate("/projects");
    } catch (error) {
      console.error("Error adding project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add project. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ProjectBasicInfo form={form} />
        <ProjectStatusInfo form={form} />
        <ProjectDates form={form} />
        <FormActions isSubmitting={isSubmitting} />
      </form>
    </Form>
  );
};
