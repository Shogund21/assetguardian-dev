import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import ManualReadingEntry from "./ManualReadingEntry";
import ReadingHistory from "./ReadingHistory";
import EnhancedAIAnalysis from "./EnhancedAIAnalysis";
import AnalysisResultsHistory from "./AnalysisResultsHistory";
import DatabaseStatus from "./DatabaseStatus";
import { getEquipmentReadingTemplate } from "@/utils/equipmentTemplates";

const PredictiveMaintenanceDashboard = () => {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");

  // Fetch equipment list
  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const selectedEquipment = equipment.find(eq => eq.id === selectedEquipmentId);
  
  // Detect equipment type for template selection
  const getEquipmentType = (equipment: any) => {
    if (!equipment) return 'general';
    
    const name = equipment.name.toLowerCase();
    if (name.includes('ahu') || name.includes('air handler')) return 'ahu';
    if (name.includes('chiller')) return 'chiller';
    if (name.includes('rtu') || name.includes('rooftop')) return 'rtu';
    if (name.includes('cooling tower')) return 'cooling_tower';
    return 'general';
  };

  const equipmentType = getEquipmentType(selectedEquipment);
  const readingTemplates = getEquipmentReadingTemplate(equipmentType);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Predictive Maintenance Dashboard</h1>
        <p className="text-muted-foreground">
          Record manual readings and get AI-powered predictive maintenance insights
        </p>
      </div>

      <Tabs defaultValue="database" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="results">Analysis Results</TabsTrigger>
          <TabsTrigger value="readings">Record Readings</TabsTrigger>
          <TabsTrigger value="history">Reading History</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="database">
          <DatabaseStatus />
        </TabsContent>
        
        <TabsContent value="results">
          <AnalysisResultsHistory />
        </TabsContent>
        
        <TabsContent value="readings">
          <div className="mb-6">
            <Select value={selectedEquipmentId} onValueChange={setSelectedEquipmentId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select equipment to monitor" />
              </SelectTrigger>
              <SelectContent>
                {equipment.map((eq) => (
                  <SelectItem key={eq.id} value={eq.id}>
                    {eq.name} - {eq.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEquipment ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedEquipment.name}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    <p>Location: {selectedEquipment.location}</p>
                    <p>Status: {selectedEquipment.status || 'Active'}</p>
                    {readingTemplates.length > 0 && (
                      <p className="mt-2 text-blue-600">
                        {readingTemplates.length} standard readings available for this equipment type
                      </p>
                    )}
                  </div>
                </CardHeader>
              </Card>

              <ManualReadingEntry 
                equipmentId={selectedEquipmentId}
                equipmentType={equipmentType}
                onSuccess={() => {
                  console.log('Reading recorded successfully');
                }}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="text-lg font-medium mb-2">Select Equipment</h3>
                <p className="text-muted-foreground">
                  Choose equipment above to start recording readings
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="history">
          <div className="mb-6">
            <Select value={selectedEquipmentId} onValueChange={setSelectedEquipmentId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select equipment to view history" />
              </SelectTrigger>
              <SelectContent>
                {equipment.map((eq) => (
                  <SelectItem key={eq.id} value={eq.id}>
                    {eq.name} - {eq.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEquipment ? (
            <ReadingHistory 
              equipmentId={selectedEquipmentId}
              equipmentType={equipmentType}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="text-lg font-medium mb-2">Select Equipment</h3>
                <p className="text-muted-foreground">
                  Choose equipment above to view reading history
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="analysis">
          <div className="mb-6">
            <Select value={selectedEquipmentId} onValueChange={setSelectedEquipmentId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select equipment to analyze" />
              </SelectTrigger>
              <SelectContent>
                {equipment.map((eq) => (
                  <SelectItem key={eq.id} value={eq.id}>
                    {eq.name} - {eq.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEquipment ? (
            <EnhancedAIAnalysis 
              equipmentId={selectedEquipmentId}
              equipmentType={equipmentType}
              equipmentName={selectedEquipment.name}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="text-lg font-medium mb-2">Select Equipment</h3>
                <p className="text-muted-foreground">
                  Choose equipment above to run AI analysis
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveMaintenanceDashboard;
