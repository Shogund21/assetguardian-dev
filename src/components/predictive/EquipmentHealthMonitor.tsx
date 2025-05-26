
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { PredictiveMaintenanceService } from "@/services/predictiveMaintenanceService";
import { PredictiveAlert } from "@/types/predictive";
import { useToast } from "@/hooks/use-toast";

interface EquipmentHealthMonitorProps {
  equipmentId?: string;
}

export const EquipmentHealthMonitor: React.FC<EquipmentHealthMonitorProps> = ({ equipmentId }) => {
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAlerts();
  }, [equipmentId]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await PredictiveMaintenanceService.getActivePredictiveAlerts();
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast({
        title: "Error loading alerts",
        description: "Failed to load predictive maintenance alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runPredictiveAnalysis = async (targetEquipmentId: string) => {
    try {
      setAnalyzing(true);
      const result = await PredictiveMaintenanceService.processAIAnalysis(targetEquipmentId);
      
      if (result) {
        // Create alert if risk is not low
        if (result.risk_level !== 'low') {
          await PredictiveMaintenanceService.createPredictiveAlert({
            asset_id: result.asset_id,
            risk_level: result.risk_level,
            finding: result.finding,
            recommendation: result.recommendation,
            confidence_score: 0.85,
            resolved_at: null,
            work_order_id: null
          });

          // Create work order if recommended
          if (result.create_work_order && result.work_order) {
            const dueDate = new Date();
            dueDate.setHours(dueDate.getHours() + result.work_order.due_hours);
            
            await PredictiveMaintenanceService.createAutomatedWorkOrder({
              title: result.work_order.title,
              description: result.work_order.description,
              priority: result.work_order.priority,
              equipment_id: result.asset_id,
              due_date: dueDate.toISOString(),
              status: 'pending'
            });
          }
        }

        toast({
          title: "Analysis Complete",
          description: `Equipment analysis completed. Risk level: ${result.risk_level}`,
        });

        loadAlerts(); // Refresh alerts
      } else {
        toast({
          title: "Analysis Unavailable",
          description: "No sensor data available for analysis",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error running analysis:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to run predictive analysis",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Equipment Health Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading predictive alerts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Equipment Health Monitor
        </CardTitle>
        {equipmentId && (
          <Button 
            onClick={() => runPredictiveAnalysis(equipmentId)}
            disabled={analyzing}
            size="sm"
          >
            {analyzing ? "Analyzing..." : "Run Analysis"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium">All Equipment Healthy</p>
            <p className="text-muted-foreground">No active predictive maintenance alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentHealthMonitor;
