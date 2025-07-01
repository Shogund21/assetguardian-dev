import { detectEquipmentType } from "@/components/maintenance/form/hooks/utils/equipmentTypeDetection";

export interface Equipment {
  id: string;
  name: string;
  location: string;
  status?: string;
  type?: string;
}

export interface GroupedEquipment {
  type: string;
  typeLabel: string;
  equipment: Equipment[];
}

const EQUIPMENT_TYPE_ORDER = [
  'ahu',
  'chiller', 
  'rtu',
  'cooling_tower',
  'elevator',
  'restroom',
  'general'
];

const EQUIPMENT_TYPE_LABELS = {
  ahu: 'Air Handlers',
  chiller: 'Chillers',
  rtu: 'Rooftop Units',
  cooling_tower: 'Cooling Towers',
  elevator: 'Elevators',
  restroom: 'Restrooms',
  general: 'General Equipment'
};

/**
 * Groups equipment by type and sorts alphabetically within each group
 */
export const groupAndSortEquipment = (equipment: Equipment[]): GroupedEquipment[] => {
  // First, ensure each equipment has a detected type
  const equipmentWithTypes = equipment.map(eq => ({
    ...eq,
    detectedType: eq.type || detectEquipmentType(eq.name)
  }));

  // Group by type
  const grouped = equipmentWithTypes.reduce((acc, eq) => {
    const type = eq.detectedType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(eq);
    return acc;
  }, {} as Record<string, Equipment[]>);

  // Sort within each group and create result
  const result: GroupedEquipment[] = [];
  
  EQUIPMENT_TYPE_ORDER.forEach(type => {
    if (grouped[type] && grouped[type].length > 0) {
      result.push({
        type,
        typeLabel: EQUIPMENT_TYPE_LABELS[type as keyof typeof EQUIPMENT_TYPE_LABELS],
        equipment: grouped[type].sort((a, b) => a.name.localeCompare(b.name))
      });
    }
  });

  return result;
};

/**
 * Flattens grouped equipment back to a simple sorted array
 */
export const getSortedEquipmentList = (equipment: Equipment[]): Equipment[] => {
  const grouped = groupAndSortEquipment(equipment);
  return grouped.flatMap(group => group.equipment);
};