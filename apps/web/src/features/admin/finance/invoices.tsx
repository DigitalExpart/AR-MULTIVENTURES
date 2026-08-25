import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, Search, Eye, Download, Plus, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { DocumentViewerModal } from '@/components/finance/document-viewer-modal';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { financeApi } from '@ar-multiventures/api';
import type { InvoiceRecord } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

export function AdminFinanceInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const list = await financeApi.getInvoices({ search: searchQuery, status: selectedStatus });
        setInvoices(list);
      } catch (err) {
        console.error('Failed to load invoices:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [searchQuery, selectedStatus]);

  const handleOpenDoc = (inv: InvoiceRecord) => {
    setSelectedInvoice(inv);
    setIsViewerOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Commercial Invoices & Billing Management"
        description="Official proformas and tax invoices with frozen pricing line items and automatic sub-ledger postings."
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin' },
          { label: 'Finance', href: '/admin/finance' },
          { label: 'Invoices' },
        ]}
      />

      <Card padding="sm" className="bg-white border-neutral-200 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search invoice # (INV-...), requisition (REQ-...), or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-primary-600 focus:bg-white"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm font-semibold text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-primary-600"
          >
            <option value="all">All Invoice Statuses</option>
            <option value="issued">Issued / Unpaid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Fully Settled</option>
          </select>
        </div>
      </Card>

      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
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
                  <td colSpan={10} className="py-8 text-center text-caption text-neutral-400">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-body-sm text-neutral-500">
                    No commercial invoices found matching filters.
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
                    <td className="py-3.5 px-4 font-bold text-neutral-900 truncate max-w-[160px]">
                      {inv.customerName}
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
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleOpenDoc(inv)}
                        leftIcon={<Eye className="h-3.5 w-3.5" />}
                      >
                        View
                      </Button>
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
    </div>
  );
}
