import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Loader2, CheckCircle, AlertTriangle, TrendingUp, Calendar, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EnhancedPredictiveService } from "@/services/enhancedPredictiveService";
import { PredictiveAlert } from "@/types/predictive";
import ReadingSourceSelector, { ReadingSource } from "./ReadingSourceSelector";
import DataIntegrityDiagnostic from "./DataIntegrityDiagnostic";
import PredictiveTimeline from "./PredictiveTimeline";

interface EnhancedAIAnalysisProps {
  equipmentId: string;
  equipmentType: string;
  equipmentName: string;
}

const EnhancedAIAnalysis = ({ equipmentId, equipmentType, equipmentName }: EnhancedAIAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PredictiveAlert | null>(null);
  const [readingSource, setReadingSource] = useState<ReadingSource>('auto');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRunAnalysis = async () => {
    if (!equipmentId) {
      toast({
        title: "Error",
        description: "Please select equipment first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      console.log('Starting AI analysis for equipment:', equipmentId);
      
      const result = await EnhancedPredictiveService.processEnhancedAIAnalysis(
        equipmentId,
        readingSource
      );

      if (result) {
        setAnalysisResult(result);
        toast({
          title: "Analysis Complete",
          description: `Risk level: ${result.risk_level.toUpperCase()}`,
        });
      } else {
        throw new Error('No analysis result received');
      }

    } catch (error: any) {
      console.error('Analysis failed:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      setAnalysisError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Data Integrity Check */}
      <DataIntegrityDiagnostic 
        equipmentId={equipmentId}
        equipmentName={equipmentName}
      />

      {/* AI Analysis Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI-Powered Predictive Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Equipment:</label>
              <p className="text-sm text-muted-foreground">{equipmentName}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Type:</label>
              <p className="text-sm text-muted-foreground">{equipmentType}</p>
            </div>
          </div>

          <ReadingSourceSelector
            value={readingSource}
            onChange={setReadingSource}
          />

          <Button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Equipment Data...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Run AI Analysis
              </>
            )}
          </Button>

          {analysisError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {analysisError}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Analysis Summary</TabsTrigger>
                <TabsTrigger value="timeline">Predictive Timeline</TabsTrigger>
                <TabsTrigger value="technical">Technical Details</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Risk Level:</span>
                      <Badge className={getRiskColor(analysisResult.risk_level)}>
                        {analysisResult.risk_level.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Confidence:</span>
                      <span className="text-sm">
                        {analysisResult.confidence_score ? 
                          `${(analysisResult.confidence_score * 100).toFixed(0)}%` : 
                          'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">
                        {formatDate(analysisResult.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Key Finding
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {analysisResult.finding}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center gap-1">
                      <Wrench className="h-4 w-4 text-blue-500" />
                      Recommendation
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {analysisResult.recommendation}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <PredictiveTimeline 
                  timelineEvents={analysisResult.predictive_timeline}
                  maintenanceWindows={analysisResult.maintenance_windows}
                  degradationAnalysis={analysisResult.degradation_analysis}
                  performanceTrends={analysisResult.performance_trends}
                />
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <div className="space-y-4">
                  {analysisResult.data_quality && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Data Quality Assessment</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {analysisResult.data_quality.manual_readings_count}
                            </div>
                            <div className="text-sm text-muted-foreground">Manual Readings</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {analysisResult.data_quality.standard_readings_count}
                            </div>
                            <div className="text-sm text-muted-foreground">Standard Readings</div>
                          </div>
                          <div className="text-center">
                            <Badge variant="outline" className="text-sm">
                              {analysisResult.data_quality.reading_source_used || 'Auto'}
                            </Badge>
                            <div className="text-sm text-muted-foreground mt-1">Source Used</div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <h5 className="font-medium text-blue-900 mb-1">Coverage Assessment</h5>
                          <p className="text-sm text-blue-800">
                            {analysisResult.data_quality.coverage_assessment}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {analysisResult.degradation_analysis && analysisResult.degradation_analysis.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Component Health Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysisResult.degradation_analysis.map((analysis, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <h5 className="font-medium mb-3">{analysis.component}</h5>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Current Condition:</span>
                                  <span className="font-medium">{analysis.current_condition}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Degradation Rate:</span>
                                  <span className="font-medium text-orange-600">{analysis.degradation_rate}%/month</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Life Remaining:</span>
                                  <span className="font-medium">{analysis.expected_life_remaining} months</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
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
                      </CardContent>
                    </Card>
                  )}

                  {analysisResult.performance_trends && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Performance Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                              {analysisResult.performance_trends.efficiency_decline_rate.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Efficiency Decline</div>
                            <div className="text-xs text-muted-foreground">per month</div>
                          </div>
                          <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                              +{analysisResult.performance_trends.energy_consumption_increase.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Energy Increase</div>
                            <div className="text-xs text-muted-foreground">vs baseline</div>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">
                              {new Date(analysisResult.performance_trends.projected_failure_date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Projected Failure</div>
                            <div className="text-xs text-muted-foreground">if no intervention</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedAIAnalysis;
