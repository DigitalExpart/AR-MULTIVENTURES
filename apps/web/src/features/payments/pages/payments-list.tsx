import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageTransition } from '@/components/motion/page-transition';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { paymentApi } from '@ar-multiventures/api';
import type { Payment } from '@ar-multiventures/types';
import { CreditCard, CheckCircle2 } from 'lucide-react';

export function PaymentsListPage() {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    async function loadPayments() {
      const data = await paymentApi.list();
      setPayments(data);
    }
    loadPayments();
  }, []);

  return (
    <PageTransition>
      <PageHeader
        title="Payment & Transaction History"
        description="Audit log of all verified bank transfers, payments, and account debits."
        breadcrumbs={[{ label: 'Payments' }]}
      />

      <Card padding="none">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
                <th className="text-left px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Payment Ref</th>
                <th className="text-left px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Description</th>
                <th className="text-left px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Method</th>
                <th className="text-left px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Date & Time</th>
                <th className="text-right px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Amount</th>
                <th className="text-right px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="px-5 py-4 text-body-sm font-mono font-bold text-primary-700">
                    {p.referenceNumber}
                  </td>
                  <td className="px-5 py-4 text-body-sm font-medium text-neutral-900 max-w-sm">
                    {p.description}
                  </td>
                  <td className="px-5 py-4 text-body-sm text-neutral-600 uppercase font-mono text-caption font-semibold">
                    {p.method.replace('_', ' ')}
                  </td>
                  <td className="px-5 py-4 text-body-sm text-neutral-600">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-body-sm font-mono font-bold text-neutral-900 text-right">
                    {formatNaira(p.amount)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Badge variant="success" size="sm" dot>
                      CONFIRMED
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Alternative */}
        <div className="md:hidden divide-y divide-neutral-100 p-3 space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="p-3.5 bg-surface-secondary rounded-lg border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-body-sm font-bold text-primary-700">{p.referenceNumber}</span>
                <Badge variant="success" size="sm">
                  CONFIRMED
                </Badge>
              </div>
              <p className="text-body-sm text-neutral-900 font-medium">{p.description}</p>
              <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-caption text-neutral-500">
                <span>{formatDate(p.createdAt)}</span>
                <span className="font-mono font-bold text-neutral-900 text-body-sm">{formatNaira(p.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageTransition>
  );
}
