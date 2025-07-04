
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { EnhancedPrintControls, PrintDataType } from "./EnhancedPrintControls";
import { EquipmentTable } from "./EquipmentTable";
import { ProjectsTable } from "./ProjectsTable";
import { MaintenanceChecksTable } from "./MaintenanceChecksTable";
import { TechniciansTable } from "./TechniciansTable";
import { FilterChangesTable } from "./FilterChangesTable";
import { LocationsTable } from "./LocationsTable";
import { CompaniesTable } from "./CompaniesTable";
import { SensorReadingsTable } from "./SensorReadingsTable";
import { usePrintHandler } from "./usePrintHandler";

export const PrintView = () => {
  const [selectedType, setSelectedType] = useState<PrintDataType>("equipment");
  const { handlePrint } = usePrintHandler();

  const { data: equipmentData } = useQuery({
    queryKey: ["equipment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select("id, name, model, serial_number, location, status, type, company_id, created_at, updated_at")
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

  const { data: maintenanceData } = useQuery({
    queryKey: ["maintenance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hvac_maintenance_checks")
        .select("id, equipment_id, check_date, status, technician_id, equipment_type, notes")
        .order("check_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: techniciansData } = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("technicians")
        .select("id, firstName, lastName, email, phone, specialization, status, user_role")
        .order("firstName");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: filterChangesData } = useQuery({
    queryKey: ["filter_changes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("filter_changes")
        .select("id, equipment_id, filter_type, filter_size, installation_date, due_date, status, notes")
        .order("due_date");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: locationsData } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name, store_number, is_active, created_at")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: companiesData } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, contact_email, contact_phone, address, created_at")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: sensorReadingsData } = useQuery({
    queryKey: ["sensor_readings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sensor_readings")
        .select("id, equipment_id, sensor_type, value, unit, timestamp_utc, source")
        .order("timestamp_utc", { ascending: false })
        .limit(1000); // Limit for performance
      
      if (error) throw error;
      return data;
    },
  });

  const renderContent = () => {
    if (selectedType === "all") {
      return (
        <div className="space-y-8">
          {equipmentData && <EquipmentTable data={equipmentData} />}
          {projectsData && <ProjectsTable data={projectsData} />}
          {maintenanceData && <MaintenanceChecksTable data={maintenanceData} />}
          {techniciansData && <TechniciansTable data={techniciansData} />}
          {filterChangesData && <FilterChangesTable data={filterChangesData} />}
          {locationsData && <LocationsTable data={locationsData} />}
          {companiesData && <CompaniesTable data={companiesData} />}
          {sensorReadingsData && <SensorReadingsTable data={sensorReadingsData} />}
        </div>
      );
    }

    switch (selectedType) {
      case "equipment":
        return equipmentData && <EquipmentTable data={equipmentData} />;
      case "projects":
        return projectsData && <ProjectsTable data={projectsData} />;
      case "maintenance":
        return maintenanceData && <MaintenanceChecksTable data={maintenanceData} />;
      case "technicians":
        return techniciansData && <TechniciansTable data={techniciansData} />;
      case "filter_changes":
        return filterChangesData && <FilterChangesTable data={filterChangesData} />;
      case "locations":
        return locationsData && <LocationsTable data={locationsData} />;
      case "companies":
        return companiesData && <CompaniesTable data={companiesData} />;
      case "sensor_readings":
        return sensorReadingsData && <SensorReadingsTable data={sensorReadingsData} />;
      default:
        return <div>Select a data type to print</div>;
    }
  };

  return (
    <div className="p-6 space-y-6 print:p-0">
      <EnhancedPrintControls 
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        onPrint={handlePrint}
      />

      <div className="print-content">
        {renderContent()}
      </div>
    </div>
  );
};
