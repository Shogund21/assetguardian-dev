
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { EquipmentList } from "@/components/equipment/EquipmentList";
import { EquipmentAuth } from "@/components/equipment/EquipmentAuth";
import { useEquipmentStatus } from "@/hooks/equipment/useEquipmentStatus";
import { useCompanyFilter } from "@/hooks/useCompanyFilter";
import { useAuth } from "@/hooks/useAuth";
import { supabase, testJWTTransmission } from "@/integrations/supabase/client";
import { useEffect } from "react";

const Equipment = () => {
  const navigate = useNavigate();
  const { handleStatusChange, handleDelete } = useEquipmentStatus();
  const { applyCompanyFilter } = useCompanyFilter();
  const { isAuthenticated, user } = useAuth();

  // Test JWT transmission on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      testJWTTransmission().then(result => {
        console.log("Equipment page JWT test result:", result);
      });
    }
  }, [isAuthenticated, user]);

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      if (!isAuthenticated) {
        console.log('Equipment: User not authenticated');
        return [];
      }

      const { data, error } = await supabase.rpc('get_equipment_data', {
        p_company_id: null,
        p_limit: 1000,
        p_offset: 0,
        p_search: ''
      });
      
      if (error) {
        console.error('Error fetching equipment:', error);
        throw error;
      }
      return data || [];
    },
    enabled: isAuthenticated,
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
