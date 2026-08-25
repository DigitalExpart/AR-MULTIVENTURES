import { Link } from 'react-router-dom';
import { PlusCircle, Wallet, Package, Truck, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/business/order-status-badge';
import { OrderStatusTimeline } from '@/components/business/order-status-timeline';
import { NotificationItem } from '@/components/business/notification-item';
import { PageTransition } from '@/components/motion/page-transition';
import { FadeIn } from '@/components/motion/fade-in';
import { formatNaira, formatDate, getGreeting } from '@/lib/format';
import {
  mockUser, mockRequisitions, mockPayments,
  dashboardStats, mockNotifications, mockDeliveries,
} from '@/services/mock/mock-data';
import type { OrderStatus } from '@/types/common';

const deliveryTimeline: Array<{
  status: OrderStatus;
  label: string;
  timestamp?: string;
  isCurrent?: boolean;
  isCompleted?: boolean;
}> = [
  { status: 'approved', label: 'Approved', timestamp: 'Aug 23, 10:00 AM', isCompleted: true },
  { status: 'payment_confirmed', label: 'Payment Confirmed', timestamp: 'Aug 24, 9:00 AM', isCompleted: true },
  { status: 'loading', label: 'Loading', timestamp: 'Aug 25, 11:30 AM', isCompleted: true },
  { status: 'dispatched', label: 'Dispatched', timestamp: 'Aug 25, 2:00 PM', isCurrent: true },
  { status: 'delivered', label: 'Delivered', isCompleted: false },
];

export function DashboardPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-h1 text-neutral-900">
                {getGreeting()}, {mockUser.firstName}
              </h1>
              <p className="text-body text-neutral-500">
                Here's an overview of your AR Multiventures account and deliveries.
              </p>
            </div>
            <Link to="/app/requisitions/new">
              <Button leftIcon={<PlusCircle className="h-4 w-4" />}>
                New Requisition
              </Button>
            </Link>
          </div>
        </FadeIn>

        {/* Summary Cards */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Account Balance"
              value={formatNaira(dashboardStats.accountBalance)}
              icon={<Wallet className="h-5 w-5" />}
              valueClassName="text-kpi-sm"
            />
            <StatCard
              title="Outstanding Orders"
              value={dashboardStats.outstandingOrders}
              icon={<Package className="h-5 w-5" />}
            />
            <StatCard
              title="Orders in Transit"
              value={dashboardStats.ordersInTransit}
              icon={<Truck className="h-5 w-5" />}
            />
            <StatCard
              title="Pending Payments"
              value={dashboardStats.pendingPayments}
              icon={<Clock className="h-5 w-5" />}
            />
          </div>
        </FadeIn>

        {/* Current Delivery */}
        <FadeIn delay={0.15}>
          <Card padding="lg">
            <CardHeader>
              <CardTitle>Current Delivery</CardTitle>
              <OrderStatusBadge status="dispatched" />
            </CardHeader>

            <div className="grid lg:grid-cols-[1fr_auto] gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-body font-semibold text-neutral-900">
                    {mockRequisitions[0]?.referenceNumber}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 mb-5">
                  <div>
                    <p className="text-caption text-neutral-500 mb-0.5">Material</p>
                    <p className="text-body-sm font-medium text-neutral-900">
                      {mockRequisitions[0]?.materialName}
                    </p>
                  </div>
                  <div>
                    <p className="text-caption text-neutral-500 mb-0.5">Quantity</p>
                    <p className="text-body-sm font-medium text-neutral-900">
                      {mockRequisitions[0]?.quantity} {mockRequisitions[0]?.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-caption text-neutral-500 mb-0.5">Quarry</p>
                    <p className="text-body-sm font-medium text-neutral-900">
                      {mockRequisitions[0]?.quarryName}
                    </p>
                  </div>
                  <div>
                    <p className="text-caption text-neutral-500 mb-0.5">Truck</p>
                    <p className="text-body-sm font-medium text-neutral-900">
                      {mockRequisitions[0]?.truckRegistration}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="hidden sm:block">
                  <OrderStatusTimeline steps={deliveryTimeline} orientation="horizontal" />
                </div>
                <div className="sm:hidden">
                  <OrderStatusTimeline steps={deliveryTimeline} orientation="vertical" />
                </div>
              </div>

              <div className="hidden lg:block w-px bg-neutral-200" />
              <div className="lg:w-48 flex flex-col justify-center">
                <p className="text-caption text-neutral-500 mb-1">Destination</p>
                <p className="text-body-sm font-medium text-neutral-900 mb-3">
                  {mockRequisitions[0]?.destination}
                </p>
                <Link to="/app/orders">
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />} className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </FadeIn>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          {/* Recent Requisitions */}
          <FadeIn delay={0.2}>
            <Card padding="none">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <h3 className="text-h4 text-neutral-900">Recent Requisitions</h3>
                <Link to="/app/requisitions" className="text-body-sm font-medium text-primary-600 hover:text-primary-700">
                  View all
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="text-left px-5 py-2.5 text-caption font-semibold text-neutral-500 uppercase tracking-wider">Reference</th>
                      <th className="text-left px-5 py-2.5 text-caption font-semibold text-neutral-500 uppercase tracking-wider">Material</th>
                      <th className="text-left px-5 py-2.5 text-caption font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Quantity</th>
                      <th className="text-right px-5 py-2.5 text-caption font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Amount</th>
                      <th className="text-right px-5 py-2.5 text-caption font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {mockRequisitions.map((req) => (
                      <tr key={req.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-5 py-3 text-body-sm font-medium text-neutral-900">{req.referenceNumber}</td>
                        <td className="px-5 py-3 text-body-sm text-neutral-600">{req.materialName}</td>
                        <td className="px-5 py-3 text-body-sm text-neutral-600 hidden sm:table-cell">{req.quantity} {req.unit}</td>
                        <td className="px-5 py-3 text-body-sm text-neutral-900 tabular-nums text-right hidden md:table-cell">{formatNaira(req.pricing.total)}</td>
                        <td className="px-5 py-3 text-right">
                          <OrderStatusBadge status={req.status} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </FadeIn>

          {/* Right column: Transactions + Notifications */}
          <div className="space-y-6">
            {/* Recent Transactions */}
            <FadeIn delay={0.25}>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <Link to="/app/payments" className="text-body-sm font-medium text-primary-600 hover:text-primary-700">
                    View all
                  </Link>
                </CardHeader>

                <div className="space-y-3">
                  {mockPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                      <div>
                        <p className="text-body-sm font-medium text-neutral-900">{payment.description}</p>
                        <p className="text-caption text-neutral-500">{formatDate(payment.createdAt)}</p>
                      </div>
                      <p className="text-body-sm font-semibold text-neutral-900 tabular-nums">
                        {formatNaira(payment.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </FadeIn>

            {/* Notifications */}
            <FadeIn delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <Link to="/app/notifications" className="text-body-sm font-medium text-primary-600 hover:text-primary-700">
                    View all
                  </Link>
                </CardHeader>

                <div className="space-y-1">
                  {mockNotifications.slice(0, 3).map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      type={notification.type}
                      title={notification.title}
                      message={notification.message}
                      time={notification.time}
                      isRead={notification.isRead}
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
