import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuditService } from '@/services/auditService';

interface DeleteReadingParams {
  readingId: string;
  reason: string;
  equipmentId: string;
}

export const useDeleteReading = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ readingId, reason, equipmentId }: DeleteReadingParams) => {
      // First, get the reading data for audit log
      const { data: reading, error: fetchError } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('id', readingId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch reading: ${fetchError.message}`);
      }

      if (!reading) {
        throw new Error('Reading not found');
      }

      // Delete the reading
      const { error: deleteError } = await supabase
        .from('sensor_readings')
        .delete()
        .eq('id', readingId);

      if (deleteError) {
        throw new Error(`Failed to delete reading: ${deleteError.message}`);
      }

      // Log the deletion for SOC 2 compliance
      await AuditService.logDelete(
        'sensor_readings',
        readingId,
        reading,
        reason
      );

      return { readingId, reading };
    },
    onSuccess: (data) => {
      toast({
        title: "Reading Deleted",
        description: `Successfully deleted ${data.reading.sensor_type} reading.`,
      });

      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['sensor-readings'] });
      queryClient.invalidateQueries({ queryKey: ['reading-counts'] });
      queryClient.invalidateQueries({ queryKey: ['predictive-alerts'] });
    },
    onError: (error: Error) => {
      console.error('Error deleting reading:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete reading",
        variant: "destructive",
      });
    },
  });
};