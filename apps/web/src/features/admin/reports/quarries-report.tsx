import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { ReportDateSelector } from '@/components/reports/report-date-selector';
import { ReportTable } from '@/components/reports/report-table';
import { reportApi } from '@ar-multiventures/api';
import { formatNaira, getDateRangeForPeriod, CsvColumn } from '@ar-multiventures/business-logic';
import type { QuarryReportRow, DateRangeFilter } from '@ar-multiventures/types';
import { Building2, Scale, Truck, DollarSign } from 'lucide-react';

const CSV_COLUMNS: CsvColumn<QuarryReportRow>[] = [
  { header: 'Quarry Name', key: 'quarryName' },
  { header: 'Location', key: 'location' },
  { header: 'Total Trips', key: 'totalTrips', format: 'number' },
  { header: 'Planned (Tonnes)', key: 'plannedTonnes', format: 'number' },
  { header: 'Loaded (Tonnes)', key: 'loadedTonnes', format: 'number' },
  { header: 'Delivered (Tonnes)', key: 'deliveredTonnes', format: 'number' },
  { header: 'Material Revenue (NGN)', key: 'materialSalesValue', format: 'number' },
  { header: 'Avg Variance (T)', key: 'averageVarianceTonnes', format: 'number' },
  { header: 'Avg Variance (%)', key: 'averageVariancePercent', format: 'number' },
];

export function AdminQuarriesReportPage() {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>(getDateRangeForPeriod('this_month'));
  const [rows, setRows] = useState<QuarryReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await reportApi.getQuarryReport(dateFilter);
        setRows(data);
      } catch (err) {
        console.error('Failed to load quarry report:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [dateFilter]);

  const totalLoaded = rows.reduce((s, r) => s + r.loadedTonnes, 0);
  const totalRevenue = rows.reduce((s, r) => s + r.materialSalesValue, 0);
  const totalTrips = rows.reduce((s, r) => s + r.totalTrips, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Quarry Production & Loading Performance Report"
          description="Quarry aggregate production tonnage, weighbridge scale variance averages, and pit-head commercial revenue."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Reports', href: '/admin/reports' },
            { label: 'Quarry Performance' },
          ]}
        />
        <ReportDateSelector value={dateFilter} onChange={setDateFilter} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-neutral-500">Total Loaded Tonnage</span>
          <div className="text-h3 font-black text-neutral-950 font-mono">
            {totalLoaded.toLocaleString()} Tonnes
          </div>
          <span className="text-[11px] text-neutral-400">Across Active Quarries</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-800">Material Sales Value</span>
          <div className="text-h3 font-black text-emerald-950 font-mono">
            {formatNaira(totalRevenue)}
          </div>
          <span className="text-[11px] text-emerald-700">Pit-head Aggregate Value</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-primary-800">Total Trips Handled</span>
          <div className="text-h3 font-black text-primary-950 font-mono">
            {totalTrips} Trips
          </div>
          <span className="text-[11px] text-primary-700">Dispatch Departures</span>
        </Card>
      </div>

      <ReportTable
        title="Quarry Production Breakdown"
        subtitle="Operational metrics by partner and licensed quarry pits"
        columns={CSV_COLUMNS}
        data={rows}
        exportFilename={`quarry_report_${dateFilter.period}`}
        isLoading={isLoading}
        renderRow={(row) => (
          <tr key={row.quarryId} className="hover:bg-neutral-50/80 transition-colors">
            <td className="py-3 px-4 font-bold text-neutral-900">{row.quarryName}</td>
            <td className="py-3 px-4 text-caption text-neutral-500">{row.location}</td>
            <td className="py-3 px-4 font-mono font-bold text-neutral-900">{row.totalTrips}</td>
            <td className="py-3 px-4 font-mono text-neutral-700">{row.plannedTonnes} T</td>
            <td className="py-3 px-4 font-mono font-bold text-emerald-800">{row.loadedTonnes} T</td>
            <td className="py-3 px-4 font-mono text-neutral-700">{row.deliveredTonnes} T</td>
            <td className="py-3 px-4 font-mono font-black text-neutral-950">{formatNaira(row.materialSalesValue)}</td>
            <td className="py-3 px-4 font-mono font-semibold text-neutral-800">
              {row.averageVarianceTonnes > 0 ? `+${row.averageVarianceTonnes}` : row.averageVarianceTonnes} T ({row.averageVariancePercent}%)
            </td>
          </tr>
        )}
      />
    </div>
  );
}
