
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const NoDataState = () => {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Predictive Timeline Available</h3>
        <p className="text-muted-foreground mb-4">
          Run an AI analysis to generate predictive timeline insights
        </p>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 max-w-md mx-auto">
          <li>Failure probability timeline with dates</li>
          <li>Component degradation analysis</li>
          <li>Optimal maintenance windows</li>
          <li>Performance trend predictions</li>
          <li>Cost and downtime estimates</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default NoDataState;
