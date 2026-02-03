import { AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ToggleButtonPair } from '../components/ToggleButtonPair';
import { NumberStepper } from '../components/NumberStepper';
import { ChillerWizardFormData } from '@/types/chillerWizard';
import { cn } from '@/lib/utils';

interface Step2Props {
  formData: ChillerWizardFormData;
  updateRefrigerant: (
    field: keyof ChillerWizardFormData['refrigerant'],
    value: unknown
  ) => void;
  errors: string[];
}

const LEAK_LOCATIONS = [
  { code: 'shaft_seal', label: 'Shaft Seal' },
  { code: 'suction_flange', label: 'Suction Flange' },
  { code: 'discharge_flange', label: 'Discharge Flange' },
  { code: 'relief_valve', label: 'Relief Valve' },
  { code: 'sight_glass', label: 'Sight Glass' },
  { code: 'service_valve', label: 'Service Valve' },
  { code: 'tube_leak', label: 'Tube Leak' },
  { code: 'other', label: 'Other' },
];

const SIGHT_GLASS_CONDITIONS = [
  { code: 'clear', label: 'Clear' },
  { code: 'bubbles_minor', label: 'Bubbles (Minor)' },
  { code: 'bubbles_heavy', label: 'Bubbles (Heavy)' },
  { code: 'discolored', label: 'Discolored' },
];

const MOISTURE_COLORS = [
  { code: 'green', label: '🟢 Green', color: 'bg-green-500' },
  { code: 'yellow', label: '🟡 Yellow', color: 'bg-yellow-500' },
  { code: 'red', label: '🔴 Red', color: 'bg-red-500' },
];

const REFRIGERANT_TYPES = [
  'R-11',
  'R-134a',
  'R-123',
  'R-1233zd',
  'R-514A',
  'R-22',
  'R-410A',
  'R-407C',
  'Other',
];

