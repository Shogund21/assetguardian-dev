
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { EquipmentList } from "@/components/equipment/EquipmentList";
import { EquipmentAuth } from "@/components/equipment/EquipmentAuth";
import { useEquipmentStatus } from "@/hooks/equipment/useEquipmentStatus";
import { useCompanyFilter } from "@/hooks/useCompanyFilter";

const Equipment = () => {
  const navigate = useNavigate();
  const { handleStatusChange, handleDelete } = useEquipmentStatus();
  const { applyCompanyFilter } = useCompanyFilter();

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      let query = supabase
        .from('equipment')
        .select('id, name, model, serial_number, location, status, type, company_id, created_at, updated_at');
      
      // Apply company filtering
      query = applyCompanyFilter(query);
      
      query = query.order('name', { ascending: true }); // Sort by name (equipment type) alphabetically
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching equipment:', error);
        throw error;
      }
      return data;
    },
  });

  return (
    <Layout>
      <EquipmentAuth>
        <div className="space-y-8 animate-fade-in p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Equipment</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                View and manage all equipment
              </p>
            </div>
            <Button 
              onClick={() => navigate("/add-equipment")}
              className="w-full md:w-auto bg-[#1EAEDB] hover:bg-[#33C3F0] text-black"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Equipment
            </Button>
          </div>

          {isLoading ? (
            <p className="text-center py-4">Loading equipment...</p>
          ) : (
            <EquipmentList 
              equipment={equipment || []}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          )}
        </div>
      </EquipmentAuth>
    </Layout>
  );
};

export default Equipment;
