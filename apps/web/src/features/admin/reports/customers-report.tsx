import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { ReportDateSelector } from '@/components/reports/report-date-selector';
import { ReportTable } from '@/components/reports/report-table';
import { financeApi } from '@ar-multiventures/api';
import { formatNaira, getDateRangeForPeriod, CsvColumn } from '@ar-multiventures/business-logic';
import type { CustomerFinancialSummary, DateRangeFilter } from '@ar-multiventures/types';
import { Users, DollarSign, CreditCard, ShieldCheck } from 'lucide-react';

const CSV_COLUMNS: CsvColumn<CustomerFinancialSummary>[] = [
  { header: 'Customer Name', key: 'customerName' },
  { header: 'Reference #', key: 'customerReference' },
  { header: 'Total Invoiced (NGN)', key: 'totalInvoiced', format: 'number' },
  { header: 'Total Paid (NGN)', key: 'totalPaid', format: 'number' },
  { header: 'Outstanding Balance (NGN)', key: (c) => Math.abs(c.accountBalance), format: 'number' },
  { header: 'Credit Limit (NGN)', key: 'creditLimit', format: 'number' },
  { header: 'Credit Status', key: 'creditStatus' },
];

export function AdminCustomersReportPage() {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>(getDateRangeForPeriod('this_month'));
  const [rows, setRows] = useState<CustomerFinancialSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await financeApi.getAllCustomerFinancialSummaries();
        setRows(data);
      } catch (err) {
        console.error('Failed to load customer report:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [dateFilter]);

  const totalInvoiced = rows.reduce((s, r) => s + r.totalInvoiced, 0);
  const totalPaid = rows.reduce((s, r) => s + r.totalPaid, 0);
  const totalCreditLimit = rows.reduce((s, r) => s + r.creditLimit, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Customer Volume, Revenue & Credit Report"
          description="Client corporate account balances, invoice billing totals, payments cleared, and authorized credit lines."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Reports', href: '/admin/reports' },
            { label: 'Customers' },
          ]}
        />
        <ReportDateSelector value={dateFilter} onChange={setDateFilter} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-neutral-500">Total Billed</span>
          <div className="text-h3 font-black text-neutral-950 font-mono">
            {formatNaira(totalInvoiced)}
          </div>
          <span className="text-[11px] text-neutral-400">All Client Accounts</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-800">Total Collected</span>
          <div className="text-h3 font-black text-emerald-950 font-mono">
            {formatNaira(totalPaid)}
          </div>
          <span className="text-[11px] text-emerald-700">Settled Receipts</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-amber-800">Outstanding Balance</span>
          <div className="text-h3 font-black text-amber-950 font-mono">
            {formatNaira(totalInvoiced - totalPaid)}
          </div>
          <span className="text-[11px] text-amber-700">Trade Debt</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-primary-800">Total Credit Line</span>
          <div className="text-h3 font-black text-primary-950 font-mono">
            {formatNaira(totalCreditLimit)}
          </div>
          <span className="text-[11px] text-primary-700">Approved Facilities</span>
        </Card>
      </div>

      <ReportTable
        title="Customer Financial Summary Log"
        subtitle="Individual commercial accounts and credit utilization"
        columns={CSV_COLUMNS}
        data={rows}
        exportFilename={`customer_report_${dateFilter.period}`}
        isLoading={isLoading}
        renderRow={(row) => (
          <tr key={row.customerId} className="hover:bg-neutral-50/80 transition-colors">
            <td className="py-3 px-4 font-bold text-neutral-900">{row.customerName}</td>
            <td className="py-3 px-4 font-mono text-caption text-neutral-500">{row.customerReference}</td>
            <td className="py-3 px-4 font-mono font-bold text-neutral-900">{formatNaira(row.totalInvoiced)}</td>
            <td className="py-3 px-4 font-mono font-bold text-emerald-800">{formatNaira(row.totalPaid)}</td>
            <td className="py-3 px-4 font-mono font-black text-amber-900">{formatNaira(Math.abs(row.accountBalance))}</td>
            <td className="py-3 px-4 font-mono font-semibold text-neutral-700">{formatNaira(row.creditLimit)}</td>
            <td className="py-3 px-4 text-right">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-neutral-100 text-neutral-800">
                {row.creditStatus}
              </span>
            </td>
          </tr>
        )}
      />
    </div>
  );
}
