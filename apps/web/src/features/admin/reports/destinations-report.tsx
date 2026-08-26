import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { ReportDateSelector } from '@/components/reports/report-date-selector';
import { ReportTable } from '@/components/reports/report-table';
import { reportApi } from '@ar-multiventures/api';
import { formatNaira, getDateRangeForPeriod, CsvColumn } from '@ar-multiventures/business-logic';
import type { DestinationReportRow, DateRangeFilter } from '@ar-multiventures/types';
import { MapPin, Truck, Clock, DollarSign } from 'lucide-react';

const CSV_COLUMNS: CsvColumn<DestinationReportRow>[] = [
  { header: 'Delivery Destination Site', key: 'destinationName' },
  { header: 'State / Region', key: 'state' },
  { header: 'Primary Origin Quarry', key: 'primaryQuarryOrigin' },
  { header: 'Total Trips', key: 'totalTrips', format: 'number' },
  { header: 'Total Tonnage', key: 'totalTonnes', format: 'number' },
  { header: 'Haulage Revenue (NGN)', key: 'haulageRevenue', format: 'number' },
  { header: 'Avg Transit Duration (Hours)', key: 'averageDeliveryHours', format: 'number' },
  { header: 'Completed Deliveries', key: 'completedDeliveries', format: 'number' },
];

export function AdminDestinationsReportPage() {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>(getDateRangeForPeriod('this_month'));
  const [rows, setRows] = useState<DestinationReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await reportApi.getDestinationReport(dateFilter);
        setRows(data);
      } catch (err) {
        console.error('Failed to load destination report:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [dateFilter]);

  const totalHaulage = rows.reduce((s, r) => s + r.haulageRevenue, 0);
  const totalTrips = rows.reduce((s, r) => s + r.totalTrips, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Destination Corridors & Delivery Routes Report"
          description="Analysis of major project offload sites, transit corridor durations, freight revenue, and quarry origin corridors."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Reports', href: '/admin/reports' },
            { label: 'Destination Corridors' },
          ]}
        />
        <ReportDateSelector value={dateFilter} onChange={setDateFilter} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-neutral-500">Total Haulage Revenue</span>
          <div className="text-h3 font-black text-neutral-950 font-mono">
            {formatNaira(totalHaulage)}
          </div>
          <span className="text-[11px] text-neutral-400">Freight Tariffs</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-primary-800">Total Corridor Trips</span>
          <div className="text-h3 font-black text-primary-950 font-mono">
            {totalTrips} Trips
          </div>
          <span className="text-[11px] text-primary-700">Completed & En Route</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-800">Top Corridor</span>
          <div className="text-body font-black text-emerald-950 truncate">
            {rows[0]?.destinationName || 'Lekki Free Trade Zone'}
          </div>
          <span className="text-[11px] text-emerald-700 font-mono">{rows[0]?.totalTrips || 0} Trips Logged</span>
        </Card>
      </div>

      <ReportTable
        title="Destination Sites & Corridor Analysis"
        subtitle="Freight statistics across active construction sites and industrial hubs"
        columns={CSV_COLUMNS}
        data={rows}
        exportFilename={`destinations_report_${dateFilter.period}`}
        isLoading={isLoading}
        renderRow={(row) => (
          <tr key={row.destinationId} className="hover:bg-neutral-50/80 transition-colors">
            <td className="py-3 px-4 font-bold text-neutral-900">{row.destinationName}</td>
            <td className="py-3 px-4 text-caption text-neutral-500">{row.state}</td>
            <td className="py-3 px-4 text-caption text-neutral-700">{row.primaryQuarryOrigin}</td>
            <td className="py-3 px-4 font-mono font-bold text-neutral-900">{row.totalTrips}</td>
            <td className="py-3 px-4 font-mono font-bold text-neutral-900">{row.totalTonnes} T</td>
            <td className="py-3 px-4 font-mono font-black text-emerald-800">{formatNaira(row.haulageRevenue)}</td>
            <td className="py-3 px-4 font-mono text-neutral-700">{row.averageDeliveryHours} hrs</td>
            <td className="py-3 px-4 font-mono font-bold text-neutral-800 text-right">{row.completedDeliveries}</td>
          </tr>
        )}
      />
    </div>
  );
}
