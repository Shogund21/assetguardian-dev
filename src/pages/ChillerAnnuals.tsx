import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, AlertTriangle, CheckCircle2, Clock, BarChart3, LayoutDashboard, FileText } from "lucide-react";
import { format } from "date-fns";
import CustomLayout from "@/components/CustomLayout";
import ChillerAnnualsDashboard from "@/components/chiller-annuals/dashboard/ChillerAnnualsDashboard";
import ExecutiveReportGenerator from "@/components/chiller-annuals/reports/ExecutiveReportGenerator";
import type { AnnualChillerPM } from "@/types/chillerAnnual";

const ChillerAnnuals = () => {
  const { currentCompany } = useCompany();
  const [activeTab, setActiveTab] = useState("inspections");
  const [inspectionFilter, setInspectionFilter] = useState("all");

  // Fetch annual chiller PMs
  const { data: annualPMs, isLoading } = useQuery({
    queryKey: ["annual-chiller-pms", currentCompany?.id],
    queryFn: async () => {
      let query = supabase
        .from("annual_chiller_pm")
        .select(`
          *,
          equipment:equipment_id (name, location, type),
          technician:technician_id (firstName:firstName, lastName:lastName)
        `)
        .order("inspection_date", { ascending: false });

      if (currentCompany?.id) {
        query = query.eq("company_id", currentCompany.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as AnnualChillerPM[];
    },
    enabled: true,
  });

  // Summary stats
  const stats = React.useMemo(() => {
    if (!annualPMs) return { total: 0, completed: 0, inProgress: 0, critical: 0 };
    return {
      total: annualPMs.length,
      completed: annualPMs.filter(pm => pm.status === "completed").length,
      inProgress: annualPMs.filter(pm => pm.status === "in_progress").length,
      critical: annualPMs.filter(pm => pm.overall_risk_level === "critical" || pm.overall_risk_level === "high").length,
    };
  }, [annualPMs]);

  // Filter PMs based on inspection filter
  const filteredPMs = React.useMemo(() => {
    if (!annualPMs) return [];
    switch (inspectionFilter) {
      case "completed":
        return annualPMs.filter(pm => pm.status === "completed");
      case "in_progress":
        return annualPMs.filter(pm => pm.status === "in_progress" || pm.status === "draft");
      case "critical":
        return annualPMs.filter(pm => pm.overall_risk_level === "critical" || pm.overall_risk_level === "high");
      default:
        return annualPMs;
    }
  }, [annualPMs, inspectionFilter]);

  const getRiskBadgeVariant = (riskLevel: string | null) => {
    switch (riskLevel) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "pending_review":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <CustomLayout>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Calendar className="h-7 w-7" />
                Annual Chiller Maintenance
              </h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive annual inspections for water-cooled chillers
              </p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Annual PM
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Inspections</CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Completed</CardDescription>
                <CardTitle className="text-3xl text-green-600">{stats.completed}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>In Progress</CardDescription>
                <CardTitle className="text-3xl text-blue-600">{stats.inProgress}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>High/Critical Risk</CardDescription>
                <CardTitle className="text-3xl text-red-600">{stats.critical}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Main Tabs: Inspections, Dashboard, Reports */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="inspections" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Inspections
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            {/* Inspections Tab */}
            <TabsContent value="inspections" className="mt-4">
              {/* Inspection Filters */}
              <Tabs value={inspectionFilter} onValueChange={setInspectionFilter} className="w-full mb-4">
                <TabsList className="grid w-full grid-cols-4 max-w-md">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="critical">Critical</TabsTrigger>
                </TabsList>
              </Tabs>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredPMs.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Annual Inspections</h3>
                    <p className="text-muted-foreground text-center max-w-sm mt-2">
                      {inspectionFilter === "all" 
                        ? "Start by creating your first annual chiller maintenance inspection."
                        : `No ${inspectionFilter.replace("_", " ")} inspections found.`}
                    </p>
                    {inspectionFilter === "all" && (
                      <Button className="mt-4" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Inspection
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredPMs.map((pm) => (
                    <Card key={pm.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(pm.status)}
                              <h3 className="font-semibold">
                                {pm.equipment?.name || "Unknown Equipment"}
                              </h3>
                              {pm.overall_risk_level && (
                                <Badge variant={getRiskBadgeVariant(pm.overall_risk_level)}>
                                  {pm.overall_risk_level}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                              <p>
                                {pm.equipment?.location} • {pm.chiller_model || pm.equipment?.type || "Chiller"}
                              </p>
                              <p>
                                Year: {pm.inspection_year} • 
                                Inspected: {format(new Date(pm.inspection_date), "MMM d, yyyy")}
                                {pm.technician && ` • ${pm.technician.firstName} ${pm.technician.lastName}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {pm.overall_risk_score !== null && (
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">Risk Score</div>
                                <div className={`text-lg font-bold ${
                                  pm.overall_risk_score >= 70 ? "text-red-600" :
                                  pm.overall_risk_score >= 40 ? "text-yellow-600" :
                                  "text-green-600"
                                }`}>
                                  {pm.overall_risk_score.toFixed(0)}
                                </div>
                              </div>
                            )}
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="mt-4">
              <ChillerAnnualsDashboard />
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="mt-4">
              <ExecutiveReportGenerator />
            </TabsContent>
          </Tabs>
        </div>
    </CustomLayout>
  );
};

export default ChillerAnnuals;
