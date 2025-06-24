
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { useEquipmentAlerts } from "./hooks/useEquipmentAlerts";
import { AlertItem } from "./components/AlertItem";
import { HealthyEquipmentState } from "./components/HealthyEquipmentState";

interface EquipmentHealthMonitorProps {
  equipmentId?: string;
}

export const EquipmentHealthMonitor: React.FC<EquipmentHealthMonitorProps> = ({ equipmentId }) => {
  const { alerts, loading, loadAlerts } = useEquipmentAlerts({ equipmentId });

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
        <Button 
          onClick={loadAlerts}
          size="sm"
          variant="outline"
        >
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <HealthyEquipmentState />
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentHealthMonitor;
