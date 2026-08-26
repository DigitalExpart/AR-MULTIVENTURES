import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { ReportDateSelector } from '@/components/reports/report-date-selector';
import { ReportTable } from '@/components/reports/report-table';
import { reportApi } from '@ar-multiventures/api';
import { formatNaira, getDateRangeForPeriod, CsvColumn } from '@ar-multiventures/business-logic';
import type { FleetUtilizationRow, DateRangeFilter } from '@ar-multiventures/types';
import { Truck, Scale, Wrench, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const CSV_COLUMNS: CsvColumn<FleetUtilizationRow>[] = [
  { header: 'Truck Registration', key: 'registrationNumber' },
  { header: 'Make & Model', key: 'makeModel' },
  { header: 'Ownership Type', key: 'ownershipType' },
  { header: 'Capacity (Tonnes)', key: 'capacityTonnes', format: 'number' },
  { header: 'Maintenance Status', key: 'maintenanceStatus' },
  { header: 'Trips Completed', key: 'tripsCompleted', format: 'number' },
  { header: 'Tonnes Hauled', key: 'tonnesHauled', format: 'number' },
  { header: 'Utilization Rate (%)', key: 'utilizationRatePercent', format: 'number' },
  { header: 'Maintenance Cost (NGN)', key: 'maintenanceCostTotal', format: 'number' },
];

export function AdminFleetReportPage() {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>(getDateRangeForPeriod('this_month'));
  const [rows, setRows] = useState<FleetUtilizationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await reportApi.getFleetUtilizationReport(dateFilter);
        setRows(data);
      } catch (err) {
        console.error('Failed to load fleet report:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [dateFilter]);

  const totalHauled = rows.reduce((s, r) => s + r.tonnesHauled, 0);
  const totalMaint = rows.reduce((s, r) => s + r.maintenanceCostTotal, 0);
  const operationalTrucks = rows.filter((r) => r.maintenanceStatus === 'OPERATIONAL').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Fleet Utilization & Maintenance Report"
          description="Truck haulage volumes, operational readiness, duty cycle utilization formulas, and servicing costs."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Reports', href: '/admin/reports' },
            { label: 'Fleet Utilization' },
          ]}
        />
        <ReportDateSelector value={dateFilter} onChange={setDateFilter} />
      </div>

      {/* Utilization Formula Disclosure */}
      <div className="p-4 bg-neutral-100 border border-neutral-200 rounded-2xl flex items-start gap-3 text-body-sm text-neutral-700">
        <AlertCircle className="h-5 w-5 text-neutral-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-neutral-900 font-bold block">
            Utilization Rate Calculation Model
          </strong>
          <span>
            Truck utilization percentage is calculated as: <code>(Completed Trips / Expected Operating Target [1.5 trips/day × 26 days]) × 100</code>. Reflects commercial haulage readiness without fake GPS claims.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-neutral-500">Total Fleet Assets</span>
          <div className="text-h3 font-black text-neutral-950 font-mono">
            {rows.length} Trucks
          </div>
          <span className="text-[11px] text-neutral-400">Registered Heavy Tippers</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-800">Operational Readiness</span>
          <div className="text-h3 font-black text-emerald-950 font-mono">
            {operationalTrucks} / {rows.length}
          </div>
          <span className="text-[11px] text-emerald-700">Available for Missions</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-primary-800">Total Hauled</span>
          <div className="text-h3 font-black text-primary-950 font-mono">
            {totalHauled.toLocaleString()} Tonnes
          </div>
          <span className="text-[11px] text-primary-700">Delivered Volume</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-amber-800">Maintenance Cost</span>
          <div className="text-h3 font-black text-amber-950 font-mono">
            {formatNaira(totalMaint)}
          </div>
          <span className="text-[11px] text-amber-700">Periodic Repairs & Parts</span>
        </Card>
      </div>

      <ReportTable
        title="Fleet Utilization & Servicing Audit"
        subtitle="Individual vehicle productivity and maintenance logs"
        columns={CSV_COLUMNS}
        data={rows}
        exportFilename={`fleet_utilization_report_${dateFilter.period}`}
        isLoading={isLoading}
        renderRow={(row) => (
          <tr key={row.truckId} className="hover:bg-neutral-50/80 transition-colors">
            <td className="py-3 px-4 font-mono font-bold text-primary-800">{row.registrationNumber}</td>
            <td className="py-3 px-4 font-bold text-neutral-900">{row.makeModel}</td>
            <td className="py-3 px-4 text-caption font-mono text-neutral-600">{row.ownershipType}</td>
            <td className="py-3 px-4 font-mono font-bold text-neutral-900">{row.capacityTonnes} T</td>
            <td className="py-3 px-4">
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase',
                  row.maintenanceStatus === 'OPERATIONAL' && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                  row.maintenanceStatus === 'DUE_FOR_SERVICE' && 'bg-amber-50 text-amber-800 border border-amber-200',
                  row.maintenanceStatus === 'UNDER_MAINTENANCE' && 'bg-red-50 text-red-700 border border-red-200'
                )}
              >
                {row.maintenanceStatus.replace('_', ' ')}
              </span>
            </td>
            <td className="py-3 px-4 font-mono font-bold text-neutral-900">{row.tripsCompleted}</td>
            <td className="py-3 px-4 font-mono font-bold text-neutral-900">{row.tonnesHauled} T</td>
            <td className="py-3 px-4 font-mono font-black text-emerald-800">{row.utilizationRatePercent}%</td>
            <td className="py-3 px-4 font-mono font-bold text-neutral-900 text-right">{formatNaira(row.maintenanceCostTotal)}</td>
          </tr>
        )}
      />
    </div>
  );
}
