-- Populate demo company with sample data
DO $$
DECLARE
    demo_company_id uuid;
    location_ids uuid[];
    equipment_ids uuid[];
    technician_ids uuid[];
BEGIN
    -- Get demo company ID
    SELECT id INTO demo_company_id 
    FROM public.companies 
    WHERE name = 'Demo Facilities Inc.' AND is_trial = true;
    
    IF demo_company_id IS NULL THEN
        RAISE EXCEPTION 'Demo company not found';
    END IF;
    
    -- Check if demo data already exists
    IF EXISTS (SELECT 1 FROM public.locations WHERE company_id = demo_company_id) THEN
        RAISE NOTICE 'Demo data already exists for company';
        RETURN;
    END IF;
    
    -- Create demo locations
    INSERT INTO public.locations (name, store_number, company_id, is_active) VALUES
    ('Main Office Building', 'LOC001', demo_company_id, true),
    ('Warehouse Facility', 'LOC002', demo_company_id, true),
    ('Retail Store Downtown', 'LOC003', demo_company_id, true),
    ('Manufacturing Plant', 'LOC004', demo_company_id, true);
    
    -- Create demo technicians
    INSERT INTO public.technicians (
        "firstName", "lastName", email, phone, specialization, 
        company_id, company_name, user_role, status
    ) VALUES
    ('John', 'Anderson', 'j.anderson@demo.com', '(555) 101-2001', 'HVAC Systems', demo_company_id, 'Demo Facilities Inc.', 'technician', 'active'),
    ('Sarah', 'Mitchell', 's.mitchell@demo.com', '(555) 101-2002', 'Electrical Systems', demo_company_id, 'Demo Facilities Inc.', 'technician', 'active'),
    ('Mike', 'Rodriguez', 'm.rodriguez@demo.com', '(555) 101-2003', 'Refrigeration', demo_company_id, 'Demo Facilities Inc.', 'senior_technician', 'active');
    
    -- Create demo equipment
    INSERT INTO public.equipment (
        name, type, model, serial_number, location, status, company_id,
        "lastMaintenance", "nextMaintenance"
    ) VALUES
    ('Main HVAC Unit - Building A', 'AHU', 'Trane XR95', 'TRN-2023-001', 'Main Office Building', 'operational', demo_company_id, now() - INTERVAL '30 days', now() + INTERVAL '60 days'),
    ('Chiller System - Primary', 'Chiller', 'York YK-400', 'YRK-2022-045', 'Main Office Building', 'operational', demo_company_id, now() - INTERVAL '15 days', now() + INTERVAL '75 days'),
    ('Warehouse HVAC - Zone 1', 'RTU', 'Carrier 50TC', 'CAR-2023-012', 'Warehouse Facility', 'needs_attention', demo_company_id, now() - INTERVAL '45 days', now() + INTERVAL '15 days'),
    ('Retail Store AC Unit 1', 'Split System', 'Mitsubishi MSZ-FH', 'MIT-2023-078', 'Retail Store Downtown', 'operational', demo_company_id, now() - INTERVAL '25 days', now() + INTERVAL '65 days'),
    ('Emergency Generator', 'Generator', 'Caterpillar C15', 'CAT-2022-156', 'Manufacturing Plant', 'operational', demo_company_id, now() - INTERVAL '10 days', now() + INTERVAL '80 days');
    
    -- Create demo projects
    INSERT INTO public.projects (
        name, description, status, priority, location, company_id,
        startdate, enddate
    ) VALUES
    ('Annual HVAC System Upgrade', 'Comprehensive upgrade of main HVAC systems', 'in_progress', 'high', 'Main Office Building', demo_company_id, now() - INTERVAL '30 days', now() + INTERVAL '60 days'),
    ('Energy Efficiency Assessment', 'Complete energy audit for warehouse', 'planning', 'medium', 'Warehouse Facility', demo_company_id, now() + INTERVAL '15 days', now() + INTERVAL '90 days'),
    ('Emergency System Maintenance', 'Quarterly maintenance of backup systems', 'completed', 'high', 'All Locations', demo_company_id, now() - INTERVAL '60 days', now() - INTERVAL '5 days');
    
    RAISE NOTICE 'Successfully populated demo company with sample data';
END $$;