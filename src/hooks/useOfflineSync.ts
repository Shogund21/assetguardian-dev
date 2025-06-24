
import { useState, useEffect, useCallback } from 'react';
import { offlineStorage } from '@/services/offlineStorageService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Connection restored. Syncing offline data...",
      });
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "Working offline. Data will sync when connection is restored.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize and get unsynced count
  useEffect(() => {
    const initOfflineStorage = async () => {
      try {
        await offlineStorage.initDB();
        const count = await offlineStorage.getUnsyncedCount();
        setUnsyncedCount(count);
      } catch (error) {
        console.error('Failed to init offline storage:', error);
      }
    };

    initOfflineStorage();
  }, []);

  const syncOfflineData = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      const unsyncedReadings = await offlineStorage.getUnsynced();
      console.log(`Syncing ${unsyncedReadings.length} offline readings`);

      let successCount = 0;
      let failCount = 0;

      for (const reading of unsyncedReadings) {
        try {
          // Store the reading in sensor_readings table
          const { error } = await supabase
            .from('sensor_readings')
            .insert({
              equipment_id: reading.equipment_id,
              sensor_type: reading.reading_type,
              value: reading.value,
              unit: reading.unit,
              timestamp_utc: reading.timestamp,
              source: 'manual'
            });

          if (error) {
            console.error('Failed to sync reading:', error);
            await offlineStorage.incrementRetryCount(reading.id);
            failCount++;
          } else {
            await offlineStorage.markAsSynced(reading.id);
            successCount++;

            // Store additional notes if provided
            if (reading.notes || reading.location_notes) {
              await supabase
                .from('maintenance_documents')
                .insert({
                  equipment_id: reading.equipment_id,
                  file_name: `Manual Reading - ${reading.reading_type}`,
                  file_path: 'offline_sync',
                  file_type: 'text/plain',
                  file_size: 0,
                  category: 'manual_reading',
                  comments: `${reading.notes || ''}\nLocation Notes: ${reading.location_notes || ''}`,
                  tags: ['offline_sync', reading.reading_type],
                });
            }
          }
        } catch (error) {
          console.error('Sync error for reading:', reading.id, error);
          await offlineStorage.incrementRetryCount(reading.id);
          failCount++;
        }
      }

      // Update unsynced count
      const newCount = await offlineStorage.getUnsyncedCount();
      setUnsyncedCount(newCount);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['sensor-readings'] });
      queryClient.invalidateQueries({ queryKey: ['reading-counts'] });

      if (successCount > 0) {
        toast({
          title: "Sync Complete",
          description: `${successCount} readings synced successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
        });
      }

      if (failCount > 0 && successCount === 0) {
        toast({
          title: "Sync Failed",
          description: `Failed to sync ${failCount} readings. Will retry later.`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Sync process failed:', error);
      toast({
        title: "Sync Error",
        description: "Failed to sync offline data. Will retry later.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, toast, queryClient]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && unsyncedCount > 0) {
      const timeout = setTimeout(() => {
        syncOfflineData();
      }, 1000); // Wait 1 second after coming online

      return () => clearTimeout(timeout);
    }
  }, [isOnline, unsyncedCount, syncOfflineData]);

  const cacheEquipmentData = useCallback(async (equipment: any[]) => {
    try {
      const offlineEquipment = equipment.map(eq => ({
        id: eq.id,
        name: eq.name,
        location: eq.location,
        cached_at: new Date().toISOString(),
      }));
      
      await offlineStorage.cacheEquipment(offlineEquipment);
      console.log('Equipment data cached for offline use');
    } catch (error) {
      console.error('Failed to cache equipment:', error);
    }
  }, []);

  const updateUnsyncedCount = useCallback(async () => {
    try {
      const count = await offlineStorage.getUnsyncedCount();
      setUnsyncedCount(count);
    } catch (error) {
      console.error('Failed to update unsynced count:', error);
    }
  }, []);

  return {
    isOnline,
    isSyncing,
    unsyncedCount,
    syncOfflineData,
    cacheEquipmentData,
    updateUnsyncedCount,
  };
};