export function Step2Refrigerant({ formData, updateRefrigerant, errors }: Step2Props) {
  const { refrigerant } = formData;

  const hasError = (field: string) => {
    return errors.some(e => e.toLowerCase().includes(field.toLowerCase()));
  };

  return (
    <div className="space-y-6">
      {/* Leak Detection - Critical field */}
      <Card className={cn(
        'border-2',
        hasError('leak') ? 'border-destructive' : 'border-border'
      )}>
        <CardContent className="p-4 space-y-3">
          <Label className="text-base font-medium">
            Leak Detected? *
          </Label>
          <ToggleButtonPair
            value={refrigerant.leak_detected}
            onChange={(value) => updateRefrigerant('leak_detected', value)}
            yesVariant="danger"
            noVariant="success"
          />
          
          {/* Warning if leak detected */}
          {refrigerant.leak_detected && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">+25 risk points will be added</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leak Location - Conditional */}
      {refrigerant.leak_detected && (
        <div className="space-y-2">
          <Label className={cn(hasError('location') && 'text-destructive')}>
            Leak Location *
          </Label>
          <RadioGroup
            value={refrigerant.leak_location_code || ''}
            onValueChange={(value) => updateRefrigerant('leak_location_code', value)}
            className="grid grid-cols-2 gap-2"
          >
            {LEAK_LOCATIONS.map((loc) => (
              <div
                key={loc.code}
                className={cn(
                  'flex items-center space-x-2 p-4 border rounded-lg cursor-pointer transition-colors min-h-[52px] active:scale-[0.99] touch-manipulation',
                  refrigerant.leak_location_code === loc.code
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-accent'
                )}
                onClick={() => updateRefrigerant('leak_location_code', loc.code)}
              >
                <RadioGroupItem value={loc.code} id={`leak-${loc.code}`} className="h-5 w-5" />
                <Label htmlFor={`leak-${loc.code}`} className="cursor-pointer text-base">
                  {loc.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Sight Glass Condition */}
      <div className="space-y-2">
        <Label>Sight Glass Condition</Label>
        <RadioGroup
          value={refrigerant.sight_glass_condition || ''}
          onValueChange={(value) => updateRefrigerant('sight_glass_condition', value)}
          className="grid grid-cols-2 gap-2"
        >
          {SIGHT_GLASS_CONDITIONS.map((cond) => (
            <div
              key={cond.code}
              className={cn(
                'flex items-center space-x-2 p-4 border rounded-lg cursor-pointer transition-colors min-h-[52px] active:scale-[0.99] touch-manipulation',
                refrigerant.sight_glass_condition === cond.code
                  ? 'bg-primary/10 border-primary'
                  : 'hover:bg-accent'
              )}
              onClick={() => updateRefrigerant('sight_glass_condition', cond.code)}
            >
              <RadioGroupItem value={cond.code} id={`sight-${cond.code}`} className="h-5 w-5" />
              <Label htmlFor={`sight-${cond.code}`} className="cursor-pointer text-base">
                {cond.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Moisture Indicator */}
      <div className="space-y-2">
        <Label>Moisture Indicator Color</Label>
        <div className="grid grid-cols-3 gap-2">
          {MOISTURE_COLORS.map((color) => (
            <button
              key={color.code}
              type="button"
              onClick={() => updateRefrigerant('moisture_indicator_color', color.code)}
              className={cn(
                'min-h-[52px] py-3 px-3 rounded-lg border-2 font-medium transition-all text-base active:scale-[0.98] touch-manipulation',
                refrigerant.moisture_indicator_color === color.code
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-accent'
              )}
            >
              {color.label}
            </button>
          ))}
        </div>
      </div>

      {/* Refrigerant Type */}
      <div className="space-y-2">
        <Label>Refrigerant Type</Label>
        <Select
          value={refrigerant.refrigerant_type || ''}
          onValueChange={(value) => updateRefrigerant('refrigerant_type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type..." />
          </SelectTrigger>
          <SelectContent>
            {REFRIGERANT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Charge */}
      <div className="space-y-2">
        <Label>Charge (lbs)</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-muted-foreground">Current</span>
            <NumberStepper
              value={refrigerant.charge_lbs}
              onChange={(value) => updateRefrigerant('charge_lbs', value)}
              min={0}
              step={10}
              showButtons={false}
              unit="lbs"
            />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Nameplate</span>
            <NumberStepper
              value={refrigerant.nameplate_charge_lbs}
              onChange={(value) => updateRefrigerant('nameplate_charge_lbs', value)}
              min={0}
              step={10}
              showButtons={false}
              unit="lbs"
            />
          </div>
        </div>
      </div>

      {/* Pressures */}
      <div className="space-y-2">
        <Label>Pressures (PSIG)</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-muted-foreground">Suction</span>
            <NumberStepper
              value={refrigerant.suction_pressure_psig}
              onChange={(value) => updateRefrigerant('suction_pressure_psig', value)}
              min={0}
              step={1}
              showButtons={false}
              unit="psig"
            />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Discharge</span>
            <NumberStepper
              value={refrigerant.discharge_pressure_psig}
              onChange={(value) => updateRefrigerant('discharge_pressure_psig', value)}
              min={0}
              step={1}
              showButtons={false}
              unit="psig"
            />
          </div>
        </div>
      </div>

      {/* Acid Test */}
      <div className="space-y-2">
        <Label>Acid Test Passed?</Label>
        <ToggleButtonPair
          value={refrigerant.acid_test_passed}
          onChange={(value) => updateRefrigerant('acid_test_passed', value)}
          yesVariant="default"
          noVariant="default"
        />
      </div>

      {/* Drier Replaced */}
      <div className="space-y-2">
        <Label>Drier Replaced?</Label>
        <ToggleButtonPair
          value={refrigerant.drier_replaced}
          onChange={(value) => updateRefrigerant('drier_replaced', value)}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="refrigerant-notes">Notes</Label>
        <Textarea
          id="refrigerant-notes"
          placeholder="Additional observations..."
          value={refrigerant.notes || ''}
          onChange={(e) => updateRefrigerant('notes', e.target.value)}
          className="min-h-[80px]"
        />
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3">
          <ul className="list-disc list-inside text-sm text-destructive space-y-1">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
