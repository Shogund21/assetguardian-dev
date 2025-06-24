
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle, TrendingUp, Wrench } from "lucide-react";
import { PredictiveAlert } from "@/types/predictive";

const AnalysisResultsHistory = () => {
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['analysis-results'],
    queryFn: async () => {
      console.log('Fetching analysis results...');
      
      const { data, error } = await supabase
        .from('predictive_alerts')
        .select(`
          *,
          equipment:equipment!predictive_alerts_asset_id_fkey (
            name,
            location
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching analysis results:', error);
        throw error;
      }

      console.log('Raw analysis results:', data);

      // Map database records to PredictiveAlert interface
      return (data || []).map(record => ({
        ...record,
        equipment: record.equipment || null,
        // Cast JSONB fields safely
        data_quality: record.data_quality as any,
        predictive_timeline: record.predictive_timeline as any,
        degradation_analysis: record.degradation_analysis as any,
        maintenance_windows: record.maintenance_windows as any,
        performance_trends: record.performance_trends as any,
      })) as PredictiveAlert[];
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
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
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

                <div className="space-y-2">
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

                {result.data_quality && (
                  <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                    Data Source: {JSON.stringify(result.data_quality)}
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
