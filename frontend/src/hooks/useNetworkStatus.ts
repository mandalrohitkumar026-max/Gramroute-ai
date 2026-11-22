import { useState, useEffect, useCallback } from 'react';
import { offlineQueue } from '../services/offlineQueueService';

export interface NetworkStatusState {
  isOnline: boolean;
  wasOffline: boolean;
  pendingSyncCount: number;
  lastOnlineAt: Date | null;
}

/**
 * Custom hook for progressive web app connectivity tracking and offline draft queue management
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(new Date());

  const refreshPendingCount = useCallback(() => {
    try {
      const drafts = offlineQueue.getDrafts();
      setPendingSyncCount(drafts.length);
    } catch {
      // IndexedDB fallback
    }
  }, []);

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = async () => {
      setIsOnline(true);
      setLastOnlineAt(new Date());

      // Attempt automatic background synchronization of queued drafts
      try {
        await offlineQueue.syncOfflineDrafts();
        refreshPendingCount();
      } catch (e) {
        console.warn('[PWA] Failed to automatically sync offline queue on reconnect:', e);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshPendingCount]);

  const triggerManualSync = useCallback(async () => {
    if (!isOnline) return { syncedCount: 0, errorsCount: 0 };
    const result = await offlineQueue.syncOfflineDrafts();
    refreshPendingCount();
    return result;
  }, [isOnline, refreshPendingCount]);

  return {
    isOnline,
    wasOffline,
    pendingSyncCount,
    lastOnlineAt,
    refreshPendingCount,
    triggerManualSync
  };
};

export default useNetworkStatus;
