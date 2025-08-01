import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  Zap,
  MessageSquare,
  Send,
  Calendar,
  Target
} from 'lucide-react';
import { EnergyAIAnalysis } from '@/services/energyAIService';
import { EnergyEfficiencyData } from '@/services/chillerEnergyService';
import { EnergyAIService } from '@/services/energyAIService';

interface EnergyAIInsightsProps {
  analysis: EnergyAIAnalysis | null;
  loading: boolean;
  onRefresh: () => void;
  equipmentId: string;
  energyData: EnergyEfficiencyData | null;
}

const EnergyAIInsights = ({ 
  analysis, 
  loading, 
  onRefresh, 
  equipmentId, 
  energyData 
}: EnergyAIInsightsProps) => {
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleChatSubmit = async () => {
    if (!chatQuestion.trim() || !energyData) return;
    
    try {
      setChatLoading(true);
      const response = await EnergyAIService.getChatResponse(
        equipmentId, 
        chatQuestion, 
        energyData
      );
      setChatResponse(response);
      setChatQuestion('');
    } catch (error) {
      console.error('Error getting chat response:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const getEfficiencyStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'immediate': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'short_term': return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'long_term': return <Target className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Energy Analysis
          </CardTitle>
          <CardDescription>Analyzing energy performance with artificial intelligence...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Energy Analysis
          </CardTitle>
          <CardDescription>Click refresh to generate AI-powered energy insights</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRefresh} className="w-full">
            <Brain className="h-4 w-4 mr-2" />
            Generate AI Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Performance Rating */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Energy Analysis
              </CardTitle>
              <CardDescription>Comprehensive AI-powered energy efficiency assessment</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Rating */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Overall Rating</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {analysis.overall_rating}/10
              </div>
              <Badge className={`${getEfficiencyStatusColor(analysis.efficiency_status)} text-white`}>
                {analysis.efficiency_status.toUpperCase()}
              </Badge>
            </div>

            {/* Efficiency Score */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Efficiency Score</span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {analysis.energy_insights.efficiency_score}%
                </div>
                <Progress value={analysis.energy_insights.efficiency_score} className="h-2" />
              </div>
            </div>

            {/* Health Score */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Equipment Health</span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {analysis.predictive_insights.equipment_health_score}%
                </div>
                <Progress value={analysis.predictive_insights.equipment_health_score} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {analysis.energy_insights.current_performance}
            </p>
            
            <div className="space-y-2">
              <h4 className="font-medium">Key Findings:</h4>
              <ul className="space-y-1">
                {analysis.energy_insights.key_findings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Recommendations</CardTitle>
          <CardDescription>Prioritized energy optimization strategies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(rec.priority)}
                    <h4 className="font-medium">{rec.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {rec.category}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {rec.priority}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">{rec.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-green-600">
                      ${rec.expected_savings_monthly}/mo
                    </span>
                    <p className="text-xs text-muted-foreground">Expected Savings</p>
                  </div>
                  <div>
                    <span className="font-medium">
                      ${rec.implementation_cost}
                    </span>
                    <p className="text-xs text-muted-foreground">Implementation Cost</p>
                  </div>
                  <div>
                    <span className="font-medium">
                      {rec.payback_months} months
                    </span>
                    <p className="text-xs text-muted-foreground">Payback Period</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-600">
                      {rec.energy_impact}
                    </span>
                    <p className="text-xs text-muted-foreground">Energy Impact</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">Current Monthly Cost</span>
              <div className="text-2xl font-bold">
                ${analysis.cost_analysis.current_monthly_cost.toFixed(0)}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Potential Monthly Savings</span>
              <div className="text-2xl font-bold text-green-600">
                ${analysis.cost_analysis.potential_monthly_savings.toFixed(0)}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Annual Savings Potential</span>
              <div className="text-2xl font-bold text-green-600">
                ${analysis.cost_analysis.annual_savings_potential.toFixed(0)}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">ROI Percentage</span>
              <div className="text-2xl font-bold text-blue-600">
                {analysis.cost_analysis.roi_percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Strategies */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Energy Management Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.smart_strategies.map((strategy, index) => (
              <div key={index} className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">{strategy.strategy}</h4>
                <p className="text-sm text-muted-foreground mb-2">{strategy.description}</p>
                <span className="text-sm font-medium text-green-600">
                  Savings Potential: {strategy.savings_potential}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Ask AI About Energy Efficiency
          </CardTitle>
          <CardDescription>
            Get instant answers about your energy performance and optimization strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about energy consumption, efficiency improvements, cost savings..."
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                className="flex-1"
              />
              <Button 
                onClick={handleChatSubmit} 
                disabled={chatLoading || !chatQuestion.trim()}
              >
                {chatLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {chatResponse && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Response:
                </h4>
                <p className="text-sm">{chatResponse}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnergyAIInsights;