
import { Wrench, Briefcase, Clock, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useCompanyFilter } from "@/hooks/useCompanyFilter";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const EnhancedStats = () => {
  const [hasError, setHasError] = useState(false);
  const { hasValidSession, isAuthenticated } = useCompanyFilter();

  // Single dashboard payload query
  const { data: dashboardData, isLoading, error: dashboardError } = useQuery({
    queryKey: ['dashboard-payload'],
    queryFn: async () => {
      console.log('EnhancedStats: Fetching dashboard payload...');
      
      try {
        const { data, error } = await supabase.rpc('dashboard_payload');
        
        if (error) {
          console.error('EnhancedStats: Error fetching dashboard payload:', error);
          throw error;
        }
        
        console.log('EnhancedStats: Dashboard payload fetched:', data);
        return data;
      } catch (err) {
        console.error("EnhancedStats: Dashboard payload query error:", err);
        setHasError(true);
        return null;
      }
    },
    enabled: isAuthenticated && hasValidSession,
    retry: 1,
  });

  // Extract metrics from dashboard payload with type assertion
  const payload = dashboardData as {
    equipment_count?: number;
    active_projects_count?: number;
    pending_tasks_count?: number;
    technician_count?: number;
  } | null;
  
  const equipmentCount = payload?.equipment_count || 0;
  const activeProjectsCount = payload?.active_projects_count || 0;
  const pendingTasksCount = payload?.pending_tasks_count || 0;
  const availableTechniciansCount = payload?.technician_count || 0;

  // Show any errors
  useEffect(() => {
    if (dashboardError) {
      setHasError(true);
      toast({
        title: "Data Loading Error",
        description: "Dashboard data failed to load. Please try refreshing the page.",
        variant: "destructive"
      });
    }
  }, [dashboardError]);

  const stats = [
    {
      name: "Total Equipment",
      value: isLoading ? "..." : equipmentCount.toString(),
      icon: Wrench,
      change: "+4.75%",
      changeType: "positive" as const,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      iconBg: "bg-blue-500"
    },
    {
      name: "Active Projects",
      value: isLoading ? "..." : activeProjectsCount.toString(),
      icon: Briefcase,
      change: "-0.5%",
      changeType: "negative" as const,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      iconBg: "bg-purple-500"
    },
    {
      name: "Pending Tasks",
      value: isLoading ? "..." : pendingTasksCount.toString(),
      icon: Clock,
      change: "+2.1%",
      changeType: "positive" as const,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      iconBg: "bg-orange-500"
    },
    {
      name: "Available Technicians",
      value: isLoading ? "..." : availableTechniciansCount.toString(),
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
