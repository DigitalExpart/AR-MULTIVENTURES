import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { ReportDateSelector } from '@/components/reports/report-date-selector';
import { ReportTable } from '@/components/reports/report-table';
import { reportApi } from '@ar-multiventures/api';
import { formatNaira, formatDate, getDateRangeForPeriod, CsvColumn } from '@ar-multiventures/business-logic';
import type { CancellationReportRow, DateRangeFilter } from '@ar-multiventures/types';
import { AlertTriangle, XCircle, DollarSign } from 'lucide-react';

const CSV_COLUMNS: CsvColumn<CancellationReportRow>[] = [
  { header: 'Requisition #', key: 'requisitionNumber' },
  { header: 'Customer Name', key: 'customerName' },
  { header: 'Order Value (NGN)', key: 'orderValue', format: 'number' },
  { header: 'Cancellation Reason', key: 'cancellationReason' },
  { header: 'Cancelled By', key: 'cancelledBy' },
  { header: 'Previous Status', key: 'previousStatus' },
  { header: 'Date', key: (r) => formatDate(r.cancelledAt) },
];

export function AdminCancellationsReportPage() {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>(getDateRangeForPeriod('this_month'));
  const [rows, setRows] = useState<CancellationReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await reportApi.getCancellationReport(dateFilter);
        setRows(data);
      } catch (err) {
        console.error('Failed to load cancellations report:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [dateFilter]);

  const totalCancelledValue = rows.reduce((s, r) => s + r.orderValue, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Order Cancellations & Rejections Report"
          description="Audit trail of rejected commercial requisitions, customer cancellation root causes, and lost revenue impact."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Reports', href: '/admin/reports' },
            { label: 'Cancellations' },
          ]}
        />
        <ReportDateSelector value={dateFilter} onChange={setDateFilter} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-red-700">Cancelled Value</span>
          <div className="text-h3 font-black text-red-950 font-mono">
            {formatNaira(totalCancelledValue)}
          </div>
          <span className="text-[11px] text-red-700">Voided Requisitions</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-neutral-500">Total Cancellations</span>
          <div className="text-h3 font-black text-neutral-900 font-mono">
            {rows.length} Orders
          </div>
          <span className="text-[11px] text-neutral-400">In Selected Period</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-primary-800">Primary Root Cause</span>
          <div className="text-body font-bold text-neutral-900 truncate">
            Site Schedule Postponement
          </div>
          <span className="text-[11px] text-neutral-500">Customer Project Delays</span>
        </Card>
      </div>

      <ReportTable
        title="Order Cancellation Log"
        subtitle="Individual voided requisitions with recorded operational reasons"
        columns={CSV_COLUMNS}
        data={rows}
        exportFilename={`cancellations_report_${dateFilter.period}`}
        isLoading={isLoading}
        renderRow={(row) => (
          <tr key={row.requisitionNumber} className="hover:bg-neutral-50/80 transition-colors">
            <td className="py-3 px-4 font-mono font-bold text-primary-800">{row.requisitionNumber}</td>
            <td className="py-3 px-4 font-bold text-neutral-900">{row.customerName}</td>
            <td className="py-3 px-4 font-mono font-black text-neutral-950">{formatNaira(row.orderValue)}</td>
            <td className="py-3 px-4 text-caption text-neutral-700 max-w-sm">{row.cancellationReason}</td>
            <td className="py-3 px-4 text-caption text-neutral-600">{row.cancelledBy}</td>
            <td className="py-3 px-4 font-mono text-caption text-neutral-500">{row.previousStatus}</td>
            <td className="py-3 px-4 font-mono text-caption text-neutral-500 text-right">{formatDate(row.cancelledAt)}</td>
          </tr>
        )}
      />
    </div>
  );
}
