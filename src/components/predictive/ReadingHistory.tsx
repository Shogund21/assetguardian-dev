
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { getReadingStandards } from "@/utils/equipmentTemplates";
import { format } from "date-fns";

interface ReadingHistoryProps {
  equipmentId: string;
  equipmentType: string;
  readingType?: string;
}

const ReadingHistory = ({ equipmentId, equipmentType, readingType }: ReadingHistoryProps) => {
  const { data: readings = [], isLoading } = useQuery({
    queryKey: ['reading-history', equipmentId, readingType],
    queryFn: async () => {
      let query = supabase
        .from('sensor_readings')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('timestamp_utc', { ascending: true });

      if (readingType) {
        query = query.eq('sensor_type', readingType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading reading history...</div>;
  }

  if (readings.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">No readings recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  // Group readings by sensor type
  const groupedReadings = readings.reduce((acc, reading) => {
    if (!acc[reading.sensor_type]) {
      acc[reading.sensor_type] = [];
    }
    acc[reading.sensor_type].push({
      ...reading,
      timestamp: new Date(reading.timestamp_utc).getTime(),
      formattedDate: format(new Date(reading.timestamp_utc), 'MMM dd, HH:mm'),
    });
    return acc;
  }, {} as Record<string, any[]>);

  const getStatusBadge = (value: number, sensorType: string) => {
    const standards = getReadingStandards(equipmentType, sensorType);
    if (!standards) return <Badge variant="secondary">No Standards</Badge>;

    if (standards.criticalThreshold && value >= standards.criticalThreshold) {
      return <Badge variant="destructive">Critical</Badge>;
    }
    if (standards.warningThreshold && value >= standards.warningThreshold) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Warning</Badge>;
    }
    if (standards.normalRange) {
      const { min, max } = standards.normalRange;
      if (value >= min && value <= max) {
        return <Badge variant="default" className="bg-green-600">Normal</Badge>;
      }
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedReadings).map(([sensorType, sensorReadings]) => {
        const standards = getReadingStandards(equipmentType, sensorType);
        const latestReading = sensorReadings[sensorReadings.length - 1];
        
        return (
          <Card key={sensorType}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg capitalize">
                  {sensorType.replace(/_/g, ' ')} ({latestReading.unit})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{latestReading.value}</span>
                  {getStatusBadge(latestReading.value, sensorType)}
                </div>
              </div>
              {standards?.description && (
                <p className="text-sm text-muted-foreground">{standards.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sensorReadings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="formattedDate"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(label) => `Time: ${label}`}
                      formatter={(value: number) => [value, latestReading.unit]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    {standards?.normalRange && (
                      <>
                        <Line 
                          type="monotone" 
                          dataKey={() => standards.normalRange.min}
                          stroke="#10b981" 
                          strokeDasharray="5 5"
                          strokeWidth={1}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey={() => standards.normalRange.max}
                          stroke="#10b981" 
                          strokeDasharray="5 5"
                          strokeWidth={1}
                          dot={false}
                        />
                      </>
                    )}
                    {standards?.warningThreshold && (
                      <Line 
                        type="monotone" 
                        dataKey={() => standards.warningThreshold}
                        stroke="#f59e0b" 
                        strokeDasharray="3 3"
                        strokeWidth={1}
                        dot={false}
                      />
                    )}
                    {standards?.criticalThreshold && (
                      <Line 
                        type="monotone" 
                        dataKey={() => standards.criticalThreshold}
                        stroke="#dc2626" 
                        strokeDasharray="2 2"
                        strokeWidth={1}
                        dot={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {standards && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {standards.normalRange && (
                    <div className="text-green-600">
                      Normal: {standards.normalRange.min}-{standards.normalRange.max}
                    </div>
                  )}
                  {standards.warningThreshold && (
                    <div className="text-yellow-600">
                      Warning: {standards.warningThreshold}+
                    </div>
                  )}
                  {standards.criticalThreshold && (
                    <div className="text-red-600">
                      Critical: {standards.criticalThreshold}+
                    </div>
                  )}
                  <div className="text-muted-foreground">
                    Readings: {sensorReadings.length}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ReadingHistory;
