
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LineChart from "@/components/charts/LineChart";
import { PredictiveMaintenanceService } from "@/services/predictiveMaintenanceService";
import { SensorReading } from "@/types/predictive";
import { Activity } from "lucide-react";

interface SensorDataChartProps {
  equipmentId: string;
  equipmentName?: string;
}

export const SensorDataChart: React.FC<SensorDataChartProps> = ({ 
  equipmentId, 
  equipmentName 
}) => {
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [selectedSensorType, setSelectedSensorType] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(24);

  useEffect(() => {
    loadSensorData();
  }, [equipmentId, timeRange]);

  const loadSensorData = async () => {
    try {
      setLoading(true);
      const data = await PredictiveMaintenanceService.getRecentSensorReadings(equipmentId, timeRange);
      setSensorReadings(data || []);
      
      // Set default sensor type if not selected
      if (!selectedSensorType && data && data.length > 0) {
        const sensorTypes = [...new Set(data.map(r => r.sensor_type))];
        setSelectedSensorType(sensorTypes[0]);
      }
    } catch (error) {
      console.error('Error loading sensor data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock sensor data for demonstration
  const generateMockData = () => {
    const now = new Date();
    const mockReadings: SensorReading[] = [];
    
    for (let i = timeRange * 6; i >= 0; i--) { // Every 10 minutes
      const timestamp = new Date(now.getTime() - (i * 10 * 60 * 1000));
      
      // Vibration data (mm/s)
      mockReadings.push({
        id: `vib-${i}`,
        equipment_id: equipmentId,
        timestamp_utc: timestamp.toISOString(),
        sensor_type: 'vibration_mm_s',
        value: 2.5 + Math.random() * 2 + Math.sin(i * 0.1) * 0.5,
        unit: 'mm/s',
        created_at: timestamp.toISOString()
      });
      
      // Temperature data (°C)
      mockReadings.push({
        id: `temp-${i}`,
        equipment_id: equipmentId,
        timestamp_utc: timestamp.toISOString(),
        sensor_type: 'bearing_temp_C',
        value: 65 + Math.random() * 15 + Math.sin(i * 0.05) * 3,
        unit: '°C',
        created_at: timestamp.toISOString()
      });
      
      // Current data (A)
      mockReadings.push({
        id: `current-${i}`,
        equipment_id: equipmentId,
        timestamp_utc: timestamp.toISOString(),
        sensor_type: 'current_A',
        value: 58 + Math.random() * 8 + Math.sin(i * 0.03) * 2,
        unit: 'A',
        created_at: timestamp.toISOString()
      });
    }
    
    return mockReadings;
  };

  // Use mock data if no real data available
  const displayData = sensorReadings.length > 0 ? sensorReadings : generateMockData();
  const sensorTypes = [...new Set(displayData.map(r => r.sensor_type))];

  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!selectedSensorType || displayData.length === 0) return [];
    
    const filteredData = displayData
      .filter(r => r.sensor_type === selectedSensorType)
      .sort((a, b) => new Date(a.timestamp_utc).getTime() - new Date(b.timestamp_utc).getTime());
    
    return filteredData.map(reading => ({
      name: new Date(reading.timestamp_utc).toLocaleTimeString(),
      value: reading.value,
      timestamp: reading.timestamp_utc
    }));
  }, [displayData, selectedSensorType]);

  const getSensorDisplayName = (sensorType: string) => {
    const names: Record<string, string> = {
      'vibration_mm_s': 'Vibration (mm/s)',
      'bearing_temp_C': 'Bearing Temperature (°C)',
      'current_A': 'Current (A)',
      'pressure_psi': 'Pressure (PSI)',
      'flow_rate_gpm': 'Flow Rate (GPM)'
    };
    return names[sensorType] || sensorType;
  };

  const getThresholdColor = (sensorType: string) => {
    const colors: Record<string, string> = {
      'vibration_mm_s': '#ef4444',
      'bearing_temp_C': '#f97316',
      'current_A': '#eab308',
    };
    return colors[sensorType] || '#6b7280';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sensor Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading sensor data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Sensor Data - {equipmentName}
        </CardTitle>
        <div className="flex gap-2">
          <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24">24 Hours</SelectItem>
              <SelectItem value="48">48 Hours</SelectItem>
              <SelectItem value="72">72 Hours</SelectItem>
              <SelectItem value="168">7 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedSensorType} onValueChange={setSelectedSensorType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select sensor type" />
            </SelectTrigger>
            <SelectContent>
              {sensorTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {getSensorDisplayName(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-80">
            <LineChart
              data={chartData}
              series={[
                {
                  dataKey: 'value',
                  name: getSensorDisplayName(selectedSensorType),
                  stroke: getThresholdColor(selectedSensorType),
                  strokeWidth: 2,
                  type: 'monotone'
                }
              ]}
              xAxisLabel="Time"
              yAxisLabel={displayData.find(r => r.sensor_type === selectedSensorType)?.unit || ''}
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No Sensor Data</p>
            <p className="text-muted-foreground">No sensor readings available for this equipment</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SensorDataChart;
