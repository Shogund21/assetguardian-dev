
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MaintenanceFormValues } from "./hooks/schema/maintenanceFormSchema";

interface AHUMaintenanceFieldsProps {
  form: UseFormReturn<MaintenanceFormValues>;
  isQuickCheck?: boolean;
}

const AHUMaintenanceFields = ({ form, isQuickCheck = false }: AHUMaintenanceFieldsProps) => {
  // Daily quick check fields - only essential readings
  if (isQuickCheck) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="col-span-full">
          <h4 className="font-medium text-gray-900 mb-3">Essential Daily Readings</h4>
        </div>
        
        <FormField
          control={form.control}
          name="supply_air_temp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supply Air Temp (°F)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="55-65" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="return_air_temp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Return Air Temp (°F)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="70-78" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fan_motor_current"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fan Motor Current (Amps)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="5-15" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visual_inspection_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visual Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="normal">Normal - No issues</SelectItem>
                  <SelectItem value="minor_concern">Minor Concern</SelectItem>
                  <SelectItem value="needs_attention">Needs Attention</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  // Full comprehensive fields for weekly/monthly maintenance
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-full">
          <h4 className="font-medium text-gray-900 mb-3">Air Temperature Readings</h4>
        </div>
        
        <FormField
          control={form.control}
          name="supply_air_temp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supply Air Temperature (°F)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="55-65" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="return_air_temp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Return Air Temperature (°F)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="70-78" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="static_pressure"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Static Pressure (in. W.C.)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.5-2.0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="filter_pressure_drop"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Filter Pressure Drop (in. W.C.)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.1-0.5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-full">
          <h4 className="font-medium text-gray-900 mb-3">Mechanical Components</h4>
        </div>

        <FormField
          control={form.control}
          name="fan_motor_current"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fan Motor Current (Amps)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="5-15" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fan_belt_condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fan Belt Condition</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="worn">Worn</SelectItem>
                  <SelectItem value="needs_replacement">Needs Replacement</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dampers_operation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dampers Operation</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="stuck">Stuck</SelectItem>
                  <SelectItem value="needs_adjustment">Needs Adjustment</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coils_condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coils Condition</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="clean">Clean</SelectItem>
                  <SelectItem value="dirty">Dirty</SelectItem>
                  <SelectItem value="needs_cleaning">Needs Cleaning</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-full">
          <h4 className="font-medium text-gray-900 mb-3">Maintenance Tasks</h4>
        </div>

        <FormField
          control={form.control}
          name="air_filter_cleaned"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Air Filter Cleaned/Replaced</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fan_bearings_lubricated"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Fan Bearings Lubricated</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default AHUMaintenanceFields;
