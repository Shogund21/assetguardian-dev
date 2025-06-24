
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Database, Activity, Brain } from "lucide-react";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Brain className="h-4 w-4" />
          Analysis Data Source
        </CardTitle>
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
            Uses manual readings when available, falls back to standard readings
          </p>
          
          <div className="flex items-center space-x-2 mt-3">
            <RadioGroupItem value="manual" id="manual" />
            <Label htmlFor="manual" className="flex items-center gap-2 cursor-pointer">
              <Activity className="h-3 w-3 text-green-600" />
              <span>Manual Readings Only</span>
              <Badge variant={manualCount > 0 ? "default" : "secondary"} className={manualCount > 0 ? "bg-green-600" : ""}>
                {manualCount} available
              </Badge>
            </Label>
          </div>
          {manualCount === 0 && (
            <p className="text-xs text-orange-600 ml-6">
              No manual readings available - analysis may be limited
            </p>
          )}
          
          <div className="flex items-center space-x-2 mt-3">
            <RadioGroupItem value="standard" id="standard" />
            <Label htmlFor="standard" className="flex items-center gap-2 cursor-pointer">
              <Database className="h-3 w-3 text-blue-600" />
              <span>Standard Readings Only</span>
              <Badge variant={standardCount > 0 ? "outline" : "secondary"} className={standardCount > 0 ? "border-blue-500 text-blue-600" : ""}>
                {standardCount} available
              </Badge>
            </Label>
          </div>
          {standardCount === 0 && (
            <p className="text-xs text-orange-600 ml-6">
              No standard readings available - perform maintenance checks first
            </p>
          )}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default ReadingSourceSelector;
