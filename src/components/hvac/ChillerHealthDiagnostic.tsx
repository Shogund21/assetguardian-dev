import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { HvacDiagnosticService, DiagnosticSession } from '@/services/hvacDiagnosticService';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Gauge, 
  Settings,
  TrendingUp,
  Wrench,
  FileText,
  Calendar,
  BarChart3
} from 'lucide-react';

interface ChillerHealthDiagnosticProps {
  equipmentId: string;
  equipmentName: string;
  onDiagnosticComplete?: (session: DiagnosticSession) => void;
}

interface ComponentAnalysis {
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  failure_probability_12_months: number;
  key_indicators: string[];
  recommended_action: string;
}

interface DiagnosticResult {
  asset_id: string;
  diagnostic_type: string;
  overall_health_score: number;
  confidence_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  estimated_remaining_life_months: number;
  maintenance_priority: 'low' | 'medium' | 'high' | 'critical';
  critical_findings: string[];
  recommendations: string[];
  component_analysis: {
    compressor: ComponentAnalysis;
    bearing_system: ComponentAnalysis;
    refrigerant_system: ComponentAnalysis;
    motor: ComponentAnalysis;
    condenser: ComponentAnalysis;
  };
  predictive_timeline: any[];
  cost_analysis: {
    immediate_actions_cost: number;
    preventive_maintenance_cost: number;
    emergency_repair_cost: number;
    replacement_cost: number;
    annual_maintenance_budget: number;
  };
  data_sources_used: string[];
  analyst_notes: string;
  next_diagnostic_date: string;
  recommended_monitoring_frequency: string;
}

const ChillerHealthDiagnostic: React.FC<ChillerHealthDiagnosticProps> = ({
  equipmentId,
  equipmentName,
  onDiagnosticComplete
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [dataSummary, setDataSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDataSummary();
  }, [equipmentId]);

  const loadDataSummary = async () => {
    try {
      setLoading(true);
      const summary = await HvacDiagnosticService.getSupplementalDataSummary(equipmentId);
      setDataSummary(summary);
    } catch (error) {
      console.error('Failed to load data summary:', error);
      toast({
        title: "Error",
        description: "Failed to load diagnostic data summary",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runComprehensiveDiagnostic = async () => {
    try {
      setIsAnalyzing(true);
      
      // Get both the session and full AI analysis result
      const { session: diagnosticSession, fullResult } = await HvacDiagnosticService.performComprehensiveDiagnostic(equipmentId);
      
      // Convert the AI result to our display format
      const result = {
        asset_id: diagnosticSession.equipment_id,
        diagnostic_type: diagnosticSession.diagnostic_type,
        overall_health_score: diagnosticSession.overall_health_score,
        confidence_score: diagnosticSession.confidence_score,
        risk_level: diagnosticSession.maintenance_priority as 'low' | 'medium' | 'high' | 'critical',
        estimated_remaining_life_months: diagnosticSession.estimated_remaining_life_months,
        maintenance_priority: diagnosticSession.maintenance_priority,
        critical_findings: diagnosticSession.critical_findings,
        recommendations: diagnosticSession.recommendations,
        component_analysis: fullResult?.component_analysis || {
          compressor: { condition: 'good', failure_probability_12_months: 0, key_indicators: [], recommended_action: 'No detailed analysis available' },
          bearing_system: { condition: 'good', failure_probability_12_months: 0, key_indicators: [], recommended_action: 'No detailed analysis available' },
          refrigerant_system: { condition: 'good', failure_probability_12_months: 0, key_indicators: [], recommended_action: 'No detailed analysis available' },
          motor: { condition: 'good', failure_probability_12_months: 0, key_indicators: [], recommended_action: 'No detailed analysis available' },
          condenser: { condition: 'good', failure_probability_12_months: 0, key_indicators: [], recommended_action: 'No detailed analysis available' }
        },
        predictive_timeline: fullResult?.predictive_timeline || [],
        cost_analysis: diagnosticSession.cost_analysis || {},
        data_sources_used: diagnosticSession.data_sources_used,
        analyst_notes: diagnosticSession.analyst_notes,
        next_diagnostic_date: new Date().toISOString(),
        recommended_monitoring_frequency: 'monthly'
      };

      setDiagnosticResult(result);
      onDiagnosticComplete?.(diagnosticSession);
      
      toast({
        title: "Diagnostic Complete",
        description: "Comprehensive chiller health analysis completed successfully",
      });
      
    } catch (error) {
      console.error('Diagnostic analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to complete diagnostic analysis",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading diagnostic data...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Chiller Health Diagnostic - {equipmentName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {dataSummary && (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {dataSummary.dataSummary.sensor_readings}
                  </div>
                  <div className="text-sm text-gray-600">Sensor Readings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {dataSummary.dataSummary.manual_maintenance_logs}
                  </div>
                  <div className="text-sm text-gray-600">Manual Logs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {dataSummary.dataSummary.vibration_analysis}
                  </div>
                  <div className="text-sm text-gray-600">Vibration Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {dataSummary.dataSummary.refrigerant_reports}
                  </div>
                  <div className="text-sm text-gray-600">Refrigerant Reports</div>
                </div>
              </>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={runComprehensiveDiagnostic}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Gauge className="h-4 w-4" />
                  Run Comprehensive Diagnostic
                </>
              )}
            </Button>
            
            {dataSummary && (
              <Badge variant="outline" className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                Data Quality: {dataSummary.dataQuality.data_completeness}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diagnostic Results */}
      {diagnosticResult && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
            <TabsTrigger value="recommendations">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Overall Health Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Progress value={diagnosticResult.overall_health_score * 100} className="flex-1" />
                    <span className="text-sm font-medium">
                      {Math.round(diagnosticResult.overall_health_score * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Risk Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={getRiskLevelColor(diagnosticResult.risk_level)}>
                    {diagnosticResult.risk_level.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Estimated Life Remaining</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {diagnosticResult.estimated_remaining_life_months} months
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {diagnosticResult.critical_findings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Critical Findings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {diagnosticResult.critical_findings.map((finding, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="components" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(diagnosticResult.component_analysis).map(([component, analysis]) => (
                <Card key={component}>
                  <CardHeader>
                    <CardTitle className="text-sm capitalize flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      {component.replace('_', ' ')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getConditionColor(analysis.condition)}`} />
                      <span className="text-sm font-medium capitalize">{analysis.condition}</span>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-gray-600">Failure Risk (12 months): </span>
                      <span className="font-medium">{analysis.failure_probability_12_months}%</span>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-gray-600">Action: </span>
                      <span className="font-medium">{analysis.recommended_action}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Predictive Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Timeline analysis will be available in detailed diagnostic results</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cost Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Immediate Actions:</span>
                      <span className="font-medium">
                        {formatCurrency(diagnosticResult.cost_analysis.immediate_actions_cost || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Preventive Maintenance:</span>
                      <span className="font-medium">
                        {formatCurrency(diagnosticResult.cost_analysis.preventive_maintenance_cost || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Emergency Repair:</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(diagnosticResult.cost_analysis.emergency_repair_cost || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Replacement Cost:</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(diagnosticResult.cost_analysis.replacement_cost || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {diagnosticResult.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
                
                {diagnosticResult.analyst_notes && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Analyst Notes
                    </h4>
                    <p className="text-sm text-gray-700">{diagnosticResult.analyst_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ChillerHealthDiagnostic;