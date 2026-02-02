import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { RiskLevel, RISK_LEVEL_COLORS } from '@/types/chillerRisk';

interface RiskScoreDisplayProps {
  score: number;
  level: RiskLevel;
  showBreakdown?: boolean;
  breakdown?: {
    refrigerantLeak: number;
    tubePlugs: number;
    oilAcid: number;
    voltageImbalance: number;
    efficiencyDegradation: number;
    legionella?: number;
    lowInsulation?: number;
    tubeWallLoss?: number;
  };
  className?: string;
}

export function RiskScoreDisplay({
  score,
  level,
  showBreakdown = false,
  breakdown,
  className,
}: RiskScoreDisplayProps) {
  const getRiskIcon = () => {
    switch (level) {
      case 'critical':
        return <XCircle className="h-6 w-6" />;
      case 'high':
        return <AlertTriangle className="h-6 w-6" />;
      case 'medium':
        return <AlertCircle className="h-6 w-6" />;
      case 'low':
      case 'none':
        return <CheckCircle className="h-6 w-6" />;
    }
  };

  const getRiskLabel = () => {
    switch (level) {
      case 'critical':
        return 'CRITICAL';
      case 'high':
        return 'HIGH RISK';
      case 'medium':
        return 'MEDIUM';
      case 'low':
        return 'LOW';
      case 'none':
        return 'NONE';
    }
  };

  const getProgressColor = () => {
    if (score <= 30) return 'bg-green-500';
    if (score <= 60) return 'bg-amber-500';
    return 'bg-destructive';
  };

  const getTextColor = () => {
    switch (level) {
      case 'critical':
        return 'text-red-800';
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-amber-600';
      case 'low':
      case 'none':
        return 'text-green-600';
    }
  };

  const getBgColor = () => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 border-red-300';
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-amber-50 border-amber-200';
      case 'low':
      case 'none':
        return 'bg-green-50 border-green-200';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main score display */}
      <div className={cn('rounded-lg border-2 p-4', getBgColor())}>
        <div className="text-center">
          <div className="text-4xl font-bold text-foreground">{score}</div>
          <div className="text-sm text-muted-foreground mt-1">Risk Score</div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all duration-500', getProgressColor())}
              style={{ width: `${Math.min(score, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>30</span>
            <span>60</span>
            <span>100</span>
          </div>
        </div>
        
        {/* Risk level badge */}
        <div className={cn('flex items-center justify-center gap-2 mt-4', getTextColor())}>
          {getRiskIcon()}
          <span className="font-bold text-lg">{getRiskLabel()}</span>
        </div>
      </div>

      {/* Score breakdown */}
      {showBreakdown && breakdown && (
        <div className="rounded-lg border bg-card p-4">
          <h4 className="font-medium text-sm text-muted-foreground mb-3">Score Breakdown</h4>
          <div className="space-y-2">
            <BreakdownRow label="Refrigerant Leak" value={breakdown.refrigerantLeak} />
            <BreakdownRow label="Tube Plugs" value={breakdown.tubePlugs} />
            <BreakdownRow label="Oil Acid" value={breakdown.oilAcid} />
            <BreakdownRow label="Voltage Imbalance" value={breakdown.voltageImbalance} />
            <BreakdownRow label="Efficiency Degradation" value={breakdown.efficiencyDegradation} />
            {breakdown.legionella !== undefined && breakdown.legionella > 0 && (
              <BreakdownRow label="Legionella" value={breakdown.legionella} />
            )}
            {breakdown.lowInsulation !== undefined && breakdown.lowInsulation > 0 && (
              <BreakdownRow label="Low Insulation" value={breakdown.lowInsulation} />
            )}
            {breakdown.tubeWallLoss !== undefined && breakdown.tubeWallLoss > 0 && (
              <BreakdownRow label="Tube Wall Loss" value={breakdown.tubeWallLoss} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(
        'font-medium',
        value > 0 ? 'text-destructive' : 'text-muted-foreground'
      )}>
        {value > 0 ? `+${value}` : '0'}
      </span>
    </div>
  );
}
