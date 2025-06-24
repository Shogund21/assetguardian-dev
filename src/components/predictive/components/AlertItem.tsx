
import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { PredictiveAlert } from "@/types/predictive";

interface AlertItemProps {
  alert: PredictiveAlert;
}

export const AlertItem: React.FC<AlertItemProps> = ({ alert }) => {
  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <div 
      key={alert.id} 
      className="flex items-start justify-between p-4 border rounded-lg bg-card"
    >
      <div className="flex items-start gap-3">
        {getRiskIcon(alert.risk_level)}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium">{alert.equipment?.name || alert.asset_id}</p>
            <Badge variant={getRiskColor(alert.risk_level) as any}>
              {alert.risk_level.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {alert.equipment?.location || 'Unknown Location'}
          </p>
          <p className="text-sm">{alert.finding}</p>
          <p className="text-sm text-muted-foreground mt-1">
            <strong>Recommendation:</strong> {alert.recommendation}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground">
          {new Date(alert.created_at).toLocaleDateString()}
        </p>
        <p className="text-xs text-muted-foreground">
          {Math.round(alert.confidence_score * 100)}% confidence
        </p>
      </div>
    </div>
  );
};
