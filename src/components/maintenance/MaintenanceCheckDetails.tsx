import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MaintenanceCheck } from "@/types/maintenance";
import { ScrollArea } from "@/components/ui/scroll-area";
import MaintenanceStatusBadge from "./details/MaintenanceStatusBadge";
import MaintenanceDetailsSection from "./details/MaintenanceDetailsSection";

interface MaintenanceCheckDetailsProps {
  check: MaintenanceCheck;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MaintenanceCheckDetails = ({ check, open, onOpenChange }: MaintenanceCheckDetailsProps) => {
  const getTechnicianName = () => {
    if (!check.technician) return "Unassigned";
    return `${check.technician.firstName} ${check.technician.lastName}`;
  };

  const getLocationName = () => {
    // First try to get from the location object (from location_id)
    if (check.location?.name) {
      return check.location.store_number 
        ? `${check.location.name} (${check.location.store_number})`
        : check.location.name;
    }
    
    // Fallback to equipment location if location object is not available
    return check.equipment?.location || "Location Not Available";
  };

  // Determine equipment type
  const equipmentType = check.equipment_type || 'general';
  console.log('=== MaintenanceCheckDetails Debug ===');
  console.log('Equipment type:', equipmentType);
  console.log('Check data sample:', {
    id: check.id,
    equipment_type: check.equipment_type,
    evaporator_leaving_water_temp: check.evaporator_leaving_water_temp,
    evaporator_entering_water_temp: check.evaporator_entering_water_temp,
    compressor_suction_temp: check.compressor_suction_temp,
    motor_amperage_rla: check.motor_amperage_rla,
    air_filter_status: check.air_filter_status,
    motor_condition: check.motor_condition
  });

  const basicFields = [
    { label: "Date", value: new Date(check.check_date || "") },
    { label: "Equipment", value: check.equipment?.name || "Equipment Not Available" },
    { label: "Location", value: getLocationName() },
    { label: "Technician", value: getTechnicianName() },
  ];

  // Helper function to create field objects that include null values
  const createFieldsArray = (fieldDefinitions: Array<{ label: string; key: string; isNumeric?: boolean; isRequired?: boolean }>) => {
    return fieldDefinitions.map(({ label, key, isNumeric, isRequired }) => {
      const value = (check as any)[key];
      return { label, value: value !== undefined ? value : null, isRequired: isRequired || false };
    }).filter(field => {
      // Only filter out undefined values, keep null values to show as "Not Checked"
      return field.value !== undefined;
    });
  };

  // Calculate completion percentage for critical fields
  const calculateCompletionPercentage = () => {
    if (equipmentType !== 'chiller') return null;
    
    const criticalFields = [
      'evaporator_leaving_water_temp',
      'evaporator_entering_water_temp', 
      'condenser_entering_water_temp',
      'condenser_leaving_water_temp',
      'compressor_suction_temp',
      'compressor_discharge_temp',
      'motor_amperage_rla'
    ];
    
    const completedFields = criticalFields.filter(field => {
      const value = (check as any)[field];
      return value !== null && value !== undefined && value !== '';
    });
    
    return Math.round((completedFields.length / criticalFields.length) * 100);
  };

  // AHU-specific fields - using correct database field names
  const ahuFieldDefinitions = [
    { label: "Air Filter Status", key: "air_filter_status" },
    { label: "Air Filter Cleaned", key: "air_filter_cleaned" },
    { label: "Fan Belt Condition", key: "fan_belt_condition" },
    { label: "Fan Bearings Lubricated", key: "fan_bearings_lubricated" },
    { label: "Fan Noise Level", key: "fan_noise_level" },
    { label: "Dampers Operation", key: "dampers_operation" },
    { label: "Coils Condition", key: "coils_condition" },
    { label: "Coils Cleaned", key: "coils_cleaned" },
    { label: "Sensors Operation", key: "sensors_operation" },
    { label: "Motor Condition", key: "motor_condition" },
    { label: "Drain Pan Status", key: "drain_pan_status" },
    { label: "Belt Condition", key: "belt_condition" },
    { label: "Belts Inspected", key: "belts_inspected" },
    { label: "Bearings Lubricated", key: "bearings_lubricated" },
    { label: "Electrical Connections", key: "electrical_connections_condition" },
    { label: "Control Panel Condition", key: "control_panel_condition" },
    { label: "Safety Switches Status", key: "safety_switches_status" },
    { label: "System Efficiency Rating", key: "system_efficiency_rating" },
    { label: "Energy Consumption (kWh)", key: "energy_consumption_kwh" },
    { label: "Operating Hours", key: "operating_hours" },
    { label: "Ambient Temperature (°F)", key: "ambient_temperature" },
    { label: "Humidity Level (%)", key: "humidity_level" },
  ];

  const ahuFields = createFieldsArray(ahuFieldDefinitions);
  
  if (check.airflow_reading !== undefined && check.airflow_reading !== null) {
    ahuFields.push({ 
      label: "Airflow Reading", 
      value: `${check.airflow_reading} ${check.airflow_unit || ''}`.trim(),
      isRequired: false
    });
  }

  // Elevator-specific fields - comprehensive coverage
  const elevatorFieldDefinitions = [
    { label: "Elevator Operation", key: "elevator_operation" },
    { label: "Door Operation", key: "door_operation" },
    { label: "Emergency Phone", key: "emergency_phone" },
    { label: "Elevator Lighting", key: "elevator_lighting" },
    { label: "Safety Features Status", key: "safety_features_status" },
    { label: "Unusual Noise (Elevator)", key: "unusual_noise_elevator" },
    { label: "Vibration (Elevator)", key: "vibration_elevator" },
    { label: "Control System Status", key: "control_system_status" },
    { label: "Maintenance Frequency", key: "maintenance_frequency" },
  ];

  const elevatorFields = createFieldsArray(elevatorFieldDefinitions);

  // Restroom-specific fields - comprehensive coverage
  const restroomFieldDefinitions = [
    { label: "Sink Status", key: "sink_status" },
    { label: "Toilet Status", key: "toilet_status" },
    { label: "Urinal Status", key: "urinal_status" },
    { label: "Hand Dryer Status", key: "hand_dryer_status" },
    { label: "Cleanliness Level", key: "cleanliness_level" },
    { label: "Soap Supply", key: "soap_supply" },
    { label: "Toilet Paper Supply", key: "toilet_paper_supply" },
    { label: "Floor Condition", key: "floor_condition" },
    { label: "Maintenance Frequency", key: "maintenance_frequency" },
  ];

  const restroomFields = createFieldsArray(restroomFieldDefinitions);

  // Cooling Tower fields - comprehensive coverage
  const coolingTowerFieldDefinitions = [
    { label: "Fill Media Condition", key: "fill_media_condition" },
    { label: "Drift Eliminators Condition", key: "drift_eliminators_condition" },
    { label: "Fan Assembly Status", key: "fan_assembly_status" },
    { label: "Motor Lubrication Status", key: "motor_lubrication_status" },
    { label: "Pump Seals Condition", key: "pump_seals_condition" },
    { label: "Strainer Status", key: "strainer_status" },
    { label: "Sump Basin Condition", key: "sump_basin_condition" },
    { label: "Water System Status", key: "water_system_status" },
    { label: "Drainage System Status", key: "drainage_system_status" },
    { label: "Control System Status", key: "control_system_status" },
    { label: "Sensor Status", key: "sensor_status" },
    { label: "Seasonal Preparation Status", key: "seasonal_preparation_status" },
    { label: "Vibration Monitoring", key: "vibration_monitoring" },
    { label: "Emergency Shutdown Status", key: "emergency_shutdown_status" },
    { label: "Water pH Level", key: "water_ph_level" },
    { label: "Water Conductivity", key: "water_conductivity" },
    { label: "Chemical Treatment Status", key: "chemical_treatment_status" },
    { label: "Unusual Noise", key: "unusual_noise" },
    { label: "Vibration Observed", key: "vibration_observed" },
    { label: "Maintenance Frequency", key: "maintenance_frequency" },
    { label: "Filters Replaced", key: "filters_replaced" },
    { label: "Coils Cleaned", key: "coils_cleaned" },
    { label: "Belts Inspected", key: "belts_inspected" },
    { label: "Bearings Lubricated", key: "bearings_lubricated" },
  ];

  const coolingTowerFields = createFieldsArray(coolingTowerFieldDefinitions);
  
  // Add numeric fields for cooling tower
  if (check.city_conductivity_us_cm !== undefined) {
    coolingTowerFields.push({ 
      label: "City Conductivity (μS/cm)", 
      value: check.city_conductivity_us_cm,
      isRequired: false
    });
  }
  
  if (check.tower_conductivity_us_cm !== undefined) {
    coolingTowerFields.push({ 
      label: "Tower Conductivity (μS/cm)", 
      value: check.tower_conductivity_us_cm,
      isRequired: false
    });
  }

  // Comprehensive Chiller fields - using correct database field names from chillerDataMapper
  const comprehensiveChillerFieldDefinitions = [
    // Evaporator section - critical readings (required)
    { label: "Evaporator Leaving Water Temp (°F)", key: "evaporator_leaving_water_temp", isRequired: true },
    { label: "Evaporator Entering Water Temp (°F)", key: "evaporator_entering_water_temp", isRequired: true },
    { label: "Evaporator Approach Temp (°F)", key: "evaporator_approach_temp" },
    { label: "Evaporator Pressure Drop (PSIG)", key: "evaporator_pressure_drop" },
    { label: "Evaporator Flow Rate", key: "evaporator_flow_rate" },
    { label: "Evaporator Condition", key: "evaporator_condition" },
    
    // Condenser section - critical readings (required)
    { label: "Condenser Entering Water Temp (°F)", key: "condenser_entering_water_temp", isRequired: true },
    { label: "Condenser Leaving Water Temp (°F)", key: "condenser_leaving_water_temp", isRequired: true },
    { label: "Condenser Approach Temp (°F)", key: "condenser_approach_temp" },
    { label: "Condenser Pressure Drop (PSIG)", key: "condenser_pressure_drop" },
    { label: "Condenser Flow Rate", key: "condenser_flow_rate" },
    { label: "Condenser Condition", key: "condenser_condition" },
    
    // Compressor section
    { label: "Compressor Suction Temp (°F)", key: "compressor_suction_temp", isRequired: true },
    { label: "Compressor Discharge Temp (°F)", key: "compressor_discharge_temp", isRequired: true },
    { label: "Compressor Suction Pressure (PSIG)", key: "compressor_suction_pressure" },
    { label: "Compressor Discharge Pressure (PSIG)", key: "compressor_discharge_pressure" },
    { label: "Compressor Superheat (°F)", key: "compressor_superheat" },
    { label: "Compressor Subcooling (°F)", key: "compressor_subcooling" },
    { label: "Compressor Oil Pressure (PSIG)", key: "compressor_oil_pressure" },
    { label: "Compressor Oil Temp (°F)", key: "compressor_oil_temp" },
    { label: "Compressor Condition", key: "compressor_condition" },
    
    // Motor section
    { label: "Motor Amperage % RLA", key: "motor_amperage_rla", isRequired: true },
    { label: "Motor Voltage Phase 1 (V)", key: "motor_voltage_phase1" },
    { label: "Motor Voltage Phase 2 (V)", key: "motor_voltage_phase2" },
    { label: "Motor Voltage Phase 3 (V)", key: "motor_voltage_phase3" },
    { label: "Motor Temperature (°F)", key: "motor_temperature" },
    { label: "Motor Vibration", key: "motor_vibration" },
    
    // Performance metrics
    { label: "System Efficiency Rating", key: "system_efficiency_rating" },
    { label: "Energy Consumption (kWh)", key: "energy_consumption_kwh" },
    { label: "Operating Hours", key: "operating_hours" },
    { label: "Cooling Capacity (Tons)", key: "cooling_capacity_tons" },
    { label: "Efficiency COP", key: "efficiency_cop" },
    
    // Water treatment
    { label: "Water pH Level", key: "water_ph_level" },
    { label: "Water Conductivity", key: "water_conductivity" },
    { label: "Chemical Treatment Status", key: "chemical_treatment_status" },
    
    // Maintenance actions
    { label: "Filters Replaced", key: "filters_replaced" },
    { label: "Coils Cleaned", key: "coils_cleaned" },
    { label: "Belts Inspected", key: "belts_inspected" },
    { label: "Bearings Lubricated", key: "bearings_lubricated" },
    { label: "Refrigerant Checked", key: "refrigerant_checked" },
    
    // Electrical and safety
    { label: "Electrical Connections", key: "electrical_connections_condition" },
    { label: "Control Panel Condition", key: "control_panel_condition" },
    { label: "Safety Switches Status", key: "safety_switches_status" },
    
    // Follow-up
    { label: "Inspection Notes", key: "inspection_notes" },
    { label: "Follow-up Required", key: "follow_up_required" },
    { label: "Next Inspection Date", key: "next_inspection_date" },
    { label: "Maintenance Duration (min)", key: "maintenance_duration_minutes" },
    { label: "Labor Cost ($)", key: "labor_cost" },
    { label: "Parts Cost ($)", key: "parts_cost" },
  ];

  const comprehensiveChillerFields = createFieldsArray(comprehensiveChillerFieldDefinitions);

  // Standard HVAC fields (for basic equipment and general RTU)
  const standardFieldDefinitions = [
    { label: "Chiller Pressure (PSI)", key: "chiller_pressure_reading", isNumeric: true },
    { label: "Chiller Temperature (°F)", key: "chiller_temperature_reading", isNumeric: true },
    { label: "Air Filter Status", key: "air_filter_status" },
    { label: "Belt Condition", key: "belt_condition" },
    { label: "Motor Condition", key: "motor_condition" },
    { label: "Refrigerant Level", key: "refrigerant_level" },
    { label: "Control System Status", key: "control_system_status" },
    { label: "Ambient Temperature (°F)", key: "ambient_temperature" },
    { label: "Humidity Level (%)", key: "humidity_level" },
    { label: "Maintenance Frequency", key: "maintenance_frequency" },
  ];

  const standardFields = createFieldsArray(standardFieldDefinitions);

  const observationFieldDefinitions = [
    { label: "Unusual Noise", key: "unusual_noise" },
    { label: "Vibration Observed", key: "vibration_observed" },
    { label: "Oil Level Status", key: "oil_level_status" },
    { label: "Condenser Condition", key: "condenser_condition" },
    { label: "Electrical Connections", key: "electrical_connections_condition" },
    { label: "Control Panel Condition", key: "control_panel_condition" },
    { label: "Safety Switches Status", key: "safety_switches_status" },
  ];

  const observationFields = createFieldsArray(observationFieldDefinitions);
  
  // Add description fields if the main field is true
  if (check.unusual_noise && check.unusual_noise_description) {
    observationFields.push({ label: "Noise Description", value: check.unusual_noise_description, isRequired: false });
  }
  
  if (check.vibration_observed && check.vibration_description) {
    observationFields.push({ label: "Vibration Description", value: check.vibration_description, isRequired: false });
  }

  const notesFields = [
    { label: "Troubleshooting Notes", value: check.troubleshooting_notes },
    { label: "Corrective Actions", value: check.corrective_actions },
    { label: "Maintenance Recommendations", value: check.maintenance_recommendations },
    { label: "Restroom Notes", value: check.restroom_notes },
    { label: "Elevator Notes", value: check.elevator_notes },
    { label: "General Notes", value: check.notes },
  ].filter(field => field.value !== null && field.value !== undefined && field.value !== "");

  const getNotes = () => {
    if (equipmentType === 'restroom' && check.restroom_notes) {
      return [{ label: "Notes", value: check.restroom_notes }];
    }
    if (equipmentType === 'elevator' && check.elevator_notes) {
      return [{ label: "Notes", value: check.elevator_notes }];
    }
    if (check.notes) {
      return [{ label: "Notes", value: check.notes }];
    }
    return [];
  };

  // Get the appropriate fields based on equipment type
  const getEquipmentSpecificFields = () => {
    console.log('Getting equipment specific fields for type:', equipmentType.toLowerCase());
    
    switch (equipmentType.toLowerCase()) {
      case 'ahu':
        console.log('Showing AHU fields, count:', ahuFields.length);
        return (
          <MaintenanceDetailsSection title="AHU Specific Checks" fields={ahuFields} />
        );
      case 'elevator':
        console.log('Showing Elevator fields, count:', elevatorFields.length);
        return (
          <MaintenanceDetailsSection title="Elevator Inspection" fields={elevatorFields} />
        );
      case 'restroom':
        console.log('Showing Restroom fields, count:', restroomFields.length);
        return (
          <MaintenanceDetailsSection title="Restroom Inspection" fields={restroomFields} />
        );
      case 'cooling_tower':
        console.log('Showing Cooling Tower fields, count:', coolingTowerFields.length);
        return (
          <MaintenanceDetailsSection title="Cooling Tower Inspection" fields={coolingTowerFields} />
        );
      case 'chiller':
        console.log('Showing Comprehensive Chiller fields, count:', comprehensiveChillerFields.length);
        const completionPercentage = calculateCompletionPercentage();
        return (
          <>
            {completionPercentage !== null && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-900">Critical Fields Completion</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    completionPercentage >= 80 ? 'bg-green-100 text-green-800' :
                    completionPercentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {completionPercentage}% Complete
                  </span>
                </div>
                {completionPercentage < 100 && (
                  <p className="text-sm text-blue-700 mt-2">
                    This maintenance check is missing some critical chiller readings.
                  </p>
                )}
              </div>
            )}
            {comprehensiveChillerFields.length > 0 && (
              <MaintenanceDetailsSection title="Chiller System Readings" fields={comprehensiveChillerFields} />
            )}
            {observationFields.length > 0 && (
              <MaintenanceDetailsSection title="Observations" fields={observationFields} />
            )}
          </>
        );
      case 'general':
      default:
        console.log('Showing Standard/General fields. Standard count:', standardFields.length, 'Observation count:', observationFields.length);
        return (
          <>
            {standardFields.length > 0 && (
              <MaintenanceDetailsSection title="Equipment Readings" fields={standardFields} />
            )}
            {observationFields.length > 0 && (
              <MaintenanceDetailsSection title="Observations" fields={observationFields} />
            )}
          </>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {check.equipment?.name || 'Equipment Name Not Available'}
            </DialogTitle>
            <MaintenanceStatusBadge status={check.status} />
          </div>
          <div className="text-sm text-gray-600">
            Location: {getLocationName()}
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] px-1">
          <div className="space-y-6">
            <MaintenanceDetailsSection title="Basic Information" fields={basicFields} />
            
            {/* Show only equipment-specific fields */}
            {getEquipmentSpecificFields()}
            
            {/* Show notes if any */}
            {notesFields.length > 0 && (
              <MaintenanceDetailsSection title="Notes and Recommendations" fields={notesFields} />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceCheckDetails;
