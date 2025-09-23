import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DigitalTwinFacility, DigitalTwinEquipment, DigitalTwinAlert } from '@/types/digitalTwin';
import { Equipment } from '@/types/equipment';
import { SensorReading } from '@/types/predictive';
import { useEffect } from 'react';

export const useDigitalTwinData = (facilityId?: string) => {
  const queryClient = useQueryClient();

  // Fetch equipment data
  const { data: equipment, isLoading: equipmentLoading } = useQuery({
    queryKey: ['digital-twin-equipment', facilityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Equipment[];
    },
  });

  // Fetch latest sensor readings
  const { data: sensorReadings, isLoading: sensorsLoading } = useQuery({
    queryKey: ['digital-twin-sensors', facilityId],
    queryFn: async () => {
      if (!equipment?.length) return [];
      
      const equipmentIds = equipment.map(eq => eq.id);
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .in('equipment_id', equipmentIds)
        .gte('timestamp_utc', new Date(Date.now() - 1000 * 60 * 60).toISOString()) // Last hour
        .order('timestamp_utc', { ascending: false });
      
      if (error) throw error;
      return data as SensorReading[];
    },
    enabled: !!equipment?.length,
  });

  // Fetch predictive alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['digital-twin-alerts', facilityId],
    queryFn: async () => {
      if (!equipment?.length) return [];
      
      const equipmentIds = equipment.map(eq => eq.id);
      const { data, error } = await supabase
        .from('predictive_alerts')
        .select('*')
        .in('asset_id', equipmentIds)
        .is('resolved_at', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!equipment?.length,
  });

  // Transform data into Digital Twin format
  const digitalTwinData = useQuery({
    queryKey: ['digital-twin-facility', facilityId, equipment, sensorReadings, alerts],
    queryFn: async (): Promise<DigitalTwinFacility> => {
      if (!equipment) throw new Error('Equipment data not available');
      
      // Convert equipment to 3D positioned equipment
      const digitalTwinEquipment: DigitalTwinEquipment[] = equipment.map((eq, index) => {
        // Generate positions in a grid layout
        const gridSize = Math.ceil(Math.sqrt(equipment.length));
        const x = (index % gridSize) * 6 - (gridSize * 3);
        const z = Math.floor(index / gridSize) * 6 - (gridSize * 3);
        
        // Get latest sensor readings for this equipment
        const equipmentSensors = sensorReadings?.filter(reading => reading.equipment_id === eq.id) || [];
        const latestTemperature = equipmentSensors.find(s => s.sensor_type === 'temperature')?.value;
        const latestPressure = equipmentSensors.find(s => s.sensor_type === 'pressure')?.value;
        const latestVibration = equipmentSensors.find(s => s.sensor_type === 'vibration')?.value;
        const latestPower = equipmentSensors.find(s => s.sensor_type === 'power')?.value;
        
        // Get alerts for this equipment
        const equipmentAlerts: DigitalTwinAlert[] = alerts?.filter(alert => alert.asset_id === eq.id).map(alert => ({
          id: alert.id,
          type: alert.risk_level === 'high' ? 'critical' : 'warning',
          message: alert.finding,
          timestamp: alert.created_at,
          acknowledged: false,
        })) || [];
        
        // Calculate health score based on status and alerts
        let healthScore = 100;
        if (eq.status === 'needs_attention') healthScore = 60;
        if (eq.status === 'under_maintenance') healthScore = 40;
        if (eq.status === 'offline') healthScore = 0;
        
        // Reduce health score based on alerts
        healthScore -= equipmentAlerts.length * 10;
        healthScore = Math.max(0, Math.min(100, healthScore));
        
        return {
          id: eq.id,
          name: eq.name,
          type: eq.type || 'Unknown',
          position: { x, y: 0, z },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          status: eq.status as any || 'operational',
          healthScore,
          temperature: latestTemperature,
          pressure: latestPressure,
          vibration: latestVibration,
          energyConsumption: latestPower,
          alerts: equipmentAlerts,
        };
      });

      // Generate sample energy flow data
      const energyFlow = digitalTwinEquipment.slice(0, -1).map((eq, index) => ({
        from: eq.id,
        to: digitalTwinEquipment[index + 1].id,
        flow: Math.random() * 100 + 50, // 50-150 kW
        efficiency: 0.7 + Math.random() * 0.25, // 70-95%
        color: '#3b82f6',
      }));

      return {
        id: facilityId || 'default',
        name: 'Main Facility',
        dimensions: {
          width: 40,
          length: 40,
          height: 8,
        },
        equipment: digitalTwinEquipment,
        energyFlow,
      };
    },
    enabled: !!equipment && !equipmentLoading,
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!equipment?.length) return;
    
    const equipmentIds = equipment.map(eq => eq.id);
    
    // Subscribe to sensor readings updates
    const sensorChannel = supabase
      .channel('sensor-readings-digital-twin')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings',
          filter: `equipment_id=in.(${equipmentIds.join(',')})`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['digital-twin-sensors', facilityId] });
        }
      )
      .subscribe();

    // Subscribe to alerts updates
    const alertsChannel = supabase
      .channel('alerts-digital-twin')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'predictive_alerts',
          filter: `asset_id=in.(${equipmentIds.join(',')})`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['digital-twin-alerts', facilityId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sensorChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, [equipment, facilityId, queryClient]);

  return {
    facility: digitalTwinData.data,
    isLoading: equipmentLoading || sensorsLoading || alertsLoading || digitalTwinData.isLoading,
    error: digitalTwinData.error,
    refetch: digitalTwinData.refetch,
  };
};