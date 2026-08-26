import { useState, useEffect } from 'react';
import {
  CreditCard,
  Building2,
  Search,
  CheckCircle2,
  Clock,
  X,
  AlertTriangle,
  FileText,
  Eye,
  Filter,
  Ban,
  ShieldCheck
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { ReceiptModal } from '@/components/finance/receipt-modal';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { financeApi } from '@ar-multiventures/api';
import type { PaymentRecord, InvoiceRecord, ReceiptRecord } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

type AdminPaymentTab = 'ALL' | 'ONLINE' | 'BANK_TRANSFERS' | 'PENDING_REVIEW' | 'CONFIRMED' | 'FAILED';

export function AdminFinancePaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<AdminPaymentTab>('PENDING_REVIEW');
  const [searchQuery, setSearchQuery] = useState('');

  // Confirmation Modal State
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bankRefInput, setBankRefInput] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  // Rejection Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptRecord | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

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

  const openRejection = (p: PaymentRecord) => {
    setSelectedPayment(p);
    setRejectReasonInput('');
    setIsRejectModalOpen(true);
  };

  const openReceiptView = async (p: PaymentRecord) => {
    setSelectedPayment(p);
    try {
      const r = await financeApi.getReceiptByPaymentId(p.id);
      setSelectedReceipt(r);
    } catch {
      setSelectedReceipt(null);
    }
    setIsReceiptOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment) return;
    setIsConfirming(true);
    try {
      // Allocate to open invoices for this customer
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

  const handleRejectPayment = async () => {
    if (!selectedPayment) return;
    if (!rejectReasonInput.trim()) return;

    setIsRejecting(true);
    try {
      await financeApi.rejectBankTransfer(selectedPayment.id, rejectReasonInput.trim());
      setIsRejectModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to reject payment:', err);
    } finally {
      setIsRejecting(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    // Tab filtering
    if (activeTab === 'ONLINE' && p.paymentMethod !== 'PAYSTACK') return false;
    if (activeTab === 'BANK_TRANSFERS' && p.paymentMethod !== 'BANK_TRANSFER') return false;
    if (activeTab === 'PENDING_REVIEW' && p.status !== 'PENDING') return false;
    if (activeTab === 'CONFIRMED' && p.status !== 'CONFIRMED') return false;
    if (activeTab === 'FAILED' && p.status !== 'FAILED') return false;

    // Search filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.paymentReference.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.bankReference?.toLowerCase().includes(q) ||
        p.externalReference?.toLowerCase().includes(q) ||
        p.invoiceNumber?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Payments & Bank Transfer Reconciliation"
        description="Review customer bank deposits, verify teller references, confirm Paystack gateway settlements, and atomically post sub-ledger credits."
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin' },
          { label: 'Finance', href: '/admin/finance' },
          { label: 'Payments' },
        ]}
      />

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl overflow-x-auto">
          {(
            [
              { id: 'PENDING_REVIEW', label: 'Pending Review' },
              { id: 'ALL', label: 'All Transactions' },
              { id: 'ONLINE', label: 'Paystack Online' },
              { id: 'BANK_TRANSFERS', label: 'Bank Transfers' },
              { id: 'CONFIRMED', label: 'Confirmed' },
              { id: 'FAILED', label: 'Rejected / Failed' },
            ] as Array<{ id: AdminPaymentTab; label: string }>
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-caption font-bold whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-white text-primary-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              {tab.label}
              {tab.id === 'PENDING_REVIEW' && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded-full text-[10px] font-mono">
                  {payments.filter((p) => p.status === 'PENDING').length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search reference, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-body-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-800"
          />
        </div>
      </div>

      {/* Main Reconciliation Table */}
      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Payment Ref #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Channel / Method</th>
                <th className="py-3 px-4 font-mono">Amount (₦)</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Bank / Gateway Ref</th>
                <th className="py-3 px-4">Proof</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Reconciliation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-caption text-neutral-400">
                    Loading payment records...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-body-sm text-neutral-500">
                    No payment records match current filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary-800">
                      {p.paymentReference}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-900 truncate max-w-[180px]">
                      {p.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-caption font-semibold uppercase text-neutral-700 font-mono">
                      {p.paymentMethod === 'PAYSTACK' ? (
                        <span className="flex items-center gap-1 text-emerald-800">
                          <CreditCard className="h-3.5 w-3.5" />
                          Paystack
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-primary-900">
                          <Building2 className="h-3.5 w-3.5" />
                          Bank Transfer
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-800 text-body">
                      {formatNaira(p.amount)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-caption text-neutral-600">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-caption text-neutral-800">
                      {p.bankReference || p.externalReference || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-caption">
                      {p.proofStoragePath ? (
                        <span className="inline-flex items-center gap-1 text-primary-800 font-bold hover:underline cursor-pointer">
                          <FileText className="h-3.5 w-3.5" />
                          Slip Attached
                        </span>
                      ) : (
                        <span className="text-neutral-400 font-mono text-[11px]">—</span>
                      )}
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
                      {p.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => openConfirmation(p)}
                            leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                            className="font-bold"
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="destructive"
                            size="xs"
                            onClick={() => openRejection(p)}
                            leftIcon={<Ban className="h-3.5 w-3.5" />}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : p.status === 'CONFIRMED' ? (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => openReceiptView(p)}
                          leftIcon={<Eye className="h-3.5 w-3.5 text-emerald-800" />}
                        >
                          Receipt
                        </Button>
                      ) : (
                        <span className="text-caption text-neutral-400 font-mono">
                          {p.rejectionReason ? `Rejected: ${p.rejectionReason}` : 'Failed'}
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
            <div className="flex items-center justify-between p-5 border-b border-neutral-200 bg-neutral-50/70">
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
                {selectedPayment.proofStoragePath && (
                  <div className="flex justify-between pt-1 border-t border-neutral-200">
                    <span className="text-neutral-500">Payment Proof:</span>
                    <span className="font-bold text-primary-800">Verified Attachment</span>
                  </div>
                )}
              </div>

              <Input
                label="Bank Statement Transaction Reference *"
                placeholder="e.g. GTB-TRF-998822"
                value={bankRefInput}
                onChange={(e) => setBankRefInput(e.target.value)}
                required
              />

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 leading-tight">
                <strong>Accounting Postings:</strong> Confirming this payment will post an immutable <strong>₦{selectedPayment.amount.toLocaleString()} CREDIT</strong> to the customer sub-ledger, generate an official receipt, and clear matching open invoices.
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

      {/* Rejection Modal */}
      {isRejectModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200 bg-red-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 flex items-center justify-center border border-red-200">
                  <Ban className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-body font-bold text-neutral-950">Reject Bank Transfer</h3>
                  <p className="text-caption text-neutral-500 font-mono">{selectedPayment.paymentReference}</p>
                </div>
              </div>
              <button
                onClick={() => setIsRejectModalOpen(false)}
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
                  <span className="text-neutral-500">Submitted Amount:</span>
                  <span className="font-mono font-bold text-neutral-900">{formatNaira(selectedPayment.amount)}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-caption font-bold text-neutral-700">
                  Mandatory Rejection Reason *
                </label>
                <textarea
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder="e.g. Deposit could not be matched against company bank statement, or teller slip is illegible."
                  className="w-full h-24 p-3 text-body-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-900 leading-tight">
                <strong>Zero Ledger Impact:</strong> Rejection will mark the payment record as FAILED without posting any sub-ledger credits and notify the customer.
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                isLoading={isRejecting}
                onClick={handleRejectPayment}
                disabled={!rejectReasonInput.trim()}
                className="font-bold"
              >
                Reject Transfer Record
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt Viewer */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receipt={selectedReceipt}
        payment={selectedPayment}
      />
    </div>
  );
}
