
/**
 * Utility to determine equipment type from equipment data
 */

/**
 * Determines equipment type based on equipment name with enhanced chiller detection
 * @param equipmentName The name of the equipment
 * @returns Equipment type string ('ahu', 'chiller', 'rtu', etc.)
 */
export const detectEquipmentType = (equipmentName: string): string => {
  const name = equipmentName.toLowerCase();
  
  // Enhanced chiller detection - covers all variations including numbered and hyphenated
  if (name.includes('chiller')) return 'chiller';
  
  if (name.includes('ahu') || name.includes('air handler')) return 'ahu';
  if (name.includes('rtu') || name.includes('rooftop')) return 'rtu';
  if (name.includes('cooling tower')) return 'cooling_tower';
  if (name.includes('elevator')) return 'elevator';
  if (name.includes('restroom')) return 'restroom';
  
  return 'general';
};

/**
 * Validates if the equipment type is in the list of valid types
 * @param equipmentType Type to validate
 * @returns True if valid, false otherwise
 */
export const isValidEquipmentType = (equipmentType: string): boolean => {
  const validEquipmentTypes = ['ahu', 'chiller', 'rtu', 'cooling_tower', 'elevator', 'restroom', 'general'];
  return validEquipmentTypes.includes(equipmentType);
};
