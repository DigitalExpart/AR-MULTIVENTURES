import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { ReportDateSelector } from '@/components/reports/report-date-selector';
import { ReportTable } from '@/components/reports/report-table';
import { reportApi } from '@ar-multiventures/api';
import { getDateRangeForPeriod, CsvColumn } from '@ar-multiventures/business-logic';
import type { DriverReportRow, DateRangeFilter } from '@ar-multiventures/types';
import { Users, CheckCircle2, ShieldCheck } from 'lucide-react';

const CSV_COLUMNS: CsvColumn<DriverReportRow>[] = [
  { header: 'Driver Name', key: 'driverName' },
  { header: 'Phone Number', key: 'phoneNumber' },
  { header: 'License Category', key: 'licenseCategory' },
  { header: 'License Expiry', key: 'licenseExpiry' },
  { header: 'Trips Assigned', key: 'tripsAssigned', format: 'number' },
  { header: 'Trips Completed', key: 'tripsCompleted', format: 'number' },
  { header: 'Tonnes Delivered', key: 'tonnesDelivered', format: 'number' },
  { header: 'POD Completion (%)', key: 'podCompletionRatePercent', format: 'number' },
];

export function AdminDriversReportPage() {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>(getDateRangeForPeriod('this_month'));
  const [rows, setRows] = useState<DriverReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await reportApi.getDriverReport(dateFilter);
        setRows(data);
      } catch (err) {
        console.error('Failed to load drivers report:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [dateFilter]);

  const totalDelivered = rows.reduce((s, r) => s + r.tonnesDelivered, 0);
  const totalCompleted = rows.reduce((s, r) => s + r.tripsCompleted, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Certified Drivers & Delivery Execution Report"
          description="Driver assignment completions, delivered aggregate volume, Proof of Delivery (POD) rates, and license validities."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Reports', href: '/admin/reports' },
            { label: 'Drivers' },
          ]}
        />
        <ReportDateSelector value={dateFilter} onChange={setDateFilter} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-neutral-500">Active Operators</span>
          <div className="text-h3 font-black text-neutral-950 font-mono">
            {rows.length} Drivers
          </div>
          <span className="text-[11px] text-neutral-400">CLASS_E Certified</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-primary-800">Completed Missions</span>
          <div className="text-h3 font-black text-primary-950 font-mono">
            {totalCompleted} Trips
          </div>
          <span className="text-[11px] text-primary-700">Fulfilled Deliveries</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-800">Delivered Volume</span>
          <div className="text-h3 font-black text-emerald-950 font-mono">
            {totalDelivered.toLocaleString()} Tonnes
          </div>
          <span className="text-[11px] text-emerald-700">Offloaded at Customer Sites</span>
        </Card>
      </div>

      <ReportTable
        title="Driver Operational Roster"
        subtitle="Individual operator logistics output and POD compliance"
        columns={CSV_COLUMNS}
        data={rows}
        exportFilename={`drivers_report_${dateFilter.period}`}
        isLoading={isLoading}
        renderRow={(row) => (
          <tr key={row.driverId} className="hover:bg-neutral-50/80 transition-colors">
            <td className="py-3 px-4 font-bold text-neutral-900">{row.driverName}</td>
            <td className="py-3 px-4 font-mono text-caption text-neutral-600">{row.phoneNumber}</td>
            <td className="py-3 px-4 text-caption text-neutral-500">{row.licenseCategory}</td>
            <td className="py-3 px-4 font-mono text-caption text-neutral-700">{row.licenseExpiry}</td>
            <td className="py-3 px-4 font-mono font-bold text-neutral-900">{row.tripsAssigned}</td>
            <td className="py-3 px-4 font-mono font-bold text-neutral-900">{row.tripsCompleted}</td>
            <td className="py-3 px-4 font-mono font-bold text-emerald-800">{row.tonnesDelivered} T</td>
            <td className="py-3 px-4 font-mono font-black text-neutral-950 text-right">{row.podCompletionRatePercent}%</td>
          </tr>
        )}
      />
    </div>
  );
}
