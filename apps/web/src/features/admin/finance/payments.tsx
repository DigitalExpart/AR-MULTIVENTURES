import { useState, useEffect } from 'react';
import { CreditCard, Search, CheckCircle2, Clock, X, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { financeApi } from '@ar-multiventures/api';
import type { PaymentRecord, InvoiceRecord } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

export function AdminFinancePaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bankRefInput, setBankRefInput] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pList, iList] = await Promise.all([
        financeApi.getPayments(),
        financeApi.getInvoices({ status: 'issued' }),
      ]);
      setPayments(pList);
      setInvoices(iList);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openConfirmation = (p: PaymentRecord) => {
    setSelectedPayment(p);
    setBankRefInput(p.bankReference || '');
    setIsConfirmModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment) return;
    setIsConfirming(true);
    try {
      // Find open invoices for this customer to allocate
      const openInvs = invoices.filter((i) => i.customerId === selectedPayment.customerId);
      const allocations: Array<{ invoiceId: string; amount: number }> = [];
      let rem = selectedPayment.amount;

      for (const inv of openInvs) {
        if (rem <= 0) break;
        const alloc = Math.min(rem, inv.outstandingAmount);
        if (alloc > 0) {
          allocations.push({ invoiceId: inv.id, amount: alloc });
          rem -= alloc;
        }
      }

      await financeApi.confirmPayment(selectedPayment.id, bankRefInput || undefined, allocations);
      setIsConfirmModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to confirm payment:', err);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Payments & Bank Transfer Reconciliation"
        description="Review customer bank deposits, verify teller references, and atomically post sub-ledger credits and invoice settlements."
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin' },
          { label: 'Finance', href: '/admin/finance' },
          { label: 'Payments' },
        ]}
      />

      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Payment Ref #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 font-mono">Amount (₦)</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Bank Reference</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-caption text-neutral-400">
                    Loading payment records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-body-sm text-neutral-500">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary-800">
                      {p.paymentReference}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-900 truncate max-w-[180px]">
                      {p.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-caption font-semibold uppercase text-neutral-700">
                      {p.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-800 text-body">
                      {formatNaira(p.amount)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-caption text-neutral-600">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-caption text-neutral-800">
                      {p.bankReference || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[11px] font-bold uppercase',
                          p.status === 'CONFIRMED' && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                          p.status === 'PENDING' && 'bg-amber-50 text-amber-800 border border-amber-200'
                        )}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.status === 'PENDING' ? (
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => openConfirmation(p)}
                          leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                          className="font-bold"
                        >
                          Confirm
                        </Button>
                      ) : (
                        <span className="text-caption font-semibold text-emerald-800">
                          Credited
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-body font-bold text-neutral-950">Confirm Payment Deposit</h3>
                  <p className="text-caption text-neutral-500 font-mono">{selectedPayment.paymentReference}</p>
                </div>
              </div>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2 text-body-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Customer:</span>
                  <span className="font-bold text-neutral-900">{selectedPayment.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Deposit Amount:</span>
                  <span className="font-mono font-black text-emerald-800 text-body">{formatNaira(selectedPayment.amount)}</span>
                </div>
              </div>

              <Input
                label="Bank Statement Transaction Reference *"
                placeholder="e.g. GTB-TRF-998822"
                value={bankRefInput}
                onChange={(e) => setBankRefInput(e.target.value)}
                required
              />

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 leading-tight">
                <strong>Accounting Postings:</strong> Confirming this payment will post an immutable <strong>₦{selectedPayment.amount.toLocaleString()} CREDIT</strong> to the customer sub-ledger and settle matching open invoices.
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={isConfirming}
                onClick={handleConfirmPayment}
                className="font-bold"
              >
                Confirm & Post Credit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
