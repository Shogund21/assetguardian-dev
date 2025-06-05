
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { Technician } from "@/types/maintenance";

interface TechnicianSelectProps {
  form: UseFormReturn<any>;
  technicians: Technician[];
}

const TechnicianSelect = ({ form, technicians }: TechnicianSelectProps) => {
  console.log('TechnicianSelect render:', {
    techniciansCount: technicians?.length || 0,
    currentValue: form.watch('technician_id')
  });

  return (
    <FormField
      control={form.control}
      name="technician_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-semibold text-gray-700">Technician</FormLabel>
          <Select
            onValueChange={(value) => {
              console.log('Technician selected:', value);
              field.onChange(value === "no-technician" ? "" : value);
            }}
            value={field.value || ""}
          >
            <FormControl>
              <SelectTrigger 
                className="w-full bg-white border border-gray-200 h-12 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <SelectValue 
                  placeholder="Select technician" 
                  className="text-gray-600"
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent 
              className="z-[1000] bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-[--radix-select-trigger-width] max-h-[300px] overflow-y-auto"
            >
              <SelectItem 
                value="" 
                className="py-3 px-4 hover:bg-blue-50 cursor-pointer focus:bg-blue-50 focus:text-blue-600"
              >
                No technician selected
              </SelectItem>
              
              {technicians && technicians.length > 0 ? (
                technicians.map((tech) => (
                  <SelectItem 
                    key={tech.id} 
                    value={tech.id}
                    className="py-3 px-4 hover:bg-blue-50 cursor-pointer focus:bg-blue-50 focus:text-blue-600"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {tech.firstName} {tech.lastName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {tech.specialization}
                      </span>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem 
                  value="no-technicians" 
                  disabled 
                  className="py-3 text-sm text-gray-500"
                >
                  No technicians available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage className="text-sm text-red-500" />
        </FormItem>
      )}
    />
  );
};

export default TechnicianSelect;
