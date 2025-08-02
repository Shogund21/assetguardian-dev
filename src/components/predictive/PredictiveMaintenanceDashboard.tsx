import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { offlineStorage } from "@/services/offlineStorageService";
import { useCompanyFilter } from "@/hooks/useCompanyFilter";
import { useAuthenticatedSupabase } from "@/hooks/useAuthenticatedSupabase";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Lock, Zap } from "lucide-react";
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
import MultipleImageAnalysis from "./MultipleImageAnalysis";
import { EquipmentSelector } from "./dashboard/EquipmentSelector";
import { RealtimeDiagnostic } from "./RealtimeDiagnostic";
import ChillerEnergyDashboard from "./energy/ChillerEnergyDashboard";
import EnergyFeatureLocked from "./energy/EnergyFeatureLocked";

const PredictiveMaintenanceDashboard = () => {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("readings");
  const { isOnline, cacheEquipmentData } = useOfflineSync();
  const { applyCompanyFilter } = useCompanyFilter();
  const { hasDualAIAccess } = useAuth();
  const [hasAIAccess, setHasAIAccess] = useState<boolean | null>(null);
  const { supabase: authSupabase } = useAuthenticatedSupabase();

  // Fetch equipment list with offline caching
  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      if (isOnline) {
        // Online - fetch from Supabase with company filtering
        let query = authSupabase
          .from('equipment')
          .select('*');
        
        // Apply company filtering
        query = applyCompanyFilter(query);
        
        query = query.order('name');
        
        const { data, error } = await query;
        
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

  // Check AI access when component mounts
  useEffect(() => {
    const checkAIAccess = async () => {
      const access = await hasDualAIAccess();
      setHasAIAccess(access);
    };
    
    checkAIAccess();
  }, [hasDualAIAccess]);

  return (
    <div className="w-full h-full">
      <PredictiveDashboardHeader />
      
      <MobileBreadcrumb 
        currentStep={activeTab === "readings" ? "recording" : "analysis"}
        equipmentName={selectedEquipment?.name}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex md:grid w-full md:grid-cols-8 mb-4 h-auto mobile-nav-tabs gap-1 overflow-x-auto pl-4 pr-4 md:px-0">
          <TabsTrigger value="readings" className="touch-manipulation mobile-touch-target text-sm py-3 px-4 whitespace-nowrap flex-shrink-0 min-w-[100px]">
            Record
          </TabsTrigger>
          <TabsTrigger value="history" className="touch-manipulation mobile-touch-target text-sm py-3 px-4 whitespace-nowrap flex-shrink-0 min-w-[100px]">
            History
          </TabsTrigger>
          <TabsTrigger value="analysis" className="touch-manipulation mobile-touch-target text-sm py-3 px-4 whitespace-nowrap flex-shrink-0 min-w-[100px]">
            Analysis
          </TabsTrigger>
          <TabsTrigger value="energy" className="touch-manipulation mobile-touch-target text-sm py-3 px-4 whitespace-nowrap flex-shrink-0 min-w-[100px] flex items-center gap-1">
            <Zap className="h-4 w-4" />
            Energy
            {hasAIAccess === false && <Lock className="h-3 w-3 text-amber-500" />}
          </TabsTrigger>
          <TabsTrigger value="hvac-diagnostic" className="touch-manipulation mobile-touch-target text-sm py-3 px-4 whitespace-nowrap flex-shrink-0 min-w-[110px]">
            HVAC Diag
          </TabsTrigger>
          <TabsTrigger value="multi-image" className="touch-manipulation mobile-touch-target text-sm py-3 px-4 whitespace-nowrap flex-shrink-0 min-w-[110px]">
            Multi-Image
          </TabsTrigger>
          <TabsTrigger value="results" className="touch-manipulation mobile-touch-target text-sm py-3 px-4 whitespace-nowrap flex-shrink-0 min-w-[100px]">
            Results
          </TabsTrigger>
          <TabsTrigger value="database" className="touch-manipulation mobile-touch-target text-sm py-3 px-4 whitespace-nowrap flex-shrink-0 min-w-[100px]">
            Status
          </TabsTrigger>
        </TabsList>

        {/* Universal equipment selector - visible for tabs that need equipment selection */}
        {(activeTab === "history" || activeTab === "analysis" || activeTab === "energy" || activeTab === "multi-image") && (
          <div className="mb-4 px-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-blue-800 font-medium mb-2">
                📋 Select equipment to view {activeTab === "history" ? "reading history" : activeTab === "analysis" ? "AI analysis" : activeTab === "energy" ? "energy efficiency" : "multi-image analysis"}
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
        
        <TabsContent value="energy" className="mt-2">
          {selectedEquipment ? (
            hasAIAccess === false ? (
              <EnergyFeatureLocked equipmentName={selectedEquipment.name} />
            ) : (
              <ChillerEnergyDashboard 
                equipmentId={selectedEquipmentId}
                equipmentName={selectedEquipment.name}
              />
            )
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Equipment Selected</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Select equipment above to view energy consumption and efficiency recommendations
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="hvac-diagnostic" className="mt-2">
          <RealtimeDiagnostic 
            equipmentId="general"
            equipmentName="HVAC Troubleshooting Assistant"
          />
        </TabsContent>
        
        <TabsContent value="multi-image" className="mt-2">
          {selectedEquipment ? (
            <MultipleImageAnalysis 
              equipmentId={selectedEquipmentId}
              equipmentType={equipmentType}
              equipmentName={selectedEquipment?.name || ''}
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-4xl mb-4">📷</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Equipment Selected</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Select equipment above to upload multiple images for AI analysis
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
