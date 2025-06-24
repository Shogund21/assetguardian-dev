
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Database, RefreshCw } from 'lucide-react';
import { DatabaseInitService } from '@/services/databaseInitService';

export const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const tableStatus = await DatabaseInitService.checkRequiredTables();
      const setupInstructions = await DatabaseInitService.getSetupInstructions();
      setStatus(tableStatus);
      setInstructions(setupInstructions);
    } catch (error) {
      console.error('Error checking database status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Checking database status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allTablesReady = status && Object.values(status).every(Boolean);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Status
          <Button
            onClick={checkStatus}
            size="sm"
            variant="outline"
            className="ml-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {allTablesReady ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">All database components are ready!</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Database setup required</span>
          </div>
        )}

        {status && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Predictive Alerts</span>
              <Badge variant={status.predictiveAlerts ? 'default' : 'destructive'}>
                {status.predictiveAlerts ? 'Ready' : 'Missing'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Sensor Readings</span>
              <Badge variant={status.sensorReadings ? 'default' : 'destructive'}>
                {status.sensorReadings ? 'Ready' : 'Missing'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Equipment Thresholds</span>
              <Badge variant={status.equipmentThresholds ? 'default' : 'destructive'}>
                {status.equipmentThresholds ? 'Ready' : 'Missing'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Work Orders</span>
              <Badge variant={status.automatedWorkOrders ? 'default' : 'destructive'}>
                {status.automatedWorkOrders ? 'Ready' : 'Missing'}
              </Badge>
            </div>
          </div>
        )}

        {instructions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Setup Instructions:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              {instructions.map((instruction, index) => (
                <div key={index} className="pl-4 border-l-2 border-blue-200">
                  {instruction}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseStatus;
