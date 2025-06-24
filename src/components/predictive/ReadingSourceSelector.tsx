
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Activity, Brain, ExternalLink, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type ReadingSource = 'auto' | 'manual' | 'standard';

interface ReadingSourceSelectorProps {
  value: ReadingSource;
  onChange: (value: ReadingSource) => void;
  manualCount: number;
  standardCount: number;
}

const ReadingSourceSelector = ({ 
  value, 
  onChange, 
  manualCount, 
  standardCount 
}: ReadingSourceSelectorProps) => {
  const navigate = useNavigate();

  const handleGoToMaintenanceChecks = () => {
    navigate('/maintenance-checks');
  };

  const handleOpenHelp = () => {
    window.open('/docs/predictive-maintenance.md#analysis-data-source-selection', '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Brain className="h-4 w-4" />
            Analysis Data Source
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenHelp}
            className="h-6 w-6 p-0"
          >
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Choose which historical data to use for predictive analysis
        </p>
      </CardHeader>
      <CardContent>
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="auto" id="auto" />
            <Label htmlFor="auto" className="flex items-center gap-2 cursor-pointer">
              <span>Auto (Recommended)</span>
              <Badge variant="default" className="bg-blue-600">Smart</Badge>
            </Label>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            Uses manual sensor data when available, falls back to maintenance check data
          </p>
          
          <div className="flex items-center space-x-2 mt-3">
            <RadioGroupItem value="manual" id="manual" />
            <Label htmlFor="manual" className="flex items-center gap-2 cursor-pointer">
              <Activity className="h-3 w-3 text-green-600" />
              <span>Manual Sensor Data Only</span>
              <Badge variant={manualCount > 0 ? "default" : "secondary"} className={manualCount > 0 ? "bg-green-600" : ""}>
                {manualCount} records
              </Badge>
            </Label>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            Uses only manual sensor readings from direct equipment monitoring
          </p>
          {manualCount === 0 && (
            <p className="text-xs text-orange-600 ml-6">
              No manual sensor data available - use manual reading entry to add data
            </p>
          )}
          
          <div className="flex items-center space-x-2 mt-3">
            <RadioGroupItem value="standard" id="standard" />
            <Label htmlFor="standard" className="flex items-center gap-2 cursor-pointer">
              <Database className="h-3 w-3 text-blue-600" />
              <span>Maintenance Check Data Only</span>
              <Badge variant={standardCount > 0 ? "outline" : "secondary"} className={standardCount > 0 ? "border-blue-500 text-blue-600" : ""}>
                {standardCount} checks
              </Badge>
            </Label>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            Uses only readings from completed maintenance check forms
          </p>
          {standardCount === 0 && (
            <div className="ml-6 space-y-2">
              <p className="text-xs text-orange-600">
                No maintenance check data available for this equipment
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGoToMaintenanceChecks}
                className="flex items-center gap-1 text-xs h-6"
              >
                <ExternalLink className="h-3 w-3" />
                Go to Maintenance Checks
              </Button>
            </div>
          )}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default ReadingSourceSelector;
