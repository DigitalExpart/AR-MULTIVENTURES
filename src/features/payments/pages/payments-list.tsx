import { PageHeader } from '@/components/layout/page-header';
import { PageTransition } from '@/components/motion/page-transition';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNaira, formatDate } from '@/lib/format';
import { mockPayments } from '@/services/mock/mock-data';

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  confirmed: 'success',
  pending: 'warning',
  failed: 'error',
  refunded: 'default',
};

export function PaymentsListPage() {
  return (
    <PageTransition>
      <PageHeader
        title="Payments"
        description="View your payment history"
        breadcrumbs={[{ label: 'Payments' }]}
      />
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider">Reference</th>
                <th className="text-left px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Description</th>
                <th className="text-right px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="text-right px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {mockPayments.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-3.5 text-body-sm font-medium text-primary-600">{p.referenceNumber}</td>
                  <td className="px-5 py-3.5 text-body-sm text-neutral-600 hidden sm:table-cell">{p.description}</td>
                  <td className="px-5 py-3.5 text-body-sm text-neutral-900 tabular-nums text-right">{formatNaira(p.amount)}</td>
                  <td className="px-5 py-3.5 text-body-sm text-neutral-500 hidden md:table-cell">{formatDate(p.createdAt)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Badge variant={statusColors[p.status] || 'default'} size="sm">
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageTransition>
  );
}
