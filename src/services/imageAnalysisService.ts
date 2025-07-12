import { supabase } from "@/integrations/supabase/client";

export interface ImageAnalysisBatch {
  id: string;
  equipment_id?: string;
  equipment_name?: string;
  equipment_type?: string;
  batch_name: string;
  total_images: number;
  processed_images: number;
  total_readings: number;
  status: string;
  created_by?: string;
  company_id?: string;
  created_at: string;
  completed_at?: string;
  metadata?: any;
}

export interface ExtractedReadingStaging {
  id: string;
  batch_id: string;
  image_id: string;
  image_filename: string;
  equipment_id?: string;
  sensor_type: string;
  value: number;
  unit: string;
  confidence?: number;
  location_on_image?: string;
  extracted_at: string;
  is_saved: boolean;
  created_at: string;
}

export class ImageAnalysisService {
  // Create a new image analysis batch
  static async createBatch(batchData: {
    equipment_id?: string;
    equipment_name?: string;
    equipment_type?: string;
    batch_name: string;
    total_images: number;
    company_id?: string;
  }): Promise<ImageAnalysisBatch> {
    const { data, error } = await supabase
      .from('image_analysis_batches')
      .insert({
        ...batchData,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update batch progress
  static async updateBatchProgress(
    batchId: string, 
    updates: { processed_images?: number; total_readings?: number; status?: string }
  ): Promise<void> {
    const { error } = await supabase
      .from('image_analysis_batches')
      .update(updates)
      .eq('id', batchId);

    if (error) throw error;
  }

  // Add extracted readings to staging
  static async addStagedReadings(readings: Array<{
    batch_id: string;
    image_id: string;
    image_filename: string;
    equipment_id?: string;
    sensor_type: string;
    value: number;
    unit: string;
    confidence?: number;
    location_on_image?: string;
  }>): Promise<ExtractedReadingStaging[]> {
    const { data, error } = await supabase
      .from('extracted_readings_staging')
      .insert(readings)
      .select();

    if (error) throw error;
    return data;
  }

  // Get staged readings for a batch
  static async getStagedReadings(batchId: string): Promise<ExtractedReadingStaging[]> {
    const { data, error } = await supabase
      .from('extracted_readings_staging')
      .select('*')
      .eq('batch_id', batchId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Save staged readings to sensor_readings and create maintenance check
  static async saveStagedReadings(batchId: string): Promise<{
    success: boolean;
    saved_count: number;
    maintenance_check_id?: string;
    message: string;
    error?: string;
  }> {
    const { data, error } = await supabase.rpc('save_staged_readings_to_sensors', {
      p_batch_id: batchId
    });

    if (error) throw error;
    return data as any;
  }

  // Get batch details with readings count
  static async getBatchDetails(batchId: string): Promise<ImageAnalysisBatch & { staged_readings: ExtractedReadingStaging[] }> {
    const [batchResult, readingsResult] = await Promise.all([
      supabase.from('image_analysis_batches').select('*').eq('id', batchId).single(),
      this.getStagedReadings(batchId)
    ]);

    if (batchResult.error) throw batchResult.error;
    
    return {
      ...batchResult.data,
      staged_readings: readingsResult
    };
  }

  // Get user's recent batches
  static async getUserBatches(limit: number = 10): Promise<ImageAnalysisBatch[]> {
    const { data, error } = await supabase
      .from('image_analysis_batches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}