import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { ReportDateSelector } from '@/components/reports/report-date-selector';
import { ReportTable } from '@/components/reports/report-table';
import { reportApi } from '@ar-multiventures/api';
import { formatNaira, formatDate, getDateRangeForPeriod, CsvColumn } from '@ar-multiventures/business-logic';
import type { SalesReportData, SalesReportRow, DateRangeFilter } from '@ar-multiventures/types';
import { TrendingUp, DollarSign, ShoppingBag, CheckCircle2, Clock } from 'lucide-react';

const CSV_COLUMNS: CsvColumn<SalesReportRow>[] = [
  { header: 'Requisition #', key: 'referenceNumber' },
  { header: 'Customer', key: 'customerName' },
  { header: 'Quarry Origin', key: 'quarryName' },
  { header: 'Destination Site', key: 'destinationName' },
  { header: 'Material', key: 'materialName' },
  { header: 'Quantity (Tonnes)', key: 'quantityTonnes', format: 'number' },
  { header: 'Order Value (NGN)', key: 'orderValue', format: 'number' },
  { header: 'Status', key: 'status' },
  { header: 'Date', key: (r) => formatDate(r.createdAt) },
];

export function AdminSalesReportPage() {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>(getDateRangeForPeriod('this_month'));
  const [reportData, setReportData] = useState<SalesReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await reportApi.getSalesReport(dateFilter);
        setReportData(data);
      } catch (err) {
        console.error('Failed to load sales report:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [dateFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Sales & Revenue Analytics Report"
          description="Detailed sales revenue breakdown, commercial approvals, customer order sizes, and quarry origin volumes."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Reports', href: '/admin/reports' },
            { label: 'Sales Analytics' },
          ]}
        />
        <ReportDateSelector value={dateFilter} onChange={setDateFilter} />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-neutral-500">Total Sales Value</span>
          <div className="text-h3 font-black text-neutral-950 font-mono">
            {formatNaira(reportData?.summary.totalSalesValue || 0)}
          </div>
          <span className="text-[11px] text-neutral-400">All Requisitions</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-800">Approved Sales</span>
          <div className="text-h3 font-black text-emerald-950 font-mono">
            {formatNaira(reportData?.summary.approvedSalesValue || 0)}
          </div>
          <span className="text-[11px] text-emerald-700">Commercial Cleared</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-neutral-500">Total Orders</span>
          <div className="text-h3 font-black text-neutral-900 font-mono">
            {reportData?.summary.totalOrdersCount || 0} Orders
          </div>
          <span className="text-[11px] text-neutral-400">In Selected Period</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-primary-800">Average Order</span>
          <div className="text-h3 font-black text-primary-950 font-mono">
            {formatNaira(reportData?.summary.averageOrderValue || 0)}
          </div>
          <span className="text-[11px] text-primary-700">Per Requisition</span>
        </Card>
      </div>

      {/* Main Detailed Orders Table */}
      <ReportTable
        title="Sales Orders Log"
        subtitle="Individual commercial supply orders generated in the period"
        columns={CSV_COLUMNS}
        data={reportData?.rows || []}
        exportFilename={`sales_report_${dateFilter.period}`}
        isLoading={isLoading}
        renderRow={(row) => (
          <tr key={row.requisitionId} className="hover:bg-neutral-50/80 transition-colors">
            <td className="py-3 px-4 font-mono font-bold text-primary-800">{row.referenceNumber}</td>
            <td className="py-3 px-4 font-bold text-neutral-900">{row.customerName}</td>
            <td className="py-3 px-4 text-caption text-neutral-700">{row.quarryName}</td>
            <td className="py-3 px-4 text-caption text-neutral-700 max-w-xs truncate">{row.destinationName}</td>
            <td className="py-3 px-4 text-caption text-neutral-600">{row.materialName}</td>
            <td className="py-3 px-4 font-mono font-bold text-neutral-900">{row.quantityTonnes} T</td>
            <td className="py-3 px-4 font-mono font-black text-neutral-950">{formatNaira(row.orderValue)}</td>
            <td className="py-3 px-4">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-neutral-100 text-neutral-800">
                {row.status}
              </span>
            </td>
            <td className="py-3 px-4 font-mono text-caption text-neutral-500">{formatDate(row.createdAt)}</td>
          </tr>
        )}
      />
    </div>
  );
}
