import { useState } from 'react';
import { CheckCircle2, XCircle, PauseCircle, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import type { Requisition } from '@ar-multiventures/types';

interface StatusTransitionModalProps {
  isOpen: boolean;
  targetStatus: 'APPROVED' | 'REJECTED' | 'ON_HOLD' | 'CANCELLED';
  requisition: Requisition | null;
  onClose: () => void;
  onConfirm: (status: string, reason?: string) => Promise<void>;
}

export function StatusTransitionModal({
  isOpen,
  targetStatus,
  requisition,
  onClose,
  onConfirm,
}: StatusTransitionModalProps) {
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !requisition) return null;

  const isReject = targetStatus === 'REJECTED';
  const isHold = targetStatus === 'ON_HOLD';
  const isApprove = targetStatus === 'APPROVED';

  const handleAction = async () => {
    if ((isReject || isHold) && !reason.trim()) {
      setError('A formal justification reason is required for this action.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      await onConfirm(targetStatus, reason.trim() || undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update requisition status');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            {isApprove && (
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            )}
            {isReject && (
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center border border-red-200">
                <XCircle className="h-5 w-5" />
              </div>
            )}
            {isHold && (
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <PauseCircle className="h-5 w-5" />
              </div>
            )}
            <div>
              <h3 className="text-body font-bold text-neutral-950">
                {isApprove && 'Authorize & Approve Requisition'}
                {isReject && 'Reject Requisition'}
                {isHold && 'Place Requisition On Hold'}
              </h3>
              <p className="text-caption text-neutral-500 font-mono">
                {requisition.referenceNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Summary Box */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-body-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Material & Tonnage:</span>
              <span className="font-bold text-neutral-900">{requisition.quantity}T {requisition.materialName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Source Extraction:</span>
              <span className="font-semibold text-neutral-900">{requisition.quarryName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Delivery Destination:</span>
              <span className="font-medium text-neutral-900">{requisition.destination}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-200">
              <span className="font-bold text-neutral-700">Commercial Total:</span>
              <span className="font-mono font-bold text-primary-800">{formatNaira(requisition.pricing.total)}</span>
            </div>
          </div>

          {/* Justification Input */}
          {(isReject || isHold) && (
            <div className="space-y-1">
              <Textarea
                label="Operational Reason / Justification *"
                placeholder={
                  isReject
                    ? 'e.g. Quarry currently experiencing aggregate maintenance outage. Sourcing unable to fulfill.'
                    : 'e.g. Awaiting client confirmation on site offloading gate clearance.'
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {isApprove && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-caption text-emerald-800">
              <AlertTriangle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Approving this order will notify the customer, schedule loading bay slots at <strong>{requisition.quarryName}</strong>, and initiate fulfillment for delivery on <strong>{formatDate(requisition.requestedDeliveryDate)}</strong>.
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-caption text-red-700 font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant={isApprove ? 'primary' : isReject ? 'destructive' : 'accent'}
            isLoading={isProcessing}
            onClick={handleAction}
            className="font-bold"
          >
            {isApprove && 'Confirm Approval'}
            {isReject && 'Confirm Rejection'}
            {isHold && 'Confirm Hold'}
          </Button>
        </div>
      </div>
    </div>
  );
}
