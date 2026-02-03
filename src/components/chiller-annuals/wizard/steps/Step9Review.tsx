import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChillerWizardFormData, WizardStep, WIZARD_STEPS } from '@/types/chillerWizard';
import { 
  calculateVoltageImbalance, 
  calculatePluggedPct 
} from '@/services/chillerRiskCalculator';
import { RISK_WEIGHTS, RISK_THRESHOLDS, RiskLevel, RedFlag, ScoreBreakdown } from '@/types/chillerRisk';
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  ChevronDown, 
  Edit2,
  Thermometer,
  Droplets,
  Zap,
  Gauge,
  Settings,
  Waves,
  Camera,
  XCircle,
  Info
} from 'lucide-react';

interface Step9ReviewProps {
  formData: ChillerWizardFormData;
  goToStep: (step: WizardStep) => void;
  getStepStatus: (step: WizardStep) => { isCompleted: boolean; isSkipped: boolean };
}

interface RiskResult {
  score: number;
  level: RiskLevel;
  breakdown: ScoreBreakdown;
  redFlags: RedFlag[];
}

function calculateRiskFromFormData(formData: ChillerWizardFormData): RiskResult {
  let score = 0;
  const redFlags: RedFlag[] = [];
  const breakdown: ScoreBreakdown = {
    refrigerantLeak: 0,
    tubePlugs: 0,
    oilAcid: 0,
    voltageImbalance: 0,
    efficiencyDegradation: 0,
    legionella: 0,
    lowInsulation: 0,
    tubeWallLoss: 0,
  };

  // Refrigerant leak
  if (formData.refrigerant.leak_detected) {
    score += RISK_WEIGHTS.REFRIGERANT_LEAK;
    breakdown.refrigerantLeak = RISK_WEIGHTS.REFRIGERANT_LEAK;
    redFlags.push({
      code: 'REFRIGERANT_LEAK',
      description: `Refrigerant leak at ${formData.refrigerant.leak_location_code || 'unknown location'}`,
      issueCode: 'REF002',
      severity: 'high',
    });
  }

  // Tube plugs
  const evapPlugged = calculatePluggedPct(
    formData.tubes.evaporator.tubes_plugged_total,
    formData.tubes.evaporator.tube_count_total
  );
  const condPlugged = calculatePluggedPct(
    formData.tubes.condenser.tubes_plugged_total,
    formData.tubes.condenser.tube_count_total
  );
  if (evapPlugged > 5 || condPlugged > 5) {
    score += RISK_WEIGHTS.TUBE_PLUGS_EXCEEDED;
    breakdown.tubePlugs = RISK_WEIGHTS.TUBE_PLUGS_EXCEEDED;
    redFlags.push({
      code: 'TUBE_PLUGS_EXCEEDED',
      description: `Tube plugging exceeds 5% limit`,
      issueCode: 'TUBE003',
      severity: 'high',
    });
  }

  // Wall loss
  const evapWallLoss = formData.tubes.evaporator.wall_loss_pct ?? 0;
  const condWallLoss = formData.tubes.condenser.wall_loss_pct ?? 0;
  if (evapWallLoss > 20 || condWallLoss > 20) {
    score += RISK_WEIGHTS.TUBE_WALL_LOSS_CRITICAL;
    breakdown.tubeWallLoss = RISK_WEIGHTS.TUBE_WALL_LOSS_CRITICAL;
    redFlags.push({
      code: 'TUBE_WALL_LOSS_CRITICAL',
      description: `Tube wall loss exceeds 20%`,
      issueCode: 'TUBE002',
      severity: 'high',
    });
  }

  // Oil acid
  const acidNum = formData.oil.acid_number_mgkoh_g ?? 0;
  if (acidNum > 0.05) {
    score += RISK_WEIGHTS.OIL_ACID_FAIL;
    breakdown.oilAcid = RISK_WEIGHTS.OIL_ACID_FAIL;
    redFlags.push({
      code: 'OIL_ACID_FAIL',
      description: `Oil acid number ${acidNum.toFixed(3)} exceeds 0.05 threshold`,
      issueCode: 'OIL002',
      severity: 'high',
    });
  }

  // Voltage imbalance
  const motor = formData.electrical.main_motor;
  const voltImbal = motor?.voltage_imbalance_pct ?? calculateVoltageImbalance(
    motor?.voltage_l1_l2,
    motor?.voltage_l2_l3,
    motor?.voltage_l3_l1
  );
  if (voltImbal > 2) {
    score += RISK_WEIGHTS.VOLTAGE_IMBALANCE;
    breakdown.voltageImbalance = RISK_WEIGHTS.VOLTAGE_IMBALANCE;
    redFlags.push({
      code: 'VOLTAGE_IMBALANCE',
      description: `Voltage imbalance ${voltImbal.toFixed(2)}% exceeds 2% threshold`,
      issueCode: 'ELEC001',
      severity: 'medium',
    });
  }

  // Low insulation
  const insulRes = motor?.insulation_resistance_megohms;
  if (insulRes !== null && insulRes !== undefined && insulRes < 1) {
    score += RISK_WEIGHTS.LOW_INSULATION;
    breakdown.lowInsulation = RISK_WEIGHTS.LOW_INSULATION;
    redFlags.push({
      code: 'LOW_INSULATION',
      description: `Insulation resistance ${insulRes} MΩ below 1 MΩ minimum`,
      issueCode: 'ELEC003',
      severity: 'high',
    });
  }

  // Legionella
  if (formData.water.quality.legionella_detected) {
    score += RISK_WEIGHTS.LEGIONELLA_DETECTED;
    breakdown.legionella = RISK_WEIGHTS.LEGIONELLA_DETECTED;
    redFlags.push({
      code: 'LEGIONELLA_DETECTED',
      description: 'Legionella bacteria detected in water system',
      issueCode: 'WTR004',
      severity: 'critical',
    });
  }

  // Determine level
  let level: RiskLevel = 'none';
  if (score === 0) {
    level = 'none';
  } else if (score <= RISK_THRESHOLDS.LOW_MAX) {
    level = 'low';
  } else if (score <= RISK_THRESHOLDS.MEDIUM_MAX) {
    level = 'medium';
  } else if (redFlags.some(f => f.severity === 'critical') || score > 80) {
    level = 'critical';
  } else {
    level = 'high';
  }

  return { score: Math.min(score, 100), level, breakdown, redFlags };
}

