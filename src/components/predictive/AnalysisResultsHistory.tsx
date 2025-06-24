import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  Wrench, 
  ChevronDown,
  Clock,
  DollarSign,
  Settings,
  Heart,
  TrendingDown
} from "lucide-react";
import { PredictiveAlert } from "@/types/predictive";

const AnalysisResultsHistory = () => {
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['analysis-results'],
    queryFn: async () => {
      console.log('Fetching analysis results...');
      
      const { data, error } = await supabase
        .from('predictive_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching analysis results:', error);
        throw error;
      }

      console.log('Raw analysis results:', data);

      // Get equipment details separately for each alert
      const resultsWithEquipment = await Promise.all(
        (data || []).map(async (record) => {
          let equipment = null;
          
          if (record.asset_id) {
            try {
              const { data: equipmentData, error: equipmentError } = await supabase
                .from('equipment')
                .select('name, location')
                .eq('id', record.asset_id)
                .single();
              
              if (!equipmentError && equipmentData) {
                equipment = equipmentData;
              }
            } catch (err) {
              console.warn(`Could not fetch equipment for alert ${record.id}`);
            }
          }

          return {
            ...record,
            equipment,
            // Cast JSONB fields safely
            data_quality: record.data_quality as any,
            predictive_timeline: record.predictive_timeline as any,
            degradation_analysis: record.degradation_analysis as any,
            maintenance_windows: record.maintenance_windows as any,
            performance_trends: record.performance_trends as any,
          } as PredictiveAlert;
        })
      );

      return resultsWithEquipment;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis Results History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading analysis results...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Analysis Results History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No analysis results found. Run some AI analyses to see results here.
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((result) => (
              <div key={result.id} className="border rounded-lg p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-white ${getRiskColor(result.risk_level)}`}>
                        {result.risk_level.toUpperCase()} RISK
                      </Badge>
                      {result.equipment && (
                        <span className="text-sm font-medium">
                          {result.equipment.name} - {result.equipment.location}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(result.created_at).toLocaleString()}
                      {result.confidence_score && (
                        <span className="ml-2">
                          Confidence: {(result.confidence_score * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    {result.resolved_at ? (
                      <Badge variant="secondary">Resolved</Badge>
                    ) : (
                      <Badge variant="destructive">Active</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Finding:</span>
                    <p className="text-sm text-muted-foreground mt-1">{result.finding}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Wrench className="h-4 w-4" />
                      Recommendation:
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">{result.recommendation}</p>
                  </div>
                </div>

                {/* Predictive Timeline */}
                {result.predictive_timeline && result.predictive_timeline.length > 0 && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                      <Clock className="h-4 w-4" />
                      Predictive Timeline ({result.predictive_timeline.length} predictions)
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                      <div className="grid gap-3">
                        {result.predictive_timeline.map((event, index) => (
                          <div key={index} className="border rounded-lg p-3 bg-gray-50">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge className={getSeverityColor(event.severity)}>
                                  {event.severity.toUpperCase()}
                                </Badge>
                                <span className="font-medium text-sm">{event.component}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {event.failure_probability}% probability
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Failure Type:</span>
                                <p className="font-medium">{event.failure_type}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Timeframe:</span>
                                <p className="font-medium">{event.timeframe}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Predicted Date:</span>
                                <p className="font-medium">{formatDate(event.predicted_date)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Est. Cost:</span>
                                <p className="font-medium text-red-600">{formatCurrency(event.intervention_cost)}</p>
                              </div>
                            </div>
                            {event.downtime_hours > 0 && (
                              <div className="mt-2 text-sm">
                                <span className="text-muted-foreground">Est. Downtime:</span>
                                <span className="ml-1 font-medium">{event.downtime_hours} hours</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Maintenance Windows */}
                {result.maintenance_windows && result.maintenance_windows.length > 0 && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                      <Settings className="h-4 w-4" />
                      Maintenance Windows ({result.maintenance_windows.length} windows)
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                      <div className="grid gap-3">
                        {result.maintenance_windows.map((window, index) => (
                          <div key={index} className="border rounded-lg p-3 bg-blue-50">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={window.window_type === 'optimal' ? 'default' : 'secondary'}>
                                  {window.window_type.toUpperCase()}
                                </Badge>
                                <span className="font-medium text-sm">{window.intervention_type}</span>
                              </div>
                              <div className="text-sm font-medium text-blue-600">
                                Priority: {window.priority}/10
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Window Start:</span>
                                <p className="font-medium">{formatDate(window.window_start)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Window End:</span>
                                <p className="font-medium">{formatDate(window.window_end)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Est. Cost:</span>
                                <p className="font-medium text-green-600">{formatCurrency(window.estimated_cost)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Est. Hours:</span>
                                <p className="font-medium">{window.estimated_hours} hours</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Degradation Analysis */}
                {result.degradation_analysis && result.degradation_analysis.length > 0 && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                      <Heart className="h-4 w-4 text-red-500" />
                      Component Health ({result.degradation_analysis.length} components)
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                      <div className="grid gap-3">
                        {result.degradation_analysis.map((analysis, index) => (
                          <div key={index} className="border rounded-lg p-3 bg-yellow-50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{analysis.component}</span>
                              <Badge variant="outline">
                                {analysis.current_condition}% Health
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Degradation Rate:</span>
                                <p className="font-medium">{analysis.degradation_rate}%/month</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Life Remaining:</span>
                                <p className="font-medium">{analysis.expected_life_remaining} months</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Current: {analysis.current_condition}%</span>
                                <span>Replacement at: {analysis.replacement_threshold}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    analysis.current_condition > 70 ? 'bg-green-500' :
                                    analysis.current_condition > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${analysis.current_condition}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Performance Trends */}
                {result.performance_trends && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                      <TrendingDown className="h-4 w-4" />
                      Performance Trends
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                      <div className="border rounded-lg p-3 bg-red-50">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Efficiency Decline:</span>
                            <p className="font-medium text-red-600">
                              {result.performance_trends.efficiency_decline_rate}%/month
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Energy Increase:</span>
                            <p className="font-medium text-red-600">
                              +{result.performance_trends.energy_consumption_increase}%
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Projected Failure:</span>
                            <p className="font-medium">
                              {formatDate(result.performance_trends.projected_failure_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {result.data_quality && (
                  <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded border-t">
                    <div className="flex items-center gap-4">
                      <span>Manual Readings: {result.data_quality.manual_readings_count || 0}</span>
                      <span>Standard Readings: {result.data_quality.standard_readings_count || 0}</span>
                      <span>Quality: {result.data_quality.coverage_assessment || 'Unknown'}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisResultsHistory;
