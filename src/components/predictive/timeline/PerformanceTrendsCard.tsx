
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { formatDate } from "./utils/formatters";

interface PerformanceTrendsCardProps {
  performanceTrends: {
    efficiency_decline_rate: number;
    energy_consumption_increase: number;
    projected_failure_date: string;
  };
}

const PerformanceTrendsCard = ({ performanceTrends }: PerformanceTrendsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-orange-500" />
          Performance Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {performanceTrends.efficiency_decline_rate.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Efficiency Decline Rate</div>
            <div className="text-xs text-muted-foreground">per month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              +{performanceTrends.energy_consumption_increase.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Energy Consumption Increase</div>
            <div className="text-xs text-muted-foreground">vs baseline</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {formatDate(performanceTrends.projected_failure_date)}
            </div>
            <div className="text-sm text-muted-foreground">Projected Failure Date</div>
            <div className="text-xs text-muted-foreground">if no intervention</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceTrendsCard;
