import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Brain, TrendingUp, AlertTriangle, Monitor, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimeDiagnostic } from '@/components/predictive/RealtimeDiagnostic';
import { HvacDiagnosticService } from '@/services/hvacDiagnosticService';
import { DatabaseInitService } from '@/services/databaseInitService';
import { CustomLayout } from '@/components/CustomLayout';

interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
}

interface PredictiveAlert {
  id: string;
  asset_id: string;
  risk_level: 'low' | 'medium' | 'high';
  finding: string;
  recommendation: string;
  confidence_score: number;
  created_at: string;
}

const PredictiveMaintenance = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showRealtimeDiag, setShowRealtimeDiag] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [setupInstructions, setSetupInstructions] = useState<string[]>([]);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  useEffect(() => {
    const checkSetupAndLoadData = async () => {
      try {
        // Check database setup
        const instructions = await DatabaseInitService.getSetupInstructions();
        setSetupInstructions(instructions);
        
        if (instructions[0] === 'All required database tables are present!') {
          setIsSetupComplete(true);
          await loadData();
        }
      } catch (error) {
        console.error('Error checking setup:', error);
        toast.error('Failed to check system setup');
      } finally {
        setIsLoading(false);
      }
    };

    checkSetupAndLoadData();
  }, []);

  const loadData = async () => {
    try {
      // Load equipment
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .order('name');

      if (equipmentError) throw equipmentError;

      // Load predictive alerts with proper type casting
      const { data: alertsData, error: alertsError } = await supabase
        .from('predictive_alerts')
        .select('*')
        .is('resolved_at', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (alertsError && alertsError.code !== 'PGRST116') {
        console.warn('Predictive alerts table not available:', alertsError);
      }

      setEquipment(equipmentData || []);
      
      // Type cast the alerts data to ensure risk_level is properly typed
      const typedAlerts: PredictiveAlert[] = (alertsData || []).map(alert => ({
        ...alert,
        risk_level: alert.risk_level as 'low' | 'medium' | 'high',
        confidence_score: alert.confidence_score || 0
      }));
      
      setAlerts(typedAlerts);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
  };

  const runComprehensiveDiagnostic = async (equipmentItem: Equipment) => {
    if (!isSetupComplete) {
      toast.error('Database setup required before running diagnostics');
      return;
    }

    setIsLoading(true);
    try {
      const result = await HvacDiagnosticService.performComprehensiveDiagnostic(equipmentItem.id);
      toast.success('Comprehensive diagnostic completed');
      
      // Refresh alerts to show new findings
      await loadData();
      
      // Show results in a dialog or new view
      console.log('Diagnostic results:', result);
    } catch (error) {
      console.error('Error running diagnostic:', error);
      toast.error('Failed to run comprehensive diagnostic');
    } finally {
      setIsLoading(false);
    }
  };

  const openRealtimeDiagnostic = (equipmentItem: Equipment) => {
    setSelectedEquipment(equipmentItem);
    setShowRealtimeDiag(true);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500/20 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-500/20 text-blue-700 border-blue-200';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <CustomLayout>
        <div className="container mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </CustomLayout>
    );
  }

  if (!isSetupComplete) {
    return (
      <CustomLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Database Setup Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  The predictive maintenance system requires additional database tables.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Setup Instructions:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {setupInstructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ul>
                </div>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Refresh After Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CustomLayout>
    );
  }

  if (showRealtimeDiag && selectedEquipment) {
    return (
      <CustomLayout>
        <div className="container mx-auto py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Monitor className="h-8 w-8" />
              Real-time Diagnostic
            </h1>
            <p className="text-muted-foreground mt-1">
              Live monitoring and AI-powered analysis for {selectedEquipment.name}
            </p>
          </div>

          <RealtimeDiagnostic
            equipmentId={selectedEquipment.id}
            equipmentName={selectedEquipment.name}
            onClose={() => setShowRealtimeDiag(false)}
          />
        </div>
      </CustomLayout>
    );
  }

  return (
    <CustomLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            Predictive Maintenance
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered equipment monitoring and diagnostic system
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{equipment.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active monitoring systems
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{alerts.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Requiring attention
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Operational</div>
                  <p className="text-xs text-muted-foreground">
                    All systems running
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Equipment Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {equipment.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.location}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {item.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRealtimeDiagnostic(item)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Diagnose
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Priority Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className={`p-3 border rounded-lg ${getRiskColor(alert.risk_level)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="capitalize">
                            {alert.risk_level} Risk
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {alert.confidence_score && `${(alert.confidence_score * 100).toFixed(0)}% confidence`}
                          </span>
                        </div>
                        <p className="text-sm font-medium mb-1">{alert.finding}</p>
                        <p className="text-xs text-muted-foreground">{alert.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="equipment">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipment.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.type} • {item.location}</p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runComprehensiveDiagnostic(item)}
                          disabled={isLoading}
                        >
                          <Brain className="h-4 w-4 mr-1" />
                          Full Analysis
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openRealtimeDiagnostic(item)}
                        >
                          <Monitor className="h-4 w-4 mr-1" />
                          Live Monitor
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>Predictive Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`p-4 border rounded-lg ${getRiskColor(alert.risk_level)}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {alert.risk_level} Risk
                          </Badge>
                          {alert.confidence_score && (
                            <Badge variant="secondary">
                              {(alert.confidence_score * 100).toFixed(0)}% Confidence
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(alert.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h4 className="font-medium mb-2">{alert.finding}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{alert.recommendation}</p>
                      
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          Create Work Order
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {alerts.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No active alerts at this time</p>
                      <p className="text-sm">System is monitoring equipment continuously</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Predictive Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Analytics dashboard coming soon</p>
                  <p className="text-sm">View trends, patterns, and predictions</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CustomLayout>
  );
};

export default PredictiveMaintenance;
