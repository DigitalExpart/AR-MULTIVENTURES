import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { ReportDateSelector } from '@/components/reports/report-date-selector';
import { ReportTable } from '@/components/reports/report-table';
import { reportApi } from '@ar-multiventures/api';
import { formatNaira, getDateRangeForPeriod, CsvColumn } from '@ar-multiventures/business-logic';
import type { MaterialReportRow, DateRangeFilter } from '@ar-multiventures/types';
import { Layers, DollarSign, Scale } from 'lucide-react';

const CSV_COLUMNS: CsvColumn<MaterialReportRow>[] = [
  { header: 'Material Specification', key: 'materialName' },
  { header: 'Orders Count', key: 'orderCount', format: 'number' },
  { header: 'Quantity Sold (Tonnes)', key: 'quantitySoldTonnes', format: 'number' },
  { header: 'Quantity Loaded (Tonnes)', key: 'quantityLoadedTonnes', format: 'number' },
  { header: 'Quantity Delivered (Tonnes)', key: 'quantityDeliveredTonnes', format: 'number' },
  { header: 'Avg Unit Price (NGN/T)', key: 'averageUnitPrice', format: 'number' },
  { header: 'Total Revenue (NGN)', key: 'totalRevenue', format: 'number' },
];

export function AdminMaterialsReportPage() {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>(getDateRangeForPeriod('this_month'));
  const [rows, setRows] = useState<MaterialReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await reportApi.getMaterialReport(dateFilter);
        setRows(data);
      } catch (err) {
        console.error('Failed to load materials report:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [dateFilter]);

  const totalVolume = rows.reduce((s, r) => s + r.quantitySoldTonnes, 0);
  const totalRev = rows.reduce((s, r) => s + r.totalRevenue, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Material Sales & Aggregate Volume Report"
          description="Analysis of granite sizes, road base materials, clean aggregates, and average unit rate realizations."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Reports', href: '/admin/reports' },
            { label: 'Material Sales' },
          ]}
        />
        <ReportDateSelector value={dateFilter} onChange={setDateFilter} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-neutral-500">Total Volume Sold</span>
          <div className="text-h3 font-black text-neutral-950 font-mono">
            {totalVolume.toLocaleString()} Tonnes
          </div>
          <span className="text-[11px] text-neutral-400">All Aggregate Grades</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-800">Aggregate Revenue</span>
          <div className="text-h3 font-black text-emerald-950 font-mono">
            {formatNaira(totalRev)}
          </div>
          <span className="text-[11px] text-emerald-700">Gross Material Billings</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-primary-800">Average Rate / Tonne</span>
          <div className="text-h3 font-black text-primary-950 font-mono">
            {formatNaira(totalVolume > 0 ? totalRev / totalVolume : 0)}
          </div>
          <span className="text-[11px] text-primary-700">Effective Aggregate Realization</span>
        </Card>
      </div>

      <ReportTable
        title="Material Sales Volume Breakdown"
        subtitle="Revenue and volume metrics per aggregate specification"
        columns={CSV_COLUMNS}
        data={rows}
        exportFilename={`material_report_${dateFilter.period}`}
        isLoading={isLoading}
        renderRow={(row) => (
          <tr key={row.materialId} className="hover:bg-neutral-50/80 transition-colors">
            <td className="py-3 px-4 font-bold text-neutral-900">{row.materialName}</td>
            <td className="py-3 px-4 font-mono font-bold text-neutral-800">{row.orderCount}</td>
            <td className="py-3 px-4 font-mono font-bold text-neutral-900">{row.quantitySoldTonnes} T</td>
            <td className="py-3 px-4 font-mono text-neutral-700">{row.quantityLoadedTonnes} T</td>
            <td className="py-3 px-4 font-mono font-bold text-emerald-800">{row.quantityDeliveredTonnes} T</td>
            <td className="py-3 px-4 font-mono text-neutral-800">{formatNaira(row.averageUnitPrice)} / T</td>
            <td className="py-3 px-4 font-mono font-black text-neutral-950 text-right">{formatNaira(row.totalRevenue)}</td>
          </tr>
        )}
      />
    </div>
  );
}
