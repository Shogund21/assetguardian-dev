
import AnalyticsCard from "./AnalyticsCard";
import MaintenanceTrends from "@/components/analytics/MaintenanceTrends";
import EquipmentStatusChart from "@/components/analytics/EquipmentStatusChart";
import MaintenanceCompletionRate from "@/components/analytics/MaintenanceCompletionRate";
import TechnicianPerformance from "@/components/analytics/technician/TechnicianPerformance";
import EquipmentHealthMatrixWrapper from "@/components/analytics/health-matrix/EquipmentHealthMatrixWrapper";
import PredictiveMaintenanceSection from "./PredictiveMaintenanceSection";

const ChartsView = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6">
      {/* Predictive Maintenance Section - New Addition */}
      <PredictiveMaintenanceSection />
      
      {/* Main Trends Chart - Full width */}
      <AnalyticsCard
        title="Maintenance Trends"
        description="Historical maintenance activity over time"
        tooltipContent="This chart shows maintenance activities over time, including completed, pending, and issues found."
      >
        <div className="min-h-[350px] w-full">
          <MaintenanceTrends />
        </div>
      </AnalyticsCard>

      {/* Two-column grid for secondary charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Equipment Status */}
        <AnalyticsCard
          title="Equipment Status"
          description="Current status breakdown"
          tooltipContent="Distribution of equipment by current operational status"
        >
          <div className="min-h-[300px] w-full">
            <EquipmentStatusChart />
          </div>
        </AnalyticsCard>
        
        {/* Maintenance Completion Rate */}
        <AnalyticsCard
          title="Completion Rate"
          description="Maintenance status overview"
          tooltipContent="Breakdown of maintenance tasks by completion status"
        >
          <div className="min-h-[300px] w-full">
            <MaintenanceCompletionRate />
          </div>
        </AnalyticsCard>
      
        {/* Technician Performance */}
        <AnalyticsCard
          title="Technician Performance"
          description="Maintenance by technician"
          tooltipContent="Comparison of completed, pending, and issues found by technician"
        >
          <div className="min-h-[300px] w-full">
            <TechnicianPerformance />
          </div>
        </AnalyticsCard>
        
        {/* Equipment Health Matrix */}
        <AnalyticsCard
          title="Equipment Health Matrix by Location"
          description="Status and risk assessment by location"
          tooltipContent="Detailed breakdown of equipment health metrics across locations"
        >
          <div className="min-h-[300px] w-full">
            <EquipmentHealthMatrixWrapper />
          </div>
        </AnalyticsCard>
      </div>
    </div>
  );
};

export default ChartsView;
