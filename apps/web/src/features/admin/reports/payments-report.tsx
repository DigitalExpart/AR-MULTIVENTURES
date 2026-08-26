import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { ReportDateSelector } from '@/components/reports/report-date-selector';
import { ReportTable } from '@/components/reports/report-table';
import { reportApi } from '@ar-multiventures/api';
import { formatNaira, formatDate, getDateRangeForPeriod, CsvColumn } from '@ar-multiventures/business-logic';
import type { PaymentReportRow, DateRangeFilter } from '@ar-multiventures/types';
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const CSV_COLUMNS: CsvColumn<PaymentReportRow>[] = [
  { header: 'Payment #', key: 'paymentNumber' },
  { header: 'Customer', key: 'customerName' },
  { header: 'Amount (NGN)', key: 'amount', format: 'number' },
  { header: 'Method', key: 'paymentMethod' },
  { header: 'Reference', key: (r) => r.gatewayReference || r.bankReference || '—' },
  { header: 'Status', key: 'status' },
  { header: 'Date', key: (r) => formatDate(r.date) },
];

export function AdminPaymentsReportPage() {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>(getDateRangeForPeriod('this_month'));
  const [rows, setRows] = useState<PaymentReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await reportApi.getPaymentsReport(dateFilter);
        setRows(data);
      } catch (err) {
        console.error('Failed to load payments report:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [dateFilter]);

  const confirmedTotal = rows.filter((r) => r.status === 'CONFIRMED').reduce((s, r) => s + r.amount, 0);
  const pendingTotal = rows.filter((r) => r.status === 'PENDING').reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Payment Transactions & Bank Reconciliation Report"
          description="Detailed transaction audit of gateway charges, wire transfers, confirmation statuses, and reconciliation logs."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Reports', href: '/admin/reports' },
            { label: 'Payments' },
          ]}
        />
        <ReportDateSelector value={dateFilter} onChange={setDateFilter} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-800">Confirmed Collections</span>
          <div className="text-h3 font-black text-emerald-950 font-mono">
            {formatNaira(confirmedTotal)}
          </div>
          <span className="text-[11px] text-emerald-700">Cleared & Reconciled</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-amber-800">Pending Review</span>
          <div className="text-h3 font-black text-amber-950 font-mono">
            {formatNaira(pendingTotal)}
          </div>
          <span className="text-[11px] text-amber-700">Awaiting Finance Confirmation</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-neutral-500">Total Transactions</span>
          <div className="text-h3 font-black text-neutral-900 font-mono">
            {rows.length} Records
          </div>
          <span className="text-[11px] text-neutral-400">Payment Attempts Logged</span>
        </Card>
      </div>

      <ReportTable
        title="Payment Transactions Log"
        subtitle="Individual payment records and gateway references"
        columns={CSV_COLUMNS}
        data={rows}
        exportFilename={`payments_report_${dateFilter.period}`}
        isLoading={isLoading}
        renderRow={(row) => (
          <tr key={row.paymentNumber} className="hover:bg-neutral-50/80 transition-colors">
            <td className="py-3 px-4 font-mono font-bold text-primary-800">{row.paymentNumber}</td>
            <td className="py-3 px-4 font-bold text-neutral-900">{row.customerName}</td>
            <td className="py-3 px-4 font-mono font-black text-neutral-950">{formatNaira(row.amount)}</td>
            <td className="py-3 px-4 text-caption text-neutral-600 font-mono">{row.paymentMethod}</td>
            <td className="py-3 px-4 font-mono text-caption text-neutral-500">
              {row.gatewayReference || row.bankReference || '—'}
            </td>
            <td className="py-3 px-4">
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase',
                  row.status === 'CONFIRMED' && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                  row.status === 'PENDING' && 'bg-amber-50 text-amber-800 border border-amber-200',
                  row.status === 'REJECTED' && 'bg-red-50 text-red-700 border border-red-200'
                )}
              >
                {row.status}
              </span>
            </td>
            <td className="py-3 px-4 font-mono text-caption text-neutral-500 text-right">{formatDate(row.date)}</td>
          </tr>
        )}
      />
    </div>
  );
}
