import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, XCircle, PauseCircle,
  Building2, Mountain, Layers, Truck, MapPin, Calendar,
  ShieldCheck, AlertCircle, Clock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/business/status-badge';
import { PriceBreakdown } from '@/components/business/price-breakdown';
import { StatusTransitionModal } from '@/components/admin/status-transition-modal';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { adminApi } from '@ar-multiventures/api';
import type { Requisition } from '@ar-multiventures/types';

export function AdminRequisitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Transition Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    targetStatus: 'APPROVED' | 'REJECTED' | 'ON_HOLD' | 'CANCELLED';
  }>({
    isOpen: false,
    targetStatus: 'APPROVED',
  });

  const loadRequisition = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await adminApi.getRequisitionById(id);
      setRequisition(data);
    } catch (err) {
      console.error('Failed to load requisition:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequisition();
  }, [id]);

  const handleStatusTransition = async (targetStatus: string, reason?: string) => {
    if (!id) return;
    await adminApi.transitionRequisitionStatus(id, targetStatus, reason);
    await loadRequisition();
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-body-sm text-neutral-500">
        Loading requisition details...
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="py-20 text-center space-y-3">
        <h3 className="text-h3 font-bold text-neutral-900">Requisition Not Found</h3>
        <p className="text-body-sm text-neutral-500">The requisition reference does not exist.</p>
        <Link to="/admin/requisitions">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Requisitions
          </Button>
        </Link>
      </div>
    );
  }

  const isSubmitted = requisition.status === 'submitted';
  const isApproved = requisition.status === 'approved';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={`Requisition ${requisition.referenceNumber}`}
        description={`Created on ${formatDate(requisition.createdAt)} · Target Delivery: ${formatDate(requisition.requestedDeliveryDate)}`}
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin' },
          { label: 'Requisitions', href: '/admin/requisitions' },
          { label: requisition.referenceNumber },
        ]}
        action={
          <div className="flex items-center gap-2.5">
            {isSubmitted && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalState({ isOpen: true, targetStatus: 'ON_HOLD' })}
                  leftIcon={<PauseCircle className="h-4 w-4 text-amber-600" />}
                >
                  Put On Hold
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setModalState({ isOpen: true, targetStatus: 'REJECTED' })}
                  leftIcon={<XCircle className="h-4 w-4" />}
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setModalState({ isOpen: true, targetStatus: 'APPROVED' })}
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                  className="font-bold"
                >
                  Approve Order
                </Button>
              </>
            )}
            {isApproved && (
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-caption font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Approved for Loading
              </span>
            )}
          </div>
        }
      />

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Order Overview, Material Items & Status Progression */}
        <div className="lg:col-span-8 space-y-6">
          {/* Order Overview Header Card */}
          <Card padding="md" className="bg-white border-neutral-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-h3 text-neutral-950">
                  {requisition.referenceNumber}
                </span>
                <StatusBadge status={requisition.status} />
              </div>
              <span className="text-caption font-mono text-neutral-400">
                LOG ID: {requisition.id.slice(0, 8)}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-body-sm">
              <div className="space-y-1">
                <span className="text-caption text-neutral-500 font-semibold flex items-center gap-1.5">
                  <Mountain className="h-3.5 w-3.5 text-neutral-400" />
                  Sourcing Quarry
                </span>
                <div className="font-bold text-neutral-900">{requisition.quarryName}</div>
              </div>

              <div className="space-y-1">
                <span className="text-caption text-neutral-500 font-semibold flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-neutral-400" />
                  Logistics & Transport
                </span>
                <div className="font-bold text-neutral-900">
                  {requisition.transportationType === 'self' ? 'Self-Pickup (Client Arranged)' : 'AR Multiventures Heavy Fleet (30T)'}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-caption text-neutral-500 font-semibold flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                  Delivery Destination
                </span>
                <div className="font-bold text-neutral-900">{requisition.destination}</div>
                <div className="text-caption text-neutral-500">{requisition.destinationAddress}</div>
              </div>

              <div className="space-y-1">
                <span className="text-caption text-neutral-500 font-semibold flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                  Requested Delivery Window
                </span>
                <div className="font-mono font-bold text-neutral-900">
                  {formatDate(requisition.requestedDeliveryDate)}
                </div>
              </div>
            </div>

            {requisition.notes && (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-caption text-neutral-700">
                <span className="font-bold text-neutral-900">Site Notes / Gate Access: </span>
                {requisition.notes}
              </div>
            )}
          </Card>

          {/* Materials Line Item Specification Table */}
          <Card padding="none" className="bg-white border-neutral-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
              <h4 className="text-body-sm font-bold text-neutral-900 uppercase tracking-wide">
                Material Line Items
              </h4>
              <span className="text-caption font-mono text-neutral-500">1 Item</span>
            </div>

            <table className="w-full text-left text-body-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold">
                <tr>
                  <th className="py-2.5 px-4">Material Aggregate</th>
                  <th className="py-2.5 px-4">Ordered Quantity</th>
                  <th className="py-2.5 px-4">Frozen Unit Rate</th>
                  <th className="py-2.5 px-4 text-right">Line Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="py-3 px-4 font-bold text-neutral-900">
                    {requisition.materialName}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-neutral-800">
                    {requisition.quantity} Tonnes
                  </td>
                  <td className="py-3 px-4 font-mono text-neutral-600">
                    {formatNaira(requisition.pricing.materialCost / requisition.quantity)} / T
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-neutral-900 text-right">
                    {formatNaira(requisition.pricing.materialCost)}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>

          {/* Status Progression Timeline */}
          <Card padding="md" className="bg-white border-neutral-200 shadow-2xs space-y-4">
            <h4 className="text-body-sm font-bold text-neutral-900 uppercase tracking-wide">
              Requisition Lifecycle Audit Trail
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
              <div className="relative">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-primary-600 ring-4 ring-white" />
                <div className="flex items-center justify-between text-body-sm">
                  <span className="font-bold text-neutral-900">Requisition Initialized & Submitted</span>
                  <span className="text-[11px] font-mono text-neutral-400">{formatDate(requisition.createdAt)}</span>
                </div>
                <p className="text-caption text-neutral-500 mt-0.5">
                  Logged by customer with frozen commercial quote.
                </p>
              </div>

              {isApproved && (
                <div className="relative">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="font-bold text-emerald-900">Order Authorized & Approved</span>
                    <span className="text-[11px] font-mono text-neutral-400">Operations Sign-off</span>
                  </div>
                  <p className="text-caption text-emerald-700 mt-0.5">
                    Authorized for loading bay slot allocation and dispatch coordination.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right 4 Cols: Frozen Commercial Snapshot */}
        <div className="lg:col-span-4 space-y-4">
          <Card padding="md" className="bg-white border-2 border-neutral-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h4 className="text-body font-bold text-neutral-900 uppercase tracking-wide">
                Commercial Snapshot
              </h4>
              <span className="text-[10px] font-mono font-bold bg-primary-50 text-primary-700 px-2 py-0.5 rounded border border-primary-200">
                FROZEN PRICE
              </span>
            </div>

            <PriceBreakdown
              items={[
                { label: `Material Extraction (${requisition.quantity}T)`, amount: requisition.pricing.materialCost },
                { label: 'Quarry Automated Loading Ticket', amount: requisition.pricing.loadingCharges },
                { label: 'Heavy Fleet Haulage', amount: requisition.pricing.haulageCharges },
                ...(requisition.pricing.otherCharges > 0
                  ? [{ label: 'Logistics Fuel Adjustment', amount: requisition.pricing.otherCharges }]
                  : []),
                ...(requisition.pricing.discount > 0
                  ? [{ label: 'Volume Tier Discount', amount: requisition.pricing.discount, isDiscount: true }]
                  : []),
              ]}
              total={requisition.pricing.total}
            />

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-[11px] text-neutral-500 leading-tight">
              <ShieldCheck className="h-4 w-4 text-primary-700 inline mr-1" />
              <strong>Financial Audit Guarantee:</strong> This commercial snapshot is immutable in PostgreSQL. Future modifications to price master tables will not alter this billing snapshot.
            </div>
          </Card>
        </div>
      </div>

      {/* Transition Modal */}
      <StatusTransitionModal
        isOpen={modalState.isOpen}
        targetStatus={modalState.targetStatus}
        requisition={requisition}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={handleStatusTransition}
      />
    </div>
  );
}
