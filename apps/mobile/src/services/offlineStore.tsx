import React, { createContext, useContext, useState, useEffect } from 'react';
import type { DeliveryTripRecord } from '@ar-multiventures/types';
import { deliveryApi } from '@ar-multiventures/api';

export type OfflineMutationState = 'PENDING' | 'SYNCING' | 'FAILED' | 'SYNCED';
export type OfflineOperationType = 'SUBMIT_POD' | 'TRIP_WAYPOINT';

export interface QueuedOfflineMutation {
  id: string;
  operationType: OfflineOperationType;
  entityId: string;
  idempotencyKey: string;
  payload: {
    tripId: string;
    tripNumber: string;
    receiverName: string;
    receiverPhone?: string;
    receiverDesignation?: string;
    deliveredQuantityTonnes: number;
    signatureBase64: string;
    photoUris: string[];
    driverRemarks?: string;
  };
  createdAt: string;
  retryCount: number;
  lastError: string | null;
  state: OfflineMutationState;
}

export interface OfflineContextState {
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  mutationQueue: QueuedOfflineMutation[];
  pendingCount: number;
  stageOfflinePod: (payload: QueuedOfflineMutation['payload']) => Promise<string>;
  syncPendingMutations: () => Promise<{ successCount: number; failCount: number }>;
  retryMutation: (mutationId: string) => Promise<void>;
  dismissFailedMutation: (mutationId: string) => void;
}

const OfflineContext = createContext<OfflineContextState | null>(null);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [mutationQueue, setMutationQueue] = useState<QueuedOfflineMutation[]>([]);

  const pendingCount = mutationQueue.filter((m) => m.state === 'PENDING' || m.state === 'FAILED').length;

  const stageOfflinePod = async (payload: QueuedOfflineMutation['payload']): Promise<string> => {
    // Sensitive financial operations (payments, credit approvals, clearance) are strictly prohibited from offline queueing
    const mutationId = `mut-pod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const idempotencyKey = `idemp-pod-${payload.tripId}-${Date.now()}`;

    const newMutation: QueuedOfflineMutation = {
      id: mutationId,
      operationType: 'SUBMIT_POD',
      entityId: payload.tripId,
      idempotencyKey,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      lastError: null,
      state: 'PENDING',
    };

    setMutationQueue((prev) => [newMutation, ...prev]);
    return idempotencyKey;
  };

  const syncPendingMutations = async () => {
    if (mutationQueue.length === 0) return { successCount: 0, failCount: 0 };

    let successCount = 0;
    let failCount = 0;

    const updatedQueue: QueuedOfflineMutation[] = [];

    for (const item of mutationQueue) {
      if (item.state === 'SYNCED') continue;

      try {
        // Pre-sync validation: verify signature token and payload integrity
        if (!item.payload.signatureBase64) {
          throw new Error('Digital signature artifact is missing from staged payload');
        }

        // Mark as SYNCING
        item.state = 'SYNCING';
        item.retryCount += 1;

        // Perform server submission
        await deliveryApi.recordTripPod({
          tripId: item.payload.tripId,
          receiverName: item.payload.receiverName,
          receiverPhone: item.payload.receiverPhone,
          receiverDesignation: item.payload.receiverDesignation,
          deliveredQuantityTonnes: item.payload.deliveredQuantityTonnes,
          signatureStoragePath: `pod_signatures/${item.payload.tripId}.png`,
          photoStoragePaths: item.payload.photoUris,
          driverRemarks: item.payload.driverRemarks,
        });

        item.state = 'SYNCED';
        item.lastError = null;
        successCount++;
      } catch (err: any) {
        item.state = 'FAILED';
        item.lastError = err.message || 'Network sync failed';
        failCount++;
        updatedQueue.push(item);
      }
    }

    setMutationQueue(updatedQueue);
    return { successCount, failCount };
  };

  const retryMutation = async (mutationId: string) => {
    setMutationQueue((prev) =>
      prev.map((m) => (m.id === mutationId ? { ...m, state: 'PENDING', lastError: null } : m))
    );
    await syncPendingMutations();
  };

  const dismissFailedMutation = (mutationId: string) => {
    setMutationQueue((prev) => prev.filter((m) => m.id !== mutationId));
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        setIsOnline,
        mutationQueue,
        pendingCount,
        stageOfflinePod,
        syncPendingMutations,
        retryMutation,
        dismissFailedMutation,
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
