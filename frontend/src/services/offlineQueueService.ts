export interface OfflineShipmentDraft {
  localId: string;
  cargoCategory: string;
  cargoDescription: string;
  weightKg: number;
  volumeM3?: number;
  packagesCount?: number;
  pickupAddress: string;
  pickupCoordinates: { latitude: number; longitude: number };
  destinationAddress: string;
  destinationCoordinates: { latitude: number; longitude: number };
  preferredPickupDate: string;
  deliveryDeadline: string;
  perishable: boolean;
  specialInstructions?: string;
  createdAt: string;
  syncStatus: 'DRAFT_OFFLINE' | 'SYNCING' | 'SYNCED' | 'CONFLICT';
  errorMessage?: string;
}

const STORAGE_KEY = 'gramroute_offline_shipment_drafts';

class OfflineQueueService {
  private isOnlineState: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Array<(isOnline: boolean) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnlineState = true;
        this.notifyOnlineChange(true);
        this.syncOfflineDrafts();
      });

      window.addEventListener('offline', () => {
        this.isOnlineState = false;
        this.notifyOnlineChange(false);
      });
    }
  }

  public isOnline(): boolean {
    return this.isOnlineState;
  }

  public onStatusChange(callback: (isOnline: boolean) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyOnlineChange(status: boolean) {
    this.listeners.forEach((l) => l(status));
    window.dispatchEvent(new CustomEvent('gramroute-network-status', { detail: { isOnline: status } }));
  }

  public getDrafts(): OfflineShipmentDraft[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveDraft(draft: Omit<OfflineShipmentDraft, 'localId' | 'createdAt' | 'syncStatus'>): OfflineShipmentDraft {
    const drafts = this.getDrafts();
    const newDraft: OfflineShipmentDraft = {
      ...draft,
      localId: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      syncStatus: 'DRAFT_OFFLINE'
    };

    drafts.push(newDraft);
    this.persistDrafts(drafts);
    window.dispatchEvent(new CustomEvent('gramroute-drafts-updated', { detail: drafts }));
    return newDraft;
  }

  public removeDraft(localId: string): void {
    const drafts = this.getDrafts().filter((d) => d.localId !== localId);
    this.persistDrafts(drafts);
    window.dispatchEvent(new CustomEvent('gramroute-drafts-updated', { detail: drafts }));
  }

  private persistDrafts(drafts: OfflineShipmentDraft[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save offline drafts to localStorage', err);
    }
  }

  /**
   * Strictly enforces safety constraint:
   * Never confirm a booking or payment while offline without server acknowledgement!
   */
  public assertCanPerformAction(actionType: 'CONFIRM_BOOKING' | 'PROCESS_PAYMENT' | 'CREATE_DRAFT'): {
    allowed: boolean;
    reason?: string;
  } {
    if (!this.isOnline() && (actionType === 'CONFIRM_BOOKING' || actionType === 'PROCESS_PAYMENT')) {
      return {
        allowed: false,
        reason: 'CRITICAL: Bookings and financial commitments require real-time server verification of vehicle capacity and road lock. Offline execution is prohibited.'
      };
    }
    return { allowed: true };
  }

  public async syncOfflineDrafts(): Promise<{ syncedCount: number; errorsCount: number }> {
    if (!this.isOnline()) {
      return { syncedCount: 0, errorsCount: 0 };
    }

    const drafts = this.getDrafts();
    const pending = drafts.filter((d) => d.syncStatus === 'DRAFT_OFFLINE' || d.syncStatus === 'CONFLICT');

    if (pending.length === 0) {
      return { syncedCount: 0, errorsCount: 0 };
    }

    let syncedCount = 0;
    let errorsCount = 0;

    for (const draft of pending) {
      try {
        draft.syncStatus = 'SYNCING';
        this.persistDrafts(drafts);

        const response = await fetch('/api/v1/shipments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('gramroute_access_token') || ''}`
          },
          body: JSON.stringify({
            pickupAddress: draft.pickupAddress,
            pickupCoordinates: draft.pickupCoordinates,
            destinationAddress: draft.destinationAddress,
            destinationCoordinates: draft.destinationCoordinates,
            cargoCategory: draft.cargoCategory,
            cargoDescription: draft.cargoDescription,
            weightKg: draft.weightKg,
            volumeM3: draft.volumeM3 || 1.0,
            packagesCount: draft.packagesCount || 1,
            preferredPickupDate: draft.preferredPickupDate,
            deliveryDeadline: draft.deliveryDeadline,
            perishable: draft.perishable,
            specialInstructions: draft.specialInstructions
          })
        });

        if (response.ok) {
          draft.syncStatus = 'SYNCED';
          syncedCount++;
        } else {
          draft.syncStatus = 'CONFLICT';
          draft.errorMessage = `Server responded with status ${response.status}`;
          errorsCount++;
        }
      } catch (err: any) {
        draft.syncStatus = 'CONFLICT';
        draft.errorMessage = err.message || 'Network sync failed';
        errorsCount++;
      }
    }

    // Retain only un-synced or conflict drafts
    const remainingDrafts = drafts.filter((d) => d.syncStatus !== 'SYNCED');
    this.persistDrafts(remainingDrafts);
    window.dispatchEvent(new CustomEvent('gramroute-drafts-updated', { detail: remainingDrafts }));

    return { syncedCount, errorsCount };
  }
}

export const offlineQueue = new OfflineQueueService();
