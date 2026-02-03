import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { NumberStepper } from '../components/NumberStepper';
import { ChillerWizardFormData } from '@/types/chillerWizard';
import { Gauge, Thermometer, Droplets, Zap, AlertTriangle, TrendingUp } from 'lucide-react';

interface Step7PerformanceTestProps {
  formData: ChillerWizardFormData;
  updatePerformance: (field: keyof ChillerWizardFormData['performance'], value: unknown) => void;
}

export function Step7PerformanceTest({ formData, updatePerformance }: Step7PerformanceTestProps) {
  const perf = formData.performance;

  // Auto-calculated values
  const calculatedTons = useMemo(() => {
    const flow = perf.chw_flow_gpm;
    const supply = perf.chilled_water_supply_f;
    const returnTemp = perf.chilled_water_return_f;
    
    if (flow && supply !== null && returnTemp !== null) {
      const deltaT = Math.abs(returnTemp - supply);
      return flow * deltaT * 0.04165;
    }
    return null;
  }, [perf.chw_flow_gpm, perf.chilled_water_supply_f, perf.chilled_water_return_f]);

  const actualTons = perf.tons_actual ?? calculatedTons;

  const calculatedKwPerTon = useMemo(() => {
    const kw = perf.kw_input;
    const tons = actualTons;
    if (kw && tons && tons > 0) {
      return kw / tons;
    }
    return null;
  }, [perf.kw_input, actualTons]);

  const actualKwPerTon = perf.kw_per_ton ?? calculatedKwPerTon;

  // Efficiency comparison
  const efficiencyVariance = useMemo(() => {
    if (actualKwPerTon && perf.design_kw_per_ton && perf.design_kw_per_ton > 0) {
      return ((actualKwPerTon - perf.design_kw_per_ton) / perf.design_kw_per_ton) * 100;
    }
    return null;
  }, [actualKwPerTon, perf.design_kw_per_ton]);

  const getEfficiencyBadge = () => {
    if (efficiencyVariance === null) return null;
    
    if (efficiencyVariance <= 0) {
      return <Badge className="bg-green-500 text-white">At or Better Than Design</Badge>;
    } else if (efficiencyVariance <= 10) {
      return <Badge className="bg-amber-500 text-white">{efficiencyVariance.toFixed(1)}% Above Design</Badge>;
    } else {
      return <Badge variant="destructive">{efficiencyVariance.toFixed(1)}% Above Design</Badge>;
    }
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Test Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gauge className="h-5 w-5 text-primary" />
            Test Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Test Date</Label>
              <Input
                type="date"
                value={perf.test_date || ''}
                onChange={(e) => updatePerformance('test_date', e.target.value || null)}
                className="min-h-[48px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Load %</Label>
              <NumberStepper
                value={perf.load_pct}
                onChange={(v) => updatePerformance('load_pct', v)}
                min={0}
                max={100}
                step={5}
                unit="%"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Water Temperatures */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Thermometer className="h-5 w-5 text-blue-500" />
            Water Temperatures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chilled Water */}
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-400" />
              Chilled Water
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Supply Temp (°F)</Label>
                <NumberStepper
                  value={perf.chilled_water_supply_f}
                  onChange={(v) => updatePerformance('chilled_water_supply_f', v)}
                  min={35}
                  max={60}
                  step={0.5}
                  decimalPlaces={1}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Return Temp (°F)</Label>
                <NumberStepper
                  value={perf.chilled_water_return_f}
                  onChange={(v) => updatePerformance('chilled_water_return_f', v)}
                  min={45}
                  max={70}
                  step={0.5}
                  decimalPlaces={1}
                />
              </div>
            </div>
          </div>

          {/* Condenser Water */}
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Droplets className="h-4 w-4 text-amber-500" />
              Condenser Water
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Supply Temp (°F)</Label>
                <NumberStepper
                  value={perf.condenser_water_supply_f}
                  onChange={(v) => updatePerformance('condenser_water_supply_f', v)}
                  min={60}
                  max={100}
                  step={0.5}
                  decimalPlaces={1}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Return Temp (°F)</Label>
                <NumberStepper
                  value={perf.condenser_water_return_f}
                  onChange={(v) => updatePerformance('condenser_water_return_f', v)}
                  min={70}
                  max={110}
                  step={0.5}
                  decimalPlaces={1}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-amber-500" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CHW Flow (GPM)</Label>
              <NumberStepper
                value={perf.chw_flow_gpm}
                onChange={(v) => updatePerformance('chw_flow_gpm', v)}
                min={0}
                max={5000}
                step={10}
              />
            </div>
            <div className="space-y-2">
              <Label>kW Input</Label>
              <NumberStepper
                value={perf.kw_input}
                onChange={(v) => updatePerformance('kw_input', v)}
                min={0}
                max={2000}
                step={5}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tons Actual</Label>
              <NumberStepper
                value={perf.tons_actual}
                onChange={(v) => updatePerformance('tons_actual', v)}
                min={0}
                max={5000}
                step={10}
              />
              {calculatedTons && !perf.tons_actual && (
                <p className="text-xs text-muted-foreground">
                  Calculated: {calculatedTons.toFixed(1)} tons
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Tons Design</Label>
              <NumberStepper
                value={perf.tons_design}
                onChange={(v) => updatePerformance('tons_design', v)}
                min={0}
                max={5000}
                step={10}
              />
            </div>
          </div>

          {/* Efficiency Section */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Efficiency
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>kW/ton Actual</Label>
                <NumberStepper
                  value={perf.kw_per_ton}
                  onChange={(v) => updatePerformance('kw_per_ton', v)}
                  min={0}
                  max={2}
                  step={0.01}
                  decimalPlaces={3}
                />
                {calculatedKwPerTon && !perf.kw_per_ton && (
                  <p className="text-xs text-muted-foreground">
                    Calculated: {calculatedKwPerTon.toFixed(3)} kW/ton
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>kW/ton Design</Label>
                <NumberStepper
                  value={perf.design_kw_per_ton}
                  onChange={(v) => updatePerformance('design_kw_per_ton', v)}
                  min={0}
                  max={2}
                  step={0.01}
                  decimalPlaces={3}
                />
              </div>
            </div>

            {/* Efficiency Comparison */}
            {actualKwPerTon && perf.design_kw_per_ton && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Efficiency vs Design:</span>
                  {getEfficiencyBadge()}
                </div>
                {efficiencyVariance !== null && efficiencyVariance > 10 && (
                  <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    Efficiency degraded more than 10% from design
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={perf.notes || ''}
            onChange={(e) => updatePerformance('notes', e.target.value || null)}
            placeholder="Additional observations during performance test..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>
    </div>
  );
}
