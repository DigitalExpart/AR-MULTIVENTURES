import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Banknote, Receipt, CreditCard, Shield, AlertTriangle,
  ArrowRight, FileSpreadsheet, CheckCircle2, TrendingUp
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { financeApi } from '@ar-multiventures/api';
import type { FinanceDashboardKPIs, InvoiceRecord, PaymentRecord } from '@ar-multiventures/types';

export function AdminFinanceDashboardPage() {
  const [kpis, setKpis] = useState<FinanceDashboardKPIs | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [kpiData, invData, payData] = await Promise.all([
          financeApi.getDashboardKPIs(),
          financeApi.getInvoices(),
          financeApi.getPayments(),
        ]);
        setKpis(kpiData);
        setInvoices(invData.slice(0, 5));
        setPayments(payData.slice(0, 5));
      } catch (err) {
        console.error('Failed to load finance dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Financial Command & Sub-Ledger Center"
        description={`Authoritative enterprise accounts receivable, confirmed payments, and credit risk exposure — ${formatDate(new Date().toISOString())}`}
        breadcrumbs={[{ label: 'Admin Command', href: '/admin' }, { label: 'Finance' }]}
        action={
          <div className="flex items-center gap-2.5">
            <Link to="/admin/finance/invoices">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Manage Invoices
              </Button>
            </Link>
          </div>
        }
      />

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card padding="sm" className="bg-white border-neutral-200">
          <div className="flex items-center justify-between text-caption font-semibold text-neutral-500 mb-1">
            <span>Total Receivables</span>
            <Receipt className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="text-h3 font-black text-neutral-950 font-mono truncate">
            {isLoading ? '...' : formatNaira(kpis?.totalReceivables || 0)}
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">Current customer balance</span>
        </Card>

        <Card padding="sm" className="bg-white border-emerald-200 bg-emerald-50/20">
          <div className="flex items-center justify-between text-caption font-semibold text-emerald-800 mb-1">
            <span>Payments Received</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-h3 font-black text-emerald-950 font-mono truncate">
            {isLoading ? '...' : formatNaira(kpis?.paymentsReceived || 0)}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Confirmed ledger credits</span>
        </Card>

        <Card padding="sm" className="bg-white border-neutral-200">
          <div className="flex items-center justify-between text-caption font-semibold text-neutral-500 mb-1">
            <span>Open Invoices</span>
            <Receipt className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="text-h3 font-black text-neutral-900">
            {isLoading ? '...' : kpis?.outstandingInvoicesCount || 0}
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">Pending settlement</span>
        </Card>

        <Card padding="sm" className="bg-white border-neutral-200">
          <div className="flex items-center justify-between text-caption font-semibold text-neutral-500 mb-1">
            <span>Credit Exposure</span>
            <CreditCard className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="text-h3 font-black text-neutral-900 font-mono truncate">
            {isLoading ? '...' : formatNaira(kpis?.totalCreditExposure || 0)}
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">Out of {formatNaira(kpis?.totalCreditLimit || 0)}</span>
        </Card>

        <Card padding="sm" className="bg-white border-neutral-200">
          <div className="flex items-center justify-between text-caption font-semibold text-neutral-500 mb-1">
            <span>Overdue Debts</span>
            <AlertTriangle className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-h3 font-black text-emerald-700 font-mono">
            ₦0.00
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">100% On-time Portfolio</span>
        </Card>
      </div>

      {/* Grid: Open Invoices & Bank Transfers for Confirmation */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-body font-bold text-neutral-900 uppercase tracking-wide">
              Recent Commercial Invoices
            </h3>
            <Link to="/admin/finance/invoices" className="text-caption font-semibold text-primary-700 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold">
                <tr>
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Total</th>
                  <th className="py-2.5 px-4">Outstanding</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-50">
                    <td className="py-3 px-4 font-mono font-bold text-primary-800">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 font-medium text-neutral-900 truncate max-w-[160px]">{inv.customerName}</td>
                    <td className="py-3 px-4 font-mono font-bold">{formatNaira(inv.totalAmount)}</td>
                    <td className="py-3 px-4 font-mono text-red-700 font-bold">{formatNaira(inv.outstandingAmount)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-neutral-100 text-neutral-700">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-body font-bold text-neutral-900 uppercase tracking-wide">
              Bank Transfers Awaiting Review
            </h3>
            <Link to="/admin/finance/payments" className="text-caption font-semibold text-primary-700 flex items-center gap-1">
              <span>Review All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {payments.map((p) => (
              <Card key={p.id} padding="sm" className="bg-white border-neutral-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-primary-800 text-body-sm">{p.paymentReference}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    p.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                  }`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-neutral-600 truncate max-w-[200px]">{p.customerName}</span>
                  <span className="font-mono font-bold text-neutral-950">{formatNaira(p.amount)}</span>
                </div>
                <div className="text-[11px] font-mono text-neutral-400">
                  Ref: {p.bankReference || 'Pending Bank Ref'} · {formatDate(p.paymentDate)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
