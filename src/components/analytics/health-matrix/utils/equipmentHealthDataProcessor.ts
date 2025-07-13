
import { EquipmentHealthItem } from "../types";
import { normalizeString, fuzzyMatch } from "@/utils/locationMatching";

/**
 * Enhanced matching function with reverse matching, fuzzy matching, and better logging
 */
export const matchEquipmentToStoreNumber = (
  equipment: any, 
  locationsData: any[]
): string | undefined => {
  if (!equipment.location) {
    console.log('Equipment has no location:', equipment.name);
    return undefined;
  }
  
  const normalizedEquipLocation = normalizeString(equipment.location);
  
  // 1. Try exact match with store number
  const exactMatch = locationsData.find(loc => 
    normalizedEquipLocation === normalizeString(loc.store_number)
  );
  
  if (exactMatch) {
    console.log(`✓ Exact match found for "${equipment.name}": ${exactMatch.store_number}`);
    return exactMatch.store_number;
  }
  
  // 2. Try reverse match - check if store number contains equipment location
  const reverseMatch = locationsData.find(loc => 
    loc.store_number && normalizeString(loc.store_number).includes(normalizedEquipLocation)
  );
  
  if (reverseMatch) {
    console.log(`✓ Reverse match found for "${equipment.name}": ${reverseMatch.store_number}`);
    return reverseMatch.store_number;
  }
  
  // 3. Try equipment location contains store number
  const containsMatch = locationsData.find(loc => 
    loc.store_number && normalizedEquipLocation.includes(normalizeString(loc.store_number))
  );
  
  if (containsMatch) {
    console.log(`✓ Contains match found for "${equipment.name}": ${containsMatch.store_number}`);
    return containsMatch.store_number;
  }
  
  // 4. Try exact match with location name
  const nameExactMatch = locationsData.find(loc => 
    loc.name && normalizedEquipLocation === normalizeString(loc.name)
  );
  
  if (nameExactMatch) {
    console.log(`✓ Name exact match found for "${equipment.name}": ${nameExactMatch.store_number}`);
    return nameExactMatch.store_number;
  }
  
  // 5. Try partial match with location name
  const nameContainsMatch = locationsData.find(loc => 
    loc.name && (
      normalizedEquipLocation.includes(normalizeString(loc.name)) ||
      normalizeString(loc.name).includes(normalizedEquipLocation)
    )
  );
  
  if (nameContainsMatch) {
    console.log(`✓ Name contains match found for "${equipment.name}": ${nameContainsMatch.store_number}`);
    return nameContainsMatch.store_number;
  }
  
  // 6. Try fuzzy matching as last resort
  const fuzzyMatchResult = locationsData.find(loc => {
    return (loc.store_number && fuzzyMatch(equipment.location, loc.store_number, 0.7)) ||
           (loc.name && fuzzyMatch(equipment.location, loc.name, 0.7));
  });
  
  if (fuzzyMatchResult) {
    console.log(`✓ Fuzzy match found for "${equipment.name}": ${fuzzyMatchResult.store_number}`);
    return fuzzyMatchResult.store_number;
  }
  
  console.log(`✗ No match found for location "${equipment.location}" (equipment: ${equipment.name})`);
  return undefined;
};

/**
 * Calculate risk score and level based on operational equipment percentage
 */
export const calculateRiskMetrics = (operational: number, total: number): { riskScore: number, riskLevel: EquipmentHealthItem["riskLevel"] } => {
  if (total === 0) return { riskScore: 0, riskLevel: "low" };
  
  const riskScore = Math.round((operational / total) * 100);
  
  let riskLevel: EquipmentHealthItem["riskLevel"] = "low";
  if (riskScore < 60) {
    riskLevel = "high";
  } else if (riskScore < 80) {
    riskLevel = "medium";
  }
  
  return { riskScore, riskLevel };
};

/**
 * Process unmatched equipment into fallback location groups
 */
export const processUnmatchedEquipment = (
  equipmentData: any[]
): EquipmentHealthItem[] => {
  const locationMap = new Map<string, EquipmentHealthItem>();
  
  equipmentData.forEach(equipment => {
    if (!equipment.location) return;
    
    const location = equipment.location;
    
    if (!locationMap.has(location)) {
      locationMap.set(location, {
        location: `${location} (unmatched)`,
        operational: 0,
        needsMaintenance: 0,
        outOfService: 0,
        total: 0,
        riskScore: 0,
        riskLevel: "low"
      });
    }
    
    const locationData = locationMap.get(location)!;
    locationData.total += 1;
    
    if (equipment.status === "Operational") {
      locationData.operational += 1;
    } else if (equipment.status === "Needs Maintenance") {
      locationData.needsMaintenance += 1;
    } else if (equipment.status === "Out of Service") {
      locationData.outOfService += 1;
    }
  });
  
  // Calculate risk scores
  locationMap.forEach(location => {
    if (location.total > 0) {
      const { riskScore, riskLevel } = calculateRiskMetrics(location.operational, location.total);
      location.riskScore = riskScore;
      location.riskLevel = riskLevel;
    }
  });
  
  return Array.from(locationMap.values()).sort((a, b) => a.riskScore - b.riskScore);
};

