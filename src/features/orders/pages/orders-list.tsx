import { PageHeader } from '@/components/layout/page-header';
import { PageTransition } from '@/components/motion/page-transition';
import { Card } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/business/order-status-badge';
import { formatNaira, formatDate } from '@/lib/format';
import { mockOrders } from '@/services/mock/mock-data';

export function OrdersListPage() {
  return (
    <PageTransition>
      <PageHeader
        title="Orders"
        description="Track your material supply orders"
        breadcrumbs={[{ label: 'Orders' }]}
      />
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider">Reference</th>
                <th className="text-left px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider">Material</th>
                <th className="text-left px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Destination</th>
                <th className="text-right px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Amount</th>
                <th className="text-right px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {mockOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-3.5 text-body-sm font-medium text-primary-600">{order.referenceNumber}</td>
                  <td className="px-5 py-3.5 text-body-sm text-neutral-900">{order.materialName}</td>
                  <td className="px-5 py-3.5 text-body-sm text-neutral-600 hidden sm:table-cell">{order.destination}</td>
                  <td className="px-5 py-3.5 text-body-sm text-neutral-900 tabular-nums text-right hidden md:table-cell">{formatNaira(order.totalAmount)}</td>
                  <td className="px-5 py-3.5 text-right"><OrderStatusBadge status={order.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageTransition>
  );
}
