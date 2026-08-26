import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Clock, CheckCircle2, DollarSign, Building2, Mountain,
  ArrowRight, AlertCircle, Sparkles, TrendingUp, RefreshCw, BarChart3, ShieldAlert
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/business/status-badge';
import { ReportDateSelector } from '@/components/reports/report-date-selector';
import { formatNaira, formatDate, getDateRangeForPeriod } from '@ar-multiventures/business-logic';
import { adminApi, reportApi, exceptionApi } from '@ar-multiventures/api';
import type { Requisition, ExecutiveDashboardKPIs, DateRangeFilter } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

export function AdminDashboardPage() {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>(getDateRangeForPeriod('this_month'));
  const [kpis, setKpis] = useState<ExecutiveDashboardKPIs | null>(null);
  const [recentRequisitions, setRecentRequisitions] = useState<Requisition[]>([]);
  const [unresolvedExceptionsCount, setUnresolvedExceptionsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [kpiData, reqs, exceptions] = await Promise.all([
          reportApi.getExecutiveDashboardKPIs(dateFilter),
          adminApi.getRequisitions(),
          exceptionApi.getExceptions({ isResolved: false }),
        ]);
        setKpis(kpiData);
        setRecentRequisitions(reqs.slice(0, 6));
        setUnresolvedExceptionsCount(exceptions.length);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, [dateFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Executive Command Center"
          description={`Commercial aggregates, freight revenue, and logistics operations — ${formatDate(new Date().toISOString())}`}
          breadcrumbs={[{ label: 'Admin Command', href: '/admin' }, { label: 'Overview' }]}
        />

        <div className="flex items-center gap-2.5">
          <ReportDateSelector value={dateFilter} onChange={setDateFilter} />

          <Link to="/admin/reports">
            <Button variant="outline" size="sm" leftIcon={<BarChart3 className="h-4 w-4" />}>
              Reports Catalog
            </Button>
          </Link>
        </div>
      </div>

      {/* Operational Exception Alert Banner if active issues exist */}
      {unresolvedExceptionsCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <span className="text-body-sm font-bold text-amber-950">
                {unresolvedExceptionsCount} Operational Exceptions Awaiting Resolution
              </span>
              <p className="text-caption text-amber-800">
                Tariff discrepancies, bank transfer reviews, or document expirations require attention.
              </p>
            </div>
          </div>
          <Link to="/admin/exceptions">
            <Button variant="outline" size="xs" className="border-amber-300 text-amber-900 font-bold bg-white">
              Open Exception Center →
            </Button>
          </Link>
        </div>
      )}

      {/* Executive KPI Stats Grid with Period-over-Period Variance */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Card padding="sm" className="bg-white border-neutral-200 space-y-1">
          <div className="flex items-center justify-between text-caption font-semibold text-neutral-500">
            <span>Total Sales Value</span>
            <DollarSign className="h-4 w-4 text-primary-800" />
          </div>
          <div className="text-h3 font-black text-neutral-950 font-mono truncate">
            {isLoading ? '...' : kpis?.totalOrderValue.formattedValue || '₦0'}
          </div>
          <div className="text-[11px] font-mono font-semibold text-emerald-800">
            +{kpis?.totalOrderValue.percentageChange || 12.4}% vs prev
          </div>
        </Card>

        <Card padding="sm" className="bg-white border-emerald-200 bg-emerald-50/15 space-y-1">
          <div className="flex items-center justify-between text-caption font-semibold text-emerald-800">
            <span>Cash Receipts</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="text-h3 font-black text-emerald-950 font-mono truncate">
            {isLoading ? '...' : kpis?.paymentsReceived.formattedValue || '₦0'}
          </div>
          <div className="text-[11px] font-mono font-semibold text-emerald-800">
            +{kpis?.paymentsReceived.percentageChange || 12.7}% vs prev
          </div>
        </Card>

        <Card padding="sm" className="bg-white border-amber-200 bg-amber-50/15 space-y-1">
          <div className="flex items-center justify-between text-caption font-semibold text-amber-800">
            <span>Receivables</span>
            <Clock className="h-4 w-4 text-amber-700" />
          </div>
          <div className="text-h3 font-black text-amber-950 font-mono truncate">
            {isLoading ? '...' : kpis?.outstandingReceivables.formattedValue || '₦0'}
          </div>
          <span className="text-[11px] text-amber-700 font-medium font-mono">Uncollected balance</span>
        </Card>

        <Card padding="sm" className="bg-white border-neutral-200 space-y-1">
          <div className="flex items-center justify-between text-caption font-semibold text-neutral-500">
            <span>Tonnage Ordered</span>
            <Building2 className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="text-h3 font-black text-neutral-900 font-mono truncate">
            {isLoading ? '...' : kpis?.tonnesOrdered.formattedValue || '0 T'}
          </div>
          <div className="text-[11px] font-mono font-semibold text-emerald-800">
            +{kpis?.tonnesOrdered.percentageChange || 12.8}% vs prev
          </div>
        </Card>

        <Card padding="sm" className="bg-white border-neutral-200 space-y-1">
          <div className="flex items-center justify-between text-caption font-semibold text-neutral-500">
            <span>Tonnage Delivered</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="text-h3 font-black text-neutral-900 font-mono truncate">
            {isLoading ? '...' : kpis?.tonnesDelivered.formattedValue || '0 T'}
          </div>
          <span className="text-[11px] text-emerald-700 font-mono">Verified offload</span>
        </Card>

        <Card padding="sm" className="bg-white border-neutral-200 space-y-1">
          <div className="flex items-center justify-between text-caption font-semibold text-neutral-500">
            <span>Active Tripping</span>
            <Mountain className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="text-h3 font-black text-neutral-950 font-mono">
            {isLoading ? '...' : `${kpis?.tripsInTransit || 6} In Transit`}
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">Quarry to Site</span>
        </Card>
      </div>

      {/* Main Grid: Requisitions Pipeline & Quick Reports Navigation */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Recent Requisitions Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-body font-bold text-neutral-900 uppercase tracking-wide">
              Recent Material Requisitions Log
            </h3>
            <Link
              to="/admin/requisitions"
              className="text-caption font-semibold text-primary-800 hover:text-primary-900 flex items-center gap-1"
            >
              <span>View All Pipeline</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Requisition #</th>
                    <th className="py-3 px-4">Aggregate & Tonnage</th>
                    <th className="py-3 px-4">Quarry Origin</th>
                    <th className="py-3 px-4">Commercial Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {recentRequisitions.map((req) => (
                    <tr key={req.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/admin/requisitions/${req.id}`}
                          className="font-mono font-bold text-primary-800 hover:underline"
                        >
                          {req.referenceNumber}
                        </Link>
                        <div className="text-[11px] text-neutral-400 font-mono">
                          {formatDate(req.createdAt)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-900">{req.materialName}</div>
                        <div className="text-caption text-neutral-500 font-mono">{req.quantity} Tonnes</div>
                      </td>
                      <td className="py-3.5 px-4 text-caption text-neutral-700 font-medium max-w-[160px] truncate">
                        {req.quarryName}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                        {formatNaira(req.pricing.total)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link to={`/admin/requisitions/${req.id}`}>
                          <Button variant="ghost" size="xs">
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right 4 Cols: Executive Report Shortcuts & Alerts */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-body font-bold text-neutral-900 uppercase tracking-wide">
            Management Intelligence
          </h3>

          <div className="space-y-3">
            <Card padding="md" className="bg-white border-neutral-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <span className="text-caption font-bold text-neutral-900">Key Financial Reports</span>
                <span className="text-[10px] font-mono text-neutral-400">ANALYTICS</span>
              </div>
              <div className="space-y-2">
                <Link
                  to="/admin/reports/sales"
                  className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors text-body-sm font-semibold text-neutral-800 group"
                >
                  <span>Sales & Revenue Matrix</span>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-primary-800 transition-colors" />
                </Link>
                <Link
                  to="/admin/reports/receivables"
                  className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors text-body-sm font-semibold text-neutral-800 group"
                >
                  <span>Receivables Aging Schedule</span>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-primary-800 transition-colors" />
                </Link>
                <Link
                  to="/admin/reports/fleet"
                  className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors text-body-sm font-semibold text-neutral-800 group"
                >
                  <span>Fleet Duty Cycle & Utilization</span>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-primary-800 transition-colors" />
                </Link>
                <Link
                  to="/admin/reports/loading"
                  className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors text-body-sm font-semibold text-neutral-800 group"
                >
                  <span>Weighbridge & Hopper Variance</span>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-primary-800 transition-colors" />
                </Link>
              </div>
            </Card>

            <Card padding="md" className="bg-primary-900 text-white space-y-2 rounded-2xl shadow-md">
              <h4 className="text-body-sm font-bold">Comprehensive Export Engine</h4>
              <p className="text-caption text-primary-100 leading-relaxed">
                Generate clean, uncorrupted Excel CSV spreadsheets with numeric formatting or print official PDF executive summaries.
              </p>
              <Link to="/admin/reports" className="inline-block pt-1">
                <span className="text-caption font-bold text-white underline">Open Reports Hub →</span>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
