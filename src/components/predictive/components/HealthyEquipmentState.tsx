
import React from "react";
import { CheckCircle } from "lucide-react";

export const HealthyEquipmentState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
      <p className="text-lg font-medium">All Equipment Healthy</p>
      <p className="text-muted-foreground">No active predictive maintenance alerts</p>
    </div>
  );
};
