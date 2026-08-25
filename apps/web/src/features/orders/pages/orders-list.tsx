import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageTransition } from '@/components/motion/page-transition';
import { Card } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/business/order-status-badge';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { orderApi } from '@ar-multiventures/api';
import type { Order } from '@ar-multiventures/types';

export function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function loadOrders() {
      const data = await orderApi.list();
      setOrders(data);
    }
    loadOrders();
  }, []);

  return (
    <PageTransition>
      <PageHeader
        title="Active Orders"
        description="Monitor dispatched orders, driver assignments, and fulfillment milestones."
        breadcrumbs={[{ label: 'Orders' }]}
      />

      <Card padding="none">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
                <th className="text-left px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Order Reference</th>
                <th className="text-left px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Material</th>
                <th className="text-left px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Quantity</th>
                <th className="text-left px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Quarry Origin</th>
                <th className="text-left px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Destination</th>
                <th className="text-right px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Total</th>
                <th className="text-right px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="px-5 py-4 text-body-sm font-mono font-bold text-primary-700">
                    {order.referenceNumber}
                  </td>
                  <td className="px-5 py-4 text-body-sm font-medium text-neutral-900">
                    {order.materialName}
                  </td>
                  <td className="px-5 py-4 text-body-sm text-neutral-600 font-mono">
                    {order.quantity} {order.unit}
                  </td>
                  <td className="px-5 py-4 text-body-sm text-neutral-600">
                    {order.quarryName}
                  </td>
                  <td className="px-5 py-4 text-body-sm text-neutral-600 max-w-[180px] truncate">
                    {order.destination}
                  </td>
                  <td className="px-5 py-4 text-body-sm font-mono font-bold text-neutral-900 text-right">
                    {formatNaira(order.totalAmount)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <OrderStatusBadge status={order.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Alternative */}
        <div className="md:hidden divide-y divide-neutral-100 p-3 space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="p-3.5 bg-surface-secondary rounded-lg border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-body-sm font-bold text-primary-700">{order.referenceNumber}</span>
                <OrderStatusBadge status={order.status} size="sm" />
              </div>
              <div>
                <p className="text-body font-bold text-neutral-900">{order.materialName}</p>
                <p className="text-caption text-neutral-500">{order.quantity} {order.unit} · {order.quarryName}</p>
              </div>
              <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-caption">
                <span className="text-neutral-500">Destination: {order.destination}</span>
                <span className="font-mono font-bold text-neutral-900 text-body-sm">{formatNaira(order.totalAmount)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageTransition>
  );
}