interface Step9ReviewProps {
  formData: ChillerWizardFormData;
  goToStep: (step: WizardStep) => void;
  getStepStatus: (step: WizardStep) => { isCompleted: boolean; isSkipped: boolean };
}

export function Step9Review({ formData, goToStep, getStepStatus }: Step9ReviewProps) {
  // Calculate risk score
  const riskResult = useMemo(() => 
    calculateRiskFromFormData(formData), 
    [formData]
  );

  const getRiskBadge = () => {
    switch (riskResult.level) {
      case 'low':
        return <Badge className="bg-green-500 text-white text-lg px-4 py-1">Low Risk</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500 text-white text-lg px-4 py-1">Medium Risk</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 text-white text-lg px-4 py-1">High Risk</Badge>;
      case 'critical':
        return <Badge className="bg-red-500 text-white text-lg px-4 py-1">Critical Risk</Badge>;
      default:
        return <Badge className="bg-green-500 text-white text-lg px-4 py-1">No Issues</Badge>;
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 2: return Thermometer;
      case 3: return Droplets;
      case 4: return Settings;
      case 5: return Waves;
      case 6: return Zap;
      case 7: return Gauge;
      case 8: return Camera;
      default: return Info;
    }
  };

  const getSummaryContent = (step: number) => {
    switch (step) {
      case 2: // Refrigerant
        const refrig = formData.refrigerant;
        return (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Leak Detected:</span>
              <span className={refrig.leak_detected ? 'text-red-500 font-medium' : ''}>
                {refrig.leak_detected === null ? 'Not checked' : refrig.leak_detected ? 'Yes' : 'No'}
              </span>
            </div>
            {refrig.refrigerant_type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Refrigerant Type:</span>
                <span>{refrig.refrigerant_type}</span>
              </div>
            )}
            {refrig.suction_pressure_psig !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Suction Pressure:</span>
                <span>{refrig.suction_pressure_psig} PSIG</span>
              </div>
            )}
            {refrig.acid_test_passed !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Acid Test:</span>
                <span className={refrig.acid_test_passed ? 'text-green-600' : 'text-red-500'}>
                  {refrig.acid_test_passed ? 'Passed' : 'Failed'}
                </span>
              </div>
            )}
          </div>
        );

      case 3: // Oil
        const oil = formData.oil;
        return (
          <div className="space-y-2 text-sm">
            {oil.current_level_pct !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Oil Level:</span>
                <span>{oil.current_level_pct}%</span>
              </div>
            )}
            {oil.appearance && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Appearance:</span>
                <span className="capitalize">{oil.appearance.replace('_', ' ')}</span>
              </div>
            )}
            {oil.acid_number_mgkoh_g !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Acid Number:</span>
                <span className={oil.acid_number_mgkoh_g > 0.05 ? 'text-red-500 font-medium' : ''}>
                  {oil.acid_number_mgkoh_g.toFixed(3)} mg KOH/g
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sample Collected:</span>
              <span>{oil.sample_collected ? 'Yes' : 'No'}</span>
            </div>
          </div>
        );

      case 4: // Tubes
        const evap = formData.tubes.evaporator;
        const cond = formData.tubes.condenser;
        return (
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium mb-1">Evaporator</p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plugged:</span>
                <span className={(evap.plugged_pct ?? 0) > 5 ? 'text-red-500 font-medium' : ''}>
                  {evap.plugged_pct?.toFixed(1) ?? 'N/A'}%
                </span>
              </div>
              {evap.wall_loss_pct !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wall Loss:</span>
                  <span className={(evap.wall_loss_pct ?? 0) > 20 ? 'text-red-500 font-medium' : ''}>
                    {evap.wall_loss_pct?.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="font-medium mb-1">Condenser</p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plugged:</span>
                <span className={(cond.plugged_pct ?? 0) > 5 ? 'text-red-500 font-medium' : ''}>
                  {cond.plugged_pct?.toFixed(1) ?? 'N/A'}%
                </span>
              </div>
            </div>
          </div>
        );

      case 5: // Water
        const quality = formData.water.quality;
        return (
          <div className="space-y-2 text-sm">
            {quality.ph !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">pH:</span>
                <span>{quality.ph}</span>
              </div>
            )}
            {quality.legionella_detected !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Legionella:</span>
                <span className={quality.legionella_detected ? 'text-red-500 font-bold' : 'text-green-600'}>
                  {quality.legionella_detected ? 'DETECTED' : 'Not Detected'}
                </span>
              </div>
            )}
            {quality.treatment_vendor && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Treatment Vendor:</span>
                <span>{quality.treatment_vendor}</span>
              </div>
            )}
          </div>
        );

      case 6: // Electrical
        const motor = formData.electrical.main_motor;
        return (
          <div className="space-y-2 text-sm">
            {motor?.voltage_imbalance_pct !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Voltage Imbalance:</span>
                <span className={(motor?.voltage_imbalance_pct ?? 0) > 2 ? 'text-red-500 font-medium' : ''}>
                  {motor?.voltage_imbalance_pct?.toFixed(2)}%
                </span>
              </div>
            )}
            {motor?.insulation_resistance_megohms !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Insulation Resistance:</span>
                <span className={(motor?.insulation_resistance_megohms ?? 999) < 1 ? 'text-red-500 font-medium' : ''}>
                  {motor?.insulation_resistance_megohms} MΩ
                </span>
              </div>
            )}
            {motor?.vibration_acceptable !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vibration:</span>
                <span className={motor?.vibration_acceptable ? 'text-green-600' : 'text-red-500'}>
                  {motor?.vibration_acceptable ? 'Acceptable' : 'Not Acceptable'}
                </span>
              </div>
            )}
          </div>
        );

      case 7: // Performance
        const perf = formData.performance;
        return (
          <div className="space-y-2 text-sm">
            {perf.load_pct !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Load:</span>
                <span>{perf.load_pct}%</span>
              </div>
            )}
            {perf.tons_actual !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tons Actual:</span>
                <span>{perf.tons_actual.toFixed(1)}</span>
              </div>
            )}
            {perf.kw_per_ton !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">kW/ton:</span>
                <span>{perf.kw_per_ton.toFixed(3)}</span>
              </div>
            )}
            {perf.design_kw_per_ton !== null && perf.kw_per_ton !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">vs Design:</span>
                <span className={perf.kw_per_ton > perf.design_kw_per_ton * 1.1 ? 'text-red-500' : 'text-green-600'}>
                  {perf.kw_per_ton <= perf.design_kw_per_ton ? 'At or Better' : 
                    `+${(((perf.kw_per_ton - perf.design_kw_per_ton) / perf.design_kw_per_ton) * 100).toFixed(1)}%`}
                </span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const skippedSteps = WIZARD_STEPS.filter(s => s.step >= 2 && s.step <= 7 && formData.skipReasons[s.step]);
  const criticalFindings = formData.findings.filter(f => f.severity === 'critical');
  const highFindings = formData.findings.filter(f => f.severity === 'high');

  return (
    <div className="space-y-4 pb-4">
      {/* Risk Score Summary */}
      <Card className={
        riskResult.level === 'critical' ? 'border-red-500 bg-red-50/50' :
        riskResult.level === 'high' ? 'border-orange-500 bg-orange-50/50' :
        riskResult.level === 'medium' ? 'border-amber-500 bg-amber-50/50' :
        'border-green-500 bg-green-50/50'
      }>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Overall Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl font-bold">{riskResult.score}</div>
            {getRiskBadge()}
          </div>
          
          {/* Score Breakdown */}
          {riskResult.breakdown && Object.entries(riskResult.breakdown).some(([_, v]) => v > 0) && (
            <div className="space-y-1 text-sm border-t pt-3">
              <p className="font-medium mb-2">Score Breakdown:</p>
              {Object.entries(riskResult.breakdown).map(([key, value]) => {
                if (value === 0) return null;
                return (
                  <div key={key} className="flex justify-between text-muted-foreground">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-foreground font-medium">+{value}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {(criticalFindings.length > 0 || riskResult.redFlags.length > 0) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-1">Immediate Attention Required</div>
            <ul className="list-disc list-inside text-sm space-y-1">
              {riskResult.redFlags.map((flag, i) => (
                <li key={i}>{flag.description}</li>
              ))}
              {criticalFindings.map(f => (
                <li key={f.id}>{f.description || 'Critical finding documented'}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Section Summaries */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide px-1">
          Inspection Summary
        </h3>
        
        {WIZARD_STEPS.filter(s => s.step >= 2 && s.step <= 7).map(stepInfo => {
          const status = getStepStatus(stepInfo.step as WizardStep);
          const Icon = getStepIcon(stepInfo.step);
          
          return (
            <Collapsible key={stepInfo.step}>
              <Card className={status.isSkipped ? 'opacity-60' : ''}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{stepInfo.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {status.isSkipped ? (
                          <Badge variant="outline" className="text-amber-600">Skipped</Badge>
                        ) : status.isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="border-t pt-4">
                    {status.isSkipped ? (
                      <p className="text-sm text-muted-foreground italic">
                        Skipped: {formData.skipReasons[stepInfo.step]?.notes || 'No reason provided'}
                      </p>
                    ) : (
                      getSummaryContent(stepInfo.step)
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToStep(stepInfo.step as WizardStep)}
                      className="mt-3 w-full"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Step
                    </Button>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {/* Findings Summary */}
      {formData.findings.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Camera className="h-5 w-5" />
                Documented Findings
              </CardTitle>
              <Badge variant="outline">{formData.findings.length} total</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {formData.findings.map((finding, i) => (
              <div key={finding.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">#{i + 1}</span>
                  <span className="text-sm truncate max-w-[200px]">
                    {finding.description || finding.issue_code || 'No description'}
                  </span>
                </div>
                <Badge className={
                  finding.severity === 'critical' ? 'bg-red-500' :
                  finding.severity === 'high' ? 'bg-orange-500' :
                  finding.severity === 'medium' ? 'bg-amber-500' :
                  'bg-blue-500'
                }>
                  {finding.severity}
                </Badge>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToStep(8)}
              className="w-full mt-2"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Findings
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Skipped Steps Notice */}
      {skippedSteps.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Skipped Steps</p>
                <ul className="text-sm text-amber-600 mt-1 space-y-1">
                  {skippedSteps.map(s => (
                    <li key={s.step}>
                      • {s.title}
                      {formData.skipReasons[s.step]?.notes && (
                        <span className="italic"> - {formData.skipReasons[s.step].notes}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ready to Submit */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Ready to Submit</p>
              <p className="text-sm text-muted-foreground">
                Review the information above and click Submit to save this inspection.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
