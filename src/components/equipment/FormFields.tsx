
import { UseFormReturn } from "react-hook-form";
import { EquipmentFormData } from "@/types/equipment";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormFieldsProps {
  formData: EquipmentFormData;
  onInputChange: (field: keyof EquipmentFormData, value: string | number) => void;
}

const FormFields = ({ formData, onInputChange }: FormFieldsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-base font-semibold">Equipment Name</label>
        <Input
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="Enter equipment name"
          className="mt-2"
        />
      </div>

      <div>
        <label className="text-base font-semibold">Location</label>
        <Input
          value={formData.location}
          onChange={(e) => onInputChange('location', e.target.value)}
          placeholder="Enter location"
          className="mt-2"
        />
      </div>

      <div>
        <label className="text-base font-semibold">Type</label>
        <Input
          value={formData.type}
          onChange={(e) => onInputChange('type', e.target.value)}
          placeholder="Enter equipment type"
          className="mt-2"
        />
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

      <div>
        <label className="text-base font-semibold">Year</label>
        <Input
          type="number"
          value={formData.year || ''}
          onChange={(e) => onInputChange('year', parseInt(e.target.value) || 0)}
          placeholder="Enter year"
          className="mt-2"
        />
      </div>
    </div>
  );
};

export default FormFields;
