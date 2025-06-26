
import React from "react";
import { PredictiveTimelineEvent, MaintenanceWindow, DegradationAnalysis } from "@/types/predictive";
import PerformanceTrendsCard from "./timeline/PerformanceTrendsCard";
import TimelineEventsCard from "./timeline/TimelineEventsCard";
import MaintenanceWindowsCard from "./timeline/MaintenanceWindowsCard";
import DegradationAnalysisCard from "./timeline/DegradationAnalysisCard";
import NoDataState from "./timeline/NoDataState";

interface PredictiveTimelineProps {
  timelineEvents?: PredictiveTimelineEvent[];
  maintenanceWindows?: MaintenanceWindow[];
  degradationAnalysis?: DegradationAnalysis[];
  performanceTrends?: {
    efficiency_decline_rate: number;
    energy_consumption_increase: number;
    projected_failure_date: string;
  };
}

const PredictiveTimeline = ({ 
  timelineEvents = [], 
  maintenanceWindows = [], 
  degradationAnalysis = [],
  performanceTrends
}: PredictiveTimelineProps) => {
  
  const hasData = timelineEvents.length > 0 || maintenanceWindows.length > 0 || 
                 degradationAnalysis.length > 0 || performanceTrends;

  if (!hasData) {
    return <NoDataState />;
  }

  return (
    <div className="space-y-6">
      {/* Performance Trends Overview */}
      {performanceTrends && (
        <PerformanceTrendsCard performanceTrends={performanceTrends} />
      )}

      {/* Timeline Events */}
      {timelineEvents.length > 0 && (
        <TimelineEventsCard timelineEvents={timelineEvents} />
      )}

      {/* Maintenance Windows */}
      {maintenanceWindows.length > 0 && (
        <MaintenanceWindowsCard maintenanceWindows={maintenanceWindows} />
      )}

      {/* Component Degradation Analysis */}
      {degradationAnalysis.length > 0 && (
        <DegradationAnalysisCard degradationAnalysis={degradationAnalysis} />
      )}
    </div>
  );
};

export default PredictiveTimeline;
