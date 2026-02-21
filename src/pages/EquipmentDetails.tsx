import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QRCodeGenerator } from "@/components/equipment/QRCodeGenerator";
import { StatusDropdown } from "@/components/equipment/StatusDropdown";
import { useEquipmentStatus } from "@/hooks/equipment/useEquipmentStatus";
import EquipmentFilterChanges from "@/components/filter/EquipmentFilterChanges";
import { ChillerHealthBadge } from "@/components/equipment/ChillerHealthBadge";

const EquipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleStatusChange } = useEquipmentStatus();

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching equipment details:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!id,
  });

  const { data: health } = useQuery({
    queryKey: ["asset-health", id],
    queryFn: async () => {
      if (!id) return null;

      await supabase.rpc("calculate_chiller_health_scores" as never);

      const { data, error } = await supabase
        .from("asset_health" as never)
        .select("health_score,risk_band,age_years,pm_compliance_pct,open_work_orders,corrective_wo_last_12m")
        .eq("asset_id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching asset health:", error);
        return null;
      }

      return data;
    },
    enabled: !!id,
  });

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in p-4 md:p-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/equipment")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Equipment
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-60">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Loading equipment details...</p>
          </div>
        ) : equipment ? (
          <div className="space-y-6 animate-fade-in pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-3">
                      <CardTitle className="text-2xl text-black">
                        {equipment.name}
                      </CardTitle>
                      {health?.health_score !== undefined && health?.risk_band ? (
                        <ChillerHealthBadge score={health.health_score} riskBand={health.risk_band} />
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium text-black">Details</h3>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between border-b pb-2">
                              <span className="font-medium">Model:</span>
                              <span>{equipment.model || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                              <span className="font-medium">Serial Number:</span>
                              <span>{equipment.serialNumber || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                              <span className="font-medium">Location:</span>
                              <span>{equipment.location}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <span className="font-medium">Status:</span>
                              <StatusDropdown 
                                status={equipment.status} 
                                onStatusChange={(newStatus) => handleStatusChange(equipment.id, newStatus)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium text-black">Maintenance Schedule</h3>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center border-b pb-2">
                              <Clock className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="font-medium mr-2">Last Maintenance:</span>
                              <span>
                                {equipment.lastMaintenance 
                                  ? new Date(equipment.lastMaintenance).toLocaleDateString() 
                                  : 'No record'}
                              </span>
                            </div>
                            <div className="flex items-center pt-2">
                              <Clock className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="font-medium mr-2">Next Maintenance:</span>
                              <span>
                                {equipment.nextMaintenance 
                                  ? new Date(equipment.nextMaintenance).toLocaleDateString() 
                                  : 'Not scheduled'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {health ? (
                        <div>
                          <h3 className="text-lg font-medium text-black">Chiller Health</h3>
                          <div className="mt-2 space-y-2 text-sm">
                            <div className="flex justify-between border-b pb-2">
                              <span className="font-medium">Age (years):</span>
                              <span>{health.age_years ?? "N/A"}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                              <span className="font-medium">PM Compliance:</span>
                              <span>{health.pm_compliance_pct ?? 0}%</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                              <span className="font-medium">Open Work Orders:</span>
                              <span>{health.open_work_orders ?? 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Corrective WOs (12m):</span>
                              <span>{health.corrective_wo_last_12m ?? 0}</span>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <QRCodeGenerator equipment={equipment} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <EquipmentFilterChanges equipmentId={equipment.id} />
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-black mb-2">Equipment Not Found</h3>
                <p className="text-gray-500 mb-4">
                  The equipment you're looking for does not exist or has been removed.
                </p>
                <Button 
                  onClick={() => navigate("/equipment")}
                  className="bg-[#1EAEDB] hover:bg-[#33C3F0] text-white"
                >
                  View All Equipment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default EquipmentDetails;
