-- Fix the get_maintenance_history function to properly return equipment and technician names
CREATE OR REPLACE FUNCTION public.get_maintenance_history(
    p_equipment_id uuid DEFAULT NULL,
    p_limit integer DEFAULT 100,
    p_offset integer DEFAULT 0
)
RETURNS TABLE(
    id uuid,
    equipment_id uuid,
    technician_id uuid,
    company_id uuid,
    location_id uuid,
    check_date timestamp with time zone,
    status maintenance_check_status,
    equipment_type text,
    -- Equipment info
    equipment_name text,
    equipment_location text,
    -- Technician info  
    technician_name text,
    technician_first_name text,
    technician_last_name text,
    -- Location info
    location_name text,
    location_store_number text,
    -- All maintenance check fields
    air_filter_status text,
    belt_condition text,
    motor_condition text,
    control_system_status text,
    notes text,
    maintenance_frequency text,
    airflow_reading numeric,
    airflow_unit text,
    -- Chiller specific fields
    evaporator_leaving_water_temp numeric,
    evaporator_entering_water_temp numeric,
    condenser_entering_water_temp numeric,
    condenser_leaving_water_temp numeric,
    compressor_suction_temp numeric,
    compressor_discharge_temp numeric,
    motor_amperage_rla numeric,
    motor_voltage_phase1 numeric,
    motor_voltage_phase2 numeric,
    motor_voltage_phase3 numeric,
    compressor_suction_pressure numeric,
    compressor_discharge_pressure numeric,
    evaporator_pressure_drop numeric,
    condenser_pressure_drop numeric,
    -- Equipment conditions
    evaporator_condition text,
    condenser_condition text,
    compressor_condition text,
    coils_condition text,
    dampers_operation text,
    control_panel_condition text,
    -- Cooling tower fields
    fill_media_condition text,
    fan_assembly_status text,
    water_system_status text,
    pump_seals_condition text,
    drift_eliminators_condition text,
    water_ph_level numeric,
    water_conductivity numeric,
    city_conductivity_us_cm numeric,
    tower_conductivity_us_cm numeric,
    chemical_treatment_status text,
    -- Restroom fields
    sink_status text,
    toilet_status text,
    urinal_status text,
    hand_dryer_status text,
    cleanliness_level text,
    floor_condition text,
    restroom_notes text,
    -- Elevator fields
    elevator_operation text,
    door_operation text,
    emergency_phone text,
    elevator_lighting text,
    safety_features_status text,
    elevator_notes text,
    unusual_noise_elevator boolean,
    vibration_elevator boolean,
    -- Additional fields
    maintenance_recommendations text,
    troubleshooting_notes text,
    corrective_actions text,
    ambient_temperature numeric,
    humidity_level numeric,
    unusual_noise boolean,
    vibration_observed boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        hmc.id,
        hmc.equipment_id,
        hmc.technician_id,
        hmc.company_id,
        hmc.location_id,
        hmc.check_date,
        hmc.status,
        hmc.equipment_type,
        -- Equipment info
        e.name as equipment_name,
        e.location as equipment_location,
        -- Technician info
        CASE 
            WHEN t."firstName" IS NOT NULL AND t."lastName" IS NOT NULL 
            THEN t."firstName" || ' ' || t."lastName"
            ELSE 'Technician Not Available'
        END as technician_name,
        t."firstName" as technician_first_name,
        t."lastName" as technician_last_name,
        -- Location info
        l.name as location_name,
        l.store_number as location_store_number,
        -- Maintenance check fields
        hmc.air_filter_status,
        hmc.belt_condition,
        hmc.motor_condition,
        hmc.control_system_status,
        hmc.notes,
        hmc.maintenance_frequency,
        hmc.airflow_reading,
        hmc.airflow_unit,
        -- Chiller specific fields
        hmc.evaporator_leaving_water_temp,
        hmc.evaporator_entering_water_temp,
        hmc.condenser_entering_water_temp,
        hmc.condenser_leaving_water_temp,
        hmc.compressor_suction_temp,
        hmc.compressor_discharge_temp,
        hmc.motor_amperage_rla,
        hmc.motor_voltage_phase1,
        hmc.motor_voltage_phase2,
        hmc.motor_voltage_phase3,
        hmc.compressor_suction_pressure,
        hmc.compressor_discharge_pressure,
        hmc.evaporator_pressure_drop,
        hmc.condenser_pressure_drop,
        -- Equipment conditions
        hmc.evaporator_condition,
        hmc.condenser_condition,
        hmc.compressor_condition,
        hmc.coils_condition,
        hmc.dampers_operation,
        hmc.control_panel_condition,
        -- Cooling tower fields
        hmc.fill_media_condition,
        hmc.fan_assembly_status,
        hmc.water_system_status,
        hmc.pump_seals_condition,
        hmc.drift_eliminators_condition,
        hmc.water_ph_level,
        hmc.water_conductivity,
        hmc.city_conductivity_us_cm,
        hmc.tower_conductivity_us_cm,
        hmc.chemical_treatment_status,
        -- Restroom fields
        hmc.sink_status,
        hmc.toilet_status,
        hmc.urinal_status,
        hmc.hand_dryer_status,
        hmc.cleanliness_level,
        hmc.floor_condition,
        hmc.restroom_notes,
        -- Elevator fields
        hmc.elevator_operation,
        hmc.door_operation,
        hmc.emergency_phone,
        hmc.elevator_lighting,
        hmc.safety_features_status,
        hmc.elevator_notes,
        hmc.unusual_noise_elevator,
        hmc.vibration_elevator,
        -- Additional fields
        hmc.maintenance_recommendations,
        hmc.troubleshooting_notes,
        hmc.corrective_actions,
        hmc.ambient_temperature,
        hmc.humidity_level,
        hmc.unusual_noise,
        hmc.vibration_observed,
        hmc.created_at,
        hmc.updated_at
    FROM public.hvac_maintenance_checks hmc
    LEFT JOIN public.equipment e ON e.id = hmc.equipment_id
    LEFT JOIN public.technicians t ON t.id = hmc.technician_id
    LEFT JOIN public.locations l ON l.id = hmc.location_id
    WHERE 
        -- RLS: User can only see data from their company or if super admin
        (
            hmc.company_id IS NULL OR 
            public.is_member_of(hmc.company_id) OR 
            public.can_access_all_data()
        )
        AND (p_equipment_id IS NULL OR hmc.equipment_id = p_equipment_id)
    ORDER BY hmc.check_date DESC, hmc.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;