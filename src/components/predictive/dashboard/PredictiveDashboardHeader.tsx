
import React from "react";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";

export const PredictiveDashboardHeader = () => {
  return (
    <>
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold mb-2">Predictive Maintenance Dashboard</h1>
        <p className="text-muted-foreground">
          Record manual readings and get AI-powered predictive maintenance insights
        </p>
      </div>

      <div className="mb-6 px-1">
        <OfflineIndicator />
      </div>
    </>
  );
};
