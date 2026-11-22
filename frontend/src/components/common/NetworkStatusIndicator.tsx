import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { offlineQueue, OfflineShipmentDraft } from '../../services/offlineQueueService';
import { useLanguage } from '../../contexts/LanguageContext';

export const NetworkStatusIndicator: React.FC = () => {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState<boolean>(offlineQueue.isOnline());
  const [drafts, setDrafts] = useState<OfflineShipmentDraft[]>(offlineQueue.getDrafts());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsub = offlineQueue.onStatusChange((status) => {
      setIsOnline(status);
    });

    const handleDrafts = (e: any) => {
      setDrafts(e.detail || []);
    };
    window.addEventListener('gramroute-drafts-updated', handleDrafts);

    return () => {
      unsub();
      window.removeEventListener('gramroute-drafts-updated', handleDrafts);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await offlineQueue.syncOfflineDrafts();
      if (result.syncedCount > 0) {
        setSyncFeedback(`Successfully synced ${result.syncedCount} draft(s)`);
      } else if (result.errorsCount > 0) {
        setSyncFeedback(`Sync conflict on ${result.errorsCount} draft(s). Check review.`);
      }
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  // If online and no pending offline drafts, render a compact subtle status pill
  if (isOnline && drafts.length === 0 && !syncFeedback) {
    return (
      <div
        className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
        title="Connected to GramRoute Cloud Network"
      >
        <Wifi className="w-3 h-3 text-emerald-600" />
        <span>{t.common.online}</span>
      </div>
    );
  }

  // If offline or has pending drafts to sync:
  return (
    <div className="flex items-center gap-2">
      {!isOnline ? (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
          <WifiOff className="w-3.5 h-3.5 text-amber-700" />
          <span>{t.common.offline}</span>
          {drafts.length > 0 && <span className="bg-amber-700 text-white px-1.5 py-0.2 rounded-full text-[10px]">{drafts.length}</span>}
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <RefreshCw className={`w-3 h-3 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{drafts.length} Draft(s) Ready</span>
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded hover:bg-blue-700 transition-colors"
          >
            {isSyncing ? t.common.syncing : 'Sync Now'}
          </button>
        </div>
      )}

      {syncFeedback && (
        <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>{syncFeedback}</span>
        </div>
      )}
    </div>
  );
};
