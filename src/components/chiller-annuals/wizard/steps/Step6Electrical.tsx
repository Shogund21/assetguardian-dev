import { useState } from 'react';
import { AlertTriangle, Zap } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleButtonPair } from '../components/ToggleButtonPair';
import { NumberStepper } from '../components/NumberStepper';
import { ChillerWizardFormData, ElectricalCheckData } from '@/types/chillerWizard';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Step6Props {
  formData: ChillerWizardFormData;
  updateElectrical: (
    component: 'main_motor' | 'oil_pump' | 'vfd',
    field: string,
    value: unknown
  ) => void;
}

const STARTER_CONDITIONS = [
  { code: 'excellent', label: 'Excellent' },
  { code: 'good', label: 'Good' },
  { code: 'fair', label: 'Fair' },
  { code: 'poor', label: 'Poor' },
  { code: 'needs_replacement', label: 'Needs Replacement' },
];

export function Step6Electrical({ formData, updateElectrical }: Step6Props) {
  const [activeComponent, setActiveComponent] = useState<'main_motor' | 'oil_pump' | 'vfd'>('main_motor');
  const { electrical } = formData;

  const renderElectricalCheck = (component: 'main_motor' | 'oil_pump' | 'vfd') => {
    const data: ElectricalCheckData = electrical[component] || {
      voltage_l1_l2: null,
      voltage_l2_l3: null,
      voltage_l3_l1: null,
      voltage_imbalance_pct: null,
      amperage_l1: null,
      amperage_l2: null,
      amperage_l3: null,
      insulation_resistance_megohms: null,
      vibration_acceptable: null,
      starter_condition: null,
      notes: null,
    };

    const voltageImbalance = data.voltage_imbalance_pct;
    const insulationResistance = data.insulation_resistance_megohms;
    const isVoltageRisk = voltageImbalance !== null && voltageImbalance > 2;
    const isInsulationRisk = insulationResistance !== null && insulationResistance < 1;

    return (
      <div className="space-y-6">
        {/* Voltage Readings */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4" />
              Voltage Readings (V)
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">L1-L2</Label>
                <NumberStepper
                  value={data.voltage_l1_l2}
                  onChange={(value) => updateElectrical(component, 'voltage_l1_l2', value)}
                  min={0}
                  max={600}
                  step={1}
                  showButtons={false}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">L2-L3</Label>
                <NumberStepper
                  value={data.voltage_l2_l3}
                  onChange={(value) => updateElectrical(component, 'voltage_l2_l3', value)}
                  min={0}
                  max={600}
                  step={1}
                  showButtons={false}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">L3-L1</Label>
                <NumberStepper
                  value={data.voltage_l3_l1}
                  onChange={(value) => updateElectrical(component, 'voltage_l3_l1', value)}
                  min={0}
                  max={600}
                  step={1}
                  showButtons={false}
                />
              </div>
            </div>

            {/* Voltage Imbalance Display */}
            {voltageImbalance !== null && (
              <div className={cn(
                'flex justify-between items-center p-3 rounded-lg',
                isVoltageRisk ? 'bg-destructive/10' : 'bg-muted'
              )}>
                <span className="text-sm">Voltage Imbalance:</span>
                <Badge variant={isVoltageRisk ? 'destructive' : 'secondary'}>
                  {voltageImbalance.toFixed(2)}%
                </Badge>
              </div>
            )}

            {isVoltageRisk && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">
                  Imbalance &gt; 2%: +20 risk points
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Amperage Readings */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4" />
              Amperage Readings (A)
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">L1</Label>
                <NumberStepper
                  value={data.amperage_l1}
                  onChange={(value) => updateElectrical(component, 'amperage_l1', value)}
                  min={0}
                  step={0.1}
                  decimalPlaces={1}
                  showButtons={false}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">L2</Label>
                <NumberStepper
                  value={data.amperage_l2}
                  onChange={(value) => updateElectrical(component, 'amperage_l2', value)}
                  min={0}
                  step={0.1}
                  decimalPlaces={1}
                  showButtons={false}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">L3</Label>
                <NumberStepper
                  value={data.amperage_l3}
                  onChange={(value) => updateElectrical(component, 'amperage_l3', value)}
                  min={0}
                  step={0.1}
                  decimalPlaces={1}
                  showButtons={false}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insulation Resistance */}
        <Card className={cn(
          'border-2',
          isInsulationRisk ? 'border-destructive bg-destructive/5' : 'border-border'
        )}>
          <CardContent className="p-4 space-y-3">
            <Label className="text-base font-medium">
              Insulation Resistance (MΩ)
            </Label>
            <NumberStepper
              value={data.insulation_resistance_megohms}
              onChange={(value) => updateElectrical(component, 'insulation_resistance_megohms', value)}
              min={0}
              step={0.1}
              decimalPlaces={1}
              showButtons={false}
              unit="MΩ"
            />
            
            {isInsulationRisk && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">
                  Below 1 MΩ: +20 risk points - Motor insulation degradation detected
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vibration */}
        <div className="space-y-2">
          <Label>Vibration Acceptable?</Label>
          <ToggleButtonPair
            value={data.vibration_acceptable}
            onChange={(value) => updateElectrical(component, 'vibration_acceptable', value)}
            yesVariant="default"
            noVariant="default"
          />
        </div>

        {/* Starter Condition */}
        <div className="space-y-2">
          <Label>Starter Condition</Label>
          <Select
            value={data.starter_condition || ''}
            onValueChange={(value) => updateElectrical(component, 'starter_condition', value)}
          >
            <SelectTrigger className="min-h-[48px]">
              <SelectValue placeholder="Select condition..." />
            </SelectTrigger>
            <SelectContent>
              {STARTER_CONDITIONS.map((cond) => (
                <SelectItem key={cond.code} value={cond.code}>
                  {cond.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor={`${component}-notes`}>Notes</Label>
          <Textarea
            id={`${component}-notes`}
            placeholder="Additional observations..."
            value={data.notes || ''}
            onChange={(e) => updateElectrical(component, 'notes', e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Component Tabs */}
      <Tabs value={activeComponent} onValueChange={(v) => setActiveComponent(v as 'main_motor' | 'oil_pump' | 'vfd')}>
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="main_motor" className="text-sm">
            Main Motor
          </TabsTrigger>
          <TabsTrigger value="oil_pump" className="text-sm">
            Oil Pump
          </TabsTrigger>
          <TabsTrigger value="vfd" className="text-sm">
            VFD
          </TabsTrigger>
        </TabsList>
        <TabsContent value="main_motor" className="mt-4">
          {renderElectricalCheck('main_motor')}
        </TabsContent>
        <TabsContent value="oil_pump" className="mt-4">
          {renderElectricalCheck('oil_pump')}
        </TabsContent>
        <TabsContent value="vfd" className="mt-4">
          {renderElectricalCheck('vfd')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
