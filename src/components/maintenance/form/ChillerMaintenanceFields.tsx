
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { MaintenanceFormValues } from "./hooks/schema/maintenanceFormSchema";
import FormSection from './FormSection';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface ChillerMaintenanceFieldsProps {
  form: UseFormReturn<MaintenanceFormValues>;
}

const ChillerMaintenanceFields = ({ form }: ChillerMaintenanceFieldsProps) => {
  return (
    <>
      <FormSection title="Refrigerant System">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="refrigerant_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Refrigerant Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="condenser_pressure_reading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condenser Pressure (PSI)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter pressure" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="evaporator_pressure_reading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Evaporator Pressure (PSI)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter pressure" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="superheat_reading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Superheat (°F)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter superheat" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subcooling_reading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subcooling (°F)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter subcooling" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="oil_level_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Oil Level Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="dirty">Dirty</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Electrical System">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="compressor_amp_draw"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compressor Amp Draw</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter amps" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="voltage_reading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voltage Reading (V)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter voltage" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="power_factor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Power Factor</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Enter power factor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="control_panel_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Control Panel Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="minor_issues">Minor Issues</SelectItem>
                    <SelectItem value="major_issues">Major Issues</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Water System">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="chilled_water_flow_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chilled Water Flow Rate (GPM)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter flow rate" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="condenser_water_flow_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condenser Water Flow Rate (GPM)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter flow rate" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="water_quality_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Water Quality Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="strainer_condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Strainer Condition</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="clean">Clean</SelectItem>
                    <SelectItem value="dirty">Dirty</SelectItem>
                    <SelectItem value="clogged">Clogged</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="water_treatment_levels"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Water Treatment Chemical Levels</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="optimal">Optimal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="high">High</SelectItem>
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
            name="compressor_vibration_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compressor Vibration Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="elevated">Elevated</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bearing_temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bearing Temperature (°F)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter temperature" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="belt_condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Belt Condition</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="worn">Worn</SelectItem>
                    <SelectItem value="cracked">Cracked</SelectItem>
                    <SelectItem value="needs_replacement">Needs Replacement</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coupling_alignment_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coupling Alignment Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="aligned">Aligned</SelectItem>
                    <SelectItem value="misaligned">Misaligned</SelectItem>
                    <SelectItem value="needs_adjustment">Needs Adjustment</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Safety and Controls">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="safety_switches_operation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Safety Switches Operation</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="issues">Issues</SelectItem>
                    <SelectItem value="needs_testing">Needs Testing</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alarm_system_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alarm System Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="functional">Functional</SelectItem>
                    <SelectItem value="minor_issues">Minor Issues</SelectItem>
                    <SelectItem value="major_issues">Major Issues</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sensor_calibration_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sensor Calibration Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="calibrated">Calibrated</SelectItem>
                    <SelectItem value="needs_calibration">Needs Calibration</SelectItem>
                    <SelectItem value="drift_detected">Drift Detected</SelectItem>
                    <SelectItem value="NA">N/A</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergency_shutdown_tested"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Emergency Shutdown System Tested</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Additional Notes">
        <FormField
          control={form.control}
          name="chiller_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chiller Maintenance Notes</FormLabel>
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

export default ChillerMaintenanceFields;
