import { PageHeader } from '@/components/layout/page-header';
import { PageTransition } from '@/components/motion/page-transition';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNaira, formatDate } from '@/lib/format';
import { mockInvoices } from '@/services/mock/mock-data';
import { cn } from '@/lib/utils';

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
  paid: 'success',
  issued: 'info',
  overdue: 'error',
  draft: 'default',
  cancelled: 'error',
};

export function InvoicesListPage() {
  return (
    <PageTransition>
      <PageHeader
        title="Invoices"
        description="View and manage your invoices"
        breadcrumbs={[{ label: 'Invoices' }]}
      />
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider">Invoice #</th>
                <th className="text-left px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Order</th>
                <th className="text-right px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Due Date</th>
                <th className="text-right px-5 py-3 text-caption font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {mockInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-3.5 text-body-sm font-medium text-primary-600">{inv.invoiceNumber}</td>
                  <td className="px-5 py-3.5 text-body-sm text-neutral-600 hidden sm:table-cell">{inv.orderReference}</td>
                  <td className="px-5 py-3.5 text-body-sm text-neutral-900 tabular-nums text-right">{formatNaira(inv.total)}</td>
                  <td className="px-5 py-3.5 text-body-sm text-neutral-500 hidden md:table-cell">{formatDate(inv.dueDate)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Badge variant={statusColors[inv.status] || 'default'} size="sm">
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
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
