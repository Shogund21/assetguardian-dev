
import { EquipmentFormData } from "@/types/equipment";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EQUIPMENT_TYPES } from "./constants/equipmentTypes";

interface FormFieldsProps {
  formData: EquipmentFormData;
  onInputChange: (field: keyof EquipmentFormData, value: string | number) => void;
}

const FormFields = ({ formData, onInputChange }: FormFieldsProps) => {
  const detectEquipmentType = (name: string): string => {
    const lowerName = name.toLowerCase();
    
    // Enhanced chiller detection for all variations including numbered ones
    if (lowerName.includes('chiller')) {
      return 'chiller';
    }
    
    if (lowerName.includes('ahu') || lowerName.includes('air handler')) {
      return 'ahu';
    }
    
    if (lowerName.includes('rtu') || lowerName.includes('rooftop')) {
      return 'rtu';
    }
    
    if (lowerName.includes('cooling tower')) {
      return 'cooling_tower';
    }
    
    if (lowerName.includes('elevator')) {
      return 'elevator';
    }
    
    if (lowerName.includes('restroom')) {
      return 'restroom';
    }
    
    return 'general';
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-base font-semibold">Equipment Name/Type</label>
        <Select 
          value={formData.name} 
          onValueChange={(value) => {
            onInputChange('name', value);
            // Auto-set the type based on the name using enhanced detection
            const detectedType = detectEquipmentType(value);
            onInputChange('type', detectedType);
          }}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select equipment type" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {EQUIPMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-base font-semibold">Location</label>
        <Input
          value={formData.location}
          onChange={(e) => onInputChange('location', e.target.value)}
          placeholder="Enter location"
          className="mt-2"
          required
        />
      </div>

      <div>
        <label className="text-base font-semibold">Equipment Type Category</label>
        <Select value={formData.type} onValueChange={(value) => onInputChange('type', value)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select type category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ahu">AHU (Air Handling Unit)</SelectItem>
            <SelectItem value="chiller">Chiller</SelectItem>
            <SelectItem value="rtu">RTU (Rooftop Unit)</SelectItem>
            <SelectItem value="cooling_tower">Cooling Tower</SelectItem>
            <SelectItem value="elevator">Elevator</SelectItem>
            <SelectItem value="restroom">Restroom</SelectItem>
            <SelectItem value="general">General Equipment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-base font-semibold">Status</label>
        <Select value={formData.status} onValueChange={(value) => onInputChange('status', value)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-base font-semibold">Model</label>
        <Input
          value={formData.model || ''}
          onChange={(e) => onInputChange('model', e.target.value)}
          placeholder="Enter model"
          className="mt-2"
        />
      </div>

      <div>
        <label className="text-base font-semibold">Serial Number</label>
        <Input
          value={formData.serial_number || ''}
          onChange={(e) => onInputChange('serial_number', e.target.value)}
          placeholder="Enter serial number"
          className="mt-2"
        />
      </div>
    </div>
  );
};

export default FormFields;
