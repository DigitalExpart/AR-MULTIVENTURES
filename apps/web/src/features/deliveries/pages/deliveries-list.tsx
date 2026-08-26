import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageTransition } from '@/components/motion/page-transition';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PodViewerModal } from '@/components/delivery/pod-viewer-modal';
import {
  Truck,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Navigation,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Scale,
  Building2
} from 'lucide-react';
import { deliveryApi } from '@ar-multiventures/api';
import type { OrderFulfillmentSummary, DeliveryTripRecord } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

export function DeliveriesListPage() {
  const [fulfillments, setFulfillments] = useState<OrderFulfillmentSummary[]>([]);
  const [selectedTripForPod, setSelectedTripForPod] = useState<DeliveryTripRecord | null>(null);
  const [isPodOpen, setIsPodOpen] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({ 'req-01': true });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await deliveryApi.getCustomerFulfillments('cus-buildcorp');
        setFulfillments(data);
      } catch (err) {
        console.error('Failed to load deliveries:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleExpand = (reqId: string) => {
    setExpandedOrders((prev) => ({ ...prev, [reqId]: !prev[reqId] }));
  };

  const handleOpenPod = (trip: DeliveryTripRecord) => {
    setSelectedTripForPod(trip);
    setIsPodOpen(true);
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl mx-auto">
        <PageHeader
          title="Supply Haulage & Delivery Fulfillment"
          description="Track multi-trip order fulfillment, quarry loading departures, in-transit fleet progress, and signed Proof of Delivery (POD) documents."
          breadcrumbs={[{ label: 'Portal', href: '/app' }, { label: 'Deliveries' }]}
        />

        {/* Operational Disclaimer Banner */}
        <div className="p-3.5 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-between text-body-sm text-neutral-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary-800 shrink-0" />
            <span>
              <strong>Operational Status Tracking:</strong> Real-time checkpoints and trip statuses recorded directly from quarry weighbridge docks and site receiving engineers.
            </span>
          </div>
        </div>

        {/* Multi-Trip Order Cards */}
        <div className="space-y-6">
          {isLoading ? (
            <Card padding="lg" className="text-center text-caption text-neutral-400 font-mono">
              Loading delivery fulfillment records...
            </Card>
          ) : fulfillments.length === 0 ? (
            <Card padding="lg" className="text-center text-body-sm text-neutral-500">
              No active delivery orders found.
            </Card>
          ) : (
            fulfillments.map((order) => {
              const isExpanded = !!expandedOrders[order.requisitionId];

              return (
                <Card key={order.requisitionId} padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
                  {/* Order Fulfillment Header Summary */}
                  <div className="p-5 bg-neutral-50/70 border-b border-neutral-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-primary-900 text-body">
                            {order.referenceNumber}
                          </span>
                          <span className="text-neutral-400">·</span>
                          <span className="text-caption font-bold text-neutral-700">
                            {order.materialName}
                          </span>
                        </div>
                        <div className="text-caption text-neutral-600 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                          <span>{order.destinationName}</span>
                        </div>
                      </div>

                      {/* Progress Bar & Metric Numbers */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-body-sm font-mono">
                        <div className="text-right">
                          <div className="text-[11px] text-neutral-500 uppercase font-bold">
                            Fulfillment: {order.fulfillmentPercent}%
                          </div>
                          <div className="text-body font-black text-neutral-950">
                            <span className="text-emerald-800">{order.deliveredQuantity}T</span> / {order.orderedQuantity} Tonnes
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => toggleExpand(order.requisitionId)}
                          rightIcon={isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        >
                          {isExpanded ? 'Hide Trips' : `View ${order.trips.length} Trips`}
                        </Button>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="mt-4 w-full bg-neutral-200 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-600 h-full transition-all duration-500"
                        style={{ width: `${(order.deliveredQuantity / order.orderedQuantity) * 100}%` }}
                        title="Delivered"
                      />
                      <div
                        className="bg-blue-500 h-full transition-all duration-500"
                        style={{ width: `${(order.dispatchedQuantity / order.orderedQuantity) * 100}%` }}
                        title="In Transit"
                      />
                      <div
                        className="bg-amber-400 h-full transition-all duration-500"
                        style={{ width: `${(order.loadedQuantity / order.orderedQuantity) * 100}%` }}
                        title="Loading"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 mt-2">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          Delivered: {order.deliveredQuantity}T
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          In Transit: {order.dispatchedQuantity}T
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          Loading/Ready: {order.loadedQuantity}T
                        </span>
                      </div>
                      <span className="font-bold text-neutral-800">
                        Remaining: {order.remainingQuantity}T
                      </span>
                    </div>
                  </div>

                  {/* Individual Trips Table */}
                  {isExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-body-sm">
                        <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 uppercase text-[11px] font-mono font-bold tracking-wider">
                          <tr>
                            <th className="py-2.5 px-4">Trip Mission</th>
                            <th className="py-2.5 px-4">Truck & Driver</th>
                            <th className="py-2.5 px-4 font-mono">Planned (T)</th>
                            <th className="py-2.5 px-4">Weighbridge Net</th>
                            <th className="py-2.5 px-4">Operational Status</th>
                            <th className="py-2.5 px-4 text-right">Proof of Delivery</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {order.trips.map((t) => (
                            <tr key={t.id} className="hover:bg-neutral-50/80 transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-primary-800">
                                {t.tripNumber}
                                <span className="text-[11px] text-neutral-400 block font-sans">
                                  Trip {t.tripIndex} of {t.totalTripsInOrder}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-mono font-bold text-neutral-900">
                                  {t.truckRegistration || 'KJA-104-XA'}
                                </div>
                                <div className="text-caption text-neutral-500 flex items-center gap-1">
                                  {t.driverName}
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                                {t.plannedQuantityTonnes} T
                              </td>
                              <td className="py-3 px-4 font-mono text-caption text-neutral-700">
                                {t.weighbridge ? (
                                  <span className="font-bold text-emerald-800">
                                    {t.weighbridge.netWeightTonnes} T
                                  </span>
                                ) : (
                                  <span className="text-neutral-400">At Dock</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={cn(
                                    'px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase',
                                    t.status === 'DELIVERED' && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                                    t.status === 'IN_TRANSIT' && 'bg-blue-50 text-blue-800 border border-blue-200',
                                    t.status === 'LOADING' && 'bg-amber-50 text-amber-800 border border-amber-200',
                                    t.status === 'SCHEDULED' && 'bg-neutral-100 text-neutral-700'
                                  )}
                                >
                                  {t.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                {t.status === 'DELIVERED' && t.pod ? (
                                  <Button
                                    variant="outline"
                                    size="xs"
                                    onClick={() => handleOpenPod(t)}
                                    leftIcon={<FileCheck className="h-3.5 w-3.5 text-emerald-800" />}
                                  >
                                    View POD
                                  </Button>
                                ) : (
                                  <span className="text-caption text-neutral-400 font-mono">
                                    {t.status === 'IN_TRANSIT' ? 'En route' : 'Pending offload'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>

        <PodViewerModal
          isOpen={isPodOpen}
          onClose={() => setIsPodOpen(false)}
          trip={selectedTripForPod}
        />
      </div>
    </PageTransition>
  );
}
