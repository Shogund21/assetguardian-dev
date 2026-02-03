import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine 
} from "recharts";
import { useTubeLossTrend } from "@/hooks/useChillerTrendData";
import type { TubeLossTrendData } from "@/types/chillerDashboard";

interface TubeLossTrendChartProps {
  data?: TubeLossTrendData[];
  isLoading?: boolean;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(220, 70%, 50%)",
  "hsl(280, 70%, 50%)",
  "hsl(160, 70%, 50%)",
  "hsl(340, 70%, 50%)",
];

const TUBE_PLUGGED_THRESHOLD = 5; // 5% is typical manufacturer limit

export function TubeLossTrendChart({ data, isLoading }: TubeLossTrendChartProps) {
  const { data: hookData, isLoading: hookLoading } = useTubeLossTrend();
  
  const rawData = data || hookData || [];
  const loading = isLoading !== undefined ? isLoading : hookLoading;

  // Transform data for chart - pivot by equipment
  const chartData = React.useMemo(() => {
    const years = [...new Set(rawData.map(d => d.year))].sort();
    const equipment = [...new Set(rawData.map(d => d.equipmentName))];

    return years.map(year => {
      const yearData: Record<string, number | string> = { year: year.toString() };
      
      for (const name of equipment) {
        const record = rawData.find(d => d.year === year && d.equipmentName === name);
        if (record) {
          yearData[`${name}_evap`] = record.evaporatorPluggedPct || 0;
          yearData[`${name}_cond`] = record.condenserPluggedPct || 0;
        }
      }
      
      return yearData;
    });
  }, [rawData]);

  const equipmentNames = [...new Set(rawData.map(d => d.equipmentName))];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tube Loss % Trend</CardTitle>
          <CardDescription>Multi-year tube plugging percentage by asset</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (rawData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tube Loss % Trend</CardTitle>
          <CardDescription>Multi-year tube plugging percentage by asset</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-12">
            No tube inspection data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tube Loss % Trend</CardTitle>
        <CardDescription>
          Multi-year tube plugging percentage by asset
          <span className="ml-2 text-red-500 text-xs">
            (5% threshold shown)
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12 }}
              domain={[0, 'auto']}
              className="text-muted-foreground"
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                borderColor: 'hsl(var(--border))' 
              }}
            />
            <Legend />
            <ReferenceLine 
              y={TUBE_PLUGGED_THRESHOLD} 
              stroke="hsl(var(--destructive))" 
              strokeDasharray="5 5"
              label={{ value: '5% Limit', position: 'right', fill: 'hsl(var(--destructive))' }}
            />
            {equipmentNames.map((name, index) => (
              <React.Fragment key={name}>
                <Line
                  type="monotone"
                  dataKey={`${name}_evap`}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name={`${name} (Evap)`}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey={`${name}_cond`}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  name={`${name} (Cond)`}
                  connectNulls
                />
              </React.Fragment>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default TubeLossTrendChart;
