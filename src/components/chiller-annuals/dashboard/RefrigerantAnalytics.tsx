import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { useRefrigerantTrend, useLeakHeatmap } from "@/hooks/useChillerTrendData";
import type { RefrigerantTrendData, LeakHeatmapCell } from "@/types/chillerDashboard";

interface RefrigerantAnalyticsProps {
  trendData?: RefrigerantTrendData[];
  heatmapData?: LeakHeatmapCell[];
  isLoading?: boolean;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(220, 70%, 50%)",
  "hsl(280, 70%, 50%)",
  "hsl(160, 70%, 50%)",
  "hsl(340, 70%, 50%)",
];

export function RefrigerantAnalytics({ trendData, heatmapData, isLoading }: RefrigerantAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("trend");
  
  const { data: hookTrendData, isLoading: trendLoading } = useRefrigerantTrend();
  const { data: hookHeatmapData, isLoading: heatmapLoading } = useLeakHeatmap();
  
  const trend = trendData || hookTrendData || [];
  const heatmap = heatmapData || hookHeatmapData || [];
  const loading = isLoading !== undefined ? isLoading : (trendLoading || heatmapLoading);

  // Transform trend data for chart
  const chartData = React.useMemo(() => {
    const years = [...new Set(trend.map(d => d.year))].sort();
    const equipment = [...new Set(trend.map(d => d.equipmentName))];

    return years.map(year => {
      const yearData: Record<string, number | string> = { year: year.toString() };
      
      for (const name of equipment) {
        const record = trend.find(d => d.year === year && d.equipmentName === name);
        if (record) {
          yearData[name] = record.netLossLbs;
        }
      }
      
      return yearData;
    });
  }, [trend]);

  const equipmentNames = [...new Set(trend.map(d => d.equipmentName))];

  // Transform heatmap data for display
  const heatmapRows = React.useMemo(() => {
    const locations = [...new Set(heatmap.map(c => c.location))];
    const leakTypes = [...new Set(heatmap.map(c => c.leakLocationLabel))];

    return { locations, leakTypes, cells: heatmap };
  }, [heatmap]);

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 0.8) return "bg-red-600 text-white";
    if (intensity >= 0.6) return "bg-red-400 text-white";
    if (intensity >= 0.4) return "bg-orange-400 text-white";
    if (intensity >= 0.2) return "bg-yellow-400 text-black";
    return "bg-yellow-200 text-black";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Refrigerant Analytics</CardTitle>
          <CardDescription>Loss trends and leak location analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Refrigerant Analytics</CardTitle>
        <CardDescription>Loss trends and leak location analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="trend">Loss Trend</TabsTrigger>
            <TabsTrigger value="heatmap">Leak Heatmap</TabsTrigger>
          </TabsList>

          <TabsContent value="trend">
            {trend.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">
                No refrigerant data available
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value} lbs`}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(0)} lbs`, 'Net Loss']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))' 
                    }}
                  />
                  <Legend />
                  {equipmentNames.map((name, index) => (
                    <Bar
                      key={name}
                      dataKey={name}
                      fill={COLORS[index % COLORS.length]}
                      name={name}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="heatmap">
            {heatmap.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">
                No leak data available
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">Intensity:</span>
                  <div className="flex gap-2">
                    <Badge className="bg-yellow-200 text-black">Low</Badge>
                    <Badge className="bg-orange-400 text-white">Medium</Badge>
                    <Badge className="bg-red-600 text-white">High</Badge>
                  </div>
                </div>
                
                <div className="overflow-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left p-2 border-b text-sm font-medium">Location</th>
                        {heatmapRows.leakTypes.map(type => (
                          <th key={type} className="text-center p-2 border-b text-sm font-medium">
                            {type}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {heatmapRows.locations.map(location => (
                        <tr key={location}>
                          <td className="p-2 border-b text-sm">{location}</td>
                          {heatmapRows.leakTypes.map(type => {
                            const cell = heatmapRows.cells.find(
                              c => c.location === location && c.leakLocationLabel === type
                            );
                            return (
                              <td key={type} className="p-2 border-b text-center">
                                {cell && cell.leakCount > 0 ? (
                                  <Badge className={getIntensityColor(cell.intensity)}>
                                    {cell.leakCount}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default RefrigerantAnalytics;
