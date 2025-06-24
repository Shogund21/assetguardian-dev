import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, Brain, Loader2, Database, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import usePredictiveMaintenance from "@/hooks/usePredictiveMaintenance";
import { getEquipmentReadingTemplate } from "@/utils/equipmentTemplates";
import ReadingSourceSelector, { ReadingSource } from "./ReadingSourceSelector";
import DataIntegrityDiagnostic from "./DataIntegrityDiagnostic";

interface EnhancedAIAnalysisProps {
  equipmentId: string;
  equipmentType: string;
  equipmentName: string;
}

const EnhancedAIAnalysis = ({ equipmentId, equipmentType, equipmentName }: EnhancedAIAnalysisProps) => {
  const [readingSource, setReadingSource] = useState<ReadingSource>('auto');
  const { analyzeEquipment, isAnalyzing, alerts, useReadingCounts } = usePredictiveMaintenance();
  const { toast } = useToast();

  // Get reading counts for the selector
  const { data: readingCounts } = useReadingCounts(equipmentId);

  const handleAnalyze = async () => {
    try {
      console.log(`Starting AI analysis for ${equipmentName} (${equipmentType}) with reading source: ${readingSource}`);
      
      // Get equipment reading standards
      const readingTemplates = getEquipmentReadingTemplate(equipmentType);
      console.log('Available reading templates:', readingTemplates);
      
      analyzeEquipment({ equipmentId, readingSource });
      
      // Show immediate feedback
      const sourceDescription = readingSource === 'manual' 
        ? 'manual sensor data only'
        : readingSource === 'standard'
          ? 'maintenance check data only'
          : 'all available data sources';
      
      toast({
        title: "Analysis Started",
        description: `Running predictive analysis for ${equipmentName} using ${sourceDescription}`,
      });
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to start predictive analysis",
        variant: "destructive",
      });
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Medium Risk</Badge>;
      case 'low':
        return <Badge variant="default" className="bg-green-600">Low Risk</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getDataQualityBadge = (dataQuality: any) => {
    if (!dataQuality) return null;
    
    const { manual_readings_count, standard_readings_count } = dataQuality;
    const hasManual = manual_readings_count > 0;
    const hasStandard = standard_readings_count > 0;
    
    if (hasManual && hasStandard) {
      return <Badge variant="default" className="bg-blue-600">Comprehensive Data</Badge>;
    } else if (hasManual) {
      return <Badge variant="default" className="bg-green-600">Manual Sensor Data</Badge>;
    } else if (hasStandard) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">Maintenance Check Data</Badge>;
    }
    
    return <Badge variant="secondary">Limited Data</Badge>;
  };

  // Get relevant alerts for this equipment
  const equipmentAlerts = alerts.filter(alert => alert.asset_id === equipmentId);
  const latestAlert = equipmentAlerts[0]; // Most recent alert

  return (
    <div className="space-y-6">
      {/* Data Integrity Diagnostic */}
      <DataIntegrityDiagnostic 
        equipmentId={equipmentId}
        equipmentName={equipmentName}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Predictive Analysis
            </CardTitle>
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="bg-blue-900 hover:bg-blue-800 text-white"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Run Analysis"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Reading Source Selector */}
          <div className="mb-6">
            <ReadingSourceSelector
              value={readingSource}
              onChange={setReadingSource}
              manualCount={readingCounts?.manual || 0}
              standardCount={readingCounts?.standard || 0}
            />
          </div>

          {isAnalyzing && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                Analyzing equipment data from {readingSource === 'manual' ? 'manual sensors' : readingSource === 'standard' ? 'maintenance checks' : 'all available sources'}...
              </p>
            </div>
          )}
          
          {latestAlert && !isAnalyzing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRiskIcon(latestAlert.risk_level)}
                  <span className="font-medium">Latest Analysis Result</span>
                </div>
                <div className="flex gap-2">
                  {getRiskBadge(latestAlert.risk_level)}
                  {latestAlert.data_quality && getDataQualityBadge(latestAlert.data_quality)}
                </div>
              </div>
              
              {latestAlert.data_quality && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Data Sources Used</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3 w-3 text-green-600" />
                      <span>Manual Sensor Data: {latestAlert.data_quality.manual_readings_count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Database className="h-3 w-3 text-blue-600" />
                      <span>Maintenance Check Data: {latestAlert.data_quality.standard_readings_count}</span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    {latestAlert.data_quality.coverage_assessment}
                  </p>
                </div>
              )}
              
              <div className="grid gap-4">
                <div>
                  <h4 className="font-medium mb-2">Finding:</h4>
                  <p className="text-sm text-muted-foreground">{latestAlert.finding}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Recommendation:</h4>
                  <p className="text-sm text-muted-foreground">{latestAlert.recommendation}</p>
                </div>
                
                {latestAlert.confidence_score && (
                  <div>
                    <h4 className="font-medium mb-2">Confidence Score:</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${latestAlert.confidence_score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{latestAlert.confidence_score}%</span>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  Analysis completed: {new Date(latestAlert.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          )}
          
          {!latestAlert && !isAnalyzing && (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No analysis results yet. Run an analysis to get AI-powered insights.
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Choose your preferred data source above</li>
                <li>Manual: Uses direct sensor readings for real-time analysis</li>
                <li>Standard: Uses maintenance check form data for trend analysis</li>
                <li>Auto: Combines both sources for comprehensive insights</li>
                <li>Identifies potential issues early with predictive algorithms</li>
                <li>Provides maintenance recommendations based on data quality</li>
                <li>Creates work orders for critical issues automatically</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      
      {equipmentAlerts.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {equipmentAlerts.slice(1, 6).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    {getRiskIcon(alert.risk_level)}
                    <div>
                      <p className="text-sm font-medium">{alert.finding}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleDateString()}
                        {alert.data_quality && (
                          <span className="ml-2">
                            • {alert.data_quality.manual_readings_count}M + {alert.data_quality.standard_readings_count}S readings
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getRiskBadge(alert.risk_level)}
                    {alert.data_quality && getDataQualityBadge(alert.data_quality)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedAIAnalysis;
