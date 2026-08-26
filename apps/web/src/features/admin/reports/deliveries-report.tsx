import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { ReportDateSelector } from '@/components/reports/report-date-selector';
import { ReportTable } from '@/components/reports/report-table';
import { reportApi } from '@ar-multiventures/api';
import { formatDate, getDateRangeForPeriod, CsvColumn } from '@ar-multiventures/business-logic';
import type { DeliveryReportRow, DateRangeFilter } from '@ar-multiventures/types';
import { Truck, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const CSV_COLUMNS: CsvColumn<DeliveryReportRow>[] = [
  { header: 'Trip #', key: 'tripNumber' },
  { header: 'Customer', key: 'customerName' },
  { header: 'Truck Plate', key: 'truckRegistration' },
  { header: 'Driver', key: 'driverName' },
  { header: 'Destination', key: 'destinationName' },
  { header: 'Dispatched At', key: (r) => formatDate(r.dispatchedAt) },
  { header: 'Delivered At', key: (r) => formatDate(r.deliveredAt) },
  { header: 'Duration (Hours)', key: 'durationHours', format: 'number' },
  { header: 'Delivered Tonnage', key: 'deliveredTonnes', format: 'number' },
  { header: 'Status', key: 'status' },
  { header: 'Receiver Signoff', key: (r) => r.podReceiverName || '—' },
];

export function AdminDeliveriesReportPage() {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>(getDateRangeForPeriod('this_month'));
  const [rows, setRows] = useState<DeliveryReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await reportApi.getDeliveryReport(dateFilter);
        setRows(data);
      } catch (err) {
        console.error('Failed to load deliveries report:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [dateFilter]);

  const deliveredRows = rows.filter((r) => r.status === 'DELIVERED');
  const totalDelivered = deliveredRows.reduce((s, r) => s + r.deliveredTonnes, 0);
  const avgDuration =
    deliveredRows.length > 0
      ? deliveredRows.reduce((s, r) => s + r.durationHours, 0) / deliveredRows.length
      : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Trip Logistics & Delivery Execution Report"
          description="End-to-end trip tracking, dispatch departure times, offload durations, and verified Proof of Delivery records."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Reports', href: '/admin/reports' },
            { label: 'Delivery Execution' },
          ]}
        />
        <ReportDateSelector value={dateFilter} onChange={setDateFilter} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-neutral-500">Delivered Volume</span>
          <div className="text-h3 font-black text-neutral-950 font-mono">
            {totalDelivered.toFixed(2)} Tonnes
          </div>
          <span className="text-[11px] text-neutral-400">Verified Offload</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-800">Average Transit Time</span>
          <div className="text-h3 font-black text-emerald-950 font-mono">
            {avgDuration.toFixed(1)} Hours
          </div>
          <span className="text-[11px] text-emerald-700">Quarry to Site</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-primary-800">Delivered Trips</span>
          <div className="text-h3 font-black text-primary-950 font-mono">
            {deliveredRows.length} / {rows.length}
          </div>
          <span className="text-[11px] text-primary-700">Signed POD Rate</span>
        </Card>
      </div>

      <ReportTable
        title="Delivery Execution Log"
        subtitle="Individual trip transit cycles and offload timestamps"
        columns={CSV_COLUMNS}
        data={rows}
        exportFilename={`deliveries_report_${dateFilter.period}`}
        isLoading={isLoading}
        renderRow={(row) => (
          <tr key={row.tripNumber} className="hover:bg-neutral-50/80 transition-colors">
            <td className="py-3 px-4 font-mono font-bold text-primary-800">{row.tripNumber}</td>
            <td className="py-3 px-4 font-bold text-neutral-900">{row.customerName}</td>
            <td className="py-3 px-4 font-mono font-bold text-neutral-800">{row.truckRegistration}</td>
            <td className="py-3 px-4 text-caption text-neutral-600">{row.driverName}</td>
            <td className="py-3 px-4 text-caption text-neutral-700 max-w-xs truncate">{row.destinationName}</td>
            <td className="py-3 px-4 font-mono text-caption text-neutral-600">{formatDate(row.dispatchedAt)}</td>
            <td className="py-3 px-4 font-mono text-caption text-neutral-600">{formatDate(row.deliveredAt)}</td>
            <td className="py-3 px-4 font-mono font-bold text-neutral-900">{row.durationHours ? `${row.durationHours}h` : '—'}</td>
            <td className="py-3 px-4 font-mono font-bold text-emerald-800">{row.deliveredTonnes} T</td>
            <td className="py-3 px-4">
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase',
                  row.status === 'DELIVERED' && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                  row.status === 'IN_TRANSIT' && 'bg-blue-50 text-blue-800 border border-blue-200'
                )}
              >
                {row.status}
              </span>
            </td>
            <td className="py-3 px-4 text-caption text-neutral-700 text-right">{row.podReceiverName || '—'}</td>
          </tr>
        )}
      />
    </div>
  );
}
