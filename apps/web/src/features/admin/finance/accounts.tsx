import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Search, ArrowRight, Eye, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { formatNaira } from '@ar-multiventures/business-logic';
import { financeApi } from '@ar-multiventures/api';
import type { CustomerFinancialSummary } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

export function AdminFinanceAccountsPage() {
  const [summaries, setSummaries] = useState<CustomerFinancialSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const list = await financeApi.getAllCustomerFinancialSummaries();
        setSummaries(list);
      } catch (err) {
        console.error('Failed to load accounts:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filtered = summaries.filter(
    (s) =>
      s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.accountNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Customer Financial Accounts & Sub-Ledgers"
        description="Derived financial receivables, debits, credits, and active facility utilization across corporate contractor accounts."
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin' },
          { label: 'Finance', href: '/admin/finance' },
          { label: 'Customer Accounts' },
        ]}
      />

      <Card padding="sm" className="bg-white border-neutral-200 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search account # (CUS-...) or company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-primary-600 focus:bg-white"
          />
        </div>
      </Card>

      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Account #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 font-mono">Total Billed (Dr)</th>
                <th className="py-3 px-4 font-mono">Total Paid (Cr)</th>
                <th className="py-3 px-4 font-mono">Outstanding Receivable</th>
                <th className="py-3 px-4">Credit Terms</th>
                <th className="py-3 px-4">Credit Limit</th>
                <th className="py-3 px-4 text-right">Statement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-caption text-neutral-400">
                    Loading customer accounts...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-body-sm text-neutral-500">
                    No customer accounts found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.customerId} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary-800">
                      {s.accountNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-950">
                      {s.companyName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-700 font-medium">
                      {formatNaira(s.totalDebit)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-800 font-medium">
                      {formatNaira(s.totalCredit)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-neutral-950 text-body">
                      {formatNaira(s.outstandingReceivable)}
                    </td>
                    <td className="py-3.5 px-4 text-caption">
                      <span className={cn(
                        'px-2 py-0.5 rounded font-semibold',
                        s.creditStatus === 'ACTIVE_CREDIT' ? 'bg-emerald-50 text-emerald-800' : 'bg-neutral-100 text-neutral-700'
                      )}>
                        {s.creditStatus === 'ACTIVE_CREDIT' ? `Net ${s.creditPeriodDays} Days` : 'Prepaid'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-800">
                      {s.creditLimit > 0 ? formatNaira(s.creditLimit) : '₦0.00'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to={`/admin/finance/statements?customer=${s.customerId}`}>
                        <Button variant="outline" size="xs" leftIcon={<FileSpreadsheet className="h-3.5 w-3.5" />}>
                          Ledger
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
