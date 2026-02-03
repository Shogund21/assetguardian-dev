import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, AlertTriangle, Calendar, Thermometer, Shield } from "lucide-react";
import { format } from "date-fns";
import { useChillerFleetHealth } from "@/hooks/useChillerFleetHealth";
import type { ChillerFleetHealth } from "@/types/chillerDashboard";

interface FleetHealthOverviewProps {
  data?: ChillerFleetHealth;
  isLoading?: boolean;
}

export function FleetHealthOverview({ data, isLoading }: FleetHealthOverviewProps) {
  // Use provided data or fetch from hook
  const { data: hookData, isLoading: hookLoading } = useChillerFleetHealth();
  
  const fleetData = data || hookData;
  const loading = isLoading !== undefined ? isLoading : hookLoading;

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {/* Total Chillers */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            Total Chillers
          </CardDescription>
          <CardTitle className="text-3xl">
            {fleetData?.totalChillers || 0}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">Active in fleet</p>
        </CardContent>
      </Card>

      {/* Average Health Score */}
      <Card className={getHealthScoreBg(fleetData?.averageHealthScore || 0)}>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Avg Health Score
          </CardDescription>
          <CardTitle className={`text-3xl ${getHealthScoreColor(fleetData?.averageHealthScore || 0)}`}>
            {fleetData?.averageHealthScore || 0}%
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            Fleet-wide average
          </p>
        </CardContent>
      </Card>

      {/* High Risk Assets */}
      <Card className={fleetData?.highRiskCount ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" : ""}>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            High Risk
          </CardDescription>
          <CardTitle className={`text-3xl ${fleetData?.highRiskCount ? "text-red-600 dark:text-red-400" : ""}`}>
            {fleetData?.highRiskCount || 0}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {fleetData?.highRiskCount ? (
            <Badge variant="destructive" className="text-xs">Attention Required</Badge>
          ) : (
            <p className="text-xs text-muted-foreground">All assets healthy</p>
          )}
        </CardContent>
      </Card>

      {/* No Redundancy Risk */}
      <Card className={fleetData?.noRedundancyRiskCount ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800" : ""}>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            No Backup
          </CardDescription>
          <CardTitle className={`text-3xl ${fleetData?.noRedundancyRiskCount ? "text-orange-600 dark:text-orange-400" : ""}`}>
            {fleetData?.noRedundancyRiskCount || 0}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            Single point of failure
          </p>
        </CardContent>
      </Card>

      {/* Next Inspection Due */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Next Due
          </CardDescription>
          <CardTitle className="text-lg">
            {fleetData?.nextInspectionDue 
              ? format(new Date(fleetData.nextInspectionDue), "MMM d, yyyy")
              : "—"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            Upcoming inspection
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default FleetHealthOverview;
