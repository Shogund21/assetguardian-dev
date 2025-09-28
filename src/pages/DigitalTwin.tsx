import React, { useState } from 'react';
import { CustomLayout } from '@/components/CustomLayout';
import { DigitalTwinScene } from '@/components/digital-twin/DigitalTwinScene';
import { DigitalTwinControls } from '@/components/digital-twin/DigitalTwinControls';
import { useDigitalTwinData } from '@/hooks/useDigitalTwinData';
import { useCameraControls } from '@/hooks/useCameraControls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building, Cpu } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DigitalTwin = () => {
  const [selectedEquipment, setSelectedEquipment] = useState<string>();
  const [showEnergyFlow, setShowEnergyFlow] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  
  const { facility, isLoading, error } = useDigitalTwinData();
  
  const {
    orbitControlsRef,
    currentPreset,
    isTransitioning,
    animateToPreset,
    resetView,
  } = useCameraControls(facility?.equipment || []);

  const handleEquipmentSelect = (equipmentId: string) => {
    setSelectedEquipment(prev => prev === equipmentId ? undefined : equipmentId);
  };

  const handleResetView = () => {
    setSelectedEquipment(undefined);
    resetView();
  };

  const handleViewPreset = (preset: 'overview' | 'detail' | 'maintenance') => {
    animateToPreset(preset, selectedEquipment);
  };

  if (isLoading) {
    return (
      <CustomLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-lg">Loading Digital Twin...</span>
          </div>
        </div>
      </CustomLayout>
    );
  }

  if (error) {
    return (
      <CustomLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load Digital Twin data: {error.message}
            </AlertDescription>
          </Alert>
        </div>
      </CustomLayout>
    );
  }

  if (!facility) {
    return (
      <CustomLayout>
        <div className="p-6">
          <Alert>
            <AlertDescription>
              No facility data available. Please add equipment to view the Digital Twin.
            </AlertDescription>
          </Alert>
        </div>
      </CustomLayout>
    );
  }

  const selectedEquipmentData = facility.equipment.find(eq => eq.id === selectedEquipment);
  const totalAlerts = facility.equipment.reduce((sum, eq) => sum + eq.alerts.filter(a => !a.acknowledged).length, 0);
  const operationalCount = facility.equipment.filter(eq => eq.status === 'operational').length;

  return (
    <CustomLayout>
      <div className="h-full flex flex-col p-6 gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building className="h-8 w-8" />
              Digital Twin
            </h1>
            <p className="text-muted-foreground mt-1">
              Interactive 3D facility visualization with real-time data
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-sm font-medium">{facility.equipment.length} Assets</div>
                  <div className="text-xs text-muted-foreground">Real-time Monitoring</div>
                </div>
              </div>
            </Card>
            
            <Badge variant={totalAlerts > 0 ? 'destructive' : 'default'} className="text-sm px-3 py-1">
              {totalAlerts === 0 ? 'All Systems Normal' : `${totalAlerts} Alert(s)`}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
          {/* 3D Scene */}
          <div className="lg:col-span-3 h-full min-h-[600px]">
            <DigitalTwinScene
              facility={facility}
              selectedEquipment={selectedEquipment}
              onEquipmentSelect={handleEquipmentSelect}
              showEnergyFlow={showEnergyFlow}
              showSensors={showSensors}
              orbitControlsRef={orbitControlsRef}
              isTransitioning={isTransitioning}
            />
          </div>

          {/* Controls Panel */}
          <div className="h-full overflow-y-auto">
            <DigitalTwinControls
              showEnergyFlow={showEnergyFlow}
              onToggleEnergyFlow={setShowEnergyFlow}
              showSensors={showSensors}
              onToggleSensors={setShowSensors}
              selectedEquipment={selectedEquipmentData}
              onResetView={handleResetView}
              onViewPreset={handleViewPreset}
              totalAlerts={totalAlerts}
              operationalCount={operationalCount}
              totalEquipment={facility.equipment.length}
              currentPreset={currentPreset}
              isTransitioning={isTransitioning}
            />
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Energy Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {facility.equipment.reduce((sum, eq) => sum + (eq.energyConsumption || 0), 0).toFixed(1)} kW
              </div>
              <p className="text-xs text-muted-foreground">Across all equipment</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Average Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(facility.equipment.reduce((sum, eq) => sum + eq.healthScore, 0) / facility.equipment.length).toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">Facility-wide average</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">System Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(facility.energyFlow.reduce((sum, flow) => sum + flow.efficiency, 0) / facility.energyFlow.length * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">Energy flow efficiency</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Maintenance Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {facility.equipment.filter(eq => eq.status === 'needs_attention').length}
              </div>
              <p className="text-xs text-muted-foreground">Equipment needs attention</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomLayout>
  );
};

export default DigitalTwin;