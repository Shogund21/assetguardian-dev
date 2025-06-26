
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { PredictiveTimelineEvent } from "@/types/predictive";
import { getSeverityColor } from "./utils/colorHelpers";
import { formatCurrency, formatDate } from "./utils/formatters";

interface TimelineEventsCardProps {
  timelineEvents: PredictiveTimelineEvent[];
}

const TimelineEventsCard = ({ timelineEvents }: TimelineEventsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Failure Probability Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timelineEvents.map((event, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${getSeverityColor(event.severity)}`}></div>
                  <div>
                    <div className="font-medium">{event.component} - {event.failure_type}</div>
                    <div className="text-sm text-muted-foreground">{event.timeframe}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">{event.failure_probability}%</div>
                  <div className="text-xs text-muted-foreground">failure risk</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Predicted Date:</span>
                  <div className="font-medium">{formatDate(event.predicted_date)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Intervention Cost:</span>
                  <div className="font-medium text-green-600">{formatCurrency(event.intervention_cost)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Downtime:</span>
                  <div className="font-medium text-orange-600">{event.downtime_hours}h</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Severity:</span>
                  <Badge variant={event.severity === 'critical' ? 'destructive' : 'outline'}>
                    {event.severity}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimelineEventsCard;
