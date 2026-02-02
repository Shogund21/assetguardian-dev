import { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ToggleButtonPair } from '../components/ToggleButtonPair';
import { NumberStepper } from '../components/NumberStepper';
import { ChillerWizardFormData, TubeInspectionData } from '@/types/chillerWizard';
import { cn } from '@/lib/utils';

interface Step4Props {
  formData: ChillerWizardFormData;
  updateTubes: (
    bundleType: 'evaporator' | 'condenser',
    field: string,
    value: unknown
  ) => void;
}

const TEST_METHODS = [
  { code: 'eddy_current', label: 'Eddy Current' },
  { code: 'ultrasonic', label: 'Ultrasonic' },
  { code: 'visual', label: 'Visual' },
  { code: 'pressure_test', label: 'Pressure Test' },
];

const FOULING_SEVERITIES = [
  { code: 'none', label: 'None' },
  { code: 'light', label: 'Light' },
  { code: 'moderate', label: 'Moderate' },
  { code: 'heavy', label: 'Heavy' },
  { code: 'severe', label: 'Severe' },
];

const CLEANING_METHODS = [
  { code: 'mechanical', label: 'Mechanical' },
  { code: 'chemical', label: 'Chemical' },
  { code: 'hydro', label: 'Hydro' },
];

const WATERBOX_CONDITIONS = [
  { code: 'good', label: 'Good' },
  { code: 'fair', label: 'Fair' },
  { code: 'poor', label: 'Poor' },
  { code: 'needs_repair', label: 'Needs Repair' },
];

const PLUG_THRESHOLD = 5;
const WALL_LOSS_THRESHOLD = 20;

