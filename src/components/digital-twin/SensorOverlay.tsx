import React from 'react';
import SafeHtml from './SafeHtml';
import { DigitalTwinEquipment } from '@/types/digitalTwin';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface SensorOverlayProps {
  equipment: DigitalTwinEquipment[];
  selectedEquipment?: string;
}

export const SensorOverlay: React.FC<SensorOverlayProps> = ({
  equipment,
  selectedEquipment,
}) => {
  const getSensorStatus = (value: number, type: string) => {
    // Simplified sensor status logic - in real app, use thresholds
    switch (type) {
      case 'temperature':
        if (value > 80) return 'critical';
        if (value > 70) return 'warning';
        return 'normal';
      case 'pressure':
        if (value > 20) return 'critical';
        if (value > 15) return 'warning';
        return 'normal';
      case 'vibration':
        if (value > 0.5) return 'critical';
        if (value > 0.3) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <>
      {equipment.map((eq) => {
        const isSelected = selectedEquipment === eq.id;
        const sensors = [
          { type: 'temperature', value: eq.temperature, unit: '°F' },
          { type: 'pressure', value: eq.pressure, unit: 'PSI' },
          { type: 'vibration', value: eq.vibration, unit: 'mm/s' },
          { type: 'energy', value: eq.energyConsumption, unit: 'kW' },
        ].filter(sensor => sensor.value !== undefined);

        return (
          <SafeHtml
            key={eq.id}
            position={[eq.position.x, eq.position.y + 3, eq.position.z]}
            distanceFactor={10}
            occlude={false}
            transform={false}
            sprite={true}
          >
            <div className={`transition-all duration-300 ${isSelected ? 'scale-110' : 'scale-100'}`}>
              {/* Equipment name label */}
              <div className="mb-2 text-center">
                <Badge variant={isSelected ? 'default' : 'secondary'} className="text-xs">
                  {eq.name}
                </Badge>
              </div>
              
              {/* Sensor readings */}
              {(isSelected || sensors.some(s => getSensorStatus(s.value!, s.type) !== 'normal')) && (
                <Card className="p-2 bg-background/90 backdrop-blur-sm border shadow-lg">
                  <div className="space-y-1">
                    {sensors.map((sensor) => {
                      const status = getSensorStatus(sensor.value!, sensor.type);
                      return (
                        <div key={sensor.type} className="flex items-center justify-between gap-2 text-xs">
                          <span className="capitalize">{sensor.type}:</span>
                          <Badge variant={getStatusColor(status)} className="text-xs">
                            {sensor.value?.toFixed(1)} {sensor.unit}
                          </Badge>
                        </div>
                      );
                    })}
                    
                    {/* Health Score */}
                    <div className="flex items-center justify-between gap-2 text-xs border-t pt-1">
                      <span>Health:</span>
                      <Badge 
                        variant={eq.healthScore < 30 ? 'destructive' : eq.healthScore < 70 ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {eq.healthScore}%
                      </Badge>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Alert indicators */}
              {eq.alerts.filter(alert => !alert.acknowledged).length > 0 && (
                <div className="mt-1 text-center">
                  <Badge variant="destructive" className="text-xs animate-pulse">
                    {eq.alerts.filter(alert => !alert.acknowledged).length} Alert(s)
                  </Badge>
                </div>
              )}
            </div>
          </SafeHtml>
        );
      })}
    </>
  );
};