import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ChillerEnergyService, EnergyReading } from '@/services/chillerEnergyService';
import { format } from 'date-fns';

interface EfficiencyTrendsChartProps {
  equipmentId: string;
}

const EfficiencyTrendsChart = ({ equipmentId }: EfficiencyTrendsChartProps) => {
  const [data, setData] = useState<EnergyReading[]>([]);
  const [timeRange, setTimeRange] = useState<string>('7');
  const [loading, setLoading] = useState(true);

  const OPTIMAL_EER = 12; // Baseline efficiency
  const WARNING_EER = 10; // Below this shows warning

  const loadData = async () => {
    try {
      setLoading(true);
      const energyHistory = await ChillerEnergyService.getEnergyHistory(equipmentId, parseInt(timeRange));
      setData(energyHistory);
    } catch (error) {
      console.error('Error loading efficiency trends data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [equipmentId, timeRange]);

  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case 'efficiency':
        return [`${value} EER`, 'Energy Efficiency Ratio'];
      case 'powerConsumption':
        return [`${value} kW`, 'Power Consumption'];
      default:
        return [value, name];
    }
  };

  const formatXAxisLabel = (tickItem: string) => {
    return format(new Date(tickItem), 'MMM dd HH:mm');
  };

  const calculateEfficiencyStats = () => {
    if (data.length === 0) return null;

    const efficiencies = data.map(d => d.efficiency);
    const avgEfficiency = efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length;
    const minEfficiency = Math.min(...efficiencies);
    const maxEfficiency = Math.max(...efficiencies);
    
    // Calculate trend
    const firstHalf = efficiencies.slice(0, Math.floor(efficiencies.length / 2));
    const secondHalf = efficiencies.slice(Math.floor(efficiencies.length / 2));
    const firstAvg = firstHalf.reduce((sum, eff) => sum + eff, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, eff) => sum + eff, 0) / secondHalf.length;
    const trendDirection = secondAvg > firstAvg ? 'improving' : secondAvg < firstAvg ? 'declining' : 'stable';
    
    return {
      avgEfficiency: avgEfficiency.toFixed(1),
      minEfficiency: minEfficiency.toFixed(1),
      maxEfficiency: maxEfficiency.toFixed(1),
      trendDirection,
      trendValue: ((secondAvg - firstAvg) / firstAvg * 100).toFixed(1)
    };
  };

  const stats = calculateEfficiencyStats();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Efficiency Trends Analysis</CardTitle>
          <CardDescription>Loading efficiency trend data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Efficiency Trends Analysis
            </CardTitle>
            <CardDescription>
              Energy Efficiency Ratio (EER) performance over time
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Day</SelectItem>
              <SelectItem value="3">3 Days</SelectItem>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="14">14 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No efficiency data available for the selected time period
          </div>
        ) : (
          <div className="space-y-6">
            {/* Efficiency Trend Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatXAxisLabel}
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="left"
                  domain={['dataMin - 1', 'dataMax + 1']}
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={formatTooltipValue}
                  labelFormatter={(label) => format(new Date(label), 'PPp')}
                />
                <Legend />
                
                {/* Reference lines for optimal and warning levels */}
                <ReferenceLine 
                  y={OPTIMAL_EER} 
                  stroke="hsl(var(--primary))" 
                  strokeDasharray="5 5" 
                  label="Optimal EER"
                />
                <ReferenceLine 
                  y={WARNING_EER} 
                  stroke="hsl(var(--destructive))" 
                  strokeDasharray="5 5" 
                  label="Warning Level"
                />
                
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="hsl(var(--accent))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
                  yAxisId="left"
                  name="Energy Efficiency Ratio"
                />
                
                <Line
                  type="monotone"
                  dataKey="powerConsumption"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  dot={false}
                  yAxisId="right"
                  name="Power Consumption (kW)"
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Performance Summary */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {stats.avgEfficiency}
                  </div>
                  <div className="text-sm text-muted-foreground">Average EER</div>
                  <div className="flex items-center justify-center mt-1">
                    {parseFloat(stats.avgEfficiency) >= OPTIMAL_EER ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : parseFloat(stats.avgEfficiency) >= WARNING_EER ? (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.maxEfficiency}
                  </div>
                  <div className="text-sm text-muted-foreground">Peak EER</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Best performance
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.minEfficiency}
                  </div>
                  <div className="text-sm text-muted-foreground">Lowest EER</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Needs attention
                  </div>
                </div>

                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    stats.trendDirection === 'improving' ? 'text-green-600' :
                    stats.trendDirection === 'declining' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stats.trendDirection === 'stable' ? '~' : 
                     stats.trendDirection === 'improving' ? '+' : ''}
                    {stats.trendValue}%
                  </div>
                  <div className="text-sm text-muted-foreground">Trend</div>
                  <div className="text-xs text-muted-foreground mt-1 capitalize">
                    {stats.trendDirection}
                  </div>
                </div>
              </div>
            )}

            {/* Performance Indicators */}
            <div className="space-y-3">
              <h4 className="font-medium">Performance Indicators</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <div className="font-medium">Optimal Range</div>
                    <div className="text-sm text-muted-foreground">EER ≥ {OPTIMAL_EER}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div>
                    <div className="font-medium">Warning Range</div>
                    <div className="text-sm text-muted-foreground">{WARNING_EER} ≤ EER &lt; {OPTIMAL_EER}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div>
                    <div className="font-medium">Critical Range</div>
                    <div className="text-sm text-muted-foreground">EER &lt; {WARNING_EER}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EfficiencyTrendsChart;