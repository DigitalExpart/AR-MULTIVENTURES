import { useState, useEffect } from 'react';
import {
  Building2, CreditCard, FileSpreadsheet, Download,
  Receipt, ArrowUpRight, ArrowDownLeft, Shield, Calendar
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { DocumentViewerModal } from '@/components/finance/document-viewer-modal';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { financeApi } from '@ar-multiventures/api';
import type { CustomerFinancialSummary, CustomerStatement } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

export function AccountPage() {
  const [summary, setSummary] = useState<CustomerFinancialSummary | null>(null);
  const [statement, setStatement] = useState<CustomerStatement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [sumData, stmtData] = await Promise.all([
          financeApi.getCustomerFinancialSummary('cus-buildcorp'),
          financeApi.getCustomerStatement('cus-buildcorp'),
        ]);
        setSummary(sumData);
        setStatement(stmtData);
      } catch (err) {
        console.error('Failed to load financial summary:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Financial Account & Credit Facility"
        description="Authoritative customer sub-ledger, credit utilization, and historical account statements."
        breadcrumbs={[{ label: 'Portal', href: '/app' }, { label: 'Account' }]}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDocModalOpen(true)}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Download Statement
          </Button>
        }
      />

      {/* Credit & Receivable Exposure Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outstanding Receivable */}
        <Card padding="md" className="bg-white border-neutral-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-caption font-semibold text-neutral-500">
            <span>Outstanding Balance</span>
            <Receipt className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="text-h3 font-black text-neutral-950 font-mono">
            {isLoading ? '...' : formatNaira(summary?.outstandingReceivable || 0)}
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">Current total debt owed</span>
        </Card>

        {/* Available Credit */}
        <Card padding="md" className="bg-white border-emerald-200 bg-emerald-50/20 space-y-1">
          <div className="flex items-center justify-between text-caption font-semibold text-emerald-800">
            <span>Available Credit</span>
            <CreditCard className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-h3 font-black text-emerald-950 font-mono">
            {isLoading ? '...' : formatNaira(summary?.availableCredit || 0)}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Ready for new requisitions</span>
        </Card>

        {/* Credit Limit */}
        <Card padding="md" className="bg-white border-neutral-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-caption font-semibold text-neutral-500">
            <span>Approved Credit Limit</span>
            <Shield className="h-4 w-4 text-primary-700" />
          </div>
          <div className="text-h3 font-black text-neutral-900 font-mono">
            {isLoading ? '...' : formatNaira(summary?.creditLimit || 0)}
          </div>
          <span className="text-[11px] text-neutral-500 font-medium">
            Net {summary?.creditPeriodDays || 0} Days Term
          </span>
        </Card>

        {/* Credit Utilization Gauge */}
        <Card padding="md" className="bg-white border-neutral-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-caption font-semibold text-neutral-500">
            <span>Credit Utilization</span>
            <span className="font-mono font-bold text-neutral-900">
              {summary?.creditUtilizationPercent || 0}%
            </span>
          </div>
          <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                (summary?.creditUtilizationPercent || 0) > 85 ? 'bg-red-600' : 'bg-primary-700'
              )}
              style={{ width: `${Math.min(100, summary?.creditUtilizationPercent || 0)}%` }}
            />
          </div>
          <span className="text-[11px] text-neutral-400 block pt-0.5 font-mono">
            Overdue: {formatNaira(summary?.overdueAmount || 0)}
          </span>
        </Card>
      </div>

      {/* Account Statement & Ledger Transactions */}
      <Card padding="none" className="bg-white border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-body font-bold text-neutral-950 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-primary-700" />
              Customer Sub-Ledger Statement
            </h4>
            <p className="text-caption text-neutral-500 mt-0.5">
              Chronological financial transactions with authoritative running balances.
            </p>
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={() => setIsDocModalOpen(true)}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            View Official Statement
          </Button>
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
                <th className="py-3 px-4 text-right">Balance (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-caption text-neutral-400 font-sans">
                    Loading financial transactions...
                  </td>
                </tr>
              ) : statement?.transactions.map((t) => (
                <tr key={t.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4 text-neutral-600">
                    {formatDate(t.transactionDate)}
                  </td>
                  <td className="py-3 px-4 font-bold text-neutral-900">
                    {t.documentNumber}
                  </td>
                  <td className="py-3 px-4 font-sans text-neutral-800">
                    <div className="font-semibold">{t.description}</div>
                    <span className="text-[10px] font-mono uppercase bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-500">
                      {t.transactionType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-neutral-900">
                    {t.debit > 0 ? formatNaira(t.debit) : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-800">
                    {t.credit > 0 ? formatNaira(t.credit) : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-primary-900 text-body-sm">
                    {formatNaira(t.runningBalance || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Official Printable Statement Modal */}
      <DocumentViewerModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        documentType="STATEMENT"
        statement={statement}
      />
    </div>
  );
}
