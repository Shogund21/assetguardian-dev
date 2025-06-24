
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Database, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DatabaseStatus = () => {
  const { data: status, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['database-status'],
    queryFn: async () => {
      console.log('Checking database status...');
      
      const tables = [
        'predictive_alerts',
        'sensor_readings', 
        'equipment_thresholds',
        'automated_work_orders'
      ];
      
      const results = await Promise.all(
        tables.map(async (table) => {
          try {
            const { data, error } = await supabase
              .from(table as any)
              .select('id')
              .limit(1);
            
            return {
              name: table,
              exists: !error,
              error: error?.message
            };
          } catch (err) {
            return {
              name: table,
              exists: false,
              error: err instanceof Error ? err.message : 'Unknown error'
            };
          }
        })
      );
      
      return results;
    },
    refetchInterval: 30000,
  });

  const getTableDisplayName = (tableName: string) => {
    const names: Record<string, string> = {
      'predictive_alerts': 'Predictive Alerts',
      'sensor_readings': 'Sensor Readings', 
      'equipment_thresholds': 'Equipment Thresholds',
      'automated_work_orders': 'Work Orders'
    };
    return names[tableName] || tableName;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Checking database status...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allTablesExist = status?.every(table => table.exists) ?? false;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Status
        </CardTitle>
        <Button 
          onClick={() => refetch()}
          size="sm"
          variant="outline"
          disabled={isRefetching}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {allTablesExist ? (
          <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">All database components are ready!</span>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <span className="text-yellow-800 font-medium">Some database components need attention</span>
          </div>
        )}

        <div className="space-y-3">
          {status?.map((table) => (
            <div key={table.name} className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">{getTableDisplayName(table.name)}</span>
              <Badge 
                variant={table.exists ? "default" : "destructive"}
                className={table.exists ? "bg-blue-500 hover:bg-blue-600" : ""}
              >
                {table.exists ? 'Ready' : 'Missing'}
              </Badge>
            </div>
          ))}
        </div>

        {!allTablesExist && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Setup Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                All required database tables are present!
              </li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseStatus;
