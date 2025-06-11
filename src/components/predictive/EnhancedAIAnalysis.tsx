
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, Brain, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import usePredictiveMaintenance from "@/hooks/usePredictiveMaintenance";
import { getEquipmentReadingTemplate } from "@/utils/equipmentTemplates";

interface EnhancedAIAnalysisProps {
  equipmentId: string;
  equipmentType: string;
  equipmentName: string;
}

const EnhancedAIAnalysis = ({ equipmentId, equipmentType, equipmentName }: EnhancedAIAnalysisProps) => {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { analyzeEquipment, isAnalyzing, alerts } = usePredictiveMaintenance();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    try {
      setAnalysisResult(null);
      
      // Get equipment reading standards
      const readingTemplates = getEquipmentReadingTemplate(equipmentType);
      
      console.log(`Starting AI analysis for ${equipmentName} (${equipmentType})`);
      console.log('Available reading templates:', readingTemplates);
      
      analyzeEquipment(equipmentId);
      
      // Show immediate feedback
      toast({
        title: "Analysis Started",
        description: `Running predictive analysis for ${equipmentName}`,
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

  // Get relevant alerts for this equipment
  const equipmentAlerts = alerts.filter(alert => alert.asset_id === equipmentId);
  const latestAlert = equipmentAlerts[0]; // Most recent alert

  return (
    <div className="space-y-6">
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
          {isAnalyzing && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                Analyzing equipment readings against industry standards...
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
                {getRiskBadge(latestAlert.risk_level)}
              </div>
              
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
                <li>Analyzes readings against industry standards</li>
                <li>Identifies potential issues early</li>
                <li>Provides maintenance recommendations</li>
                <li>Creates work orders for critical issues</li>
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
                      </p>
                    </div>
                  </div>
                  {getRiskBadge(alert.risk_level)}
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
