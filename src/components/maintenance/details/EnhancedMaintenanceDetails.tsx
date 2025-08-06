import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MaintenanceCheck } from "@/types/maintenance";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Thermometer, 
  Gauge, 
  Wrench,
  FileText,
  Calendar,
  MapPin,
  User,
  Activity
} from "lucide-react";
import { format } from "date-fns";

interface EnhancedMaintenanceDetailsProps {
  check: MaintenanceCheck;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EnhancedMaintenanceDetails = ({ check, open, onOpenChange }: EnhancedMaintenanceDetailsProps) => {
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'issue_found':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      issue_found: "bg-red-100 text-red-800 border-red-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200"
    };
    
    return (
      <Badge className={`${variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'} border`}>
        <div className="flex items-center gap-1">
          {getStatusIcon(status)}
          {status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
        </div>
      </Badge>
    );
  };

  const getTechnicianName = () => {
    if (check.technician) {
      return `${check.technician.firstName} ${check.technician.lastName}`;
    }
    return "Technician Not Available";
  };

  const getLocationName = () => {
    if (check.location?.name) {
      return check.location.store_number 
        ? `${check.location.name} (${check.location.store_number})`
        : check.location.name;
    }
    return check.equipment?.location || "Location Not Available";
  };

  const getEquipmentName = () => {
    return check.equipment?.name || "Equipment Not Available";
  };

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    const equipmentType = check.equipment_type?.toLowerCase();
    let criticalFields: string[] = [];

    switch (equipmentType) {
      case 'chiller':
        criticalFields = [
          'evaporator_leaving_water_temp',
          'evaporator_entering_water_temp', 
          'condenser_entering_water_temp',
          'condenser_leaving_water_temp',
          'compressor_suction_temp',
          'compressor_discharge_temp',
          'motor_amperage_rla'
        ];
        break;
      case 'ahu':
        criticalFields = [
          'air_filter_status',
          'motor_condition',
          'belt_condition',
          'coils_condition'
        ];
        break;
      case 'cooling_tower':
        criticalFields = [
          'fill_media_condition',
          'water_system_status',
          'fan_assembly_status'
        ];
        break;
      default:
        criticalFields = ['air_filter_status', 'motor_condition'];
    }
    
    const completedFields = criticalFields.filter(field => {
      const value = (check as any)[field];
      return value !== null && value !== undefined && value !== '';
    });
    