/**
 * Process equipment data and location data into health matrix format
 * with improved matching logic and fallback for unmatched equipment
 */
export const processEquipmentHealthData = (
  equipmentData: any[],
  locationsData: any[]
): EquipmentHealthItem[] => {
  if (!equipmentData?.length || !locationsData?.length) {
    console.log('Insufficient data for processing health matrix');
    return [];
  }
  
  console.log('Processing equipment health data:', {
    equipmentCount: equipmentData.length,
    locationsCount: locationsData.length
  });

  // Log sample equipment data to debug location issues
  console.log('Sample equipment items:');
  equipmentData.slice(0, 3).forEach(equip => {
    console.log('Equipment:', {
      name: equip.name,
      location: equip.location,
      status: equip.status
    });
  });
  
  console.log('Sample location items:');
  locationsData.slice(0, 3).forEach(loc => {
    console.log('Location:', {
      name: loc.name,
      storeNumber: loc.store_number
    });
  });
  
  // Create a map of store numbers to EquipmentHealthItem
  const storeNumberMap = new Map<string, EquipmentHealthItem>();
  
  // Initialize map with store numbers from database
  locationsData.forEach(location => {
    if (!location.store_number) {
      console.log('Location missing store number:', location.name || 'unnamed location');
      return;
    }
    
    storeNumberMap.set(location.store_number, {
      location: location.store_number,
      operational: 0,
      needsMaintenance: 0,
      outOfService: 0,
      total: 0,
      riskScore: 0,
      riskLevel: "low"
    });
  });
  
  // Separate matched and unmatched equipment
  const matchedEquipment: any[] = [];
  const unmatchedEquipment: any[] = [];
  
  equipmentData.forEach(equipment => {
    const matchedStoreNumber = matchEquipmentToStoreNumber(equipment, locationsData);
    
    if (matchedStoreNumber) {
      matchedEquipment.push({ ...equipment, matchedStoreNumber });
    } else {
      unmatchedEquipment.push(equipment);
    }
  });
  
  console.log(`Equipment matching results: ${matchedEquipment.length} matched, ${unmatchedEquipment.length} unmatched`);
  
  // Process matched equipment
  matchedEquipment.forEach(equipment => {
    const storeNumber = equipment.matchedStoreNumber;
    
    // Get or create the health data entry for this store number
    if (!storeNumberMap.has(storeNumber)) {
      storeNumberMap.set(storeNumber, {
        location: storeNumber,
        operational: 0,
        needsMaintenance: 0,
        outOfService: 0,
        total: 0,
        riskScore: 0,
        riskLevel: "low"
      });
    }
    
    const locationData = storeNumberMap.get(storeNumber)!;
    locationData.total += 1;
    
    // Count by status
    if (equipment.status === "Operational") {
      locationData.operational += 1;
    } else if (equipment.status === "Needs Maintenance") {
      locationData.needsMaintenance += 1;
    } else if (equipment.status === "Out of Service") {
      locationData.outOfService += 1;
    }
  });
  
  // Calculate risk scores and levels for each location
  storeNumberMap.forEach(location => {
    if (location.total > 0) {
      const { riskScore, riskLevel } = calculateRiskMetrics(location.operational, location.total);
      location.riskScore = riskScore;
      location.riskLevel = riskLevel;
    }
  });
  
  // Convert map to array and sort by risk score (ascending) so highest risk is first
  const matchedData = Array.from(storeNumberMap.values())
    .filter(item => item.total > 0) // Only show store numbers with equipment
    .sort((a, b) => a.riskScore - b.riskScore);
  
  // Process unmatched equipment as fallback locations
  const unmatchedData = unmatchedEquipment.length > 0 
    ? processUnmatchedEquipment(unmatchedEquipment)
    : [];
  
  // Combine matched and unmatched data
  const allData = [...matchedData, ...unmatchedData].sort((a, b) => a.riskScore - b.riskScore);
  
  console.log('Final processed health data:', allData.length, 'total locations');
  console.log(`  - ${matchedData.length} matched store locations`);
  console.log(`  - ${unmatchedData.length} unmatched location groups`);
  
  allData.forEach(data => {
    console.log(`Location ${data.location}: ${data.operational} operational, ${data.needsMaintenance} needs maintenance, ${data.outOfService} out of service`);
  });
  
  return allData;
};
