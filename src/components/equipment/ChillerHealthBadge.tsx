import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Activity, RefreshCw } from "lucide-react";

const RISK_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  low: "bg-green-100 text-green-800 border-green-300",
};

interface ChillerHealthBadgeProps {
  equipmentId: string;
}

export default function ChillerHealthBadge({ equipmentId }: ChillerHealthBadgeProps) {
  const [calculating, setCalculating] = useState(false);

  const { data: healthData, isLoading, refetch } = useQuery({
    queryKey: ["asset_health", equipmentId],
    queryFn: async () => {
      const { data } = await supabase
        .from("asset_health")
        .select("*")
        .eq("equipment_id", equipmentId)
        .maybeSingle();
      return data;
    },
  });

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const { error } = await supabase.rpc("calculate_chiller_health_scores");
      if (error) throw error;
      await refetch();
      toast({ title: "Health score calculated" });
    } catch (e: any) {
      toast({ title: "Calculation failed", description: e.message, variant: "destructive" });
    } finally {
      setCalculating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-black">Asset Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-4">
            <Skeleton className="h-16 w-20" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!healthData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-black">Asset Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No health score calculated yet</p>
            <Button onClick={handleCalculate} disabled={calculating}>
              <RefreshCw className={cn("h-4 w-4 mr-2", calculating && "animate-spin")} />
              {calculating ? "Calculating…" : "Calculate Now"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    { label: "Age", value: healthData.age_years != null ? `${Number(healthData.age_years).toFixed(1)} yrs` : "N/A" },
    { label: "Open Work Orders", value: healthData.open_wo_count ?? "N/A" },
    { label: "Corrective WOs (12m)", value: healthData.corrective_wo_12m_count ?? "N/A" },
    { label: "PM Compliance", value: healthData.pm_compliance_pct != null ? `${Number(healthData.pm_compliance_pct).toFixed(1)}%` : "N/A" },
    { label: "Calculated At", value: healthData.calculated_at ? format(new Date(healthData.calculated_at), "MMM d, yyyy h:mm a") : "N/A" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-black">Asset Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-4xl font-bold">{healthData.health_score}</span>
          <span
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium border",
              RISK_COLORS[healthData.risk_level] ?? "bg-muted text-muted-foreground"
            )}
          >
            {healthData.risk_level}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-sm font-semibold mt-1">{m.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
