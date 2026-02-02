import { useState } from 'react';
import { AlertTriangle, Droplets } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ToggleButtonPair } from '../components/ToggleButtonPair';
import { NumberStepper } from '../components/NumberStepper';
import { ChillerWizardFormData } from '@/types/chillerWizard';
import { cn } from '@/lib/utils';

interface Step5Props {
  formData: ChillerWizardFormData;
  updateWater: (
    loopType: 'chilled_water' | 'condenser_water',
    field: string,
    value: unknown
  ) => void;
  updateWaterQuality: (
    field: keyof ChillerWizardFormData['water']['quality'],
    value: unknown
  ) => void;
}

export function Step5WaterSystem({ formData, updateWater, updateWaterQuality }: Step5Props) {
  const [activeLoop, setActiveLoop] = useState<'chilled_water' | 'condenser_water'>('chilled_water');
  const { water } = formData;

  const renderWaterLoop = (loopType: 'chilled_water' | 'condenser_water') => {
    const data = water[loopType];
    const loopLabel = loopType === 'chilled_water' ? 'Chilled Water' : 'Condenser Water';

    return (
      <div className="space-y-6">
        {/* Flow & Temperatures */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Droplets className="h-4 w-4" />
              Flow & Temperatures
            </div>

            {/* Flow Rate */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Actual (GPM)</Label>
                <NumberStepper
                  value={data.flow_rate_gpm}
                  onChange={(value) => updateWater(loopType, 'flow_rate_gpm', value)}
                  min={0}
                  showButtons={false}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Design (GPM)</Label>
                <NumberStepper
                  value={data.design_flow_gpm}
                  onChange={(value) => updateWater(loopType, 'design_flow_gpm', value)}
                  min={0}
                  showButtons={false}
                />
              </div>
            </div>

            {/* Water Temps */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Entering (°F)</Label>
                <NumberStepper
                  value={data.entering_water_temp_f}
                  onChange={(value) => updateWater(loopType, 'entering_water_temp_f', value)}
                  step={0.1}
                  decimalPlaces={1}
                  showButtons={false}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Leaving (°F)</Label>
                <NumberStepper
                  value={data.leaving_water_temp_f}
                  onChange={(value) => updateWater(loopType, 'leaving_water_temp_f', value)}
                  step={0.1}
                  decimalPlaces={1}
                  showButtons={false}
                />
              </div>
            </div>

            {/* Delta T */}
            {data.delta_t_f !== null && (
              <div className="flex justify-between items-center p-2 rounded-lg bg-muted">
                <span className="text-sm">Calculated ΔT:</span>
                <span className="font-medium">{data.delta_t_f.toFixed(1)}°F</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strainer */}
        <div className="space-y-2">
          <Label>Strainer Cleaned?</Label>
          <ToggleButtonPair
            value={data.strainer_cleaned}
            onChange={(value) => updateWater(loopType, 'strainer_cleaned', value)}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor={`${loopType}-notes`}>Notes</Label>
          <Textarea
            id={`${loopType}-notes`}
            placeholder="Additional observations..."
            value={data.notes || ''}
            onChange={(e) => updateWater(loopType, 'notes', e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      </div>
    );
  };

  const renderWaterQuality = () => {
    const quality = water.quality;
    const isLegionellaDetected = quality.legionella_detected === true;

    return (
      <div className="space-y-6">
        {/* pH Level */}
        <div className="space-y-4">
          <Label>pH Level</Label>
          <div className="space-y-2">
            <Slider
              value={[quality.ph ?? 7.5]}
              onValueChange={([value]) => updateWaterQuality('ph', value)}
              min={6.0}
              max={9.5}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>6.0</span>
              <span className="font-medium text-foreground text-sm">
                {(quality.ph ?? 7.5).toFixed(1)}
              </span>
              <span>9.5</span>
            </div>
          </div>
        </div>

        {/* Conductivity */}
        <div className="space-y-2">
          <Label>Conductivity (μmhos)</Label>
          <NumberStepper
            value={quality.conductivity_umhos}
            onChange={(value) => updateWaterQuality('conductivity_umhos', value)}
            min={0}
            showButtons={false}
          />
        </div>

        {/* TDS */}
        <div className="space-y-2">
          <Label>Total Dissolved Solids (ppm)</Label>
          <NumberStepper
            value={quality.total_dissolved_solids_ppm}
            onChange={(value) => updateWaterQuality('total_dissolved_solids_ppm', value)}
            min={0}
            showButtons={false}
          />
        </div>

        {/* Legionella - Critical */}
        <Card className={cn(
          'border-2',
          isLegionellaDetected ? 'border-destructive bg-destructive/5' : 'border-border'
        )}>
          <CardContent className="p-4 space-y-3">
            <Label className="text-base font-medium">
              Legionella Detected?
            </Label>
            <ToggleButtonPair
              value={quality.legionella_detected}
              onChange={(value) => updateWaterQuality('legionella_detected', value)}
              yesVariant="danger"
              noVariant="success"
            />
            
            {isLegionellaDetected && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">
                  CRITICAL: +40 risk points - Immediate action required!
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Within Spec */}
        <div className="space-y-2">
          <Label>Within Treatment Spec?</Label>
          <ToggleButtonPair
            value={quality.within_spec}
            onChange={(value) => updateWaterQuality('within_spec', value)}
            yesVariant="default"
            noVariant="default"
          />
        </div>

        {/* Treatment Vendor */}
        <div className="space-y-2">
          <Label>Treatment Vendor</Label>
          <NumberStepper
            value={null}
            onChange={() => {}}
            showButtons={false}
            placeholder="Enter vendor name..."
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="quality-notes">Notes</Label>
          <Textarea
            id="quality-notes"
            placeholder="Additional observations..."
            value={quality.notes || ''}
            onChange={(e) => updateWaterQuality('notes', e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Main Tabs for Water Loops - touch-friendly */}
      <Tabs value={activeLoop} onValueChange={(v) => setActiveLoop(v as 'chilled_water' | 'condenser_water')}>
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="chilled_water" className="text-base">Chilled Water</TabsTrigger>
          <TabsTrigger value="condenser_water" className="text-base">Condenser</TabsTrigger>
        </TabsList>
        <TabsContent value="chilled_water" className="mt-4">
          {renderWaterLoop('chilled_water')}
        </TabsContent>
        <TabsContent value="condenser_water" className="mt-4">
          {renderWaterLoop('condenser_water')}
        </TabsContent>
      </Tabs>

      {/* Water Quality Section */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2 text-base">
            <Droplets className="h-5 w-5" />
            Water Quality
          </h3>
          {renderWaterQuality()}
        </CardContent>
      </Card>
    </div>
  );
}
