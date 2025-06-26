
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceFormValues } from "./hooks/schema/maintenanceFormSchema";

interface ComprehensiveChillerFieldsProps {
  form: UseFormReturn<MaintenanceFormValues>;
}

const ComprehensiveChillerFields = ({ form }: ComprehensiveChillerFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Comprehensive Chiller System Data Entry</h4>
        <p className="text-sm text-blue-700">
          Enter all available readings from the HVAC system interface
        </p>
      </div>

      <Tabs defaultValue="evaporator" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="evaporator">Evaporator</TabsTrigger>
          <TabsTrigger value="condenser">Condenser</TabsTrigger>
          <TabsTrigger value="compressor">Compressor</TabsTrigger>
          <TabsTrigger value="motor">Motor</TabsTrigger>
        </TabsList>

        <TabsContent value="evaporator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Evaporator Section</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="evaporator_leaving_water_temp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evaporator Leaving Water Temperature (°F)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="45.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evaporator_entering_water_temp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evaporator Entering Water Temperature (°F)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="45.9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evap_sat_rfgt_temp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evap Sat Rfgt Temp (°F)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="42.9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evap_rfgt_pressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evap Rfgt Pressure (PSIG)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="-8.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evap_approach_temp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evap Approach Temp (°F)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="2.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active_chilled_water_setpoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Active Chilled Water Setpoint (°F)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="45.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evaporator_pump_override"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evaporator Pump Override</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="off">Off</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evap_water_flow_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evap Water Flow Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="flow">Flow</SelectItem>
                          <SelectItem value="no_flow">No Flow</SelectItem>
                          <SelectItem value="low_flow">Low Flow</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="condenser" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Condenser Section</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="condenser_entering_water_temp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cond Entering Water Temp (°F)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="80.7" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condenser_leaving_water_temp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cond Leaving Water Temp (°F)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="85.2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cond_sat_rfgt_temp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cond Sat Rfgt Temp (°F)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="85.4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cond_rfgt_pressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cond Rfgt Pressure (PSIG)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="2.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cond_approach_temp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cond Approach Temp (°F)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="0.2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="differential_refrigerant_pressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Differential Refrigerant Pressure (PSID)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="10.48" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condenser_pump_override"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condenser Pump Override</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="off">Off</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cond_water_flow_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cond Water Flow Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="flow">Flow</SelectItem>
                          <SelectItem value="no_flow">No Flow</SelectItem>
                          <SelectItem value="low_flow">Low Flow</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compressor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compressor Section</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="compressor_running_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compressor Running</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="running">Running</SelectItem>
                          <SelectItem value="stopped">Stopped</SelectItem>
                          <SelectItem value="starting">Starting</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chiller_control_signal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chiller Control Signal (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="52.2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="average_motor_current_pct_rla"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Motor Current % RLA</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="67.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="compressor_starts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compressor Starts</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2020" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="oil_differential_pressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oil Differential Pressure (PSID)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="25.45" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="compressor_running_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compressor Running Time (Hr:Min)</FormLabel>
                      <FormControl>
                        <Input placeholder="18030:53" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="oil_pump_discharge_pressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oil Pump Discharge Pressure (PSIG)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="18.2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="oil_tank_pressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oil Tank Pressure (PSIG)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="-7.3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="compressor_refrigerant_discharge_temp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compressor Refrigerant Discharge Temperature (°F)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="106.6" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="oil_pump_control"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oil Pump Control</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="off">Off</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="oil_pump_command"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oil Pump Command</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select command" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="on">On</SelectItem>
                          <SelectItem value="off">Off</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="motor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Motor Section</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="active_current_limit_setpoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Active Current Limit Setpoint (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="80.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="average_motor_current_pct_rla_motor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Motor Current % RLA</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="67.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motor_frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motor Frequency (Hz)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="60.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="starter_motor_current_l1_pct_rla"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starter Motor Current L1 % RLA</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="64.9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="starter_motor_current_l2_pct_rla"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starter Motor Current L2 % RLA</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="67.7" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="starter_motor_current_l3_pct_rla"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starter Motor Current L3 % RLA</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="68.4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="starter_motor_current_l1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starter Motor Current L1 (A)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="133.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="starter_motor_current_l2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starter Motor Current L2 (A)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="138.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="starter_motor_current_l3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starter Motor Current L3 (A)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="140.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="afd_input_current_l1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AFD Input Current L1 (A)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="118.3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="afd_input_current_l2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AFD Input Current L2 (A)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="116.2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="afd_input_current_l3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AFD Input Current L3 (A)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="116.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveChillerFields;
