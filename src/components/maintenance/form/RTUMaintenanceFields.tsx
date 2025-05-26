
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { MaintenanceFormValues } from "./hooks/schema/maintenanceFormSchema";
import FormSection from './FormSection';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface RTUMaintenanceFieldsProps {
  form: UseFormReturn<MaintenanceFormValues>;
}

const RTUMaintenanceFields = ({ form }: RTUMaintenanceFieldsProps) => {
  return (
    <>
      <FormSection title="Heating System">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="heat_exchanger_condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heat Exchanger Condition</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="needs_cleaning">Needs Cleaning</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gas_pressure_reading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gas Pressure (in. W.C.)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="Enter pressure" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ignition_system_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ignition System Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="intermittent">Intermittent</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heat_strip_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heat Strip Status (Electric Units)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="partial">Partial Operation</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="flue_gas_temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Flue Gas Temperature (°F)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter temperature" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Cooling System">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="high_side_pressure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>High Side Pressure (PSI)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter pressure" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="low_side_pressure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Low Side Pressure (PSI)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter pressure" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="compressor_operation_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compressor Operation Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="short_cycling">Short Cycling</SelectItem>
                    <SelectItem value="hard_start">Hard Start</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="condenser_coil_condition"
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
                    <SelectItem value="dirty">Dirty</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="evaporator_coil_condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Evaporator Coil Condition</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="clean">Clean</SelectItem>
                    <SelectItem value="dirty">Dirty</SelectItem>
                    <SelectItem value="frozen">Frozen</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expansion_valve_operation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expansion Valve Operation</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="hunting">Hunting</SelectItem>
                    <SelectItem value="stuck">Stuck</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Air System">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="supply_air_temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supply Air Temperature (°F)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter temperature" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="return_air_temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Return Air Temperature (°F)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter temperature" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="static_pressure_reading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Static Pressure (in. W.C.)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Enter pressure" {...field} />
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
                  <Input type="number" step="0.01" placeholder="Enter pressure drop" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ductwork_condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ductwork Condition</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="minor_leaks">Minor Leaks</SelectItem>
                    <SelectItem value="major_leaks">Major Leaks</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Electrical and Controls">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="thermostat_calibration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thermostat Calibration</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="accurate">Accurate</SelectItem>
                    <SelectItem value="slight_drift">Slight Drift</SelectItem>
                    <SelectItem value="needs_calibration">Needs Calibration</SelectItem>
                    <SelectItem value="faulty">Faulty</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="control_sequence_verified"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Control Sequence Verified</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="safety_circuit_operation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Safety Circuit Operation</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="functional">Functional</SelectItem>
                    <SelectItem value="issues">Issues</SelectItem>
                    <SelectItem value="bypassed">Bypassed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="economizer_operation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Economizer Operation</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="manual_override">Manual Override</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="not_equipped">Not Equipped</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Mechanical Components">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fan_motor_amp_draw"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fan Motor Amp Draw</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter amps" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="blower_wheel_condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blower Wheel Condition</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="clean">Clean</SelectItem>
                    <SelectItem value="dirty">Dirty</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="imbalanced">Imbalanced</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="belt_tension_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Belt Tension Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="proper">Proper</SelectItem>
                    <SelectItem value="loose">Loose</SelectItem>
                    <SelectItem value="tight">Too Tight</SelectItem>
                    <SelectItem value="worn">Worn</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bearing_lubrication_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bearing Lubrication Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="adequate">Adequate</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="dry">Dry</SelectItem>
                    <SelectItem value="overlubricated">Over-lubricated</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Additional Notes">
        <FormField
          control={form.control}
          name="rtu_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RTU Maintenance Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter any additional observations or recommendations..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
    </>
  );
};

export default RTUMaintenanceFields;
