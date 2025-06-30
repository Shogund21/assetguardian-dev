
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { offlineStorage } from "@/services/offlineStorageService";
import { getEquipmentReadingTemplate } from "@/utils/equipmentTemplates";

// Import new components
import { PredictiveDashboardHeader } from "./dashboard/PredictiveDashboardHeader";
import { MobileBreadcrumb } from "./dashboard/MobileBreadcrumb";
import { ReadingsTabContent } from "./dashboard/ReadingsTabContent";
import { EquipmentTabContent } from "./dashboard/EquipmentTabContent";
import ReadingHistory from "./ReadingHistory";
import EnhancedAIAnalysis from "./EnhancedAIAnalysis";
import AnalysisResultsHistory from "./AnalysisResultsHistory";
import DatabaseStatus from "./DatabaseStatus";
import { EquipmentSelector } from "./dashboard/EquipmentSelector";

const PredictiveMaintenanceDashboard = () => {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("readings");
  const { isOnline, cacheEquipmentData } = useOfflineSync();

  // Fetch equipment list with offline caching
  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      if (isOnline) {
        // Online - fetch from Supabase
        const { data, error } = await supabase
          .from('equipment')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        // Cache equipment data for offline use
        if (data) {
          await cacheEquipmentData(data);
        }
        
        return data || [];
      } else {
        // Offline - get from cache
        try {
          const cachedEquipment = await offlineStorage.getCachedEquipment();
          return cachedEquipment.map(eq => ({
            id: eq.id,
            name: eq.name,
            location: eq.location,
            status: 'Active', // Default for offline
          }));
        } catch (error) {
          console.error('Failed to get cached equipment:', error);
          return [];
        }
      }
    },
    staleTime: isOnline ? 5 * 60 * 1000 : Infinity, // 5 minutes online, forever offline
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });

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

  const selectedEquipment = equipment.find(eq => eq.id === selectedEquipmentId);
  const equipmentType = getEquipmentType(selectedEquipment);
  const readingTemplates = getEquipmentReadingTemplate(equipmentType);

  // Show equipment selector for tabs that need it
  const showEquipmentSelector = ["history", "analysis"].includes(activeTab);

  return (
    <div className="w-full h-full">
      <PredictiveDashboardHeader />
      
      <MobileBreadcrumb 
        currentStep={activeTab === "readings" ? "recording" : "analysis"}
        equipmentName={selectedEquipment?.name}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-2">
          <TabsTrigger value="readings" className="touch-manipulation">Record</TabsTrigger>
          <TabsTrigger value="history" className="touch-manipulation">History</TabsTrigger>
          <TabsTrigger value="analysis" className="touch-manipulation">Analysis</TabsTrigger>
          <TabsTrigger value="results" className="touch-manipulation">Results</TabsTrigger>
          <TabsTrigger value="database" className="touch-manipulation">Status</TabsTrigger>
        </TabsList>

        {/* Compact equipment selector for specific tabs only */}
        {showEquipmentSelector && (
          <div className="mb-3 px-1">
            <EquipmentSelector
              equipment={equipment}
              selectedEquipmentId={selectedEquipmentId}
              onEquipmentChange={setSelectedEquipmentId}
              placeholder="Select equipment"
              className="w-full"
            />
          </div>
        )}
        
        <TabsContent value="readings" className="mt-2">
          <ReadingsTabContent
            equipment={equipment}
            selectedEquipmentId={selectedEquipmentId}
            onEquipmentChange={setSelectedEquipmentId}
            selectedEquipment={selectedEquipment}
            equipmentType={equipmentType}
            readingTemplates={readingTemplates}
            isOnline={isOnline}
          />
        </TabsContent>
        
        <TabsContent value="history">
          {selectedEquipment ? (
            <ReadingHistory 
              equipmentId={selectedEquipmentId}
              equipmentType={equipmentType}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Select equipment above to view history
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="analysis">
          {selectedEquipment ? (
            <EnhancedAIAnalysis 
              equipmentId={selectedEquipmentId}
              equipmentType={equipmentType}
              equipmentName={selectedEquipment?.name || ''}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Select equipment above to run analysis
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="results">
          <AnalysisResultsHistory />
        </TabsContent>
        
        <TabsContent value="database">
          <DatabaseStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveMaintenanceDashboard;
