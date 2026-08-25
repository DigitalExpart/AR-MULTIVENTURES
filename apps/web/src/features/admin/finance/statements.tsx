import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileSpreadsheet, Download, Printer, Search, Building2, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { DocumentViewerModal } from '@/components/finance/document-viewer-modal';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { financeApi } from '@ar-multiventures/api';
import type { CustomerStatement, CustomerFinancialSummary } from '@ar-multiventures/types';

export function AdminFinanceStatementsPage() {
  const [searchParams] = useSearchParams();
  const initialCustId = searchParams.get('customer') || 'cus-buildcorp';

  const [customers, setCustomers] = useState<CustomerFinancialSummary[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustId);
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-25');
  const [statement, setStatement] = useState<CustomerStatement | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      const list = await financeApi.getAllCustomerFinancialSummaries();
      setCustomers(list);
    }
    loadCustomers();
  }, []);

  useEffect(() => {
    async function loadStatement() {
      setIsLoading(true);
      try {
        const stmt = await financeApi.getCustomerStatement(selectedCustomerId, startDate, endDate);
        setStatement(stmt);
      } catch (err) {
        console.error('Failed to load statement:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStatement();
  }, [selectedCustomerId, startDate, endDate]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Enterprise Customer Account Statements"
        description="Generate official sub-ledger statements with calculated opening balances, running transaction ledgers, and closing receivables."
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin' },
          { label: 'Finance', href: '/admin/finance' },
          { label: 'Statements' },
        ]}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsViewerOpen(true)}
            leftIcon={<Printer className="h-4 w-4" />}
          >
            Print / Save Statement PDF
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <Card padding="sm" className="bg-white border-neutral-200 grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-bold uppercase text-neutral-500 block mb-1">Select Customer Account</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm font-semibold text-neutral-900"
          >
            {customers.map((c) => (
              <option key={c.customerId} value={c.customerId}>
                {c.companyName} ({c.accountNumber})
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Statement Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <Input
          label="Statement End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </Card>

      {/* Statement Table */}
      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="p-4 bg-neutral-50/50 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 text-body">
              {statement?.customerName}
            </span>
            <span className="font-mono text-caption text-neutral-500">
              ({statement?.accountNumber})
            </span>
          </div>
          <div className="font-mono text-body-sm">
            <span className="text-neutral-500">Closing Balance: </span>
            <span className="font-black text-primary-900">{formatNaira(statement?.closingBalance || 0)}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm font-mono">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Posting Date</th>
                <th className="py-3 px-4">Document #</th>
                <th className="py-3 px-4 font-sans">Transaction Details</th>
                <th className="py-3 px-4 text-right">Debit (₦)</th>
                <th className="py-3 px-4 text-right">Credit (₦)</th>
                <th className="py-3 px-4 text-right">Running Balance (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-caption text-neutral-400 font-sans">
                    Loading sub-ledger statement...
                  </td>
                </tr>
              ) : statement?.transactions.map((t) => (
                <tr key={t.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-neutral-600">
                    {formatDate(t.transactionDate)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-neutral-900">
                    {t.documentNumber}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-neutral-800">
                    <div className="font-semibold">{t.description}</div>
                    <span className="text-[10px] font-mono uppercase bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-500">
                      {t.transactionType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-neutral-900">
                    {t.debit > 0 ? formatNaira(t.debit) : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-800">
                    {t.credit > 0 ? formatNaira(t.credit) : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-primary-900">
                    {formatNaira(t.runningBalance || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <DocumentViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        documentType="STATEMENT"
        statement={statement}
      />
    </div>
  );
}
