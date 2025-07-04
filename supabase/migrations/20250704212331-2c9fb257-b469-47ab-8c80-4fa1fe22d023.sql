-- Phase 3.2: Demo Data Generation Functions
-- Create comprehensive demo data for trial companies

CREATE OR REPLACE FUNCTION public.generate_demo_data(p_company_id uuid, p_company_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    location_ids uuid[];
    equipment_ids uuid[];
    technician_ids uuid[];
    project_ids uuid[];
    i integer;
    temp_id uuid;
BEGIN
    -- Create demo locations
    INSERT INTO public.locations (name, store_number, company_id, is_active) VALUES
    ('Main Office Building', 'LOC001', p_company_id, true),
    ('Warehouse Facility', 'LOC002', p_company_id, true),
    ('Retail Store - Downtown', 'LOC003', p_company_id, true),
    ('Manufacturing Plant', 'LOC004', p_company_id, true),
    ('Distribution Center', 'LOC005', p_company_id, true)
    RETURNING ARRAY_AGG(id) INTO location_ids;
    
    -- Create demo technicians
    INSERT INTO public.technicians (
        "firstName", "lastName", email, phone, specialization, 
        company_id, company_name, user_role, status
    ) VALUES
    ('John', 'Anderson', 'j.anderson@demo.com', '(555) 101-2001', 'HVAC Systems', p_company_id, p_company_name, 'technician', 'active'),
    ('Sarah', 'Mitchell', 's.mitchell@demo.com', '(555) 101-2002', 'Electrical Systems', p_company_id, p_company_name, 'technician', 'active'),
    ('Mike', 'Rodriguez', 'm.rodriguez@demo.com', '(555) 101-2003', 'Refrigeration', p_company_id, p_company_name, 'technician', 'active'),
    ('Emily', 'Chen', 'e.chen@demo.com', '(555) 101-2004', 'Building Automation', p_company_id, p_company_name, 'senior_technician', 'active')
    RETURNING ARRAY_AGG(id) INTO technician_ids;
    
    -- Create demo equipment
    INSERT INTO public.equipment (
        name, type, model, serial_number, location, status, company_id,
        "lastMaintenance", "nextMaintenance"
    ) VALUES
    ('Main HVAC Unit - Building A', 'AHU', 'Trane XR95', 'TRN-2023-001', 'Main Office Building', 'operational', p_company_id, now() - INTERVAL '30 days', now() + INTERVAL '60 days'),
    ('Chiller System - Primary', 'Chiller', 'York YK-400', 'YRK-2022-045', 'Main Office Building', 'operational', p_company_id, now() - INTERVAL '15 days', now() + INTERVAL '75 days'),
    ('Warehouse HVAC - Zone 1', 'RTU', 'Carrier 50TC', 'CAR-2023-012', 'Warehouse Facility', 'needs_attention', p_company_id, now() - INTERVAL '45 days', now() + INTERVAL '15 days'),
    ('Cooling Tower - West', 'Cooling Tower', 'BAC VTI-1500', 'BAC-2021-089', 'Manufacturing Plant', 'operational', p_company_id, now() - INTERVAL '20 days', now() + INTERVAL '70 days'),
    ('Emergency Generator', 'Generator', 'Caterpillar C15', 'CAT-2022-156', 'Distribution Center', 'operational', p_company_id, now() - INTERVAL '10 days', now() + INTERVAL '80 days'),
    ('Retail Store AC Unit 1', 'Split System', 'Mitsubishi MSZ-FH', 'MIT-2023-078', 'Retail Store - Downtown', 'operational', p_company_id, now() - INTERVAL '25 days', now() + INTERVAL '65 days'),
    ('Retail Store AC Unit 2', 'Split System', 'Mitsubishi MSZ-FH', 'MIT-2023-079', 'Retail Store - Downtown', 'under_maintenance', p_company_id, now() - INTERVAL '5 days', now() + INTERVAL '25 days'),
    ('Warehouse Exhaust Fan', 'Exhaust Fan', 'Greenheck SQ-36', 'GRN-2022-234', 'Warehouse Facility', 'operational', p_company_id, now() - INTERVAL '35 days', now() + INTERVAL '55 days'),
    ('Office Building Elevator 1', 'Elevator', 'Otis Gen2', 'OTS-2020-445', 'Main Office Building', 'operational', p_company_id, now() - INTERVAL '40 days', now() + INTERVAL '50 days'),
    ('Restroom Exhaust System', 'Exhaust System', 'Broan-NuTone', 'BRN-2023-067', 'Main Office Building', 'operational', p_company_id, now() - INTERVAL '20 days', now() + INTERVAL '70 days')
    RETURNING ARRAY_AGG(id) INTO equipment_ids;
    
    -- Create demo projects
    INSERT INTO public.projects (
        name, description, status, priority, location, company_id,
        startdate, enddate
    ) VALUES
    ('Annual HVAC System Upgrade', 'Comprehensive upgrade of main HVAC systems across all facilities', 'in_progress', 'high', 'Main Office Building', p_company_id, now() - INTERVAL '30 days', now() + INTERVAL '60 days'),
    ('Energy Efficiency Assessment', 'Complete energy audit and efficiency improvements for warehouse', 'planning', 'medium', 'Warehouse Facility', p_company_id, now() + INTERVAL '15 days', now() + INTERVAL '90 days'),
    ('Emergency System Maintenance', 'Quarterly maintenance of all emergency and backup systems', 'completed', 'high', 'All Locations', p_company_id, now() - INTERVAL '60 days', now() - INTERVAL '5 days'),
    ('Retail Store Climate Control', 'Installation of new climate control system for downtown store', 'in_progress', 'medium', 'Retail Store - Downtown', p_company_id, now() - INTERVAL '20 days', now() + INTERVAL '30 days'),
    ('Preventive Maintenance Schedule', 'Implementation of comprehensive preventive maintenance program', 'planning', 'low', 'All Locations', p_company_id, now() + INTERVAL '30 days', now() + INTERVAL '120 days')
    RETURNING ARRAY_AGG(id) INTO project_ids;
    
    -- Create demo maintenance checks (more realistic distribution)
    FOR i IN 1..25 LOOP
        INSERT INTO public.hvac_maintenance_checks (
            equipment_id, technician_id, company_id, location_id,
            check_date, status, equipment_type,
            air_filter_status, belt_condition, motor_condition,
            control_system_status, notes, maintenance_frequency
        ) VALUES (
            equipment_ids[1 + (i % array_length(equipment_ids, 1))],
            technician_ids[1 + (i % array_length(technician_ids, 1))],
            p_company_id,
            location_ids[1 + (i % array_length(location_ids, 1))],
            now() - INTERVAL '1 day' * (i * 7),  -- Spread over last 25 weeks
            CASE 
                WHEN i % 4 = 0 THEN 'completed'::maintenance_check_status
                WHEN i % 4 = 1 THEN 'in_progress'::maintenance_check_status
                ELSE 'pending'::maintenance_check_status
            END,
            CASE 
                WHEN i % 5 = 0 THEN 'AHU'
                WHEN i % 5 = 1 THEN 'Chiller'
                WHEN i % 5 = 2 THEN 'RTU'
                WHEN i % 5 = 3 THEN 'Cooling Tower'
                ELSE 'Split System'
            END,
            CASE WHEN i % 3 = 0 THEN 'clean' WHEN i % 3 = 1 THEN 'dirty' ELSE 'needs_replacement' END,
            CASE WHEN i % 4 = 0 THEN 'good' WHEN i % 4 = 1 THEN 'fair' ELSE 'needs_adjustment' END,
            CASE WHEN i % 3 = 0 THEN 'excellent' WHEN i % 3 = 1 THEN 'good' ELSE 'needs_attention' END,
            CASE WHEN i % 3 = 0 THEN 'normal' WHEN i % 3 = 1 THEN 'minor_issues' ELSE 'requires_repair' END,
            'Demo maintenance check #' || i || ' - ' || 
            CASE 
                WHEN i % 4 = 0 THEN 'All systems operating normally. No issues found.'
                WHEN i % 4 = 1 THEN 'Minor adjustments made to improve efficiency.'
                WHEN i % 4 = 2 THEN 'Filter replacement recommended within 30 days.'
                ELSE 'Equipment showing signs of wear, schedule follow-up inspection.'
            END,
            CASE WHEN i % 3 = 0 THEN 'weekly' WHEN i % 3 = 1 THEN 'monthly' ELSE 'quarterly' END
        );
    END LOOP;
    
    -- Create demo sensor readings for predictive maintenance
    FOR i IN 1..50 LOOP
        INSERT INTO public.sensor_readings (
            equipment_id, sensor_type, value, unit, 
            timestamp_utc, source, reading_mode
        ) VALUES (
            equipment_ids[1 + (i % array_length(equipment_ids, 1))],
            CASE 
                WHEN i % 4 = 0 THEN 'temperature'
                WHEN i % 4 = 1 THEN 'pressure'
                WHEN i % 4 = 2 THEN 'vibration'
                ELSE 'flow_rate'
            END,
            CASE 
                WHEN i % 4 = 0 THEN 68 + (i % 20) -- Temperature: 68-87°F
                WHEN i % 4 = 1 THEN 14 + (i % 6)  -- Pressure: 14-20 PSI
                WHEN i % 4 = 2 THEN 0.1 + (i % 10) * 0.05 -- Vibration: 0.1-0.6
                ELSE 100 + (i % 50) -- Flow rate: 100-150 CFM
            END,
            CASE 
                WHEN i % 4 = 0 THEN '°F'
                WHEN i % 4 = 1 THEN 'PSI'
                WHEN i % 4 = 2 THEN 'mm/s'
                ELSE 'CFM'
            END,
            now() - INTERVAL '1 hour' * i,
            'manual',
            'standard'
        );
    END LOOP;
    
    RAISE NOTICE 'Demo data generated successfully for company: %', p_company_name;
END;
$$;