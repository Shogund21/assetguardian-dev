-- Create table for image analysis batches
CREATE TABLE public.image_analysis_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID REFERENCES public.equipment(id),
  equipment_name TEXT,
  equipment_type TEXT,
  batch_name TEXT NOT NULL,
  total_images INTEGER NOT NULL DEFAULT 0,
  processed_images INTEGER NOT NULL DEFAULT 0,
  total_readings INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing', -- processing, completed, failed
  created_by UUID,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Create table for extracted readings staging (before saving to sensor_readings)
CREATE TABLE public.extracted_readings_staging (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID REFERENCES public.image_analysis_batches(id) ON DELETE CASCADE,
  image_id TEXT NOT NULL,
  image_filename TEXT NOT NULL,
  equipment_id UUID,
  sensor_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  confidence NUMERIC DEFAULT 0,
  location_on_image TEXT, -- coordinates or description
  extracted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_saved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.image_analysis_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_readings_staging ENABLE ROW LEVEL SECURITY;

-- RLS policies for image_analysis_batches
CREATE POLICY "Users can view batches from their company" 
ON public.image_analysis_batches 
FOR SELECT 
USING (company_id IS NULL OR is_member_of(company_id) OR can_access_all_data());

CREATE POLICY "Users can create batches for their company" 
ON public.image_analysis_batches 
FOR INSERT 
WITH CHECK (company_id IS NULL OR is_member_of(company_id) OR can_access_all_data());

CREATE POLICY "Users can update batches from their company" 
ON public.image_analysis_batches 
FOR UPDATE 
USING (company_id IS NULL OR is_member_of(company_id) OR can_access_all_data());

-- RLS policies for extracted_readings_staging
CREATE POLICY "Users can view staging readings from their batches" 
ON public.extracted_readings_staging 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.image_analysis_batches b 
  WHERE b.id = batch_id 
  AND (b.company_id IS NULL OR is_member_of(b.company_id) OR can_access_all_data())
));

CREATE POLICY "Users can create staging readings for their batches" 
ON public.extracted_readings_staging 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.image_analysis_batches b 
  WHERE b.id = batch_id 
  AND (b.company_id IS NULL OR is_member_of(b.company_id) OR can_access_all_data())
));

CREATE POLICY "Users can update staging readings from their batches" 
ON public.extracted_readings_staging 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.image_analysis_batches b 
  WHERE b.id = batch_id 
  AND (b.company_id IS NULL OR is_member_of(b.company_id) OR can_access_all_data())
));

-- Function to save staged readings to sensor_readings table
CREATE OR REPLACE FUNCTION public.save_staged_readings_to_sensors(p_batch_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  batch_record RECORD;
  reading_record RECORD;
  saved_count INTEGER := 0;
  maintenance_check_id UUID;
BEGIN
  -- Get batch information
  SELECT * INTO batch_record 
  FROM public.image_analysis_batches 
  WHERE id = p_batch_id;
  
  IF batch_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Batch not found');
  END IF;
  
  -- Create maintenance check record
  INSERT INTO public.hvac_maintenance_checks (
    equipment_id,
    equipment_type,
    company_id,
    check_date,
    status,
    notes,
    reading_mode
  ) VALUES (
    batch_record.equipment_id,
    batch_record.equipment_type,
    batch_record.company_id,
    now(),
    'completed'::maintenance_check_status,
    'AI-generated from image analysis batch: ' || batch_record.batch_name,
    'ai_extracted'
  ) RETURNING id INTO maintenance_check_id;
  
  -- Insert staged readings into sensor_readings
  FOR reading_record IN 
    SELECT * FROM public.extracted_readings_staging 
    WHERE batch_id = p_batch_id AND is_saved = false
  LOOP
    INSERT INTO public.sensor_readings (
      equipment_id,
      sensor_type,
      value,
      unit,
      timestamp_utc,
      source,
      reading_mode
    ) VALUES (
      batch_record.equipment_id,
      reading_record.sensor_type,
      reading_record.value,
      reading_record.unit,
      reading_record.extracted_at,
      'ai_analysis',
      'ai_extracted'
    );
    
    -- Mark as saved
    UPDATE public.extracted_readings_staging 
    SET is_saved = true 
    WHERE id = reading_record.id;
    
    saved_count := saved_count + 1;
  END LOOP;
  
  -- Update batch status
  UPDATE public.image_analysis_batches 
  SET status = 'completed', completed_at = now()
  WHERE id = p_batch_id;
  
  RETURN json_build_object(
    'success', true, 
    'saved_count', saved_count,
    'maintenance_check_id', maintenance_check_id,
    'message', 'Successfully saved ' || saved_count || ' readings'
  );
END;
$$;