    return {
      percentage: criticalFields.length > 0 ? Math.round((completedFields.length / criticalFields.length) * 100) : 100,
      completed: completedFields.length,
      total: criticalFields.length
    };
  };

  const completion = calculateCompletionPercentage();

  // Format field value for display
  const formatFieldValue = (value: any, field: string): string => {
    if (value === null || value === undefined) return "Not Checked";
    if (typeof value === 'boolean') return value ? "Yes" : "No";
    if (typeof value === 'number') {
      // Add units for temperature fields
      if (field.includes('temp')) return `${value}°F`;
      if (field.includes('pressure')) return `${value} PSI`;
      if (field.includes('flow')) return `${value} GPM`;
      if (field.includes('amperage')) return `${value}%`;
      return value.toString();
    }
    if (typeof value === 'string') {
      return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
    }
    return String(value);
  };

  // Get equipment specific readings
  const getEquipmentReadings = () => {
    const equipmentType = check.equipment_type?.toLowerCase();
    const readings: { label: string; value: any; category: string }[] = [];

    switch (equipmentType) {
      case 'chiller':
        // Temperature readings
        if (check.evaporator_leaving_water_temp !== null) readings.push({ label: "Evaporator Leaving Water", value: check.evaporator_leaving_water_temp, category: "Temperature" });
        if (check.evaporator_entering_water_temp !== null) readings.push({ label: "Evaporator Entering Water", value: check.evaporator_entering_water_temp, category: "Temperature" });
        if (check.condenser_leaving_water_temp !== null) readings.push({ label: "Condenser Leaving Water", value: check.condenser_leaving_water_temp, category: "Temperature" });
        if (check.condenser_entering_water_temp !== null) readings.push({ label: "Condenser Entering Water", value: check.condenser_entering_water_temp, category: "Temperature" });
        if (check.compressor_suction_temp !== null) readings.push({ label: "Compressor Suction", value: check.compressor_suction_temp, category: "Temperature" });
        if (check.compressor_discharge_temp !== null) readings.push({ label: "Compressor Discharge", value: check.compressor_discharge_temp, category: "Temperature" });
        
        // Pressure readings
        if (check.compressor_suction_pressure !== null) readings.push({ label: "Compressor Suction", value: check.compressor_suction_pressure, category: "Pressure" });
        if (check.compressor_discharge_pressure !== null) readings.push({ label: "Compressor Discharge", value: check.compressor_discharge_pressure, category: "Pressure" });
        if (check.evaporator_pressure_drop !== null) readings.push({ label: "Evaporator Drop", value: check.evaporator_pressure_drop, category: "Pressure" });
        if (check.condenser_pressure_drop !== null) readings.push({ label: "Condenser Drop", value: check.condenser_pressure_drop, category: "Pressure" });
        
        // Motor readings
        if (check.motor_amperage_rla !== null) readings.push({ label: "Motor Amperage % RLA", value: check.motor_amperage_rla, category: "Motor" });
        if (check.motor_voltage_phase1 !== null) readings.push({ label: "Voltage Phase 1", value: check.motor_voltage_phase1, category: "Motor" });
        if (check.motor_voltage_phase2 !== null) readings.push({ label: "Voltage Phase 2", value: check.motor_voltage_phase2, category: "Motor" });
        if (check.motor_voltage_phase3 !== null) readings.push({ label: "Voltage Phase 3", value: check.motor_voltage_phase3, category: "Motor" });
        break;

      case 'ahu':
        if (check.airflow_reading !== null) readings.push({ label: "Airflow", value: `${check.airflow_reading} ${check.airflow_unit || 'CFM'}`, category: "Performance" });
        if (check.motor_amperage_rla !== null) readings.push({ label: "Motor Amperage", value: check.motor_amperage_rla, category: "Motor" });
        if (check.ambient_temperature !== null) readings.push({ label: "Ambient Temperature", value: check.ambient_temperature, category: "Environment" });
        if (check.humidity_level !== null) readings.push({ label: "Humidity Level", value: `${check.humidity_level}%`, category: "Environment" });
        break;

      case 'cooling_tower':
        if (check.water_ph_level !== null) readings.push({ label: "Water pH Level", value: check.water_ph_level, category: "Water Quality" });
        if (check.water_conductivity !== null) readings.push({ label: "Water Conductivity", value: check.water_conductivity, category: "Water Quality" });
        if (check.city_conductivity_us_cm !== null) readings.push({ label: "City Conductivity", value: `${check.city_conductivity_us_cm} μS/cm`, category: "Water Quality" });
        if (check.tower_conductivity_us_cm !== null) readings.push({ label: "Tower Conductivity", value: `${check.tower_conductivity_us_cm} μS/cm`, category: "Water Quality" });
        break;
    }

    return readings;
  };

  // Get equipment conditions
  const getEquipmentConditions = () => {
    const conditions: { label: string; value: any; status: 'good' | 'warning' | 'critical' }[] = [];
    const equipmentType = check.equipment_type?.toLowerCase();

    const addCondition = (label: string, value: any, getStatus?: (val: any) => 'good' | 'warning' | 'critical') => {
      if (value !== null && value !== undefined) {
        const status = getStatus ? getStatus(value) : 
          (value === 'good' || value === 'normal' || value === 'clean' || value === 'working') ? 'good' :
          (value === 'fair' || value === 'minor_issues') ? 'warning' : 'critical';
        conditions.push({ label, value, status });
      }
    };

    switch (equipmentType) {
      case 'chiller':
        addCondition("Evaporator Condition", check.evaporator_condition);
        addCondition("Condenser Condition", check.condenser_condition);
        addCondition("Compressor Condition", check.compressor_condition);
        addCondition("Motor Condition", check.motor_condition);
        addCondition("Control System", check.control_system_status);
        break;
      
      case 'ahu':
        addCondition("Air Filter Status", check.air_filter_status);
        addCondition("Belt Condition", check.belt_condition);
        addCondition("Motor Condition", check.motor_condition);
        addCondition("Coils Condition", check.coils_condition);
        addCondition("Dampers Operation", check.dampers_operation);
        addCondition("Control Panel", check.control_panel_condition);
        break;

      case 'cooling_tower':
        addCondition("Fill Media", check.fill_media_condition);
        addCondition("Fan Assembly", check.fan_assembly_status);
        addCondition("Water System", check.water_system_status);
        addCondition("Pump Seals", check.pump_seals_condition);
        addCondition("Drift Eliminators", check.drift_eliminators_condition);
        break;

      case 'restroom':
        addCondition("Sink Status", check.sink_status);
        addCondition("Toilet Status", check.toilet_status);
        addCondition("Urinal Status", check.urinal_status);
        addCondition("Hand Dryer", check.hand_dryer_status);
        addCondition("Cleanliness Level", check.cleanliness_level);
        addCondition("Floor Condition", check.floor_condition);
        break;

      case 'elevator':
        addCondition("Elevator Operation", check.elevator_operation);
        addCondition("Door Operation", check.door_operation);
        addCondition("Emergency Phone", check.emergency_phone);
        addCondition("Lighting", check.elevator_lighting);
        addCondition("Safety Features", check.safety_features_status);
        break;
    }

    return conditions;
  };

  const readings = getEquipmentReadings();
  const conditions = getEquipmentConditions();

  // Group readings by category
  const groupedReadings = readings.reduce((acc, reading) => {
    if (!acc[reading.category]) acc[reading.category] = [];
    acc[reading.category].push(reading);
    return acc;
  }, {} as Record<string, typeof readings>);

  const getConditionBadge = (status: 'good' | 'warning' | 'critical') => {
    const variants = {
      good: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800", 
      critical: "bg-red-100 text-red-800"
    };
    return `${variants[status]} text-xs px-2 py-1 rounded-full`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {getEquipmentName()}
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {getLocationName()}
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {getTechnicianName()}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(check.check_date || ""), "MMM dd, yyyy 'at' h:mm a")}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(check.status || 'unknown')}
              {check.equipment_type && (
                <Badge variant="outline" className="text-xs">
                  {check.equipment_type.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Completion Progress */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Check Completion</span>
                <span className="text-sm text-gray-600">
                  {completion.completed}/{completion.total} critical items
                </span>
              </div>
              <Progress value={completion.percentage} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {completion.percentage}% of critical maintenance items completed
              </p>
            </CardContent>
          </Card>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="readings" className="flex items-center gap-1">
              <Gauge className="h-4 w-4" />
              Readings
            </TabsTrigger>
            <TabsTrigger value="conditions" className="flex items-center gap-1">
              <Wrench className="h-4 w-4" />
              Conditions
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Notes
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-blue-600" />
                      Key Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {readings.slice(0, 4).map((reading, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{reading.label}</span>
                        <span className="font-medium">{formatFieldValue(reading.value, reading.label.toLowerCase())}</span>
                      </div>
                    ))}
                    {readings.length === 0 && (
                      <p className="text-sm text-gray-500">No numeric readings available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {conditions.slice(0, 4).map((condition, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{condition.label}</span>
                        <Badge className={getConditionBadge(condition.status)}>
                          {formatFieldValue(condition.value, condition.label.toLowerCase())}
                        </Badge>
                      </div>
                    ))}
                    {conditions.length === 0 && (
                      <p className="text-sm text-gray-500">No condition data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="readings" className="space-y-4">
              {Object.keys(groupedReadings).length > 0 ? (
                Object.entries(groupedReadings).map(([category, categoryReadings]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="text-lg">{category} Readings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {categoryReadings.map((reading, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">{reading.label}</span>
                            <span className="text-lg font-bold text-gray-900">
                              {formatFieldValue(reading.value, reading.label.toLowerCase())}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Gauge className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No numeric readings available for this equipment type</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="conditions" className="space-y-4">
              {conditions.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Equipment Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {conditions.map((condition, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {condition.status === 'good' && <CheckCircle className="h-5 w-5 text-green-600" />}
                            {condition.status === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                            {condition.status === 'critical' && <XCircle className="h-5 w-5 text-red-600" />}
                            <span className="font-medium">{condition.label}</span>
                          </div>
                          <Badge className={getConditionBadge(condition.status)}>
                            {formatFieldValue(condition.value, condition.label.toLowerCase())}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No condition data available for this equipment</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Maintenance Notes & Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {check.notes && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">General Notes</h4>
                      <p className="text-blue-800">{check.notes}</p>
                    </div>
                  )}
                  {check.maintenance_recommendations && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Recommendations</h4>
                      <p className="text-green-800">{check.maintenance_recommendations}</p>
                    </div>
                  )}
                  {check.troubleshooting_notes && (
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">Troubleshooting Notes</h4>
                      <p className="text-yellow-800">{check.troubleshooting_notes}</p>
                    </div>
                  )}
                  {check.corrective_actions && (
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2">Corrective Actions</h4>
                      <p className="text-red-800">{check.corrective_actions}</p>
                    </div>
                  )}
                  {check.restroom_notes && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Restroom Specific Notes</h4>
                      <p className="text-purple-800">{check.restroom_notes}</p>
                    </div>
                  )}
                  {check.elevator_notes && (
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <h4 className="font-medium text-indigo-900 mb-2">Elevator Specific Notes</h4>
                      <p className="text-indigo-800">{check.elevator_notes}</p>
                    </div>
                  )}
                  {!check.notes && !check.maintenance_recommendations && !check.troubleshooting_notes && 
                   !check.corrective_actions && !check.restroom_notes && !check.elevator_notes && (
                    <div className="p-8 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No notes or recommendations available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedMaintenanceDetails;