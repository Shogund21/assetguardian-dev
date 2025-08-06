
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import ActivityItem from "./ActivityItem";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { 
  getStatusIcon, 
  getMaintenanceIcon, 
  formatTimestamp, 
  getOriginalDate 
} from "@/utils/activityUtils";
import { Badge } from "@/components/ui/badge";

interface Activity {
  id: string;
  title: string;
  status: string;
  timestamp: string;
  icon: any;
}

const EnhancedRecentActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRecentActivities = async () => {
    try {
      const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .order("updatedat", { ascending: false })
        .limit(2);

      const { data: maintenanceChecks } = await supabase
        .from("hvac_maintenance_checks")
        .select(`
          *,
          equipment:equipment!fk_maintenance_equipment(name),
          technician:technicians!fk_maintenance_technician(firstName, lastName)
        `)
        .order("updated_at", { ascending: false })
        .limit(2);

      const combinedActivities: Activity[] = [];

      projects?.forEach((project) => {
        combinedActivities.push({
          id: `project-${project.id}`,
          title: project.name,
          status: project.status,
          timestamp: formatTimestamp(project.updatedat),
          icon: getStatusIcon(project.status),
        });
      });

      maintenanceChecks?.forEach((check) => {
        const equipmentName = check.equipment?.name || "Unknown Equipment";
        const technicianName = check.technician 
          ? `${check.technician.firstName} ${check.technician.lastName}`
          : "Unassigned";

        combinedActivities.push({
          id: `maintenance-${check.id}`,
          title: `${equipmentName} Check`,
          status: `${check.status} by ${technicianName}`,
          timestamp: formatTimestamp(check.updated_at),
          icon: getMaintenanceIcon(check.status),
        });
      });

      const sortedActivities = combinedActivities
        .sort((a, b) => {
          const dateA = new Date(getOriginalDate(a.timestamp)).getTime();
          const dateB = new Date(getOriginalDate(b.timestamp)).getTime();
          return dateB - dateA;
        })
        .slice(0, 4);

      setActivities(sortedActivities);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRecentActivities();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    fetchRecentActivities();

    const projectsChannel = supabase
      .channel('public:projects')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => fetchRecentActivities()
      )
      .subscribe();

    const maintenanceChannel = supabase
      .channel('public:maintenance')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hvac_maintenance_checks' },
        () => fetchRecentActivities()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(maintenanceChannel);
    };
  }, []);

  return (
    <Card className="border-none shadow-lg bg-white">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <i className="fas fa-clock text-orange-600"></i>
            Recent Activities
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
              Live Updates
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-gray-300 hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <i className="fas fa-clock text-gray-300 text-4xl"></i>
              </div>
              <p className="text-gray-500 text-lg">No recent activities</p>
              <p className="text-gray-400 text-sm">Activities will appear here as they happen</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="border border-gray-100 rounded-lg p-1 hover:border-gray-200 transition-colors">
                <ActivityItem {...activity} />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedRecentActivities;
