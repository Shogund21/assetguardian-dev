
import { Wrench, Briefcase, Clock, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useCompanyFilter } from "@/hooks/useCompanyFilter";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAuthenticatedSupabase } from "@/hooks/useAuthenticatedSupabase";

const EnhancedStats = () => {
  const [hasError, setHasError] = useState(false);
  const { applyCompanyFilter } = useCompanyFilter();
  const { supabase: authSupabase, isReady, hasValidJWT } = useAuthenticatedSupabase();

  // Fetch equipment data with error handling
  const { data: equipmentData, isLoading: equipmentLoading, error: equipmentError } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      if (!isReady || !hasValidJWT) {
        console.log('EnhancedStats: Auth client not ready or JWT invalid, skipping equipment query');
        return [];
      }
      
      try {
        
        let query = authSupabase
          .from('equipment')
          .select('*');
        
        // Apply company filtering
        query = applyCompanyFilter(query);
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching equipment:', error);
          throw error;
        }
        return data || [];
      } catch (err) {
        console.error("Equipment query error:", err);
        setHasError(true);
        return [];
      }
    },
    enabled: isReady && hasValidJWT,
    retry: 1,
  });

  // Fetch projects data with error handling
  const { data: projectsData, isLoading: projectsLoading, error: projectsError } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!isReady || !hasValidJWT) {
        console.log('EnhancedStats: Auth client not ready or JWT invalid, skipping projects query');
        return [];
      }
      
      try {
        
        let query = authSupabase
          .from('projects')
          .select('*');
        
        // Apply company filtering
        query = applyCompanyFilter(query);
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching projects:', error);
          throw error;
        }
        return data || [];
      } catch (err) {
        console.error("Projects query error:", err);
        setHasError(true);
        return [];
      }
    },
    enabled: isReady && hasValidJWT,
    retry: 1,
  });

  // Fetch maintenance checks data
  const { data: maintenanceData, isLoading: maintenanceLoading, error: maintenanceError } = useQuery({
    queryKey: ['maintenance_checks'],
    queryFn: async () => {
      if (!isReady || !hasValidJWT) {
        console.log('EnhancedStats: Auth client not ready or JWT invalid, skipping maintenance query');
        return [];
      }
      
      try {
        
        let query = authSupabase
          .from('hvac_maintenance_checks')
          .select('*');
        
        // Apply company filtering
        query = applyCompanyFilter(query);
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching maintenance checks:', error);
          throw error;
        }
        return data || [];
      } catch (err) {
        console.error("Maintenance checks query error:", err);
        setHasError(true);
        return [];
      }
    },
    enabled: isReady && hasValidJWT,
    retry: 1,
  });

  // Fetch technicians data
  const { data: techniciansData, isLoading: techniciansLoading, error: techniciansError } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      if (!isReady || !hasValidJWT) {
        console.log('EnhancedStats: Auth client not ready or JWT invalid, skipping technicians query');
        return [];
      }
      
      try {
        
        let query = authSupabase
          .from('technicians')
          .select('*');
        
        // Apply company filtering
        query = applyCompanyFilter(query);
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching technicians:', error);
          throw error;
        }
        return data || [];
      } catch (err) {
        console.error("Technicians query error:", err);
        setHasError(true);
        return [];
      }
    },
    enabled: isReady && hasValidJWT,
    retry: 1,
  });

  // Calculate metrics
  const activeProjectsCount = projectsData?.filter(project => 
    project.status?.toLowerCase() === 'in progress' || 
    project.status?.toLowerCase() === 'ongoing'
  ).length || 0;

  const pendingTasksCount = maintenanceData?.filter(check => 
    check.status === 'pending'
  ).length || 0;

  // Show any errors
  useEffect(() => {
    if (equipmentError || projectsError || maintenanceError || techniciansError) {
      setHasError(true);
      toast({
        title: "Data Loading Error",
        description: "Some dashboard data failed to load. The display may be incomplete.",
        variant: "destructive"
      });
    }
  }, [equipmentError, projectsError, maintenanceError, techniciansError]);

  const stats = [
    {
      name: "Total Equipment",
      value: equipmentLoading ? "..." : (equipmentData?.length || 0).toString(),
      icon: Wrench,
      change: "+4.75%",
      changeType: "positive" as const,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      iconBg: "bg-blue-500"
    },
    {
      name: "Active Projects",
      value: projectsLoading ? "..." : activeProjectsCount.toString(),
      icon: Briefcase,
      change: "-0.5%",
      changeType: "negative" as const,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      iconBg: "bg-purple-500"
    },
    {
      name: "Pending Tasks",
      value: maintenanceLoading ? "..." : pendingTasksCount.toString(),
      icon: Clock,
      change: "+2.1%",
      changeType: "positive" as const,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      iconBg: "bg-orange-500"
    },
    {
      name: "Available Technicians",
      value: techniciansLoading 
        ? "..." 
        : (techniciansData?.filter(tech => tech.isAvailable).length || 0).toString(),
      icon: AlertCircle,
      change: "0%",
      changeType: "neutral" as const,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      iconBg: "bg-green-500"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.name} 
            className={`p-6 border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${stat.bgGradient}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.name}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <div className="flex items-center">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-gray-600"
                    )}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    from last month
                  </span>
                </div>
              </div>
              <div className={`h-14 w-14 rounded-xl ${stat.iconBg} flex items-center justify-center text-white shadow-lg`}>
                <Icon className="h-7 w-7" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default EnhancedStats;
