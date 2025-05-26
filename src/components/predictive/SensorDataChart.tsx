
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
      setSensorReadings([]);
    } finally {
      setLoading(false);
    }
  };

  // Use the sensor readings from the service (which includes mock data)
  const displayData = sensorReadings;
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
