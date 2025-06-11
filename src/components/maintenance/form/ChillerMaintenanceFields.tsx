
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MaintenanceFormValues } from "./hooks/schema/maintenanceFormSchema";

interface ChillerMaintenanceFieldsProps {
  form: UseFormReturn<MaintenanceFormValues>;
  isQuickCheck?: boolean;
}

const ChillerMaintenanceFields = ({ form, isQuickCheck = false }: ChillerMaintenanceFieldsProps) => {
  // Daily quick check fields - only essential readings
  if (isQuickCheck) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="col-span-full">
          <h4 className="font-medium text-gray-900 mb-3">Essential Daily Readings</h4>
        </div>
        
        <FormField
          control={form.control}
          name="evaporator_entering_temp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Evaporator Entering Temp (°F)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="54-58" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="evaporator_leaving_temp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Evaporator Leaving Temp (°F)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="42-48" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="compressor_current"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compressor Current (Amps)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="50-150" {...field} />
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
          <h4 className="font-medium text-gray-900 mb-3">Temperature Readings</h4>
        </div>
        
        <FormField
          control={form.control}
          name="evaporator_entering_temp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Evaporator Entering Water Temp (°F)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="54-58" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="evaporator_leaving_temp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Evaporator Leaving Water Temp (°F)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="42-48" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="condenser_entering_temp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condenser Entering Water Temp (°F)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="75-85" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="condenser_leaving_temp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condenser Leaving Water Temp (°F)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="85-95" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-full">
          <h4 className="font-medium text-gray-900 mb-3">Pressure & Current Readings</h4>
        </div>

        <FormField
          control={form.control}
          name="compressor_current"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compressor Current (Amps)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="50-150" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="suction_pressure"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Suction Pressure (PSIG)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="35-50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discharge_pressure"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discharge Pressure (PSIG)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="150-250" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="oil_pressure"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Oil Pressure (PSIG)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="45-65" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-full">
          <h4 className="font-medium text-gray-900 mb-3">System Status Checks</h4>
        </div>

        <FormField
          control={form.control}
          name="refrigerant_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Refrigerant Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="adequate">Adequate</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="needs_attention">Needs Attention</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="condenser_condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condenser Condition</FormLabel>
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

        <FormField
          control={form.control}
          name="unusual_noise"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Unusual Noise Detected</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vibration_observed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Excessive Vibration</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default ChillerMaintenanceFields;
