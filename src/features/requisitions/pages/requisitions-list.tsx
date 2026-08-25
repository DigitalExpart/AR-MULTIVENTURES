import { Link } from 'react-router-dom';
import { PlusCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { PageTransition } from '@/components/motion/page-transition';
import { OrderStatusBadge } from '@/components/business/order-status-badge';
import { formatNaira, formatDate } from '@/lib/format';
import { mockRequisitions } from '@/services/mock/mock-data';

export function RequisitionsListPage() {
  return (
    <PageTransition>
      <PageHeader
        title="Requisitions"
        description="Manage your material supply requisitions"
        breadcrumbs={[{ label: 'Requisitions' }]}
        actions={
          <Link to="/app/requisitions/new">
            <Button leftIcon={<PlusCircle className="h-4 w-4" />}>
              New Requisition
            </Button>
          </Link>
        }
      />

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider">Reference</th>
                <th className="text-left px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider">Material</th>
                <th className="text-left px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Quarry</th>
                <th className="text-left px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Qty</th>
                <th className="text-right px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider hidden lg:table-cell">Amount</th>
                <th className="text-left px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="text-right px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {mockRequisitions.map((req) => (
                <tr key={req.id} className="hover:bg-neutral-50 transition-colors cursor-pointer">
                  <td className="px-5 py-3.5 text-body-sm font-medium text-primary-600">{req.referenceNumber}</td>
                  <td className="px-5 py-3.5 text-body-sm text-neutral-900">{req.materialName}</td>
                  <td className="px-5 py-3.5 text-body-sm text-neutral-600 hidden md:table-cell">{req.quarryName}</td>
                  <td className="px-5 py-3.5 text-body-sm text-neutral-600 hidden sm:table-cell">{req.quantity} {req.unit}</td>
                  <td className="px-5 py-3.5 text-body-sm text-neutral-900 tabular-nums text-right hidden lg:table-cell">{formatNaira(req.pricing.total)}</td>
                  <td className="px-5 py-3.5 text-body-sm text-neutral-500 hidden lg:table-cell">{formatDate(req.createdAt)}</td>
                  <td className="px-5 py-3.5 text-right"><OrderStatusBadge status={req.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageTransition>
  );
}
