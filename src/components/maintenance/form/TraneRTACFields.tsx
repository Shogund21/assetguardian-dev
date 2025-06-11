
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MaintenanceFormValues } from "./hooks/schema/maintenanceFormSchema";
import { TRANE_RTAC_250_SPECS, getTraneRTACReading } from "@/utils/traneRTACSpecs";

interface TraneRTACFieldsProps {
  form: UseFormReturn<MaintenanceFormValues>;
  isQuickCheck?: boolean;
}

const TraneRTACFields = ({ form, isQuickCheck = false }: TraneRTACFieldsProps) => {
  const getRangeDisplay = (fieldName: string) => {
    const range = getTraneRTACReading(fieldName);
    return range ? `${range.min}-${range.max}` : "";
  };

  // Daily quick check fields - only essential RTAC readings
  if (isQuickCheck) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="col-span-full">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="font-medium text-gray-900">Trane RTAC 250 - Daily Check</h4>
            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
              250 Ton Capacity
            </Badge>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="evaporator_entering_temp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Evap Entering Temp (°F)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder={getRangeDisplay("evaporator_entering_temp")} {...field} />
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
              <FormLabel>Evap Leaving Temp (°F)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder={getRangeDisplay("evaporator_leaving_temp")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="compressor_1_current"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comp 1 Current (Amps)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder={getRangeDisplay("compressor_1_current")} {...field} />
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

  // Full comprehensive RTAC fields for weekly/monthly maintenance
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-medium text-blue-900">Trane RTAC 250 Ton Chiller</h4>
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            Air-Cooled Screw Chiller
          </Badge>
        </div>
        <p className="text-sm text-blue-700">
          Comprehensive maintenance check with Trane-specific operating parameters
        </p>
      </div>

      {/* Temperature Readings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-full">
          <h4 className="font-medium text-gray-900 mb-3">Water Temperature Readings</h4>
        </div>
        
        <FormField
          control={form.control}
          name="evaporator_entering_temp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Evaporator Entering Water Temp (°F)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder={getRangeDisplay("evaporator_entering_temp")} {...field} />
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
                <Input type="number" step="0.1" placeholder={getRangeDisplay("evaporator_leaving_temp")} {...field} />
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
              <FormLabel>Condenser Entering Air Temp (°F)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder={getRangeDisplay("condenser_entering_temp")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="approach_temperature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Approach Temperature (°F)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder={getRangeDisplay("approach_temp")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Compressor Readings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-full">
          <h4 className="font-medium text-gray-900 mb-3">Compressor Performance</h4>
        </div>

        <FormField
          control={form.control}
          name="compressor_1_current"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compressor 1 Current (Amps)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder={getRangeDisplay("compressor_1_current")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="compressor_2_current"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compressor 2 Current (Amps)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder={getRangeDisplay("compressor_2_current")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="oil_pressure_1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Oil Pressure 1 (PSIG)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder={getRangeDisplay("oil_pressure_1")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="oil_pressure_2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Oil Pressure 2 (PSIG)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder={getRangeDisplay("oil_pressure_2")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Refrigerant Pressures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-full">
          <h4 className="font-medium text-gray-900 mb-3">Refrigerant System</h4>
        </div>

        <FormField
          control={form.control}
          name="suction_pressure"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Suction Pressure (PSIG)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder={getRangeDisplay("suction_pressure")} {...field} />
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
                <Input type="number" step="0.1" placeholder={getRangeDisplay("discharge_pressure")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vfd_frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>VFD Frequency (Hz)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder={getRangeDisplay("vfd_frequency")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="staging_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Staging Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staging" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="comp1_only">Comp 1 Only</SelectItem>
                  <SelectItem value="comp2_only">Comp 2 Only</SelectItem>
                  <SelectItem value="both_comps">Both Compressors</SelectItem>
                  <SelectItem value="cycling">Cycling</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-full">
          <h4 className="font-medium text-gray-900 mb-3">System Status & Observations</h4>
        </div>

        <FormField
          control={form.control}
          name="control_mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Control Mode</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="auto">Automatic</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="ice_mode">Ice Mode</SelectItem>
                  <SelectItem value="off">Off</SelectItem>
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
              <FormLabel>Condenser Coil Condition</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="clean">Clean</SelectItem>
                  <SelectItem value="lightly_dirty">Lightly Dirty</SelectItem>
                  <SelectItem value="dirty">Dirty - Needs Cleaning</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
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

export default TraneRTACFields;
