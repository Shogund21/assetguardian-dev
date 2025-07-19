
-- Fix location display in maintenance history by properly joining with locations table
DROP FUNCTION IF EXISTS public.get_maintenance_history(uuid, integer, integer);

CREATE OR REPLACE FUNCTION public.get_maintenance_history(
    p_equipment_id uuid DEFAULT NULL,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0
)
RETURNS TABLE(
    id uuid,
    equipment_id uuid,
    technician_id uuid,
    check_date timestamp with time zone,
    status maintenance_check_status,
    equipment_name text,
    equipment_type text,
    equipment_location text,
    technician_name text,
    notes text,
    company_id uuid,
    location_id uuid,
    location_name text,
    location_store_number text,
    maintenance_frequency text,
    reading_mode text,
    -- Standard HVAC fields
    chiller_pressure_reading numeric,
    chiller_temperature_reading numeric,
    air_filter_status text,
    belt_condition text,
    refrigerant_level text,
    unusual_noise boolean,
    vibration_observed boolean,
    oil_level_status text,
    condenser_condition text,
    unusual_noise_description text,
    vibration_description text,
    -- AHU specific fields
    air_filter_cleaned boolean,
    fan_belt_condition text,
    fan_bearings_lubricated boolean,
    fan_noise_level text,
    dampers_operation text,
    coils_condition text,
    sensors_operation text,
    motor_condition text,
    drain_pan_status text,
    airflow_reading numeric,
    airflow_unit character varying(10),
    troubleshooting_notes text,
    corrective_actions text,
    maintenance_recommendations text,
    -- Elevator fields
    elevator_operation text,
    door_operation text,
    unusual_noise_elevator boolean,
    vibration_elevator boolean,
    emergency_phone text,
    elevator_lighting text,
    elevator_notes text,
    safety_features_status text,
    -- Restroom fields
    sink_status text,
    toilet_status text,
    urinal_status text,
    hand_dryer_status text,
    cleanliness_level text,
    soap_supply text,
    toilet_paper_supply text,
    floor_condition text,
    restroom_notes text,
    -- Cooling Tower fields
    fill_media_condition text,
    drift_eliminators_condition text,
    fan_assembly_status text,
    motor_lubrication_status text,
    pump_seals_condition text,
    strainer_status text,
    sump_basin_condition text,
    water_system_status text,
    drainage_system_status text,
    control_system_status text,
    sensor_status text,
    seasonal_preparation_status text,
    vibration_monitoring text,
    emergency_shutdown_status text,
    city_conductivity_us_cm numeric,
    tower_conductivity_us_cm numeric,
    -- Additional fields
    general_inspection text,
    images text[]
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
    is_super_admin_user boolean;
    user_company_id uuid;
BEGIN
    -- Check if user is super admin
    is_super_admin_user := public.is_super_admin();
    
    -- Get user's company ID if not super admin
    IF NOT is_super_admin_user THEN
        SELECT cu.company_id INTO user_company_id
        FROM public.company_users cu
        WHERE cu.user_id = auth.uid()::text
        LIMIT 1;
    END IF;
    
    RETURN QUERY
    SELECT 
        h.id,
        h.equipment_id,
        h.technician_id,
        h.check_date,
        h.status,
        e.name::text as equipment_name,
        COALESCE(h.equipment_type, e.type)::text as equipment_type,
        e.location::text as equipment_location,
        CONCAT(t."firstName", ' ', t."lastName")::text as technician_name,
        h.notes::text,
        h.company_id,
        h.location_id,
        -- Use location name from locations table if available, fallback to equipment location
        COALESCE(l.name, e.location)::text as location_name,
        l.store_number::text as location_store_number,
        h.maintenance_frequency,
        h.reading_mode,
        -- Standard HVAC fields
        h.chiller_pressure_reading,
        h.chiller_temperature_reading,
        h.air_filter_status,
        h.belt_condition,
        h.refrigerant_level,
        h.unusual_noise,
        h.vibration_observed,
        h.oil_level_status,
        h.condenser_condition,
        h.unusual_noise_description,
        h.vibration_description,
        -- AHU specific fields
        h.air_filter_cleaned,
        h.fan_belt_condition,
        h.fan_bearings_lubricated,
        h.fan_noise_level,
        h.dampers_operation,
        h.coils_condition,
        h.sensors_operation,
        h.motor_condition,
        h.drain_pan_status,
        h.airflow_reading,
        h.airflow_unit,
        h.troubleshooting_notes,
        h.corrective_actions,
        h.maintenance_recommendations,
        -- Elevator fields
        h.elevator_operation,
        h.door_operation,
        h.unusual_noise_elevator,
        h.vibration_elevator,
        h.emergency_phone,
        h.elevator_lighting,
        h.elevator_notes,
        h.safety_features_status,
        -- Restroom fields
        h.sink_status,
        h.toilet_status,
        h.urinal_status,
        h.hand_dryer_status,
        h.cleanliness_level,
        h.soap_supply,
        h.toilet_paper_supply,
        h.floor_condition,
        h.restroom_notes,
        -- Cooling Tower fields
        h.fill_media_condition,
        h.drift_eliminators_condition,
        h.fan_assembly_status,
        h.motor_lubrication_status,
        h.pump_seals_condition,
        h.strainer_status,
        h.sump_basin_condition,
        h.water_system_status,
        h.drainage_system_status,
        h.control_system_status,
        h.sensor_status,
        h.seasonal_preparation_status,
        h.vibration_monitoring,
        h.emergency_shutdown_status,
        h.city_conductivity_us_cm,
        h.tower_conductivity_us_cm,
        -- Additional fields
        h.general_inspection,
        h.images
    FROM public.hvac_maintenance_checks h
    LEFT JOIN public.equipment e ON e.id = h.equipment_id
    LEFT JOIN public.technicians t ON t.id = h.technician_id
    LEFT JOIN public.locations l ON l.id = h.location_id
    WHERE (
        (is_super_admin_user) OR 
        (NOT is_super_admin_user AND h.company_id = user_company_id)
    )
    AND (p_equipment_id IS NULL OR h.equipment_id = p_equipment_id)
    ORDER BY h.check_date DESC
    LIMIT LEAST(p_limit, 500)
    OFFSET p_offset;
END;
$$;
