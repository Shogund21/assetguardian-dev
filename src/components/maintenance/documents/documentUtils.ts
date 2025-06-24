
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceDocument } from "@/types/maintenance";

export const fetchDocuments = async (
  equipmentId?: string, 
  maintenanceCheckId?: string,
  category?: string
) => {
  let query = supabase
    .from('maintenance_documents')
    .select('*')
    .order('uploaded_at', { ascending: false });

  if (equipmentId) {
    query = query.eq('equipment_id', equipmentId);
  }
  if (maintenanceCheckId) {
    query = query.eq('maintenance_check_id', maintenanceCheckId);
  }
  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  // Map database records to MaintenanceDocument interface
  return (data || []).map(record => ({
    id: record.id,
    check_id: record.maintenance_check_id || record.id,
    file_name: record.file_name,
    file_url: record.file_path || '', // Use file_path as file_url fallback
    file_type: record.file_type,
    file_size: record.file_size,
    file_path: record.file_path,
    uploaded_at: record.uploaded_at,
    category: record.category,
    tags: record.tags,
    comments: record.comments,
    equipment_id: record.equipment_id,
    maintenance_check_id: record.maintenance_check_id,
    project_id: record.project_id,
    company_id: record.company_id,
    uploaded_by: record.uploaded_by,
  })) as MaintenanceDocument[];
};

export const downloadDocument = async (doc: MaintenanceDocument) => {
  const { data, error } = await supabase.storage
    .from('maintenance_docs')
    .download(doc.file_path || doc.file_url);

  if (error) throw error;

  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = doc.file_name;
  a.click();
  URL.revokeObjectURL(url);
};

export const deleteDocument = async (doc: MaintenanceDocument) => {
  const { error: storageError } = await supabase.storage
    .from('maintenance_docs')
    .remove([doc.file_path || doc.file_url]);

  if (storageError) throw storageError;

  const { error: dbError } = await supabase
    .from('maintenance_documents')
    .delete()
    .eq('id', doc.id);

  if (dbError) throw dbError;
};
