import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  ComposedChart,
  Bar,
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { useEfficiencyTrend } from "@/hooks/useChillerTrendData";
import type { EfficiencyTrendData } from "@/types/chillerDashboard";

interface EfficiencyTrendChartProps {
  data?: EfficiencyTrendData[];
  isLoading?: boolean;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(220, 70%, 50%)",
  "hsl(280, 70%, 50%)",
  "hsl(160, 70%, 50%)",
  "hsl(340, 70%, 50%)",
];

const DEGRADATION_THRESHOLD = 10; // 10% is concerning

export function EfficiencyTrendChart({ data, isLoading }: EfficiencyTrendChartProps) {
  const { data: hookData, isLoading: hookLoading } = useEfficiencyTrend();
  
  const rawData = data || hookData || [];
  const loading = isLoading !== undefined ? isLoading : hookLoading;

  // Transform data for chart
  const chartData = React.useMemo(() => {
    const years = [...new Set(rawData.map(d => d.year))].sort();
    const equipment = [...new Set(rawData.map(d => d.equipmentName))];

    return years.map(year => {
      const yearData: Record<string, number | string | null> = { year: year.toString() };
      
      for (const name of equipment) {
        const record = rawData.find(d => d.year === year && d.equipmentName === name);
        if (record) {
          yearData[`${name}_kw`] = record.kwPerTon;
          yearData[`${name}_design`] = record.designKwPerTon;
          yearData[`${name}_degradation`] = record.degradationPct;
        }
      }
      
      return yearData;
    });
  }, [rawData]);

  const equipmentNames = [...new Set(rawData.map(d => d.equipmentName))];

  // Check for any concerning degradation
  const hasHighDegradation = rawData.some(d => (d.degradationPct || 0) >= DEGRADATION_THRESHOLD);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Efficiency Trend (kW/ton)</CardTitle>
          <CardDescription>Operating efficiency with degradation indicator</CardDescription>
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
          <CardTitle>Efficiency Trend (kW/ton)</CardTitle>
          <CardDescription>Operating efficiency with degradation indicator</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-12">
            No performance test data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Efficiency Trend (kW/ton)</CardTitle>
            <CardDescription>
              Operating efficiency with degradation indicator
            </CardDescription>
          </div>
          {hasHighDegradation && (
            <Badge variant="destructive">
              High Degradation Detected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              yAxisId="left"
              tickFormatter={(value) => `${value.toFixed(2)}`}
              tick={{ fontSize: 12 }}
              domain={['auto', 'auto']}
              className="text-muted-foreground"
              label={{ value: 'kW/ton', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12 }}
              domain={[0, 'auto']}
              className="text-muted-foreground"
              label={{ value: 'Degradation %', angle: 90, position: 'insideRight' }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name.includes('degradation')) {
                  return [`${value?.toFixed(1) || 0}%`, 'Degradation'];
                }
                if (name.includes('design')) {
                  return [`${value?.toFixed(3) || 0} kW/ton`, 'Design'];
                }
                return [`${value?.toFixed(3) || 0} kW/ton`, 'Actual'];
              }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                borderColor: 'hsl(var(--border))' 
              }}
            />
            <Legend />
            
            {/* Reference line for design efficiency (using first equipment's design value) */}
            {rawData[0]?.designKwPerTon && (
              <ReferenceLine 
                y={rawData[0].designKwPerTon} 
                yAxisId="left"
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5"
                label={{ value: 'Design', position: 'right', fill: 'hsl(var(--muted-foreground))' }}
              />
            )}

            {equipmentNames.map((name, index) => (
              <React.Fragment key={name}>
                <Bar
                  yAxisId="left"
                  dataKey={`${name}_kw`}
                  fill={COLORS[index % COLORS.length]}
                  name={`${name} (kW/ton)`}
                  opacity={0.8}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={`${name}_degradation`}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  name={`${name} (Degradation)`}
                  connectNulls
                />
              </React.Fragment>
            ))}
          </ComposedChart>
        </ResponsiveContainer>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            Lower kW/ton values indicate better efficiency. 
            {hasHighDegradation && (
              <span className="text-red-500 ml-1">
                Degradation ≥10% indicates potential fouling or mechanical issues.
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default EfficiencyTrendChart;
