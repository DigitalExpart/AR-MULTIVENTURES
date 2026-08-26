import { useState, useEffect } from 'react';
import { Receipt, Eye, Download, Search, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { DocumentViewerModal } from '@/components/finance/document-viewer-modal';
import { CheckoutModal } from '@/components/finance/checkout-modal';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { financeApi } from '@ar-multiventures/api';
import type { InvoiceRecord } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

export function InvoicesListPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutInvoice, setCheckoutInvoice] = useState<InvoiceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const list = await financeApi.getInvoices({ customerId: 'cus-buildcorp' });
      setInvoices(list);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleOpenDoc = (inv: InvoiceRecord) => {
    setSelectedInvoice(inv);
    setIsViewerOpen(true);
  };

  const handleOpenCheckout = (inv: InvoiceRecord) => {
    setCheckoutInvoice(inv);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Commercial Invoices & Billing"
        description="Official tax invoices, proformas, and settlement statuses for aggregate supply requisitions."
        breadcrumbs={[{ label: 'Portal', href: '/app' }, { label: 'Invoices' }]}
      />

      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 font-mono">Total Billed</th>
                <th className="py-3 px-4 font-mono">Paid (₦)</th>
                <th className="py-3 px-4 font-mono">Outstanding</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-caption text-neutral-400">
                    Loading commercial invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-caption text-neutral-500">
                    No commercial invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary-800">
                      {inv.invoiceNumber}
                      {inv.requisitionNumber && (
                        <div className="text-[11px] text-neutral-400 font-sans">
                          {inv.requisitionNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-mono font-bold uppercase bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">
                        {inv.invoiceType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-caption text-neutral-600">
                      {formatDate(inv.issueDate)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-caption font-bold text-neutral-800">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                      {formatNaira(inv.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-800 font-semibold">
                      {formatNaira(inv.amountPaid)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                      {inv.outstandingAmount > 0 ? (
                        <span className="text-red-700">{formatNaira(inv.outstandingAmount)}</span>
                      ) : (
                        '₦0.00'
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[11px] font-bold uppercase',
                          inv.status === 'PAID' && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                          inv.status === 'ISSUED' && 'bg-amber-50 text-amber-800 border border-amber-200',
                          inv.status === 'PARTIALLY_PAID' && 'bg-blue-50 text-blue-800 border border-blue-200'
                        )}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inv.outstandingAmount > 0 && inv.status !== 'PAID' && (
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => handleOpenCheckout(inv)}
                            leftIcon={<CreditCard className="h-3.5 w-3.5" />}
                            className="font-bold shadow-2xs"
                          >
                            Pay Now
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleOpenDoc(inv)}
                          leftIcon={<Eye className="h-3.5 w-3.5" />}
                        >
                          View PDF
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <DocumentViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        documentType={selectedInvoice?.invoiceType || 'INVOICE'}
        invoice={selectedInvoice}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        invoice={checkoutInvoice}
        onSuccess={() => {
          loadInvoices();
        }}
      />
    </div>
  );
}
