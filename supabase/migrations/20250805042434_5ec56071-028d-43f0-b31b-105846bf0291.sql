
-- Add comprehensive chiller and HVAC maintenance fields to hvac_maintenance_checks table

-- Evaporator readings
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS evaporator_approach_temp numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS evaporator_leaving_water_temp numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS evaporator_entering_water_temp numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS evaporator_pressure_drop numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS evaporator_flow_rate numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS evaporator_condition text;

-- Condenser readings  
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS condenser_approach_temp numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS condenser_entering_water_temp numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS condenser_leaving_water_temp numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS condenser_pressure_drop numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS condenser_flow_rate numeric;

-- Compressor readings
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS compressor_suction_temp numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS compressor_discharge_temp numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS compressor_suction_pressure numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS compressor_discharge_pressure numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS compressor_superheat numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS compressor_subcooling numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS compressor_oil_pressure numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS compressor_oil_temp numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS compressor_condition text;

-- Motor readings
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS motor_amperage_rla numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS motor_voltage_phase1 numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS motor_voltage_phase2 numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS motor_voltage_phase3 numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS motor_temperature numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS motor_vibration numeric;

-- Additional HVAC fields for comprehensive maintenance
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS system_efficiency_rating numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS energy_consumption_kwh numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS operating_hours numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS ambient_temperature numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS humidity_level numeric;

-- Electrical readings
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS electrical_connections_condition text;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS control_panel_condition text;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS safety_switches_status text;

-- Maintenance status fields
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS filters_replaced boolean DEFAULT false;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS coils_cleaned boolean DEFAULT false;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS belts_inspected boolean DEFAULT false;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS bearings_lubricated boolean DEFAULT false;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS refrigerant_checked boolean DEFAULT false;

-- Performance metrics
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS cooling_capacity_tons numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS heating_capacity_btuh numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS efficiency_cop numeric;

-- Water treatment (for chillers/cooling towers)
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS water_ph_level numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS water_conductivity numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS chemical_treatment_status text;

-- Additional comprehensive fields for various equipment types
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS inspection_notes text;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS follow_up_required boolean DEFAULT false;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS next_inspection_date timestamp with time zone;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS maintenance_duration_minutes integer;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS parts_used jsonb;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS labor_cost numeric;
ALTER TABLE public.hvac_maintenance_checks ADD COLUMN IF NOT EXISTS parts_cost numeric;
