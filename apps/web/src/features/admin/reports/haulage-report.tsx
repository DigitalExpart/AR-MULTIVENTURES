import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { ReportDateSelector } from '@/components/reports/report-date-selector';
import { ReportTable } from '@/components/reports/report-table';
import { reportApi } from '@ar-multiventures/api';
import { formatNaira, getDateRangeForPeriod, CsvColumn } from '@ar-multiventures/business-logic';
import type { HaulageReportRow, DateRangeFilter } from '@ar-multiventures/types';
import { Truck, DollarSign, ShieldAlert, AlertCircle } from 'lucide-react';

const CSV_COLUMNS: CsvColumn<HaulageReportRow>[] = [
  { header: 'Quarry Origin', key: 'quarryName' },
  { header: 'Destination Offload Site', key: 'destinationName' },
  { header: 'Vehicle Category', key: 'truckType' },
  { header: 'Trips Count', key: 'tripCount', format: 'number' },
  { header: 'Tonnage Hauled', key: 'tonnesHauled', format: 'number' },
  { header: 'Haulage Revenue (NGN)', key: 'totalHaulageRevenue', format: 'number' },
  { header: 'Avg Revenue / Trip (NGN)', key: 'averageHaulagePerTrip', format: 'number' },
];

export function AdminHaulageReportPage() {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>(getDateRangeForPeriod('this_month'));
  const [rows, setRows] = useState<HaulageReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await reportApi.getHaulageReport(dateFilter);
        setRows(data);
      } catch (err) {
        console.error('Failed to load haulage report:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [dateFilter]);

  const totalHaulage = rows.reduce((s, r) => s + r.totalHaulageRevenue, 0);
  const totalTonnes = rows.reduce((s, r) => s + r.tonnesHauled, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Haulage Tariffs & Freight Revenue Report"
          description="Freight revenue realization, heavy tipper route tariffs, and transportation volume analytics."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Reports', href: '/admin/reports' },
            { label: 'Haulage Revenue' },
          ]}
        />
        <ReportDateSelector value={dateFilter} onChange={setDateFilter} />
      </div>

      {/* Cost & Profitability Principle Notice */}
      <div className="p-4 bg-neutral-100 border border-neutral-200 rounded-2xl flex items-start gap-3 text-body-sm text-neutral-700">
        <AlertCircle className="h-5 w-5 text-neutral-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-neutral-900 font-bold block">
            Commercial Gross Freight Revenue Notice
          </strong>
          <span>
            This report presents gross billable haulage revenue based on approved tariff matrices. Net operating profitability reporting requires driver wages, maintenance invoices, and fuel cost tracking.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-neutral-500">Gross Haulage Tariffs</span>
          <div className="text-h3 font-black text-neutral-950 font-mono">
            {formatNaira(totalHaulage)}
          </div>
          <span className="text-[11px] text-neutral-400">Total Billed Freight</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-primary-800">Total Hauled Tonnage</span>
          <div className="text-h3 font-black text-primary-950 font-mono">
            {totalTonnes.toLocaleString()} Tonnes
          </div>
          <span className="text-[11px] text-primary-700">Moved Across Corridors</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-800">Average Freight / Trip</span>
          <div className="text-h3 font-black text-emerald-950 font-mono">
            {formatNaira(rows.length > 0 ? totalHaulage / rows.reduce((s, r) => s + r.tripCount, 0) : 0)}
          </div>
          <span className="text-[11px] text-emerald-700">30-Tonne Tipper Average</span>
        </Card>
      </div>

      <ReportTable
        title="Haulage Corridor Revenue Matrix"
        subtitle="Freight tariffs realized by quarry-destination corridor"
        columns={CSV_COLUMNS}
        data={rows}
        exportFilename={`haulage_report_${dateFilter.period}`}
        isLoading={isLoading}
        renderRow={(row, idx) => (
          <tr key={idx} className="hover:bg-neutral-50/80 transition-colors">
            <td className="py-3 px-4 font-bold text-neutral-900">{row.quarryName}</td>
            <td className="py-3 px-4 text-caption text-neutral-700">{row.destinationName}</td>
            <td className="py-3 px-4 text-caption text-neutral-600 font-mono">{row.truckType}</td>
            <td className="py-3 px-4 font-mono font-bold text-neutral-900">{row.tripCount}</td>
            <td className="py-3 px-4 font-mono text-neutral-700">{row.tonnesHauled} T</td>
            <td className="py-3 px-4 font-mono font-black text-emerald-800">{formatNaira(row.totalHaulageRevenue)}</td>
            <td className="py-3 px-4 font-mono font-bold text-neutral-900 text-right">{formatNaira(row.averageHaulagePerTrip)}</td>
          </tr>
        )}
      />
    </div>
  );
}
