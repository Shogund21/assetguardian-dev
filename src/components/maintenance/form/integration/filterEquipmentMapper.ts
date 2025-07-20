
interface FilterSpec {
  type: string;
  size: string;
  commonSizes: string[];
}

const equipmentFilterSpecs: Record<string, FilterSpec> = {
  'ahu': {
    type: 'MERV-13',
    size: '20x25x2',
    commonSizes: ['20x25x2', '24x24x2', '16x25x2', '20x20x2']
  },
  'rtu': {
    type: 'MERV-11',
    size: '16x25x2',
    commonSizes: ['16x25x2', '20x25x2', '24x24x2', '16x20x2']
  },
  'chiller': {
    type: 'MERV-8',
    size: '24x24x2',
    commonSizes: ['24x24x2', '20x25x2', '16x25x2']
  },
  'split_system': {
    type: 'MERV-8',
    size: '16x20x1',
    commonSizes: ['16x20x1', '20x25x1', '14x20x1', '16x25x1']
  },
  'cooling_tower': {
    type: 'Mesh Filter',
    size: 'Custom',
    commonSizes: ['Custom', '24x24x2', '20x25x2']
  }
};

export const getDefaultFilterSpec = (equipmentType?: string, equipmentName?: string): FilterSpec => {
  // Try to determine type from equipment name if type not provided
  if (!equipmentType && equipmentName) {
    const name = equipmentName.toLowerCase();
    if (name.includes('ahu') || name.includes('air handler')) {
      equipmentType = 'ahu';
    } else if (name.includes('rtu') || name.includes('rooftop')) {
      equipmentType = 'rtu';
    } else if (name.includes('chiller')) {
      equipmentType = 'chiller';
    } else if (name.includes('split')) {
      equipmentType = 'split_system';
    } else if (name.includes('cooling tower')) {
      equipmentType = 'cooling_tower';
    }
  }

  // Return spec for detected type or default
  return equipmentFilterSpecs[equipmentType || 'ahu'] || equipmentFilterSpecs.ahu;
};

export const getAllFilterSizes = (): string[] => {
  const allSizes = new Set<string>();
  Object.values(equipmentFilterSpecs).forEach(spec => {
    spec.commonSizes.forEach(size => allSizes.add(size));
  });
  return Array.from(allSizes).sort();
};

export const getFilterTypesForEquipment = (equipmentType?: string): string[] => {
  return ['MERV-8', 'MERV-11', 'MERV-13', 'MERV-16', 'HEPA', 'Mesh Filter', 'Carbon Filter'];
};
