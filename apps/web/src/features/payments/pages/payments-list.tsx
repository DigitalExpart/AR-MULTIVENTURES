import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { PageTransition } from '@/components/motion/page-transition';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReceiptModal } from '@/components/finance/receipt-modal';
import { CheckoutModal } from '@/components/finance/checkout-modal';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { financeApi } from '@ar-multiventures/api';
import type { PaymentRecord, ReceiptRecord, InvoiceRecord } from '@ar-multiventures/types';
import {
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  Eye,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterTab = 'ALL' | 'CONFIRMED' | 'PENDING' | 'FAILED';

export function PaymentsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptRecord | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [callbackBanner, setCallbackBanner] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pList, iList] = await Promise.all([
        financeApi.getPayments(),
        financeApi.getInvoices({ customerId: 'cus-buildcorp' }),
      ]);
      setPayments(pList);
      setInvoices(iList);
    } catch (err) {
      console.error('Failed to load payment history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Check for callback reference in URL (e.g. Paystack return redirect)
    const ref = searchParams.get('reference') || searchParams.get('mock_reference');
    if (ref) {
      financeApi.verifyOnlinePayment(ref).then((res) => {
        if (res.success) {
          setCallbackBanner(`Payment ${ref} has been successfully verified and posted to your ledger!`);
          loadData();
        }
      }).catch((err) => {
        console.error('Callback verification failed:', err);
      });
    }
  }, []);

  const handleOpenReceipt = async (p: PaymentRecord) => {
    setSelectedPayment(p);
    try {
      const r = await financeApi.getReceiptByPaymentId(p.id);
      setSelectedReceipt(r);
    } catch {
      setSelectedReceipt(null);
    }
    setIsReceiptOpen(true);
  };

  const filteredPayments = payments.filter((p) => {
    // Tab filter
    if (activeTab === 'CONFIRMED' && p.status !== 'CONFIRMED') return false;
    if (activeTab === 'PENDING' && p.status !== 'PENDING') return false;
    if (activeTab === 'FAILED' && p.status !== 'FAILED') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.paymentReference.toLowerCase().includes(q) ||
        p.bankReference?.toLowerCase().includes(q) ||
        p.externalReference?.toLowerCase().includes(q) ||
        p.invoiceNumber?.toLowerCase().includes(q) ||
        p.paymentMethod.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader
            title="Payment & Settlement History"
            description="Audit log of verified online gateway transactions, customer bank deposits, and authoritative receipts."
            breadcrumbs={[{ label: 'Portal', href: '/app' }, { label: 'Payments' }]}
          />

          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCheckoutOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
              className="font-bold shadow-2xs"
            >
              Make Payment / Record Transfer
            </Button>
          </div>
        </div>

        {/* Callback Verification Alert */}
        {callbackBanner && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-body-sm text-emerald-900 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-800 shrink-0" />
              <span>{callbackBanner}</span>
            </div>
            <button
              onClick={() => {
                setCallbackBanner(null);
                setSearchParams({});
              }}
              className="text-caption font-bold text-emerald-800 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl max-w-fit">
            {(['ALL', 'CONFIRMED', 'PENDING', 'FAILED'] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-caption font-bold transition-all',
                  activeTab === tab
                    ? 'bg-white text-primary-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                )}
              >
                {tab === 'ALL'
                  ? 'All Transactions'
                  : tab === 'CONFIRMED'
                  ? 'Confirmed'
                  : tab === 'PENDING'
                  ? 'Pending Review'
                  : 'Failed / Rejected'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-xs w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search reference, bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-body-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-800"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Payment Ref #</th>
                  <th className="py-3 px-4">Channel / Method</th>
                  <th className="py-3 px-4">Invoice / Description</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 font-mono">Amount (₦)</th>
                  <th className="py-3 px-4">Bank / Gateway Ref</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Official Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-caption text-neutral-400">
                      Loading payment transactions...
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-caption text-neutral-500">
                      No payment transactions match your selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-primary-800">
                        {p.paymentReference}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1.5 text-caption font-semibold uppercase text-neutral-700 font-mono">
                          {p.paymentMethod === 'PAYSTACK' ? (
                            <>
                              <CreditCard className="h-3.5 w-3.5 text-emerald-800" />
                              Paystack
                            </>
                          ) : (
                            <>
                              <Building2 className="h-3.5 w-3.5 text-primary-800" />
                              Bank Transfer
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-caption font-medium text-neutral-800">
                        {p.invoiceNumber ? (
                          <span className="font-mono font-bold text-primary-900">{p.invoiceNumber}</span>
                        ) : (
                          p.notes || 'Supply payment'
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-caption text-neutral-600">
                        {formatDate(p.paymentDate)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-emerald-800 text-body-sm">
                        {formatNaira(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-caption text-neutral-600">
                        {p.bankReference || p.externalReference || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[11px] font-bold uppercase',
                            p.status === 'CONFIRMED' && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                            p.status === 'PENDING' && 'bg-amber-50 text-amber-800 border border-amber-200',
                            p.status === 'FAILED' && 'bg-red-50 text-red-700 border border-red-200'
                          )}
                        >
                          {p.status === 'PENDING' ? 'Pending Review' : p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {p.status === 'CONFIRMED' ? (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleOpenReceipt(p)}
                            leftIcon={<Receipt className="h-3.5 w-3.5 text-emerald-800" />}
                          >
                            View Receipt
                          </Button>
                        ) : (
                          <span className="text-[11px] text-neutral-400 font-mono">
                            Awaiting verification
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

        {/* Modals */}
        <ReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          receipt={selectedReceipt}
          payment={selectedPayment}
        />

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          invoice={invoices.find((i) => i.outstandingAmount > 0) || invoices[0] || null}
          onSuccess={() => {
            loadData();
          }}
        />
      </div>
    </PageTransition>
  );
}
