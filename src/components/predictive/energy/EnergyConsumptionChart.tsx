import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Download } from 'lucide-react';
import { ChillerEnergyService, EnergyReading } from '@/services/chillerEnergyService';
import { format } from 'date-fns';

interface EnergyConsumptionChartProps {
  equipmentId: string;
}

const EnergyConsumptionChart = ({ equipmentId }: EnergyConsumptionChartProps) => {
  const [data, setData] = useState<EnergyReading[]>([]);
  const [timeRange, setTimeRange] = useState<string>('7');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const energyHistory = await ChillerEnergyService.getEnergyHistory(equipmentId, parseInt(timeRange));
      setData(energyHistory);
    } catch (error) {
      console.error('Error loading energy consumption data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [equipmentId, timeRange]);

  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case 'powerConsumption':
        return [`${value} kW`, 'Power Consumption'];
      case 'cost':
        return [`$${value}`, 'Hourly Cost'];
      case 'coolingLoad':
        return [`${value} tons`, 'Cooling Load'];
      default:
        return [value, name];
    }
  };

  const formatXAxisLabel = (tickItem: string) => {
    return format(new Date(tickItem), 'MMM dd HH:mm');
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Timestamp,Power (kW),Cost ($),Cooling Load (tons),Efficiency (EER)\n" +
      data.map(row => 
        `${row.timestamp},${row.powerConsumption},${row.cost},${row.coolingLoad},${row.efficiency}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `energy_consumption_${timeRange}days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Energy Consumption Trends</CardTitle>
          <CardDescription>Loading energy consumption data...</CardDescription>
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
              <Calendar className="h-5 w-5" />
              Energy Consumption Trends
            </CardTitle>
            <CardDescription>
              Power consumption, costs, and cooling load over time
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
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
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              disabled={data.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No energy consumption data available for the selected time period
          </div>
        ) : (
          <div className="space-y-6">
            {/* Power Consumption Chart */}
            <div>
              <h4 className="font-medium mb-2">Power Consumption & Cooling Load</h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatXAxisLabel}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    formatter={formatTooltipValue}
                    labelFormatter={(label) => format(new Date(label), 'PPp')}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="powerConsumption"
                    stackId="1"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                    name="Power Consumption (kW)"
                  />
                  <Line
                    type="monotone"
                    dataKey="coolingLoad"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    dot={false}
                    name="Cooling Load (tons)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Cost Analysis Chart */}
            <div>
              <h4 className="font-medium mb-2">Energy Cost Analysis</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatXAxisLabel}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    formatter={formatTooltipValue}
                    labelFormatter={(label) => format(new Date(label), 'PPp')}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={false}
                    name="Hourly Cost ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {(data.reduce((sum, d) => sum + d.powerConsumption, 0) / data.length).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Power (kW)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${(data.reduce((sum, d) => sum + d.cost, 0) / data.length).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Cost/Hour</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.max(...data.map(d => d.powerConsumption)).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Peak Power (kW)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ${data.reduce((sum, d) => sum + d.cost, 0).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Total Cost</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnergyConsumptionChart;