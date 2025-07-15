-- Create enhanced HVAC diagnostic tables for supplemental data

-- Manual maintenance logs table
CREATE TABLE IF NOT EXISTS public.manual_maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('bearing', 'motor', 'compressor', 'general')),
    description TEXT NOT NULL,
    technician_name TEXT,
    parts_replaced TEXT[],
    labor_hours DECIMAL(5,2),
    cost_usd DECIMAL(10,2),
    severity TEXT CHECK (severity IN ('minor', 'major', 'critical')),
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Refrigerant charge and leak test reports
CREATE TABLE IF NOT EXISTS public.refrigerant_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    refrigerant_type TEXT NOT NULL,
    charge_amount_lbs DECIMAL(8,2),
    leak_test_passed BOOLEAN NOT NULL,
    leak_locations TEXT[],
    leak_severity TEXT CHECK (leak_severity IN ('minor', 'moderate', 'major')),
    pressure_high_side DECIMAL(8,2),
    pressure_low_side DECIMAL(8,2),
    superheat_temp DECIMAL(6,2),
    subcooling_temp DECIMAL(6,2),
    technician_name TEXT,
    certification_number TEXT,
    next_test_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vibration analysis results
CREATE TABLE IF NOT EXISTS public.vibration_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL,
    measurement_location TEXT NOT NULL,
    vibration_velocity DECIMAL(6,3), -- in/sec
    vibration_acceleration DECIMAL(6,3), -- g's
    frequency_hz DECIMAL(8,2),
    amplitude_mils DECIMAL(6,3),
    overall_condition TEXT CHECK (overall_condition IN ('good', 'fair', 'poor', 'critical')),
    bearing_condition TEXT CHECK (bearing_condition IN ('good', 'fair', 'poor', 'critical')),
    motor_condition TEXT CHECK (motor_condition IN ('good', 'fair', 'poor', 'critical')),
    alignment_status TEXT CHECK (alignment_status IN ('good', 'fair', 'poor')),
    recommendations TEXT,
    next_analysis_date DATE,
    analyst_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Condenser coil cleaning and water treatment records
CREATE TABLE IF NOT EXISTS public.condenser_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    service_type TEXT NOT NULL CHECK (service_type IN ('coil_cleaning', 'tube_brushing', 'water_treatment', 'chemical_cleaning')),
    coil_condition_before TEXT CHECK (coil_condition_before IN ('clean', 'light_fouling', 'moderate_fouling', 'heavy_fouling')),
    coil_condition_after TEXT CHECK (coil_condition_after IN ('clean', 'light_fouling', 'moderate_fouling', 'heavy_fouling')),
    cleaning_method TEXT,
    chemicals_used TEXT[],
    water_flow_rate_gpm DECIMAL(8,2),
    water_temperature_in DECIMAL(6,2),
    water_temperature_out DECIMAL(6,2),
    approach_temperature DECIMAL(6,2),
    efficiency_improvement_percent DECIMAL(5,2),
    technician_name TEXT,
    service_cost DECIMAL(10,2),
    next_service_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HVAC diagnostic sessions table
CREATE TABLE IF NOT EXISTS public.hvac_diagnostic_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    session_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    diagnostic_type TEXT NOT NULL CHECK (diagnostic_type IN ('comprehensive', 'targeted', 'emergency')),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    overall_health_score DECIMAL(3,2) CHECK (overall_health_score >= 0 AND overall_health_score <= 1),
    critical_findings TEXT[],
    recommendations TEXT[],
    estimated_remaining_life_months INTEGER,
    maintenance_priority TEXT CHECK (maintenance_priority IN ('low', 'medium', 'high', 'critical')),
    cost_analysis JSONB,
    data_sources_used TEXT[],
    analyst_notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.manual_maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refrigerant_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vibration_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condenser_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hvac_diagnostic_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for equipment access
CREATE POLICY "Users can access maintenance logs for their equipment" ON public.manual_maintenance_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.equipment e
            WHERE e.id = equipment_id 
            AND (e.company_id IS NULL OR is_member_of(e.company_id) OR can_access_all_data())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.equipment e
            WHERE e.id = equipment_id 
            AND (e.company_id IS NULL OR is_member_of(e.company_id) OR can_access_all_data())
        )
    );

CREATE POLICY "Users can access refrigerant reports for their equipment" ON public.refrigerant_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.equipment e
            WHERE e.id = equipment_id 
            AND (e.company_id IS NULL OR is_member_of(e.company_id) OR can_access_all_data())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.equipment e
            WHERE e.id = equipment_id 
            AND (e.company_id IS NULL OR is_member_of(e.company_id) OR can_access_all_data())
        )
    );

CREATE POLICY "Users can access vibration analysis for their equipment" ON public.vibration_analysis
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.equipment e
            WHERE e.id = equipment_id 
            AND (e.company_id IS NULL OR is_member_of(e.company_id) OR can_access_all_data())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.equipment e
            WHERE e.id = equipment_id 
            AND (e.company_id IS NULL OR is_member_of(e.company_id) OR can_access_all_data())
        )
    );

CREATE POLICY "Users can access condenser maintenance for their equipment" ON public.condenser_maintenance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.equipment e
            WHERE e.id = equipment_id 
            AND (e.company_id IS NULL OR is_member_of(e.company_id) OR can_access_all_data())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.equipment e
            WHERE e.id = equipment_id 
            AND (e.company_id IS NULL OR is_member_of(e.company_id) OR can_access_all_data())
        )
    );

CREATE POLICY "Users can access diagnostic sessions for their equipment" ON public.hvac_diagnostic_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.equipment e
            WHERE e.id = equipment_id 
            AND (e.company_id IS NULL OR is_member_of(e.company_id) OR can_access_all_data())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.equipment e
            WHERE e.id = equipment_id 
            AND (e.company_id IS NULL OR is_member_of(e.company_id) OR can_access_all_data())
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_manual_maintenance_logs_equipment_date ON public.manual_maintenance_logs(equipment_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_refrigerant_reports_equipment_date ON public.refrigerant_reports(equipment_id, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_vibration_analysis_equipment_date ON public.vibration_analysis(equipment_id, analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_condenser_maintenance_equipment_date ON public.condenser_maintenance(equipment_id, service_date DESC);
CREATE INDEX IF NOT EXISTS idx_hvac_diagnostic_sessions_equipment_date ON public.hvac_diagnostic_sessions(equipment_id, session_date DESC);

-- Create update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_manual_maintenance_logs_updated_at
    BEFORE UPDATE ON public.manual_maintenance_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refrigerant_reports_updated_at
    BEFORE UPDATE ON public.refrigerant_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vibration_analysis_updated_at
    BEFORE UPDATE ON public.vibration_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_condenser_maintenance_updated_at
    BEFORE UPDATE ON public.condenser_maintenance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hvac_diagnostic_sessions_updated_at
    BEFORE UPDATE ON public.hvac_diagnostic_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();