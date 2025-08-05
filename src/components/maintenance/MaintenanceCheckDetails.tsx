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
  console.log('Equipment type for details:', equipmentType, 'Check data:', check);

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
      'condenser_leaving_water_temp'
    ];
    
    const completedFields = criticalFields.filter(field => {
      const value = (check as any)[field];
      return value !== null && value !== undefined && value !== '';
    });
    
    return Math.round((completedFields.length / criticalFields.length) * 100);
  };

  // AHU-specific fields
  const ahuFieldDefinitions = [
    { label: "Air Filter Cleaned", key: "air_filter_cleaned" },
    { label: "Fan Belt Condition", key: "fan_belt_condition" },
    { label: "Fan Bearings Lubricated", key: "fan_bearings_lubricated" },
    { label: "Fan Noise Level", key: "fan_noise_level" },
    { label: "Dampers Operation", key: "dampers_operation" },
    { label: "Coils Condition", key: "coils_condition" },
    { label: "Sensors Operation", key: "sensors_operation" },
    { label: "Motor Condition", key: "motor_condition" },
    { label: "Drain Pan Status", key: "drain_pan_status" },
  ];

  const ahuFields = createFieldsArray(ahuFieldDefinitions);
  
  if (check.airflow_reading !== undefined && check.airflow_reading !== null) {
    ahuFields.push({ 
      label: "Airflow Reading", 
      value: `${check.airflow_reading} ${check.airflow_unit || ''}`.trim(),
      isRequired: false
    });
  }

  // Elevator-specific fields
  const elevatorFieldDefinitions = [
    { label: "Elevator Operation", key: "elevator_operation" },
    { label: "Door Operation", key: "door_operation" },
    { label: "Emergency Phone", key: "emergency_phone" },
    { label: "Elevator Lighting", key: "elevator_lighting" },
    { label: "Safety Features Status", key: "safety_features_status" },
  ];

  const elevatorFields = createFieldsArray(elevatorFieldDefinitions);

  // Restroom-specific fields
  const restroomFieldDefinitions = [
    { label: "Sink Status", key: "sink_status" },
    { label: "Toilet Status", key: "toilet_status" },
    { label: "Urinal Status", key: "urinal_status" },
    { label: "Hand Dryer Status", key: "hand_dryer_status" },
    { label: "Cleanliness Level", key: "cleanliness_level" },
    { label: "Soap Supply", key: "soap_supply" },
    { label: "Toilet Paper Supply", key: "toilet_paper_supply" },
    { label: "Floor Condition", key: "floor_condition" },
  ];

  const restroomFields = createFieldsArray(restroomFieldDefinitions);

  // Cooling Tower fields - this is the main fix
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

  // Comprehensive Chiller fields for detailed chiller maintenance
  const comprehensiveChillerFieldDefinitions = [
    // Critical evaporator readings (required)
    { label: "Evaporator Leaving Water Temp (°F)", key: "evaporator_leaving_water_temp", isRequired: true },
    { label: "Evaporator Entering Water Temp (°F)", key: "evaporator_entering_water_temp", isRequired: true },
    { label: "Evap Sat Rfgt Temp (°F)", key: "evap_sat_rfgt_temp" },
    { label: "Evap Rfgt Pressure (PSIG)", key: "evap_rfgt_pressure" },
    { label: "Evap Approach Temp (°F)", key: "evap_approach_temp" },
    
    // Critical condenser readings (required)
    { label: "Condenser Entering Water Temp (°F)", key: "condenser_entering_water_temp", isRequired: true },
    { label: "Condenser Leaving Water Temp (°F)", key: "condenser_leaving_water_temp", isRequired: true },
    { label: "Cond Sat Rfgt Temp (°F)", key: "cond_sat_rfgt_temp" },
    { label: "Cond Rfgt Pressure (PSIG)", key: "cond_rfgt_pressure" },
    { label: "Cond Approach Temp (°F)", key: "cond_approach_temp" },
    
    // Compressor readings
    { label: "Compressor Running", key: "compressor_running_status" },
    { label: "Chiller Control Signal (%)", key: "chiller_control_signal" },
    { label: "Average Motor Current % RLA", key: "average_motor_current_pct_rla" },
    { label: "Oil Differential Pressure (PSID)", key: "oil_differential_pressure" },
    
    // Motor readings
    { label: "Motor Current (Amps)", key: "motor_current_amps" },
    { label: "Motor Voltage (Volts)", key: "motor_voltage" },
    { label: "Motor Power Factor", key: "motor_power_factor" },
  ];

  const comprehensiveChillerFields = createFieldsArray(comprehensiveChillerFieldDefinitions);

  // Standard HVAC fields (for basic chiller and general equipment)
  const standardFieldDefinitions = [
    { label: "Chiller Pressure (PSI)", key: "chiller_pressure_reading", isNumeric: true },
    { label: "Chiller Temperature (°F)", key: "chiller_temperature_reading", isNumeric: true },
    { label: "Air Filter Status", key: "air_filter_status" },
    { label: "Belt Condition", key: "belt_condition" },
    { label: "Refrigerant Level", key: "refrigerant_level" },
  ];

  const standardFields = createFieldsArray(standardFieldDefinitions);

  const observationFieldDefinitions = [
    { label: "Unusual Noise", key: "unusual_noise" },
    { label: "Vibration Observed", key: "vibration_observed" },
    { label: "Oil Level Status", key: "oil_level_status" },
    { label: "Condenser Condition", key: "condenser_condition" },
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
