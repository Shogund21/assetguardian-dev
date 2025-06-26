
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";
import { MaintenanceWindow } from "@/types/predictive";
import { getWindowTypeColor, getWindowTypeBadgeVariant } from "./utils/colorHelpers";
import { formatCurrency, formatDate } from "./utils/formatters";

interface MaintenanceWindowsCardProps {
  maintenanceWindows: MaintenanceWindow[];
}

const MaintenanceWindowsCard = ({ maintenanceWindows }: MaintenanceWindowsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-green-500" />
          Optimal Maintenance Windows
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {maintenanceWindows.map((window, index) => (
            <div key={index} className={`border rounded-lg p-4 ${getWindowTypeColor(window.window_type)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{window.intervention_type}</div>
                <Badge variant={getWindowTypeBadgeVariant(window.window_type)}>
                  {window.window_type}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Window:</span>
                  <div className="font-medium">
                    {formatDate(window.window_start)} - {formatDate(window.window_end)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Est. Cost:</span>
                  <div className="font-medium text-green-600">{formatCurrency(window.estimated_cost)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Est. Hours:</span>
                  <div className="font-medium">{window.estimated_hours}h</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Priority:</span>
                  <div className="font-medium">{window.priority}/10</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenanceWindowsCard;