export function Step4TubeInspection({ formData, updateTubes }: Step4Props) {
  const [activeBundle, setActiveBundle] = useState<'evaporator' | 'condenser'>('evaporator');

  const renderBundleInspection = (bundleType: 'evaporator' | 'condenser') => {
    const data = formData.tubes[bundleType];
    const isPlugsExceeded = (data.plugged_pct ?? 0) > PLUG_THRESHOLD;
    const isWallLossCritical = (data.wall_loss_pct ?? 0) > WALL_LOSS_THRESHOLD;

    return (
      <div className="space-y-6">
        {/* Tube Count & Plugged */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Tubes</Label>
                <NumberStepper
                  value={data.tube_count_total}
                  onChange={(value) => updateTubes(bundleType, 'tube_count_total', value)}
                  min={0}
                  showButtons={false}
                />
              </div>
              <div className="space-y-2">
                <Label>Plugged</Label>
                <NumberStepper
                  value={data.tubes_plugged_total}
                  onChange={(value) => updateTubes(bundleType, 'tubes_plugged_total', value)}
                  min={0}
                  showButtons={false}
                />
              </div>
            </div>

            {/* Calculated percentage */}
            {data.plugged_pct !== null && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plugged Percentage</span>
                  <span className={cn(
                    'font-medium',
                    isPlugsExceeded ? 'text-destructive' : 'text-green-600'
                  )}>
                    {data.plugged_pct.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={Math.min(data.plugged_pct, 20) * 5}
                  className={cn(
                    'h-3',
                    isPlugsExceeded && '[&>div]:bg-destructive'
                  )}
                />
                <div className="flex items-center gap-2 text-sm">
                  {isPlugsExceeded ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-destructive">Exceeds {PLUG_THRESHOLD}% limit (+30 risk)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Within limit</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Method */}
        <div className="space-y-2">
          <Label>Test Method</Label>
          <RadioGroup
            value={data.test_method || ''}
            onValueChange={(value) => updateTubes(bundleType, 'test_method', value)}
            className="grid grid-cols-2 gap-2"
          >
            {TEST_METHODS.map((method) => (
              <div
                key={method.code}
                className={cn(
                  'flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors',
                  data.test_method === method.code
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-accent'
                )}
                onClick={() => updateTubes(bundleType, 'test_method', method.code)}
              >
                <RadioGroupItem value={method.code} id={`${bundleType}-${method.code}`} />
                <Label htmlFor={`${bundleType}-${method.code}`} className="cursor-pointer text-sm">
                  {method.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Wall Thickness */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <Label className="text-sm font-medium">Wall Thickness (mils)</Label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Min</span>
                <NumberStepper
                  value={data.min_wall_thickness_mils}
                  onChange={(value) => updateTubes(bundleType, 'min_wall_thickness_mils', value)}
                  min={0}
                  showButtons={false}
                />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Avg</span>
                <NumberStepper
                  value={data.avg_wall_thickness_mils}
                  onChange={(value) => updateTubes(bundleType, 'avg_wall_thickness_mils', value)}
                  min={0}
                  showButtons={false}
                />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Original</span>
                <NumberStepper
                  value={data.original_wall_thickness_mils}
                  onChange={(value) => updateTubes(bundleType, 'original_wall_thickness_mils', value)}
                  min={0}
                  showButtons={false}
                />
              </div>
            </div>

            {/* Wall loss */}
            {data.wall_loss_pct !== null && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                <span className="text-sm">Wall Loss:</span>
                <span className={cn(
                  'font-medium',
                  isWallLossCritical ? 'text-destructive' : 'text-foreground'
                )}>
                  {data.wall_loss_pct.toFixed(1)}%
                  {isWallLossCritical && ' (Critical!)'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fouling Severity */}
        <div className="space-y-2">
          <Label>Fouling Severity</Label>
          <RadioGroup
            value={data.fouling_severity || ''}
            onValueChange={(value) => updateTubes(bundleType, 'fouling_severity', value)}
            className="flex flex-wrap gap-2"
          >
            {FOULING_SEVERITIES.map((sev) => (
              <div
                key={sev.code}
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors',
                  data.fouling_severity === sev.code
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-accent'
                )}
                onClick={() => updateTubes(bundleType, 'fouling_severity', sev.code)}
              >
                <RadioGroupItem value={sev.code} id={`${bundleType}-foul-${sev.code}`} />
                <Label htmlFor={`${bundleType}-foul-${sev.code}`} className="cursor-pointer text-sm">
                  {sev.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Tubes Cleaned */}
        <div className="space-y-2">
          <Label>Tubes Cleaned?</Label>
          <ToggleButtonPair
            value={data.tubes_cleaned}
            onChange={(value) => updateTubes(bundleType, 'tubes_cleaned', value)}
          />
        </div>

        {/* Cleaning Method - Conditional */}
        {data.tubes_cleaned && (
          <div className="space-y-2">
            <Label>Cleaning Method</Label>
            <RadioGroup
              value={data.cleaning_method || ''}
              onValueChange={(value) => updateTubes(bundleType, 'cleaning_method', value)}
              className="flex gap-2"
            >
              {CLEANING_METHODS.map((method) => (
                <div
                  key={method.code}
                  className={cn(
                    'flex-1 flex items-center justify-center space-x-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors',
                    data.cleaning_method === method.code
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => updateTubes(bundleType, 'cleaning_method', method.code)}
                >
                  <RadioGroupItem value={method.code} id={`${bundleType}-clean-${method.code}`} />
                  <Label htmlFor={`${bundleType}-clean-${method.code}`} className="cursor-pointer text-sm">
                    {method.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* Waterbox Condition */}
        <div className="space-y-2">
          <Label>Waterbox Condition</Label>
          <RadioGroup
            value={data.waterbox_condition || ''}
            onValueChange={(value) => updateTubes(bundleType, 'waterbox_condition', value)}
            className="grid grid-cols-2 gap-2"
          >
            {WATERBOX_CONDITIONS.map((cond) => (
              <div
                key={cond.code}
                className={cn(
                  'flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors',
                  data.waterbox_condition === cond.code
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-accent'
                )}
                onClick={() => updateTubes(bundleType, 'waterbox_condition', cond.code)}
              >
                <RadioGroupItem value={cond.code} id={`${bundleType}-wb-${cond.code}`} />
                <Label htmlFor={`${bundleType}-wb-${cond.code}`} className="cursor-pointer text-sm">
                  {cond.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Gaskets & Anodes */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Gaskets Replaced?</Label>
            <ToggleButtonPair
              value={data.waterbox_gaskets_replaced}
              onChange={(value) => updateTubes(bundleType, 'waterbox_gaskets_replaced', value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Anodes Replaced?</Label>
            <ToggleButtonPair
              value={data.sacrificial_anodes_replaced}
              onChange={(value) => updateTubes(bundleType, 'sacrificial_anodes_replaced', value)}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor={`${bundleType}-notes`}>Notes</Label>
          <Textarea
            id={`${bundleType}-notes`}
            placeholder="Additional observations..."
            value={data.notes || ''}
            onChange={(e) => updateTubes(bundleType, 'notes', e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Bundle Selection Tabs */}
      <Tabs value={activeBundle} onValueChange={(v) => setActiveBundle(v as 'evaporator' | 'condenser')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="evaporator">Evaporator</TabsTrigger>
          <TabsTrigger value="condenser">Condenser</TabsTrigger>
        </TabsList>
        <TabsContent value="evaporator" className="mt-4">
          {renderBundleInspection('evaporator')}
        </TabsContent>
        <TabsContent value="condenser" className="mt-4">
          {renderBundleInspection('condenser')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
