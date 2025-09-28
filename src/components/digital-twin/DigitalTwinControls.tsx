import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Eye, 
  Zap, 
  Activity, 
  RotateCcw, 
  Camera, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Wrench
} from 'lucide-react';
import { DigitalTwinEquipment } from '@/types/digitalTwin';

interface DigitalTwinControlsProps {
  showEnergyFlow: boolean;
  onToggleEnergyFlow: (show: boolean) => void;
  showSensors: boolean;
  onToggleSensors: (show: boolean) => void;
  selectedEquipment?: DigitalTwinEquipment;
  onResetView: () => void;
  onViewPreset: (preset: 'overview' | 'detail' | 'maintenance') => void;
  totalAlerts: number;
  operationalCount: number;
  totalEquipment: number;
  currentPreset: string;
  isTransitioning: boolean;
  attentionEquipment: DigitalTwinEquipment[];
  onAttentionClick: () => void;
  onEquipmentSelect: (equipmentId: string) => void;
}

export const DigitalTwinControls: React.FC<DigitalTwinControlsProps> = ({
  showEnergyFlow,
  onToggleEnergyFlow,
  showSensors,
  onToggleSensors,
  selectedEquipment,
  onResetView,
  onViewPreset,
  totalAlerts,
  operationalCount,
  totalEquipment,
  currentPreset,
  isTransitioning,
  attentionEquipment,
  onAttentionClick,
  onEquipmentSelect,
}) => {
  const [showAttentionDetails, setShowAttentionDetails] = useState(false);
  return (
    <div className="space-y-4">
      {/* Facility Status Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Facility Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Operational</span>
              <Badge variant={operationalCount === totalEquipment ? 'default' : 'secondary'}>
                {String(operationalCount)}/{String(totalEquipment)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Alerts</span>
              <Badge variant={totalAlerts > 0 ? 'destructive' : 'default'}>
                {String(totalAlerts)}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            {totalAlerts === 0 && attentionEquipment.length === 0 ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-600">All systems operational</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <Button 
                  variant="link" 
                  className="text-amber-600 hover:text-amber-700 p-0 h-auto text-sm"
                  onClick={onAttentionClick}
                >
                  Attention required
                </Button>
              </>
            )}
          </div>

          {/* Equipment Needing Attention Details */}
          {attentionEquipment.length > 0 && (
            <Collapsible open={showAttentionDetails} onOpenChange={setShowAttentionDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between" size="sm">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    <span>{attentionEquipment.length} Equipment Need Attention</span>
                  </div>
                  {showAttentionDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {attentionEquipment.map((equipment) => (
                  <Button
                    key={equipment.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left"
                    onClick={() => onEquipmentSelect(equipment.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium">{equipment.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {equipment.healthScore}%
                      </Badge>
                    </div>
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>

      {/* Visualization Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visualization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Energy Flow</span>
            </div>
            <Switch
              checked={showEnergyFlow}
              onCheckedChange={onToggleEnergyFlow}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm">Sensor Data</span>
            </div>
            <Switch
              checked={showSensors}
              onCheckedChange={onToggleSensors}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Camera className="h-4 w-4" />
              View Presets
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant={currentPreset === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewPreset('overview')}
                className="justify-start"
                disabled={isTransitioning}
              >
                Overview
              </Button>
              <Button
                variant={currentPreset === 'detail' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewPreset('detail')}
                className="justify-start"
                disabled={isTransitioning}
              >
                Detail View
              </Button>
              <Button
                variant={currentPreset === 'maintenance' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewPreset('maintenance')}
                className="justify-start"
                disabled={isTransitioning}
              >
                Maintenance
              </Button>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onResetView}
            className="w-full"
            disabled={isTransitioning}
          >
            <RotateCcw className={`h-4 w-4 mr-2 ${isTransitioning ? 'animate-spin' : ''}`} />
            Reset View
          </Button>
        </CardContent>
      </Card>

      {/* Selected Equipment Details */}
      {selectedEquipment && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Equipment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium">{selectedEquipment.name}</h4>
              <p className="text-sm text-muted-foreground">{selectedEquipment.type}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant={
                  selectedEquipment.status === 'operational' ? 'default' :
                  selectedEquipment.status === 'needs_attention' ? 'secondary' :
                  selectedEquipment.status === 'under_maintenance' ? 'outline' : 'destructive'
                }>
                  {selectedEquipment.status.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Health Score</span>
                <Badge variant={
                  selectedEquipment.healthScore >= 70 ? 'default' :
                  selectedEquipment.healthScore >= 30 ? 'secondary' : 'destructive'
                }>
                  {selectedEquipment.healthScore}%
                </Badge>
              </div>
              
              {selectedEquipment.temperature && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Temperature</span>
                  <span className="text-sm font-medium">{selectedEquipment.temperature.toFixed(1)}°F</span>
                </div>
              )}
              
              {selectedEquipment.pressure && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pressure</span>
                  <span className="text-sm font-medium">{selectedEquipment.pressure.toFixed(1)} PSI</span>
                </div>
              )}
              
              {selectedEquipment.energyConsumption && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Energy Usage</span>
                  <span className="text-sm font-medium">{selectedEquipment.energyConsumption.toFixed(1)} kW</span>
                </div>
              )}
            </div>
            
            {selectedEquipment.alerts.length > 0 && (
              <>
                <Separator />
                <div>
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Alerts
                  </h5>
                  <div className="space-y-1">
                    {selectedEquipment.alerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="text-xs p-2 rounded border">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                            {alert.type}
                          </Badge>
                          {alert.acknowledged && (
                            <Badge variant="outline" className="text-xs">Ack</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};