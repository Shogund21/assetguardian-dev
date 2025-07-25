import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap, TrendingUp, DollarSign, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import { ChillerEnergyService, EnergyEfficiencyData } from '@/services/chillerEnergyService';
import EnergyConsumptionChart from './EnergyConsumptionChart';
import EnergyRecommendations from './EnergyRecommendations';
import EfficiencyTrendsChart from './EfficiencyTrendsChart';
import { useToast } from '@/hooks/use-toast';

interface ChillerEnergyDashboardProps {
  equipmentId: string;
  equipmentName: string;
}

const ChillerEnergyDashboard = ({ equipmentId, equipmentName }: ChillerEnergyDashboardProps) => {
  const [energyData, setEnergyData] = useState<EnergyEfficiencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const loadEnergyData = async () => {
    try {
      setRefreshing(true);
      const data = await ChillerEnergyService.getEnergyEfficiencyData(equipmentId);
      setEnergyData(data);
    } catch (error) {
      console.error('Error loading energy data:', error);
      toast({
        title: "Error Loading Energy Data",
        description: "Failed to load energy consumption data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEnergyData();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(loadEnergyData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [equipmentId]);

  const getEfficiencyStatus = (current: number, optimal: number) => {
    const ratio = current / optimal;
    if (ratio >= 0.9) return { status: 'excellent', color: 'bg-green-500', icon: CheckCircle };
    if (ratio >= 0.8) return { status: 'good', color: 'bg-blue-500', icon: CheckCircle };
    if (ratio >= 0.7) return { status: 'fair', color: 'bg-yellow-500', icon: AlertTriangle };
    return { status: 'poor', color: 'bg-red-500', icon: AlertTriangle };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'decreasing':
      case 'falling':
        return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      case 'declining':
      case 'increasing':
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-muted-foreground rotate-90" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Energy Efficiency Dashboard
          </CardTitle>
          <CardDescription>Loading energy consumption data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!energyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Energy Efficiency Dashboard
          </CardTitle>
          <CardDescription>No energy data available for {equipmentName}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const efficiencyStatus = getEfficiencyStatus(energyData.currentEfficiency, energyData.optimalEfficiency);
  const StatusIcon = efficiencyStatus.icon;

  return (
    <div className="space-y-6">
      {/* Header with Key Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Energy Efficiency Dashboard
              </CardTitle>
              <CardDescription>{equipmentName} - Real-time Energy Analysis</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadEnergyData}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Power Consumption */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Current Power</span>
                {getTrendIcon(energyData.trends.powerTrend)}
              </div>
              <div className="text-2xl font-bold">{energyData.currentPowerConsumption} kW</div>
              <div className="text-xs text-muted-foreground">
                ${(energyData.currentPowerConsumption * 0.12).toFixed(2)}/hour
              </div>
            </div>

            {/* Efficiency Rating */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <StatusIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Efficiency (EER)</span>
                {getTrendIcon(energyData.trends.efficiencyTrend)}
              </div>
              <div className="text-2xl font-bold">{energyData.currentEfficiency}</div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${efficiencyStatus.color} text-white`}>
                  {efficiencyStatus.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  vs {energyData.optimalEfficiency} optimal
                </span>
              </div>
            </div>

            {/* Daily Cost */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Daily Cost</span>
                {getTrendIcon(energyData.trends.costTrend)}
              </div>
              <div className="text-2xl font-bold">${energyData.dailyCost.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">
                ${(energyData.dailyCost * 30).toFixed(0)}/month
              </div>
            </div>

            {/* Potential Savings */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Potential Savings</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                ${energyData.potentialSavings.toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground">per month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="consumption" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="consumption">Energy Consumption</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="consumption" className="space-y-4">
          <EnergyConsumptionChart equipmentId={equipmentId} />
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-4">
          <EfficiencyTrendsChart equipmentId={equipmentId} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <EnergyRecommendations recommendations={energyData.recommendations} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChillerEnergyDashboard;