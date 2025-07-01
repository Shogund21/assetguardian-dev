import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { offlineStorage } from "@/services/offlineStorageService";
import { getEquipmentReadingTemplate } from "@/utils/equipmentTemplates";
import { getSortedEquipmentList } from "@/utils/equipmentSorting";

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

  // Enhanced equipment type detection for all chiller variations
  const getEquipmentType = (equipment: any) => {
    if (!equipment) return 'general';
    
    const name = equipment.name.toLowerCase();
    
    // Enhanced chiller detection - covers all numbered and hyphenated variations
    if (name.includes('chiller')) return 'chiller';
    
    if (name.includes('ahu') || name.includes('air handler') || name.includes('air handling')) return 'ahu';
    if (name.includes('rtu') || name.includes('rooftop')) return 'rtu';
    if (name.includes('cooling tower')) return 'cooling_tower';
    if (name.includes('elevator')) return 'elevator';
    if (name.includes('restroom')) return 'restroom';
    
    return 'general';
  };

  // Sort equipment alphabetically by type
  const sortedEquipment = getSortedEquipmentList(equipment);
  
  const selectedEquipment = sortedEquipment.find(eq => eq.id === selectedEquipmentId);
  const equipmentType = getEquipmentType(selectedEquipment);
  const readingTemplates = getEquipmentReadingTemplate(equipmentType);

  return (
    <div className="w-full h-full">
      <PredictiveDashboardHeader />
      
      <MobileBreadcrumb 
        currentStep={activeTab === "readings" ? "recording" : "analysis"}
        equipmentName={selectedEquipment?.name}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-4 h-auto">
          <TabsTrigger value="readings" className="touch-manipulation text-xs md:text-sm py-2">
            Record
          </TabsTrigger>
          <TabsTrigger value="history" className="touch-manipulation text-xs md:text-sm py-2">
            History
          </TabsTrigger>
          <TabsTrigger value="analysis" className="touch-manipulation text-xs md:text-sm py-2">
            Analysis
          </TabsTrigger>
          <TabsTrigger value="results" className="touch-manipulation text-xs md:text-sm py-2">
            Results
          </TabsTrigger>
          <TabsTrigger value="database" className="touch-manipulation text-xs md:text-sm py-2">
            Status
          </TabsTrigger>
        </TabsList>

        {/* Universal equipment selector - visible for tabs that need equipment selection */}
        {(activeTab === "history" || activeTab === "analysis") && (
          <div className="mb-4 px-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-blue-800 font-medium mb-2">
                📋 Select equipment to view {activeTab === "history" ? "reading history" : "AI analysis"}
              </p>
              <EquipmentSelector
                equipment={sortedEquipment}
                selectedEquipmentId={selectedEquipmentId}
                onEquipmentChange={setSelectedEquipmentId}
                placeholder={`Select equipment for ${activeTab}`}
                className="w-full"
              />
            </div>
          </div>
        )}
        
        <TabsContent value="readings" className="mt-2">
          <ReadingsTabContent
            equipment={sortedEquipment}
            selectedEquipmentId={selectedEquipmentId}
            onEquipmentChange={setSelectedEquipmentId}
            selectedEquipment={selectedEquipment}
            equipmentType={equipmentType}
            readingTemplates={readingTemplates}
            isOnline={isOnline}
          />
        </TabsContent>
        
        <TabsContent value="history" className="mt-2">
          {selectedEquipment ? (
            <ReadingHistory 
              equipmentId={selectedEquipmentId}
              equipmentType={equipmentType}
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Equipment Selected</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Select equipment above to view its reading history and trends
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="analysis" className="mt-2">
          {selectedEquipment ? (
            <EnhancedAIAnalysis 
              equipmentId={selectedEquipmentId}
              equipmentType={equipmentType}
              equipmentName={selectedEquipment?.name || ''}
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Equipment Selected</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Select equipment above to run AI-powered predictive analysis
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="results" className="mt-2">
          <AnalysisResultsHistory />
        </TabsContent>
        
        <TabsContent value="database" className="mt-2">
          <DatabaseStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveMaintenanceDashboard;
