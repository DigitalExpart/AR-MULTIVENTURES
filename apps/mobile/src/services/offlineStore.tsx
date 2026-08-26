import React, { createContext, useContext, useState } from 'react';
import type { DeliveryTripRecord } from '@ar-multiventures/types';
import { deliveryApi } from '@ar-multiventures/api';

export interface StagedOfflinePod {
  idempotencyKey: string;
  tripId: string;
  tripNumber: string;
  receiverName: string;
  receiverPhone?: string;
  receiverDesignation?: string;
  deliveredQuantityTonnes: number;
  signatureBase64: string;
  photoUris: string[];
  driverRemarks?: string;
  stagedAt: string;
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  errorMessage?: string;
}

export interface OfflineContextState {
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  pendingPods: StagedOfflinePod[];
  stageOfflinePod: (pod: Omit<StagedOfflinePod, 'idempotencyKey' | 'stagedAt' | 'status'>) => Promise<string>;
  syncPendingPods: () => Promise<{ successCount: number; failCount: number }>;
  clearSyncedPod: (idempotencyKey: string) => void;
}

const OfflineContext = createContext<OfflineContextState | null>(null);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingPods, setPendingPods] = useState<StagedOfflinePod[]>([]);

  const stageOfflinePod = async (
    podData: Omit<StagedOfflinePod, 'idempotencyKey' | 'stagedAt' | 'status'>
  ): Promise<string> => {
    const idempotencyKey = `pod-offline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const stagedItem: StagedOfflinePod = {
      ...podData,
      idempotencyKey,
      stagedAt: new Date().toISOString(),
      status: 'PENDING',
    };

    setPendingPods((prev) => [stagedItem, ...prev]);
    return idempotencyKey;
  };

  const syncPendingPods = async () => {
    if (pendingPods.length === 0) return { successCount: 0, failCount: 0 };

    let successCount = 0;
    let failCount = 0;

    const remainingPods: StagedOfflinePod[] = [];

    for (const pod of pendingPods) {
      try {
        await deliveryApi.recordTripPod({
          tripId: pod.tripId,
          receiverName: pod.receiverName,
          receiverPhone: pod.receiverPhone,
          receiverDesignation: pod.receiverDesignation,
          deliveredQuantityTonnes: pod.deliveredQuantityTonnes,
          signatureStoragePath: `pod_signatures/${pod.tripId}.png`,
          photoStoragePaths: pod.photoUris,
          driverRemarks: pod.driverRemarks,
        });
        successCount++;
      } catch (err: any) {
        failCount++;
        remainingPods.push({
          ...pod,
          status: 'FAILED',
          errorMessage: err.message || 'Sync failed',
        });
      }
    }

    setPendingPods(remainingPods);
    return { successCount, failCount };
  };

  const clearSyncedPod = (idempotencyKey: string) => {
    setPendingPods((prev) => prev.filter((p) => p.idempotencyKey !== idempotencyKey));
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        setIsOnline,
        pendingPods,
        stageOfflinePod,
        syncPendingPods,
        clearSyncedPod,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
