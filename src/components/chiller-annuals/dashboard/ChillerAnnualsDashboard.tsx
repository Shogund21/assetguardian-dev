import React from "react";
import { FleetHealthOverview } from "./FleetHealthOverview";
import { ChillerHealthScoreTable } from "./ChillerHealthScoreTable";
import { TubeLossTrendChart } from "./TubeLossTrendChart";
import { RefrigerantAnalytics } from "./RefrigerantAnalytics";
import { EfficiencyTrendChart } from "./EfficiencyTrendChart";
import { HighRiskAssetsList } from "./HighRiskAssetsList";
import { VendorAccountabilitySummary } from "./VendorAccountabilitySummary";

export function ChillerAnnualsDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Overview */}
      <FleetHealthOverview />

      {/* High Risk Assets - Priority Display */}
      <HighRiskAssetsList />

      {/* Health Scores Table */}
      <ChillerHealthScoreTable />

      {/* Charts Row 1: Tubes and Refrigerant */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TubeLossTrendChart />
        <RefrigerantAnalytics />
      </div>

      {/* Charts Row 2: Efficiency */}
      <EfficiencyTrendChart />

      {/* Vendor Accountability */}
      <VendorAccountabilitySummary />
    </div>
  );
}

export default ChillerAnnualsDashboard;
