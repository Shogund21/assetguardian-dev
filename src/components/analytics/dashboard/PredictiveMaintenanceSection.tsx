
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, AlertTriangle } from "lucide-react";
import EquipmentHealthMonitor from "@/components/predictive/EquipmentHealthMonitor";
import SensorDataChart from "@/components/predictive/SensorDataChart";

const PredictiveMaintenanceSection = () => {
  // Mock equipment for demonstration
  const sampleEquipment = {
    id: "chiller-001",
    name: "Main Chiller Unit",
    location: "Roof - North Side"
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            Predictive Maintenance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            AI-powered equipment health monitoring and predictive analytics
          </p>
          
          <Tabs defaultValue="health" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="health">Equipment Health</TabsTrigger>
              <TabsTrigger value="sensors">Sensor Data</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="health" className="space-y-4">
              <EquipmentHealthMonitor equipmentId={sampleEquipment.id} />
            </TabsContent>
            
            <TabsContent value="sensors" className="space-y-4">
              <SensorDataChart 
                equipmentId={sampleEquipment.id}
                equipmentName={sampleEquipment.name}
              />
            </TabsContent>
            
            <TabsContent value="predictions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Maintenance Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="font-medium">Low Risk</span>
                        </div>
                        <p className="text-sm text-muted-foreground">12 equipment items</p>
                        <p className="text-xs text-green-600 mt-1">Routine maintenance schedule</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-yellow-200 bg-yellow-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-3 h-3 text-yellow-500" />
                          <span className="font-medium">Medium Risk</span>
                        </div>
                        <p className="text-sm text-muted-foreground">3 equipment items</p>
                        <p className="text-xs text-yellow-600 mt-1">Schedule preventive maintenance</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-red-200 bg-red-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="font-medium">High Risk</span>
                        </div>
                        <p className="text-sm text-muted-foreground">1 equipment item</p>
                        <p className="text-xs text-red-600 mt-1">Immediate attention required</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Next Predicted Failures</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Chiller Bearing Replacement</span>
                        <span className="text-blue-600 font-medium">14 days</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>AHU Belt Replacement</span>
                        <span className="text-blue-600 font-medium">21 days</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Filter Change - Unit 3</span>
                        <span className="text-blue-600 font-medium">7 days</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictiveMaintenanceSection;
