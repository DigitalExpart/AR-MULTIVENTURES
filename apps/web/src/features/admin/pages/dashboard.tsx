import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Clock, CheckCircle2, DollarSign, Building2, Mountain,
  ArrowRight, AlertCircle, Sparkles, TrendingUp, RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/business/status-badge';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { adminApi } from '@ar-multiventures/api';
import type { Requisition } from '@ar-multiventures/types';

export function AdminDashboardPage() {
  const [kpis, setKpis] = useState<{
    todayRequisitions: number;
    pendingApproval: number;
    approvedOrders: number;
    totalOrderValue: number;
    totalCustomers: number;
    activeQuarries: number;
    statusBreakdown: Record<string, number>;
  } | null>(null);

  const [recentRequisitions, setRecentRequisitions] = useState<Requisition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [kpiData, reqs] = await Promise.all([
          adminApi.getDashboardKPIs(),
          adminApi.getRequisitions(),
        ]);
        setKpis(kpiData);
        setRecentRequisitions(reqs.slice(0, 6));
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Operations Overview"
        description={`Live logistics management & commercial supply tracking — ${formatDate(new Date().toISOString())}`}
        breadcrumbs={[{ label: 'Admin Command', href: '/admin' }, { label: 'Overview' }]}
        action={
          <div className="flex items-center gap-2.5">
            <Link to="/admin/requisitions">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Manage Requisitions
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        <Card padding="sm" className="bg-white border-neutral-200">
          <div className="flex items-center justify-between text-caption font-semibold text-neutral-500 mb-1">
            <span>Requisitions</span>
            <FileText className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="text-h3 font-black text-neutral-950">
            {isLoading ? '...' : kpis?.todayRequisitions || 0}
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">Logged orders</span>
        </Card>

        <Card padding="sm" className="bg-white border-amber-200 bg-amber-50/20">
          <div className="flex items-center justify-between text-caption font-semibold text-amber-700 mb-1">
            <span>Pending Review</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-h3 font-black text-amber-900">
            {isLoading ? '...' : kpis?.pendingApproval || 0}
          </div>
          <span className="text-[11px] text-amber-700 font-medium">Requires approval</span>
        </Card>

        <Card padding="sm" className="bg-white border-emerald-200 bg-emerald-50/20">
          <div className="flex items-center justify-between text-caption font-semibold text-emerald-700 mb-1">
            <span>Approved Orders</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-h3 font-black text-emerald-900">
            {isLoading ? '...' : kpis?.approvedOrders || 0}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Ready for loading</span>
        </Card>

        <Card padding="sm" className="bg-white border-neutral-200 lg:col-span-1">
          <div className="flex items-center justify-between text-caption font-semibold text-neutral-500 mb-1">
            <span>Order Value</span>
            <DollarSign className="h-4 w-4 text-primary-600" />
          </div>
          <div className="text-h3 font-black text-primary-900 font-mono truncate">
            {isLoading ? '...' : formatNaira(kpis?.totalOrderValue || 0)}
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">Total pipeline value</span>
        </Card>

        <Card padding="sm" className="bg-white border-neutral-200">
          <div className="flex items-center justify-between text-caption font-semibold text-neutral-500 mb-1">
            <span>Customers</span>
            <Building2 className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="text-h3 font-black text-neutral-950">
            {isLoading ? '...' : kpis?.totalCustomers || 0}
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">Registered accounts</span>
        </Card>

        <Card padding="sm" className="bg-white border-neutral-200">
          <div className="flex items-center justify-between text-caption font-semibold text-neutral-500 mb-1">
            <span>Active Quarries</span>
            <Mountain className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="text-h3 font-black text-neutral-950">
            {isLoading ? '...' : kpis?.activeQuarries || 0}
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">Operational hubs</span>
        </Card>
      </div>

      {/* Main Grid: Requisitions Pipeline & Pricing Alerts */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Recent Requisitions Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-body font-bold text-neutral-900 uppercase tracking-wide">
              Recent Material Requisitions
            </h3>
            <Link
              to="/admin/requisitions"
              className="text-caption font-semibold text-primary-700 hover:text-primary-800 flex items-center gap-1"
            >
              <span>View All</span>
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
                    <th className="py-3 px-4">Extraction Quarry</th>
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

        {/* Right 4 Cols: Operational Alerts & Quick Links */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-body font-bold text-neutral-900 uppercase tracking-wide">
            Commercial & Pricing Alerts
          </h3>

          <div className="space-y-3">
            <Card padding="sm" className="bg-amber-50/50 border-amber-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-caption font-bold text-amber-900">
                    1 Pending Sourcing Site Request
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Badagry Deep Sea Port site base submitted by Julius Berger requires route validation.
                  </p>
                  <Link
                    to="/admin/destination-requests"
                    className="inline-block mt-2 text-[11px] font-bold text-amber-900 underline"
                  >
                    Review Site Request →
                  </Link>
                </div>
              </div>
            </Card>

            <Card padding="sm" className="bg-emerald-50/50 border-emerald-200">
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-caption font-bold text-emerald-900">
                    Active Campaign: South-West Stimulus
                  </h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    ₦8,100/T promo rate active on 3/4" Granite @ Abeokuta Quarry. Expires Sept 30.
                  </p>
                  <Link
                    to="/admin/pricing/promotions"
                    className="inline-block mt-2 text-[11px] font-bold text-emerald-900 underline"
                  >
                    Manage Promotions →
                  </Link>
                </div>
              </div>
            </Card>

            <Card padding="sm" className="bg-white border-neutral-200">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <span className="text-caption font-bold text-neutral-900">Quick Catalog Navigation</span>
                <span className="text-[10px] font-mono text-neutral-400">SHORTCUTS</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 text-caption">
                <Link
                  to="/admin/pricing/materials"
                  className="p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-semibold transition-colors"
                >
                  Material Prices
                </Link>
                <Link
                  to="/admin/pricing/haulage"
                  className="p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-semibold transition-colors"
                >
                  Haulage Tariffs
                </Link>
                <Link
                  to="/admin/pricing/customers"
                  className="p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-semibold transition-colors"
                >
                  Customer Rates
                </Link>
                <Link
                  to="/admin/audit"
                  className="p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-semibold transition-colors"
                >
                  Audit Trail
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
