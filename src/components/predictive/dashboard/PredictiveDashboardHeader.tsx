
import React from "react";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";

export const PredictiveDashboardHeader = () => {
  return (
    <>
      <div className="mb-2 px-1">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg md:text-2xl font-bold">Predictive Maintenance Dashboard</h1>
          <div className="md:hidden">
            <OfflineIndicator />
          </div>
        </div>
        <p className="text-muted-foreground hidden md:block">
          Record manual readings and get AI-powered predictive maintenance insights
        </p>
      </div>

      <div className="mb-2 px-1 hidden md:block">
        <OfflineIndicator />
      </div>
    </>
  );
};
