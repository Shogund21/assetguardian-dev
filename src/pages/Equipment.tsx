import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { EquipmentList } from "@/components/equipment/EquipmentList";
import { EquipmentAuth } from "@/components/equipment/EquipmentAuth";
import { useEquipmentStatus } from "@/hooks/equipment/useEquipmentStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChillerHealthBadge } from "@/components/equipment/ChillerHealthBadge";

interface ChillerRankingRow {
  asset_id: string;
  name: string;
  model: string | null;
  location: string;
  pm_compliance_pct: number | null;
  open_work_orders: number;
  corrective_wo_last_12m: number;
  health_score: number;
  risk_band: "low" | "medium" | "high" | "critical";
}

const Equipment = () => {
  const navigate = useNavigate();
  const { handleStatusChange, handleDelete } = useEquipmentStatus();

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name', { ascending: true }); // Sort by name (equipment type) alphabetically
      
      if (error) {
        console.error('Error fetching equipment:', error);
        throw error;
      }
      return data;
    },
  });

  const { data: chillerRanking, isLoading: rankingLoading } = useQuery({
    queryKey: ["chiller-health-ranking"],
    queryFn: async () => {
      await supabase.rpc("calculate_chiller_health_scores" as never);

      const { data, error } = await supabase
        .from("chiller_health_ranking" as never)
        .select("*")
        .limit(25);

      if (error) {
        console.error("Error loading chiller ranking:", error);
        return [];
      }

      return (data || []) as unknown as ChillerRankingRow[];
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

          <Card>
            <CardHeader>
              <CardTitle>Chiller Health Ranking (Worst → Best)</CardTitle>
            </CardHeader>
            <CardContent>
              {rankingLoading ? (
                <p className="text-sm text-muted-foreground">Calculating chiller health...</p>
              ) : !chillerRanking?.length ? (
                <p className="text-sm text-muted-foreground">No chiller health data available yet.</p>
              ) : (
                <div className="space-y-3">
                  {chillerRanking.map((row, index: number) => (
                    <div key={row.asset_id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                      <div>
                        <p className="font-medium">#{index + 1} {row.name}</p>
                        <p className="text-xs text-muted-foreground">{row.location} • {row.model || "Unknown model"}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>PM: {row.pm_compliance_pct ?? 0}%</span>
                        <span>Open WO: {row.open_work_orders ?? 0}</span>
                        <span>Corrective 12m: {row.corrective_wo_last_12m ?? 0}</span>
                        <ChillerHealthBadge score={row.health_score} riskBand={row.risk_band} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </EquipmentAuth>
    </Layout>
  );
};

export default Equipment;
