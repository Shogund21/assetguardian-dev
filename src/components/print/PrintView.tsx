
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { PrintControls } from "./PrintControls";
import { EquipmentTable } from "./EquipmentTable";
import { ProjectsTable } from "./ProjectsTable";
import { usePrintHandler } from "./usePrintHandler";

export const PrintView = () => {
  const [view, setView] = useState<"equipment" | "projects">("equipment");
  const { handlePrint } = usePrintHandler();

  const { data: equipmentData } = useQuery({
    queryKey: ["equipment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select("id, name, model, serial_number, location, status, company_id, created_at, updated_at")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="p-6 space-y-6 print:p-0">
      <PrintControls 
        view={view}
        setView={setView}
        onPrint={handlePrint}
      />

      <div className="print-content">
        {view === "equipment" && equipmentData && (
          <EquipmentTable data={equipmentData} />
        )}

        {view === "projects" && projectsData && (
          <ProjectsTable data={projectsData} />
        )}
      </div>
    </div>
  );
};
