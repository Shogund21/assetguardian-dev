
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle, TrendingDown, Wrench } from "lucide-react";
import { PredictiveTimelineEvent, MaintenanceWindow, DegradationAnalysis } from "@/types/predictive";

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
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 border-red-600';
      case 'high': return 'bg-orange-500 border-orange-600';
      case 'medium': return 'bg-yellow-500 border-yellow-600';
      case 'low': return 'bg-green-500 border-green-600';
      default: return 'bg-gray-500 border-gray-600';
    }
  };

  const getWindowTypeColor = (windowType: string) => {
    switch (windowType) {
      case 'optimal': return 'border-green-500 bg-green-50';
      case 'acceptable': return 'border-yellow-500 bg-yellow-50';
      case 'critical': return 'border-red-500 bg-red-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Performance Trends Overview */}
      {performanceTrends && (
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
      )}

      {/* Timeline Events */}
      {timelineEvents.length > 0 && (
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
      )}

      {/* Maintenance Windows */}
      {maintenanceWindows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-green-500" />
              Optimal Maintenance Windows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maintenanceWindows.map((window, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getWindowTypeColor(window.window_type)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{window.intervention_type}</div>
                    <Badge 
                      variant={window.window_type === 'optimal' ? 'default' : window.window_type === 'critical' ? 'destructive' : 'outline'}
                    >
                      {window.window_type}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Window:</span>
                      <div className="font-medium">
                        {formatDate(window.window_start)} - {formatDate(window.window_end)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Est. Cost:</span>
                      <div className="font-medium text-green-600">{formatCurrency(window.estimated_cost)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Est. Hours:</span>
                      <div className="font-medium">{window.estimated_hours}h</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Priority:</span>
                      <div className="font-medium">{window.priority}/10</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Component Degradation Analysis */}
      {degradationAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              Component Degradation Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {degradationAnalysis.map((analysis, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium">{analysis.component}</div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{analysis.current_condition}%</div>
                      <div className="text-xs text-muted-foreground">current condition</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full ${
                        analysis.current_condition > 70 ? 'bg-green-500' :
                        analysis.current_condition > 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${analysis.current_condition}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Degradation Rate:</span>
                      <div className="font-medium text-orange-600">{analysis.degradation_rate}%/month</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Life Remaining:</span>
                      <div className="font-medium">{analysis.expected_life_remaining} months</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Replacement Threshold:</span>
                      <div className="font-medium">{analysis.replacement_threshold}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {timelineEvents.length === 0 && maintenanceWindows.length === 0 && degradationAnalysis.length === 0 && !performanceTrends && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Predictive Timeline Available</h3>
            <p className="text-muted-foreground mb-4">
              Run an AI analysis to generate predictive timeline insights
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 max-w-md mx-auto">
              <li>Failure probability timeline with dates</li>
              <li>Component degradation analysis</li>
              <li>Optimal maintenance windows</li>
              <li>Performance trend predictions</li>
              <li>Cost and downtime estimates</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PredictiveTimeline;
