
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterStatusBadge } from "../filter/FilterStatusBadge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FilterChange } from "@/types/filterChanges";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { calculateFilterStatus } from "@/utils/filterStatusCalculator";

interface FilterChangeSummary {
  total: number;
  overdue: number;
  due_soon: number;
  upcoming: number;
  completed: number;
}

export const FilterChangesOverview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<FilterChangeSummary>({
    total: 0,
    overdue: 0,
    due_soon: 0,
    upcoming: 0,
    completed: 0
  });
  const [recentChanges, setRecentChanges] = useState<FilterChange[]>([]);

  useEffect(() => {
    const fetchFilterSummary = async () => {
      try {
        // Fetch summary counts - query filter_changes directly where status = 'active'
        const { data: viewData, error: viewError } = await supabase
          .from("filter_changes")
          .select("status, due_date")
          .eq("status", "active");

        if (viewError) throw viewError;

        // Process summary data and calculate status on client side
        const summaryData: FilterChangeSummary = {
          total: viewData.length,
          overdue: 0,
          due_soon: 0,
          upcoming: 0,
          completed: 0
        };

        viewData.forEach(item => {
          if (item.status === 'completed') {
            summaryData.completed++;
          } else {
            const statusCalc = calculateFilterStatus(item.due_date);
            if (statusCalc === 'overdue') {
              summaryData.overdue++;
            } else if (statusCalc === 'due_soon') {
              summaryData.due_soon++;
            } else {
              summaryData.upcoming++;
            }
          }
        });

        setSummary(summaryData);

        // Fetch recent filter changes - query filter_changes directly where status = 'active'
        const { data: recentData, error: recentError } = await supabase
          .from("filter_changes")
          .select(`
            *,
            equipment:equipment_id (
              name,
              location
            )
          `)
          .eq("status", "active")
          .order("due_date", { ascending: true })
          .limit(3);

        if (recentError) throw recentError;
        
        // Add calculated status_calc to each item
        const dataWithStatus = recentData.map(item => ({
          ...item,
          status_calc: calculateFilterStatus(item.due_date)
        }));
        
        setRecentChanges(dataWithStatus as FilterChange[]);

      } catch (error) {
        console.error("Error fetching filter changes summary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilterSummary();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('filter-changes-overview')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'filter_changes' },
        () => fetchFilterSummary()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="overflow-hidden border-none shadow-lg bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-2">
        <CardTitle className="text-lg font-bold">Filter Changes Status</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="h-24 flex items-center justify-center">
            <p>Loading filter changes...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
              <div className="bg-red-50 p-2 rounded">
                <div className="text-xs text-gray-500">Overdue</div>
                <div className="text-xl font-bold text-red-600">{summary.overdue}</div>
              </div>
              <div className="bg-yellow-50 p-2 rounded">
                <div className="text-xs text-gray-500">Due Soon</div>
                <div className="text-xl font-bold text-yellow-600">{summary.due_soon}</div>
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <div className="text-xs text-gray-500">Upcoming</div>
                <div className="text-xl font-bold text-blue-600">{summary.upcoming}</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="text-xs text-gray-500">Completed</div>
                <div className="text-xl font-bold text-green-600">{summary.completed}</div>
              </div>
            </div>
            
            {recentChanges.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Upcoming Filter Changes</h3>
                <div className="space-y-2">
                  {recentChanges.map(change => (
                    <div key={change.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <div className="text-sm">
                        <div className="font-medium">{change.equipment?.name}</div>
                        <div className="text-gray-500">{format(new Date(change.due_date), "MMM d, yyyy")}</div>
                      </div>
                      <FilterStatusBadge 
                        status={change.status} 
                        calculatedStatus={change.status_calc} 
                        className="text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-center mt-2">
              <Button variant="ghost" asChild size="sm">
                <Link to="/filter-changes" className="text-blue-600 hover:text-blue-800">
                  View All Filter Changes <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
