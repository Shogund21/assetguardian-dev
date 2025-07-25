import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Settings, 
  Wrench, 
  Zap,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { EnergyRecommendation } from '@/services/chillerEnergyService';

interface EnergyRecommendationsProps {
  recommendations: EnergyRecommendation[];
}

const EnergyRecommendations = ({ recommendations }: EnergyRecommendationsProps) => {
  const getRecommendationIcon = (type: EnergyRecommendation['type']) => {
    switch (type) {
      case 'optimization':
        return Settings;
      case 'maintenance':
        return Wrench;
      case 'operational':
        return Zap;
      case 'cost_saving':
        return DollarSign;
      default:
        return Lightbulb;
    }
  };

  const getPriorityColor = (priority: EnergyRecommendation['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPriorityIcon = (priority: EnergyRecommendation['priority']) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return AlertTriangle;
      case 'medium':
        return Clock;
      case 'low':
        return CheckCircle2;
      default:
        return Clock;
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

  const totalPotentialSavings = recommendations.reduce((sum, rec) => sum + rec.potentialSavings, 0);
  const totalImplementationCost = recommendations.reduce((sum, rec) => sum + rec.implementationCost, 0);
  const avgPaybackMonths = recommendations.length > 0 
    ? recommendations.reduce((sum, rec) => sum + rec.paybackMonths, 0) / recommendations.length 
    : 0;

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Energy Efficiency Recommendations
          </CardTitle>
          <CardDescription>Your chiller is operating efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              No immediate energy efficiency improvements identified. Your chiller is currently operating within optimal parameters.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Energy Efficiency Recommendations
          </CardTitle>
          <CardDescription>
            {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''} to improve energy efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPotentialSavings)}
              </div>
              <div className="text-sm text-muted-foreground">Total Monthly Savings</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalImplementationCost)}
              </div>
              <div className="text-sm text-muted-foreground">Implementation Cost</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">
                {avgPaybackMonths.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Avg. Payback (months)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((recommendation, index) => {
          const Icon = getRecommendationIcon(recommendation.type);
          const PriorityIcon = getPriorityIcon(recommendation.priority);
          
          return (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{recommendation.title}</h3>
                      <Badge className={getPriorityColor(recommendation.priority)}>
                        <PriorityIcon className="h-3 w-3 mr-1" />
                        {recommendation.priority}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {recommendation.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground">
                      {recommendation.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <div>
                          <div className="font-medium text-green-600">
                            {formatCurrency(recommendation.potentialSavings)}/month
                          </div>
                          <div className="text-xs text-muted-foreground">Potential Savings</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="font-medium text-blue-600">
                            {formatCurrency(recommendation.implementationCost)}
                          </div>
                          <div className="text-xs text-muted-foreground">Implementation Cost</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <div>
                          <div className="font-medium text-orange-600">
                            {recommendation.paybackMonths === 0 ? 'Immediate' : `${recommendation.paybackMonths} months`}
                          </div>
                          <div className="text-xs text-muted-foreground">Payback Period</div>
                        </div>
                      </div>
                    </div>
                    
                    {recommendation.implementationCost === 0 && (
                      <div className="mt-4">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Implement Now (No Cost)
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Implementation Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Implementation Guide
          </CardTitle>
          <CardDescription>Recommended order of implementation for maximum impact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-green-700 dark:text-green-300">Phase 1: No-Cost Improvements</h4>
              <p className="text-sm text-green-600 dark:text-green-400">
                Start with operational adjustments that require no investment
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-700 dark:text-blue-300">Phase 2: Low-Cost Maintenance</h4>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Implement maintenance recommendations with quick payback
              </p>
            </div>
            
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <h4 className="font-medium text-orange-700 dark:text-orange-300">Phase 3: Capital Improvements</h4>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Consider larger investments for long-term efficiency gains
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnergyRecommendations;