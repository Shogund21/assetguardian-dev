
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

  const basicFields = [
    { label: "Date", value: new Date(check.check_date || "") },
    { label: "Equipment", value: check.equipment?.name || "Equipment Not Available" },
    { label: "Location", value: getLocationName() },
    { label: "Technician", value: getTechnicianName() },
  ];

  // AHU-specific fields
  const ahuFields = [
    { label: "Air Filter Cleaned", value: check.air_filter_cleaned },
    { label: "Fan Belt Condition", value: check.fan_belt_condition },
    { label: "Fan Bearings Lubricated", value: check.fan_bearings_lubricated },
    { label: "Fan Noise Level", value: check.fan_noise_level },
    { label: "Dampers Operation", value: check.dampers_operation },
    { label: "Coils Condition", value: check.coils_condition },
    { label: "Sensors Operation", value: check.sensors_operation },
    { label: "Motor Condition", value: check.motor_condition },
    { label: "Drain Pan Status", value: check.drain_pan_status },
  ];

  if (check.airflow_reading) {
    ahuFields.push({ 
      label: "Airflow Reading", 
      value: `${check.airflow_reading} ${check.airflow_unit}` 
    });
  }

  // Elevator-specific fields
  const elevatorFields = [
    { label: "Elevator Operation", value: check.elevator_operation },
    { label: "Door Operation", value: check.door_operation },
    { label: "Emergency Phone", value: check.emergency_phone },
    { label: "Elevator Lighting", value: check.elevator_lighting },
    { label: "Safety Features Status", value: check.safety_features_status },
  ].filter(field => field.value);

  // Restroom-specific fields
  const restroomFields = [
    { label: "Sink Status", value: check.sink_status },
    { label: "Toilet Status", value: check.toilet_status },
    { label: "Urinal Status", value: check.urinal_status },
    { label: "Hand Dryer Status", value: check.hand_dryer_status },
    { label: "Cleanliness Level", value: check.cleanliness_level },
    { label: "Soap Supply", value: check.soap_supply },
    { label: "Toilet Paper Supply", value: check.toilet_paper_supply },
    { label: "Floor Condition", value: check.floor_condition },
  ].filter(field => field.value);

  // Cooling Tower fields
  const coolingTowerFields = [
    { label: "Fill Media Condition", value: check.fill_media_condition },
    { label: "Drift Eliminators Condition", value: check.drift_eliminators_condition },
    { label: "Fan Assembly Status", value: check.fan_assembly_status },
    { label: "Motor Lubrication Status", value: check.motor_lubrication_status },
    { label: "Pump Seals Condition", value: check.pump_seals_condition },
    { label: "Strainer Status", value: check.strainer_status },
    { label: "Sump Basin Condition", value: check.sump_basin_condition },
    { label: "Water System Status", value: check.water_system_status },
    { label: "Drainage System Status", value: check.drainage_system_status },
    { label: "Control System Status", value: check.control_system_status },
    { label: "Sensor Status", value: check.sensor_status },
    { label: "Seasonal Preparation Status", value: check.seasonal_preparation_status },
    { label: "Vibration Monitoring", value: check.vibration_monitoring },
    { label: "Emergency Shutdown Status", value: check.emergency_shutdown_status },
    { label: "City Conductivity (μS/cm)", value: check.city_conductivity_us_cm },
    { label: "Tower Conductivity (μS/cm)", value: check.tower_conductivity_us_cm },
  ].filter(field => field.value !== null && field.value !== undefined && field.value !== "");

  // Standard HVAC fields (chiller and general)
  const standardFields = [
    { label: "Chiller Pressure (PSI)", value: check.chiller_pressure_reading },
    { label: "Chiller Temperature (°F)", value: check.chiller_temperature_reading },
    { label: "Air Filter Status", value: check.air_filter_status },
    { label: "Belt Condition", value: check.belt_condition },
    { label: "Refrigerant Level", value: check.refrigerant_level },
  ].filter(field => field.value);

  const observationFields = [
    { label: "Unusual Noise", value: check.unusual_noise },
    ...(check.unusual_noise ? [{ label: "Noise Description", value: check.unusual_noise_description }] : []),
    { label: "Vibration Observed", value: check.vibration_observed },
    ...(check.vibration_observed ? [{ label: "Vibration Description", value: check.vibration_description }] : []),
    { label: "Oil Level Status", value: check.oil_level_status },
    { label: "Condenser Condition", value: check.condenser_condition },
  ].filter(field => field.value);

  const notesFields = [
    { label: "Troubleshooting Notes", value: check.troubleshooting_notes },
    { label: "Corrective Actions", value: check.corrective_actions },
    { label: "Maintenance Recommendations", value: check.maintenance_recommendations },
    { label: "Restroom Notes", value: check.restroom_notes },
    { label: "Elevator Notes", value: check.elevator_notes },
  ].filter(field => field.value);

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
    switch (equipmentType.toLowerCase()) {
      case 'ahu':
        return (
          <MaintenanceDetailsSection title="AHU Specific Checks" fields={ahuFields} />
        );
      case 'elevator':
        return (
          <MaintenanceDetailsSection title="Elevator Inspection" fields={elevatorFields} />
        );
      case 'restroom':
        return (
          <MaintenanceDetailsSection title="Restroom Inspection" fields={restroomFields} />
        );
      case 'cooling_tower':
        return (
          <MaintenanceDetailsSection title="Cooling Tower Inspection" fields={coolingTowerFields} />
        );
      case 'chiller':
      case 'general':
      default:
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
