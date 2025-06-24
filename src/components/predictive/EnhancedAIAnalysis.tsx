
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Loader2, CheckCircle, AlertTriangle, TrendingUp, Calendar, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EnhancedPredictiveService, ReadingSource } from "@/services/enhancedPredictiveService";
import { PredictiveAlert } from "@/types/predictive";
import ReadingSourceSelector from "./ReadingSourceSelector";
import DataIntegrityDiagnostic from "./DataIntegrityDiagnostic";

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
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    Predictive Timeline
                  </h4>
                  
                  {analysisResult.predictive_timeline ? (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap text-purple-800">
                        {JSON.stringify(analysisResult.predictive_timeline, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No timeline data available for this analysis.
                    </p>
                  )}

                  {analysisResult.maintenance_windows && (
                    <div>
                      <h5 className="font-medium text-sm mb-2">Recommended Maintenance Windows</h5>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap text-blue-800">
                          {JSON.stringify(analysisResult.maintenance_windows, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <div className="space-y-4">
                  {analysisResult.data_quality && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Data Quality Metrics</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap">
                          {JSON.stringify(analysisResult.data_quality, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {analysisResult.degradation_analysis && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Degradation Analysis</h4>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap text-orange-800">
                          {JSON.stringify(analysisResult.degradation_analysis, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {analysisResult.performance_trends && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Performance Trends</h4>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap text-green-800">
                          {JSON.stringify(analysisResult.performance_trends, null, 2)}
                        </pre>
                      </div>
                    </div>
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
