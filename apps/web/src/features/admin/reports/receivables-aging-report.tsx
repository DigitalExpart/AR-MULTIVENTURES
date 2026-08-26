import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { ReportTable } from '@/components/reports/report-table';
import { reportApi } from '@ar-multiventures/api';
import { formatNaira, CsvColumn } from '@ar-multiventures/business-logic';
import type { ReceivablesAgingReportData, ReceivablesAgingRow } from '@ar-multiventures/types';
import { FileSpreadsheet, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';

const CSV_COLUMNS: CsvColumn<ReceivablesAgingRow>[] = [
  { header: 'Customer Name', key: 'customerName' },
  { header: 'Customer Reference', key: 'customerReference' },
  { header: 'Current Amount (NGN)', key: 'currentAmount', format: 'number' },
  { header: '1-30 Days Overdue (NGN)', key: 'days1To30', format: 'number' },
  { header: '31-60 Days Overdue (NGN)', key: 'days31To60', format: 'number' },
  { header: '61-90 Days Overdue (NGN)', key: 'days61To90', format: 'number' },
  { header: '90+ Days Overdue (NGN)', key: 'days90Plus', format: 'number' },
  { header: 'Total Outstanding (NGN)', key: 'totalOutstanding', format: 'number' },
];

export function AdminReceivablesAgingReportPage() {
  const [reportData, setReportData] = useState<ReceivablesAgingReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await reportApi.getReceivablesAgingReport();
        setReportData(data);
      } catch (err) {
        console.error('Failed to load receivables aging report:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const totalOverdue =
    (reportData?.total1To30 || 0) +
    (reportData?.total31To60 || 0) +
    (reportData?.total61To90 || 0) +
    (reportData?.total90Plus || 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Customer Receivables Aging Report"
        description="Comprehensive analysis of outstanding trade debt across deterministic aging buckets based on invoice due dates."
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin' },
          { label: 'Reports', href: '/admin/reports' },
          { label: 'Receivables Aging' },
        ]}
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-neutral-500">Total Outstanding</span>
          <div className="text-h3 font-black text-neutral-950 font-mono">
            {formatNaira(reportData?.totalOutstanding || 0)}
          </div>
          <span className="text-[11px] text-neutral-400">All Client Accounts</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-800">Current (Not Due)</span>
          <div className="text-h3 font-black text-emerald-950 font-mono">
            {formatNaira(reportData?.totalCurrent || 0)}
          </div>
          <span className="text-[11px] text-emerald-700">Within Credit Terms</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-amber-800">1–60 Days Overdue</span>
          <div className="text-h3 font-black text-amber-950 font-mono">
            {formatNaira((reportData?.total1To30 || 0) + (reportData?.total31To60 || 0))}
          </div>
          <span className="text-[11px] text-amber-700">Follow-up Required</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-red-700">60+ Days Overdue</span>
          <div className="text-h3 font-black text-red-950 font-mono">
            {formatNaira((reportData?.total61To90 || 0) + (reportData?.total90Plus || 0))}
          </div>
          <span className="text-[11px] text-red-700">Critical Credit Warning</span>
        </Card>
      </div>

      {/* Main Aging Table */}
      <ReportTable
        title="Receivables Aging Schedule"
        subtitle="Individual customer debt distribution across aging intervals"
        columns={CSV_COLUMNS}
        data={reportData?.rows || []}
        exportFilename="receivables_aging_report"
        isLoading={isLoading}
        renderRow={(row) => (
          <tr key={row.customerId} className="hover:bg-neutral-50/80 transition-colors">
            <td className="py-3 px-4 font-bold text-neutral-900">{row.customerName}</td>
            <td className="py-3 px-4 font-mono text-caption text-neutral-500">{row.customerReference}</td>
            <td className="py-3 px-4 font-mono font-semibold text-emerald-800">{formatNaira(row.currentAmount)}</td>
            <td className="py-3 px-4 font-mono font-semibold text-neutral-800">{formatNaira(row.days1To30)}</td>
            <td className="py-3 px-4 font-mono font-semibold text-amber-800">{formatNaira(row.days31To60)}</td>
            <td className="py-3 px-4 font-mono font-semibold text-amber-900">{formatNaira(row.days61To90)}</td>
            <td className="py-3 px-4 font-mono font-black text-red-700">{formatNaira(row.days90Plus)}</td>
            <td className="py-3 px-4 font-mono font-black text-neutral-950 text-right">
              {formatNaira(row.totalOutstanding)}
            </td>
          </tr>
        )}
      />
    </div>
  );
}
