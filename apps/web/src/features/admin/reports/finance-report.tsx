import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { ReportDateSelector } from '@/components/reports/report-date-selector';
import { reportApi } from '@ar-multiventures/api';
import { formatNaira, getDateRangeForPeriod } from '@ar-multiventures/business-logic';
import type { FinanceReportData, DateRangeFilter } from '@ar-multiventures/types';
import { DollarSign, ShieldCheck, CreditCard, Banknote, AlertTriangle } from 'lucide-react';

export function AdminFinanceReportPage() {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>(getDateRangeForPeriod('this_month'));
  const [data, setData] = useState<FinanceReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await reportApi.getFinanceReport(dateFilter);
        setData(res);
      } catch (err) {
        console.error('Failed to load finance report:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [dateFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Financial & Collections Performance Report"
          description="Executive summary of invoiced aggregates, confirmed receipts, trade receivables, unallocated funds, and gateway distributions."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Reports', href: '/admin/reports' },
            { label: 'Finance & Collections' },
          ]}
        />
        <ReportDateSelector value={dateFilter} onChange={setDateFilter} />
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-neutral-500">Invoiced Total</span>
          <div className="text-h3 font-black text-neutral-950 font-mono">
            {formatNaira(data?.invoicedTotal || 0)}
          </div>
          <span className="text-[11px] text-neutral-400">All Issued Invoices</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-800">Confirmed Receipts</span>
          <div className="text-h3 font-black text-emerald-950 font-mono">
            {formatNaira(data?.confirmedReceiptsTotal || 0)}
          </div>
          <span className="text-[11px] text-emerald-700">Settled Cash</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-amber-800">Trade Receivables</span>
          <div className="text-h3 font-black text-amber-950 font-mono">
            {formatNaira(data?.outstandingReceivablesTotal || 0)}
          </div>
          <span className="text-[11px] text-amber-700">Unpaid Balances</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-red-700">Overdue Total</span>
          <div className="text-h3 font-black text-red-950 font-mono">
            {formatNaira(data?.overdueReceivablesTotal || 0)}
          </div>
          <span className="text-[11px] text-red-700">Exceeded Terms</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-purple-800">Credit Exposure</span>
          <div className="text-h3 font-black text-purple-950 font-mono">
            {formatNaira(data?.creditExposureTotal || 0)}
          </div>
          <span className="text-[11px] text-purple-700">Approved Limits</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-blue-800">Unallocated Funds</span>
          <div className="text-h3 font-black text-blue-950 font-mono">
            {formatNaira(data?.unallocatedCashTotal || 0)}
          </div>
          <span className="text-[11px] text-blue-700">On Account Balance</span>
        </Card>
      </div>

      {/* Payment Channels Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-neutral-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 text-body font-bold text-neutral-950">
            <CreditCard className="h-5 w-5 text-primary-800" />
            <span>Paystack Gateway Collections</span>
          </div>
          <p className="text-caption text-neutral-500">
            Card, USSD, and automated instant virtual bank transfer settlements.
          </p>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between font-mono">
            <span className="text-body-sm font-bold text-emerald-900">Total Confirmed</span>
            <span className="text-h3 font-black text-emerald-950">
              {formatNaira(data?.paymentMethodDistribution?.PAYSTACK_GATEWAY || 0)}
            </span>
          </div>
        </Card>

        <Card className="bg-white border-neutral-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 text-body font-bold text-neutral-950">
            <Banknote className="h-5 w-5 text-neutral-700" />
            <span>Direct Commercial Bank Transfers (NIP)</span>
          </div>
          <p className="text-caption text-neutral-500">
            Manual bank wire deposits matched against corporate sub-accounts with verified proof of payment slips.
          </p>
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between font-mono">
            <span className="text-body-sm font-bold text-neutral-800">Total Reconciled</span>
            <span className="text-h3 font-black text-neutral-950">
              {formatNaira(data?.paymentMethodDistribution?.DIRECT_BANK_TRANSFER || 0)}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
