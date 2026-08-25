import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle, Wallet, Package, Truck, Clock, ArrowRight,
  MapPin, CheckCircle2, ShieldAlert, Phone, FileText, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/business/order-status-badge';
import { OrderStatusTimeline } from '@/components/business/order-status-timeline';
import { NotificationItem } from '@/components/business/notification-item';
import { PageTransition } from '@/components/motion/page-transition';
import { FadeIn } from '@/components/motion/fade-in';
import { formatNaira, formatDate, getGreeting } from '@ar-multiventures/business-logic';
import { useAuth } from '@/features/auth/context/auth-context';
import {
  requisitionApi,
  deliveryApi,
  paymentApi,
  customerApi
} from '@ar-multiventures/api';
import type { Requisition, Delivery, Payment, Notification, OrderStatus } from '@ar-multiventures/types';

export function DashboardPage() {
  const { customerProfile } = useAuth();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [reqs, delivery, pmts, notifs] = await Promise.all([
          requisitionApi.list(),
          deliveryApi.getActiveDelivery(),
          paymentApi.list(),
          customerApi.getNotifications('usr-buildcorp-01'),
        ]);
        setRequisitions(reqs);
        setActiveDelivery(delivery);
        setPayments(pmts);
        setNotifications(notifs);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const deliveryTimeline: Array<{
    status: OrderStatus;
    label: string;
    timestamp?: string;
    isCurrent?: boolean;
    isCompleted?: boolean;
  }> = [
    { status: 'approved', label: 'Approved', timestamp: 'Aug 25, 08:30 AM', isCompleted: true },
    { status: 'payment_confirmed', label: 'Payment Confirmed', timestamp: 'Aug 25, 09:30 AM', isCompleted: true },
    { status: 'loading', label: 'Quarry Loading', timestamp: 'Aug 25, 12:15 PM', isCompleted: true },
    { status: 'dispatched', label: 'Dispatched (En Route)', timestamp: 'Aug 25, 02:15 PM', isCurrent: true },
    { status: 'delivered', label: 'Site Offloading', isCompleted: false },
  ];

  const greeting = getGreeting();
  const customerName = customerProfile?.firstName || 'Adebayo';

  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header & Requisition CTA */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-h2 font-extrabold text-neutral-900 tracking-tight">
                  {greeting}, {customerName}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-semibold bg-success-50 text-success-700 border border-success-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-600" />
                  Account Active
                </span>
              </div>
              <p className="text-body-sm text-neutral-500 mt-1">
                {customerProfile?.companyName || 'BuildCorp Nigeria Limited'} · Real-time overview of granite supply orders & haulage logistics.
              </p>
            </div>
            <Link to="/app/requisitions/new">
              <Button
                variant="accent"
                size="lg"
                leftIcon={<PlusCircle className="h-5 w-5" />}
                className="w-full sm:w-auto font-bold text-neutral-950 shadow-sm whitespace-nowrap"
              >
                + Create Requisition
              </Button>
            </Link>
          </div>
        </FadeIn>

        {/* Operational & Financial KPI Cards */}
        <FadeIn delay={0.08}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Account Balance"
              value={formatNaira(customerProfile?.accountBalance || 2450000)}
              icon={<Wallet className="h-5 w-5" />}
              valueClassName="text-h3 font-mono font-bold text-neutral-900"
            />
            <StatCard
              title="Outstanding Orders"
              value={requisitions.length || 4}
              icon={<Package className="h-5 w-5" />}
              valueClassName="text-h3 font-mono font-bold text-neutral-900"
            />
            <StatCard
              title="Orders in Transit"
              value={2}
              icon={<Truck className="h-5 w-5" />}
              valueClassName="text-h3 font-mono font-bold text-accent-700"
            />
            <StatCard
              title="Pending Payments"
              value={formatNaira(780000)}
              icon={<Clock className="h-5 w-5" />}
              valueClassName="text-h3 font-mono font-bold text-neutral-900"
            />
          </div>
        </FadeIn>

        {/* Current Active Delivery Component */}
        <FadeIn delay={0.14}>
          <Card padding="lg" className="border-2 border-primary-600/20 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600/10 text-primary-700 font-bold shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-caption font-mono uppercase text-neutral-500 font-bold">ACTIVE HAULAGE SHIPMENT</span>
                    <span className="text-neutral-300">·</span>
                    <span className="text-body-sm font-bold text-neutral-900">REQ-2026-000142</span>
                  </div>
                  <h3 className="text-h4 font-bold text-neutral-900 mt-0.5">
                    30 Tonnes 20mm Granite Aggregate
                  </h3>
                </div>
              </div>
              <OrderStatusBadge status="dispatched" />
            </div>

            <div className="grid lg:grid-cols-12 gap-6 items-center">
              {/* Route Details & Truck Info (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface-secondary rounded-lg border border-neutral-200">
                    <p className="text-caption text-neutral-500 font-semibold uppercase">Source Quarry</p>
                    <p className="text-body-sm font-bold text-neutral-900 mt-0.5">Abeokuta North Quarry</p>
                    <p className="text-[11px] text-neutral-500">Ogun State Complex</p>
                  </div>
                  <div className="p-3 bg-surface-secondary rounded-lg border border-neutral-200">
                    <p className="text-caption text-neutral-500 font-semibold uppercase">Destination Site</p>
                    <p className="text-body-sm font-bold text-neutral-900 mt-0.5">Lekki Coastal Site</p>
                    <p className="text-[11px] text-neutral-500">Plot 4, Lekki Phase 1, Lagos</p>
                  </div>
                </div>

                <div className="p-3 bg-primary-50/60 rounded-lg border border-primary-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-caption shrink-0">
                      CN
                    </div>
                    <div>
                      <p className="text-body-sm font-bold text-neutral-900">Chukwudi Nwankwo</p>
                      <p className="text-caption text-neutral-600">Assigned Driver · Howo Sinotruk (KJA-842-XY)</p>
                    </div>
                  </div>
                  <a
                    href="tel:+2348031123344"
                    className="p-2 rounded-lg bg-white text-primary-700 border border-primary-200 hover:bg-primary-100 transition-colors"
                    aria-label="Call driver"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Status Timeline Visualization (7 cols) */}
              <div className="lg:col-span-7 bg-surface-secondary p-4 sm:p-5 rounded-xl border border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-caption font-bold uppercase text-neutral-700 tracking-wider">
                    Logistics Progression
                  </p>
                  <span className="text-caption font-mono text-accent-800 font-bold bg-accent-100 px-2 py-0.5 rounded">
                    Checkpoint: Lagos Tollgate Axis
                  </span>
                </div>
                {/* Horizontal on Desktop, Vertical on Mobile */}
                <div className="hidden sm:block">
                  <OrderStatusTimeline steps={deliveryTimeline} orientation="horizontal" />
                </div>
                <div className="sm:hidden">
                  <OrderStatusTimeline steps={deliveryTimeline} orientation="vertical" />
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* 2-Column Operational Grid: Recent Requisitions & Account Activity */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Recent Requisitions (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <FadeIn delay={0.2}>
              <Card padding="none">
                <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-200">
                  <div>
                    <h3 className="text-h4 font-bold text-neutral-900">Recent Supply Requisitions</h3>
                    <p className="text-caption text-neutral-500">Track current batch requisitions and loading statuses</p>
                  </div>
                  <Link to="/app/requisitions" className="text-body-sm font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1">
                    <span>View all</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
                        <th className="text-left px-5 py-3 text-caption font-bold uppercase tracking-wider">Reference</th>
                        <th className="text-left px-5 py-3 text-caption font-bold uppercase tracking-wider">Material</th>
                        <th className="text-left px-5 py-3 text-caption font-bold uppercase tracking-wider">Tonnage</th>
                        <th className="text-left px-5 py-3 text-caption font-bold uppercase tracking-wider">Quarry</th>
                        <th className="text-right px-5 py-3 text-caption font-bold uppercase tracking-wider">Amount</th>
                        <th className="text-right px-5 py-3 text-caption font-bold uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {requisitions.map((req) => (
                        <tr key={req.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="px-5 py-3.5 text-body-sm font-mono font-bold text-primary-700">
                            {req.referenceNumber}
                          </td>
                          <td className="px-5 py-3.5 text-body-sm font-medium text-neutral-900">
                            {req.materialName}
                          </td>
                          <td className="px-5 py-3.5 text-body-sm text-neutral-600">
                            {req.quantity} {req.unit}
                          </td>
                          <td className="px-5 py-3.5 text-body-sm text-neutral-600">
                            {req.quarryName}
                          </td>
                          <td className="px-5 py-3.5 text-body-sm font-mono font-bold text-neutral-900 text-right">
                            {formatNaira(req.pricing.total)}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <OrderStatusBadge status={req.status} size="sm" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Alternative (Responsive requirement) */}
                <div className="md:hidden divide-y divide-neutral-100 p-3 space-y-3">
                  {requisitions.map((req) => (
                    <div key={req.id} className="p-3 bg-surface-secondary rounded-lg border border-neutral-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-body-sm font-bold text-primary-700">{req.referenceNumber}</span>
                        <OrderStatusBadge status={req.status} size="sm" />
                      </div>
                      <div>
                        <p className="text-body-sm font-bold text-neutral-900">{req.materialName}</p>
                        <p className="text-caption text-neutral-500">{req.quantity} {req.unit} · {req.quarryName}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
                        <span className="text-caption text-neutral-500">Destination: {req.destination}</span>
                        <span className="font-mono font-bold text-neutral-900 text-body-sm">{formatNaira(req.pricing.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </FadeIn>
          </div>

          {/* Right Column: Transactions & Notifications (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Recent Payments Card */}
            <FadeIn delay={0.25}>
              <Card padding="none">
                <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-200">
                  <h3 className="text-h4 font-bold text-neutral-900">Recent Payments</h3>
                  <Link to="/app/payments" className="text-caption font-bold text-primary-700 hover:text-primary-800">
                    View all
                  </Link>
                </div>
                <div className="p-4 space-y-3">
                  {payments.map((p) => (
                    <div key={p.id} className="p-3 rounded-lg bg-surface-secondary border border-neutral-200 flex items-center justify-between">
                      <div>
                        <p className="text-body-sm font-bold text-neutral-900 font-mono">{p.referenceNumber}</p>
                        <p className="text-caption text-neutral-500 line-clamp-1">{p.description}</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">{formatDate(p.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-body-sm font-mono font-bold text-success-700">{formatNaira(p.amount)}</p>
                        <span className="text-[10px] uppercase font-bold text-success-700 bg-success-50 px-1.5 py-0.5 rounded border border-success-200">
                          Confirmed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </FadeIn>

            {/* Notifications Panel */}
            <FadeIn delay={0.3}>
              <Card padding="none">
                <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-200">
                  <h3 className="text-h4 font-bold text-neutral-900">Operational Alerts</h3>
                  <Link to="/app/notifications" className="text-caption font-bold text-primary-700 hover:text-primary-800">
                    View all
                  </Link>
                </div>
                <div className="p-3 space-y-1">
                  {notifications.slice(0, 3).map((n) => (
                    <NotificationItem
                      key={n.id}
                      type={n.type}
                      title={n.title}
                      message={n.message}
                      time={n.timestamp}
                      isRead={n.isRead}
                    />
                  ))}
                </div>
              </Card>
            </FadeIn>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
