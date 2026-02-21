import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const RISK_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  low: "bg-green-100 text-green-800 border-green-300",
};

export const ChillerRiskRanking = () => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");

  const { data: locations } = useQuery({
    queryKey: ["locations-for-ranking"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name, store_number")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const selectedLocation = locations?.find((l) => l.id === selectedLocationId);

  const {
    data: rankedChillers,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["chiller-risk-ranking", selectedLocationId],
    enabled: !!selectedLocation,
    queryFn: async () => {
      if (!selectedLocation) return [];

      // Step 1: Fetch chiller equipment at this location
      const { data: chillers, error: eqError } = await supabase
        .from("equipment")
        .select("id, name, type, location")
        .or(`location.eq.${selectedLocation.name},location.eq.${selectedLocation.store_number}`)
        .ilike("type", "%chiller%");

      if (eqError) throw eqError;
      if (!chillers?.length) return [];

      // Step 2: Fetch asset_health for those IDs
      const ids = chillers.map((c) => c.id);
      const { data: healthRows, error: hError } = await supabase
        .from("asset_health")
        .select("*")
        .in("equipment_id", ids);

      if (hError) throw hError;

      // Step 3: Merge and sort
      const healthMap = new Map(healthRows?.map((h) => [h.equipment_id, h]));
      return chillers
        .map((c) => ({ ...c, health: healthMap.get(c.id) ?? null }))
        .sort(
          (a, b) =>
            (a.health?.health_score ?? 999) - (b.health?.health_score ?? 999)
        );
    },
  });

  const [recalculating, setRecalculating] = useState(false);
  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const { error } = await supabase.rpc("calculate_chiller_health_scores");
      if (error) throw error;
      await refetch();
      toast.success("Health scores recalculated");
    } catch {
      toast.error("Failed to recalculate scores");
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl md:text-2xl">Chiller Risk Ranking</CardTitle>
            <CardDescription className="text-sm md:text-base">
              View chillers ranked by health score (worst first)
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            disabled={recalculating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${recalculating ? "animate-spin" : ""}`} />
            Recalculate All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue placeholder="Select a location" />
          </SelectTrigger>
          <SelectContent>
            {locations?.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name} {loc.store_number ? `(#${loc.store_number})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!selectedLocationId && (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Select a location to view chiller risk rankings.
          </p>
        )}

        {selectedLocationId && isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {selectedLocationId && !isLoading && rankedChillers?.length === 0 && (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No chillers found at this location.
          </p>
        )}

        {selectedLocationId && !isLoading && (rankedChillers?.length ?? 0) > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Health Score</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Open WOs</TableHead>
                  <TableHead>PM Compliance</TableHead>
                  <TableHead>Calculated At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankedChillers?.map((chiller) => (
                  <TableRow key={chiller.id}>
                    <TableCell className="font-medium">{chiller.name}</TableCell>
                    <TableCell>
                      <span className="font-bold text-lg">
                        {chiller.health?.health_score ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {chiller.health?.risk_level ? (
                        <Badge
                          className={
                            RISK_COLORS[chiller.health.risk_level] ?? ""
                          }
                        >
                          {chiller.health.risk_level}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{chiller.health?.open_wo_count ?? "—"}</TableCell>
                    <TableCell>
                      {chiller.health?.pm_compliance_pct != null
                        ? `${chiller.health.pm_compliance_pct.toFixed(1)}%`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {chiller.health?.calculated_at
                        ? format(new Date(chiller.health.calculated_at), "MMM d, yyyy h:mm a")
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
