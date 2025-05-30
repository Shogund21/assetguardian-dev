
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { sub } from "date-fns";
import { AnalyticsFilterProvider } from "@/components/analytics/AnalyticsFilterContext";
import { useToast } from "@/components/ui/use-toast";

// Import refactored components
import AnalyticsHeader from "@/components/analytics/dashboard/AnalyticsHeader";
import AnalyticsControls from "@/components/analytics/dashboard/AnalyticsControls";
import ChartsView from "@/components/analytics/dashboard/ChartsView";
import TablePlaceholder from "@/components/analytics/dashboard/TablePlaceholder";

const Analytics = () => {
  // Default date range is last 30 days
  const defaultDateRange: DateRange = {
    from: sub(new Date(), { days: 30 }),
    to: new Date(),
  };
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<"charts" | "tables">("charts");
  const { toast } = useToast();

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Analytics refreshed",
        description: "Chart data has been updated with the latest information."
      });
    }, 1000);
  };

  const handleExportData = () => {
    toast({
      title: "Export initiated",
      description: "Analytics data export feature will be implemented in a future update."
    });
  };

  return (
    <Layout>
      <AnalyticsFilterProvider>
        <div className="w-full max-w-full space-y-6 px-1 sm:px-2 md:px-3 pb-20">
          {/* Header Section */}
          <AnalyticsHeader 
            activeView={activeView} 
            setActiveView={setActiveView} 
          />
          
          {/* Controls Section */}
          <AnalyticsControls 
            defaultDateRange={defaultDateRange}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            onExport={handleExportData}
          />

          {/* Content Section */}
          {activeView === "charts" ? (
            <ChartsView />
          ) : (
            <TablePlaceholder onShowCharts={() => setActiveView("charts")} />
          )}
        </div>
      </AnalyticsFilterProvider>
    </Layout>
  );
};

export default Analytics;
