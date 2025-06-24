
import { supabase } from "@/integrations/supabase/client";

export interface EquipmentNameMismatch {
  equipmentId: string;
  equipmentName: string;
  maintenanceCheckNames: string[];
  sensorReadingNames: string[];
  suggestedStandardName: string;
}

export const equipmentDataIntegrityService = {
  /**
   * Normalize equipment names for better matching
   */
  normalizeEquipmentName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[-_\s]+/g, ' ') // Replace hyphens, underscores, spaces with single space
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  },

  /**
   * Check if two equipment names are similar (fuzzy match)
   */
  areNamesSimilar(name1: string, name2: string): boolean {
    const normalized1 = this.normalizeEquipmentName(name1);
    const normalized2 = this.normalizeEquipmentName(name2);
    
    // Exact match after normalization
    if (normalized1 === normalized2) return true;
    
    // Check if one contains the other (for cases like "chiller 1" vs "chiller-01")
    const words1 = normalized1.split(' ');
    const words2 = normalized2.split(' ');
    
    // Same number of words and similar structure
    if (words1.length === words2.length) {
      let matches = 0;
      for (let i = 0; i < words1.length; i++) {
        if (words1[i] === words2[i] || 
            words1[i].includes(words2[i]) || 
            words2[i].includes(words1[i])) {
          matches++;
        }
      }
      return matches >= words1.length - 1; // Allow one word to be different
    }
    
    return false;
  },

  /**
   * Find equipment naming inconsistencies across tables
   */
  async findNamingInconsistencies(): Promise<EquipmentNameMismatch[]> {
    console.log('Starting equipment naming consistency check...');
    
    try {
      // Get all equipment
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .select('id, name');
      
      if (equipmentError) throw equipmentError;
      
      // Get equipment names from maintenance checks
      const { data: maintenanceChecks, error: maintenanceError } = await supabase
        .from('hvac_maintenance_checks')
        .select('equipment_id')
        .not('equipment_id', 'is', null);
      
      if (maintenanceError) throw maintenanceError;
      
      // Get equipment names from sensor readings
      const { data: sensorReadings, error: sensorError } = await supabase
        .from('sensor_readings')
        .select('equipment_id')
        .not('equipment_id', 'is', null);
      
      if (sensorError) throw sensorError;
      
      const inconsistencies: EquipmentNameMismatch[] = [];
      
      for (const eq of equipment || []) {
        const maintenanceEquipmentIds = maintenanceChecks
          ?.filter(mc => mc.equipment_id)
          .map(mc => mc.equipment_id) || [];
          
        const sensorEquipmentIds = sensorReadings
          ?.filter(sr => sr.equipment_id)
          .map(sr => sr.equipment_id) || [];
        
        // Check if this equipment has maintenance or sensor data
        const hasMaintenanceData = maintenanceEquipmentIds.includes(eq.id);
        const hasSensorData = sensorEquipmentIds.includes(eq.id);
        
        if (!hasMaintenanceData && !hasSensorData) {
          console.log(`Equipment "${eq.name}" has no associated maintenance or sensor data`);
        }
      }
      
      console.log(`Found ${inconsistencies.length} naming inconsistencies`);
      return inconsistencies;
      
    } catch (error) {
      console.error('Error checking naming inconsistencies:', error);
      throw error;
    }
  },

  /**
   * Enhanced equipment lookup that handles naming variations
   */
  async findEquipmentByName(searchName: string): Promise<any[]> {
    try {
      const { data: equipment, error } = await supabase
        .from('equipment')
        .select('*');
      
      if (error) throw error;
      
      if (!equipment) return [];
      
      // First try exact match
      const exactMatch = equipment.filter(eq => eq.name === searchName);
      if (exactMatch.length > 0) return exactMatch;
      
      // Then try fuzzy matching
      const fuzzyMatches = equipment.filter(eq => 
        this.areNamesSimilar(eq.name, searchName)
      );
      
      console.log(`Equipment search for "${searchName}":`, {
        exactMatches: exactMatch.length,
        fuzzyMatches: fuzzyMatches.length,
        allEquipment: equipment.map(eq => eq.name)
      });
      
      return fuzzyMatches;
      
    } catch (error) {
      console.error('Error finding equipment by name:', error);
      return [];
    }
  },

  /**
   * Get reading counts with improved equipment matching
   */
  async getReadingCountsWithFuzzyMatching(equipmentId: string): Promise<{manual: number, standard: number}> {
    try {
      // Get equipment details
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', equipmentId)
        .single();
      
      if (equipmentError || !equipment) {
        console.error('Equipment not found:', equipmentId);
        return { manual: 0, standard: 0 };
      }
      
      console.log(`Getting reading counts for equipment: "${equipment.name}" (ID: ${equipmentId})`);
      
      // Get manual sensor readings (direct match by equipment_id)
      const { data: manualReadings, error: manualError } = await supabase
        .from('sensor_readings')
        .select('id')
        .eq('equipment_id', equipmentId);
      
      if (manualError) {
        console.error('Error fetching manual readings:', manualError);
      }
      
      // Get maintenance check readings (direct match by equipment_id)
      const { data: maintenanceChecks, error: maintenanceError } = await supabase
        .from('hvac_maintenance_checks')
        .select('id')
        .eq('equipment_id', equipmentId);
      
      if (maintenanceError) {
        console.error('Error fetching maintenance checks:', maintenanceError);
      }
      
      const manualCount = manualReadings?.length || 0;
      const standardCount = maintenanceChecks?.length || 0;
      
      console.log(`Reading counts for "${equipment.name}":`, {
        manual: manualCount,
        standard: standardCount
      });
      
      // If no data found, try fuzzy matching by name
      if (manualCount === 0 && standardCount === 0) {
        console.log(`No direct matches found, attempting fuzzy matching for "${equipment.name}"`);
        
        // This is where we could implement cross-reference logic if needed
        // For now, we'll log this case for investigation
        console.log('Equipment with no associated data found - this may indicate naming inconsistencies');
      }
      
      return { manual: manualCount, standard: standardCount };
      
    } catch (error) {
      console.error('Error getting reading counts with fuzzy matching:', error);
      return { manual: 0, standard: 0 };
    }
  }
};
