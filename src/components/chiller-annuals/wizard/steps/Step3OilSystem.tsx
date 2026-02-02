import { AlertTriangle, Beaker } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ToggleButtonPair } from '../components/ToggleButtonPair';
import { NumberStepper } from '../components/NumberStepper';
import { ChillerWizardFormData } from '@/types/chillerWizard';
import { cn } from '@/lib/utils';

interface Step3Props {
  formData: ChillerWizardFormData;
  updateOil: (
    field: keyof ChillerWizardFormData['oil'],
    value: unknown
  ) => void;
}

const OIL_TYPES = [
  { code: 'poe', label: 'POE' },
  { code: 'mineral', label: 'Mineral' },
  { code: 'alkylbenzene', label: 'Alkylbenzene' },
  { code: 'pag', label: 'PAG' },
];

const OIL_APPEARANCES = [
  { code: 'clear', label: 'Clear' },
  { code: 'hazy', label: 'Hazy' },
  { code: 'dark', label: 'Dark' },
  { code: 'contaminated', label: 'Contaminated' },
];

const ACID_THRESHOLD = 0.05;

export function Step3OilSystem({ formData, updateOil }: Step3Props) {
  const { oil } = formData;

  const isHighAcid = oil.acid_number_mgkoh_g !== null && oil.acid_number_mgkoh_g > ACID_THRESHOLD;

  return (
    <div className="space-y-6 pb-24">
      {/* Oil Level */}
      <div className="space-y-4">
        <Label>Oil Level</Label>
        <div className="space-y-2">
          <Slider
            value={[oil.current_level_pct ?? 50]}
            onValueChange={([value]) => updateOil('current_level_pct', value)}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className="font-medium text-foreground text-sm">
              {oil.current_level_pct ?? '--'}%
            </span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Oil Type */}
      <div className="space-y-2">
        <Label>Oil Type</Label>
        <RadioGroup
          value={oil.oil_type || ''}
          onValueChange={(value) => updateOil('oil_type', value)}
          className="grid grid-cols-2 gap-2"
        >
          {OIL_TYPES.map((type) => (
            <div
              key={type.code}
              className={cn(
                'flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors',
                oil.oil_type === type.code
                  ? 'bg-primary/10 border-primary'
                  : 'hover:bg-accent'
              )}
              onClick={() => updateOil('oil_type', type.code)}
            >
              <RadioGroupItem value={type.code} id={`oil-${type.code}`} />
              <Label htmlFor={`oil-${type.code}`} className="cursor-pointer text-sm">
                {type.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Oil Appearance */}
      <div className="space-y-2">
        <Label>Oil Appearance</Label>
        <RadioGroup
          value={oil.appearance || ''}
          onValueChange={(value) => updateOil('appearance', value)}
          className="grid grid-cols-2 gap-2"
        >
          {OIL_APPEARANCES.map((app) => (
            <div
              key={app.code}
              className={cn(
                'flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors',
                oil.appearance === app.code
                  ? 'bg-primary/10 border-primary'
                  : 'hover:bg-accent'
              )}
              onClick={() => updateOil('appearance', app.code)}
            >
              <RadioGroupItem value={app.code} id={`app-${app.code}`} />
              <Label htmlFor={`app-${app.code}`} className="cursor-pointer text-sm">
                {app.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Sample Collected */}
      <div className="space-y-2">
        <Label>Sample Collected?</Label>
        <ToggleButtonPair
          value={oil.sample_collected}
          onChange={(value) => updateOil('sample_collected', value)}
        />
      </div>

      {/* Lab Results Section */}
      {oil.sample_collected && (
        <Card className="bg-muted/30">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Beaker className="h-4 w-4" />
              Lab Results
            </div>

            {/* Acid Number - Critical */}
            <div className="space-y-2">
              <Label>Acid Number (mg KOH/g)</Label>
              <NumberStepper
                value={oil.acid_number_mgkoh_g}
                onChange={(value) => updateOil('acid_number_mgkoh_g', value)}
                min={0}
                max={1}
                step={0.01}
                decimalPlaces={2}
                showButtons={false}
                placeholder="0.00"
              />
              {isHighAcid && (
                <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-2 rounded-lg text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Above threshold ({ACID_THRESHOLD}) - +30 risk points</span>
                </div>
              )}
            </div>

            {/* Wear Metals */}
            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">Wear Metals (ppm)</Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Iron</span>
                  <NumberStepper
                    value={oil.iron_ppm}
                    onChange={(value) => updateOil('iron_ppm', value)}
                    min={0}
                    showButtons={false}
                  />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Copper</span>
                  <NumberStepper
                    value={oil.copper_ppm}
                    onChange={(value) => updateOil('copper_ppm', value)}
                    min={0}
                    showButtons={false}
                  />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Aluminum</span>
                  <NumberStepper
                    value={oil.aluminum_ppm}
                    onChange={(value) => updateOil('aluminum_ppm', value)}
                    min={0}
                    showButtons={false}
                  />
                </div>
              </div>
            </div>

            {/* Moisture */}
            <div className="space-y-2">
              <Label>Moisture (ppm)</Label>
              <NumberStepper
                value={oil.moisture_ppm}
                onChange={(value) => updateOil('moisture_ppm', value)}
                min={0}
                showButtons={false}
                unit="ppm"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Oil Changed */}
      <div className="space-y-2">
        <Label>Oil Changed?</Label>
        <ToggleButtonPair
          value={oil.oil_changed}
          onChange={(value) => updateOil('oil_changed', value)}
        />
      </div>

      {/* Oil Filter Replaced */}
      <div className="space-y-2">
        <Label>Oil Filter Replaced?</Label>
        <ToggleButtonPair
          value={oil.oil_filter_replaced}
          onChange={(value) => updateOil('oil_filter_replaced', value)}
        />
      </div>

      {/* Oil Heater */}
      <div className="space-y-2">
        <Label>Oil Heater Functional?</Label>
        <ToggleButtonPair
          value={oil.oil_heater_functional}
          onChange={(value) => updateOil('oil_heater_functional', value)}
        />
      </div>

      {/* Oil Pump Pressure */}
      <div className="space-y-2">
        <Label>Oil Pump Pressure (psig)</Label>
        <NumberStepper
          value={oil.oil_pump_pressure_psig}
          onChange={(value) => updateOil('oil_pump_pressure_psig', value)}
          min={0}
          showButtons={false}
          unit="psig"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="oil-notes">Notes</Label>
        <Textarea
          id="oil-notes"
          placeholder="Additional observations..."
          value={oil.notes || ''}
          onChange={(e) => updateOil('notes', e.target.value)}
          className="min-h-[80px]"
        />
      </div>
    </div>
  );
}
