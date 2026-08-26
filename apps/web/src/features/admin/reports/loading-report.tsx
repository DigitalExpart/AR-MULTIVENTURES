import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { ReportDateSelector } from '@/components/reports/report-date-selector';
import { ReportTable } from '@/components/reports/report-table';
import { reportApi } from '@ar-multiventures/api';
import { formatDate, getDateRangeForPeriod, CsvColumn } from '@ar-multiventures/business-logic';
import type { LoadingReportRow, DateRangeFilter } from '@ar-multiventures/types';
import { Scale, ShieldCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const CSV_COLUMNS: CsvColumn<LoadingReportRow>[] = [
  { header: 'Trip #', key: 'tripNumber' },
  { header: 'Quarry Origin', key: 'quarryName' },
  { header: 'Truck Plate', key: 'truckRegistration' },
  { header: 'Driver', key: 'driverName' },
  { header: 'Loading Bay', key: 'loadingBay' },
  { header: 'Planned (T)', key: 'plannedTonnes', format: 'number' },
  { header: 'Gross (T)', key: 'grossWeightTonnes', format: 'number' },
  { header: 'Tare (T)', key: 'tareWeightTonnes', format: 'number' },
  { header: 'Net Weight (T)', key: 'netWeightTonnes', format: 'number' },
  { header: 'Variance (T)', key: 'varianceTonnes', format: 'number' },
  { header: 'Variance (%)', key: 'variancePercent', format: 'number' },
  { header: 'Weighbridge Ticket #', key: 'weighbridgeTicketNumber' },
];

export function AdminLoadingReportPage() {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>(getDateRangeForPeriod('this_month'));
  const [rows, setRows] = useState<LoadingReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await reportApi.getLoadingReport(dateFilter);
        setRows(data);
      } catch (err) {
        console.error('Failed to load loading report:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [dateFilter]);

  const totalLoaded = rows.reduce((s, r) => s + r.netWeightTonnes, 0);
  const avgVariance = rows.length > 0 ? rows.reduce((s, r) => s + r.varianceTonnes, 0) / rows.length : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Loading Bay & Weighbridge Audit Report"
          description="Quarry loading bay hoppers, weighbridge scale tickets, gross vs tare net calculations, and variance tolerances."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Reports', href: '/admin/reports' },
            { label: 'Loading & Weighbridge' },
          ]}
        />
        <ReportDateSelector value={dateFilter} onChange={setDateFilter} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-neutral-500">Weighbridge Scaled Total</span>
          <div className="text-h3 font-black text-neutral-950 font-mono">
            {totalLoaded.toFixed(2)} Tonnes
          </div>
          <span className="text-[11px] text-neutral-400">Net Weight Logged</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-800">Average Net Variance</span>
          <div className="text-h3 font-black text-emerald-950 font-mono">
            {avgVariance >= 0 ? `+${avgVariance.toFixed(2)}` : avgVariance.toFixed(2)} Tonnes
          </div>
          <span className="text-[11px] text-emerald-700">Against 30T Planned</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-primary-800">Weighbridge Slips</span>
          <div className="text-h3 font-black text-primary-950 font-mono">
            {rows.length} Tickets
          </div>
          <span className="text-[11px] text-primary-700">Official Scale Audits</span>
        </Card>
      </div>

      <ReportTable
        title="Weighbridge Tickets Log"
        subtitle="Individual scale readings and hopper allocations"
        columns={CSV_COLUMNS}
        data={rows}
        exportFilename={`loading_report_${dateFilter.period}`}
        isLoading={isLoading}
        renderRow={(row) => (
          <tr key={row.tripNumber} className="hover:bg-neutral-50/80 transition-colors">
            <td className="py-3 px-4 font-mono font-bold text-primary-800">{row.tripNumber}</td>
            <td className="py-3 px-4 text-caption text-neutral-700">{row.quarryName}</td>
            <td className="py-3 px-4 font-mono font-bold text-neutral-900">{row.truckRegistration}</td>
            <td className="py-3 px-4 text-caption text-neutral-600">{row.driverName}</td>
            <td className="py-3 px-4 text-caption font-mono text-neutral-500">{row.loadingBay}</td>
            <td className="py-3 px-4 font-mono text-neutral-700">{row.plannedTonnes} T</td>
            <td className="py-3 px-4 font-mono text-neutral-600">{row.grossWeightTonnes} T</td>
            <td className="py-3 px-4 font-mono text-neutral-600">{row.tareWeightTonnes} T</td>
            <td className="py-3 px-4 font-mono font-black text-emerald-800">{row.netWeightTonnes} T</td>
            <td className="py-3 px-4 font-mono font-bold">
              <span className={row.varianceTonnes >= 0 ? 'text-emerald-800' : 'text-amber-800'}>
                {row.varianceTonnes > 0 ? `+${row.varianceTonnes}` : row.varianceTonnes} T ({row.variancePercent}%)
              </span>
            </td>
            <td className="py-3 px-4 font-mono text-caption text-neutral-500 text-right">{row.weighbridgeTicketNumber}</td>
          </tr>
        )}
      />
    </div>
  );
}
