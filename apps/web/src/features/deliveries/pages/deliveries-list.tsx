import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageTransition } from '@/components/motion/page-transition';
import { Card } from '@/components/ui/card';
import { Truck, MapPin, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { deliveryApi } from '@ar-multiventures/api';
import type { Delivery } from '@ar-multiventures/types';
import { formatDateTime } from '@ar-multiventures/business-logic';
import { OrderStatusBadge } from '@/components/business/order-status-badge';

export function DeliveriesListPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    async function loadDeliveries() {
      const data = await deliveryApi.list();
      setDeliveries(data);
    }
    loadDeliveries();
  }, []);

  return (
    <PageTransition>
      <PageHeader
        title="Fleet Deliveries & Haulage Tracking"
        description="Real-time transit statuses, checkpoint progress, and weighbridge offloading verification."
        breadcrumbs={[{ label: 'Deliveries' }]}
      />

      <div className="grid gap-5 max-w-5xl">
        {deliveries.map((del) => (
          <Card key={del.id} padding="lg" className="border-2 border-neutral-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-body-sm font-bold text-primary-700">{del.orderReference}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-caption font-bold uppercase text-neutral-600">
                      {del.truckRegistration}
                    </span>
                  </div>
                  <h3 className="text-h4 font-bold text-neutral-900 mt-0.5">
                    {del.quantity} {del.unit} · {del.materialName}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-caption font-bold border border-primary-200 uppercase">
                  {del.status}
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-body-sm">
              <div className="p-3 bg-surface-secondary rounded-lg">
                <span className="text-caption font-semibold text-neutral-500 uppercase">Quarry Origin</span>
                <p className="font-bold text-neutral-900 mt-0.5">{del.quarryName}</p>
                <p className="text-caption text-neutral-500">Dispatched: {formatDateTime(del.dispatchedAt || '')}</p>
              </div>

              <div className="p-3 bg-surface-secondary rounded-lg">
                <span className="text-caption font-semibold text-neutral-500 uppercase">Destination Site</span>
                <p className="font-bold text-neutral-900 mt-0.5">{del.destination}</p>
                <p className="text-caption text-neutral-500 line-clamp-1">{del.destinationAddress}</p>
              </div>

              <div className="p-3 bg-surface-secondary rounded-lg">
                <span className="text-caption font-semibold text-neutral-500 uppercase">Assigned Driver</span>
                <p className="font-bold text-neutral-900 mt-0.5">{del.driverName}</p>
                <a href={`tel:${del.driverPhone}`} className="text-caption text-primary-700 font-semibold flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3" /> {del.driverPhone}
                </a>
              </div>
            </div>

            {del.currentCheckpoint && (
              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-caption text-neutral-600">
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="h-4 w-4 text-accent-600" />
                  <span>Current Checkpoint: <strong className="text-neutral-900">{del.currentCheckpoint}</strong></span>
                </div>
                <span className="font-mono text-neutral-500">Estimated Arrival: {formatDateTime(del.estimatedArrival || '')}</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </PageTransition>
  );
}
