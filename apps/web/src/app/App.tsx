import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/public-layout';
import { AppLayout } from '@/components/layout/app-layout';
import { AdminLayout } from '@/components/layout/admin-layout';
import { LandingPage } from '@/pages/landing/landing-page';
import { LoginPage } from '@/features/auth/pages/login';
import { RegisterPage } from '@/features/auth/pages/register';
import { ForgotPasswordPage } from '@/features/auth/pages/forgot-password';

// Customer Portal Pages (Eagerly loaded for fast initial customer interaction)
import { DashboardPage } from '@/features/dashboard/pages/dashboard';
import { RequisitionsListPage } from '@/features/requisitions/pages/requisitions-list';
import { NewRequisitionPage } from '@/features/requisitions/pages/new-requisition';
import { OrdersListPage } from '@/features/orders/pages/orders-list';
import { DeliveriesListPage } from '@/features/deliveries/pages/deliveries-list';
import { InvoicesListPage } from '@/features/invoices/pages/invoices-list';
import { PaymentsListPage } from '@/features/payments/pages/payments-list';
import { AccountPage } from '@/features/account/pages/account';
import { NotificationsPage } from '@/features/notifications/pages/notifications';

// Driver Mobile Web Portal Pages
const DriverDashboardPage = lazy(() => import('@/features/driver/pages/driver-dashboard').then(m => ({ default: m.DriverDashboardPage })));
const DriverTripsListPage = lazy(() => import('@/features/driver/pages/driver-trips-list').then(m => ({ default: m.DriverTripsListPage })));
const DriverTripDetailPage = lazy(() => import('@/features/driver/pages/driver-trip-detail').then(m => ({ default: m.DriverTripDetailPage })));

// Quarry Operations Pages
const QuarryQueuePage = lazy(() => import('@/features/quarry/pages/quarry-queue').then(m => ({ default: m.QuarryQueuePage })));

// Admin Operations & Dispatch Pages
const AdminOperationsDashboardPage = lazy(() => import('@/features/admin/operations/dashboard').then(m => ({ default: m.AdminOperationsDashboardPage })));
const AdminOperationsDispatchPage = lazy(() => import('@/features/admin/operations/dispatch').then(m => ({ default: m.AdminOperationsDispatchPage })));

// Admin Fleet Pages
const AdminFleetTrucksPage = lazy(() => import('@/features/admin/fleet/trucks').then(m => ({ default: m.AdminFleetTrucksPage })));
const AdminFleetDriversPage = lazy(() => import('@/features/admin/fleet/drivers').then(m => ({ default: m.AdminFleetDriversPage })));
const AdminFleetMaintenancePage = lazy(() => import('@/features/admin/fleet/maintenance').then(m => ({ default: m.AdminFleetMaintenancePage })));

// Admin Catalog & Customer Pages
const AdminDashboardPage = lazy(() => import('@/features/admin/pages/dashboard').then(m => ({ default: m.AdminDashboardPage })));
const AdminRequisitionsListPage = lazy(() => import('@/features/admin/pages/requisitions-list').then(m => ({ default: m.AdminRequisitionsListPage })));
const AdminRequisitionDetailPage = lazy(() => import('@/features/admin/pages/requisition-detail').then(m => ({ default: m.AdminRequisitionDetailPage })));
const AdminCustomersListPage = lazy(() => import('@/features/admin/pages/customers-list').then(m => ({ default: m.AdminCustomersListPage })));
const AdminCustomerDetailPage = lazy(() => import('@/features/admin/pages/customer-detail').then(m => ({ default: m.AdminCustomerDetailPage })));
const AdminQuarriesListPage = lazy(() => import('@/features/admin/pages/quarries-list').then(m => ({ default: m.AdminQuarriesListPage })));
const AdminNewQuarryPage = lazy(() => import('@/features/admin/pages/new-quarry').then(m => ({ default: m.AdminNewQuarryPage })));
const AdminQuarryDetailPage = lazy(() => import('@/features/admin/pages/quarry-detail').then(m => ({ default: m.AdminQuarryDetailPage })));
const AdminMaterialsListPage = lazy(() => import('@/features/admin/pages/materials-list').then(m => ({ default: m.AdminMaterialsListPage })));
const AdminDestinationsListPage = lazy(() => import('@/features/admin/pages/destinations-list').then(m => ({ default: m.AdminDestinationsListPage })));
const AdminDestinationRequestsPage = lazy(() => import('@/features/admin/pages/destination-requests').then(m => ({ default: m.AdminDestinationRequestsPage })));

// Admin Commercial & Pricing Pages
const AdminPricingCenterPage = lazy(() => import('@/features/admin/pages/pricing-center').then(m => ({ default: m.AdminPricingCenterPage })));
const AdminMaterialPricesPage = lazy(() => import('@/features/admin/pages/material-prices').then(m => ({ default: m.AdminMaterialPricesPage })));
const AdminHaulageRatesPage = lazy(() => import('@/features/admin/pages/haulage-rates').then(m => ({ default: m.AdminHaulageRatesPage })));
const AdminCustomerPricesPage = lazy(() => import('@/features/admin/pages/customer-prices').then(m => ({ default: m.AdminCustomerPricesPage })));
const AdminPromotionsPage = lazy(() => import('@/features/admin/pages/promotions').then(m => ({ default: m.AdminPromotionsPage })));
const AdminDiscountsFuelPage = lazy(() => import('@/features/admin/pages/discounts-fuel').then(m => ({ default: m.AdminDiscountsFuelPage })));

// Admin Finance & Sub-Ledger Pages
const AdminFinanceDashboardPage = lazy(() => import('@/features/admin/finance/dashboard').then(m => ({ default: m.AdminFinanceDashboardPage })));
const AdminFinanceAccountsPage = lazy(() => import('@/features/admin/finance/accounts').then(m => ({ default: m.AdminFinanceAccountsPage })));
const AdminFinanceInvoicesPage = lazy(() => import('@/features/admin/finance/invoices').then(m => ({ default: m.AdminFinanceInvoicesPage })));
const AdminFinancePaymentsPage = lazy(() => import('@/features/admin/finance/payments').then(m => ({ default: m.AdminFinancePaymentsPage })));
const AdminFinanceCreditPage = lazy(() => import('@/features/admin/finance/credit').then(m => ({ default: m.AdminFinanceCreditPage })));
const AdminFinanceStatementsPage = lazy(() => import('@/features/admin/finance/statements').then(m => ({ default: m.AdminFinanceStatementsPage })));

// Admin Exception Center
const AdminExceptionsListPage = lazy(() => import('@/features/admin/exceptions/pages/exceptions-list').then(m => ({ default: m.AdminExceptionsListPage })));

// Admin Reports Catalog & Individual Modules (Lazy Loaded)
const AdminReportsIndexPage = lazy(() => import('@/features/admin/reports/reports-index').then(m => ({ default: m.AdminReportsIndexPage })));
const AdminSalesReportPage = lazy(() => import('@/features/admin/reports/sales-report').then(m => ({ default: m.AdminSalesReportPage })));
const AdminCustomersReportPage = lazy(() => import('@/features/admin/reports/customers-report').then(m => ({ default: m.AdminCustomersReportPage })));
const AdminQuarriesReportPage = lazy(() => import('@/features/admin/reports/quarries-report').then(m => ({ default: m.AdminQuarriesReportPage })));
const AdminMaterialsReportPage = lazy(() => import('@/features/admin/reports/materials-report').then(m => ({ default: m.AdminMaterialsReportPage })));
const AdminDestinationsReportPage = lazy(() => import('@/features/admin/reports/destinations-report').then(m => ({ default: m.AdminDestinationsReportPage })));
const AdminHaulageReportPage = lazy(() => import('@/features/admin/reports/haulage-report').then(m => ({ default: m.AdminHaulageReportPage })));
const AdminFinanceReportPage = lazy(() => import('@/features/admin/reports/finance-report').then(m => ({ default: m.AdminFinanceReportPage })));
const AdminReceivablesAgingReportPage = lazy(() => import('@/features/admin/reports/receivables-aging-report').then(m => ({ default: m.AdminReceivablesAgingReportPage })));
const AdminPaymentsReportPage = lazy(() => import('@/features/admin/reports/payments-report').then(m => ({ default: m.AdminPaymentsReportPage })));
const AdminFleetReportPage = lazy(() => import('@/features/admin/reports/fleet-report').then(m => ({ default: m.AdminFleetReportPage })));
const AdminDriversReportPage = lazy(() => import('@/features/admin/reports/drivers-report').then(m => ({ default: m.AdminDriversReportPage })));
const AdminLoadingReportPage = lazy(() => import('@/features/admin/reports/loading-report').then(m => ({ default: m.AdminLoadingReportPage })));
const AdminDeliveriesReportPage = lazy(() => import('@/features/admin/reports/deliveries-report').then(m => ({ default: m.AdminDeliveriesReportPage })));
const AdminCancellationsReportPage = lazy(() => import('@/features/admin/reports/cancellations-report').then(m => ({ default: m.AdminCancellationsReportPage })));

// Admin Administration Pages
const AdminUsersListPage = lazy(() => import('@/features/admin/pages/users-list').then(m => ({ default: m.AdminUsersListPage })));
const AdminRolesPage = lazy(() => import('@/features/admin/pages/roles').then(m => ({ default: m.AdminRolesPage })));
const AdminAuditTrailPage = lazy(() => import('@/features/admin/pages/audit-trail').then(m => ({ default: m.AdminAuditTrailPage })));
const AdminSettingsPage = lazy(() => import('@/features/admin/pages/settings').then(m => ({ default: m.AdminSettingsPage })));

import { NotFoundPage } from '@/pages/not-found';

function ModuleLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-24 text-caption font-mono text-neutral-400">
      Loading operations module...
    </div>
  );
}

export function App() {
  return (
    <Suspense fallback={<ModuleLoadingFallback />}>
      <Routes>
        {/* Public Landing Route */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Driver Mobile Web Portal Routes */}
        <Route path="/driver" element={<DriverDashboardPage />} />
        <Route path="/driver/trips" element={<DriverTripsListPage />} />
        <Route path="/driver/trips/:id" element={<DriverTripDetailPage />} />

        {/* Quarry Dock Portal Route */}
        <Route path="/operations/quarry" element={<QuarryQueuePage />} />

        {/* Authenticated Customer Portal Shell (/app/*) */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="requisitions" element={<RequisitionsListPage />} />
          <Route path="requisitions/new" element={<NewRequisitionPage />} />
          <Route path="orders" element={<OrdersListPage />} />
          <Route path="deliveries" element={<DeliveriesListPage />} />
          <Route path="deliveries/:id" element={<DeliveriesListPage />} />
          <Route path="invoices" element={<InvoicesListPage />} />
          <Route path="payments" element={<PaymentsListPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<AccountPage />} />
        </Route>

        {/* Authenticated Internal Staff Operations Shell (/admin/*) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          
          {/* Operations & Dispatch Command Center */}
          <Route path="operations" element={<AdminOperationsDashboardPage />} />
          <Route path="operations/dispatch" element={<AdminOperationsDispatchPage />} />
          <Route path="requisitions" element={<AdminRequisitionsListPage />} />
          <Route path="requisitions/:id" element={<AdminRequisitionDetailPage />} />
          <Route path="customers" element={<AdminCustomersListPage />} />
          <Route path="customers/:id" element={<AdminCustomerDetailPage />} />

          {/* Fleet & Driver Management */}
          <Route path="fleet" element={<AdminFleetTrucksPage />} />
          <Route path="fleet/trucks" element={<AdminFleetTrucksPage />} />
          <Route path="fleet/drivers" element={<AdminFleetDriversPage />} />
          <Route path="fleet/maintenance" element={<AdminFleetMaintenancePage />} />

          {/* Catalog */}
          <Route path="quarries" element={<AdminQuarriesListPage />} />
          <Route path="quarries/new" element={<AdminNewQuarryPage />} />
          <Route path="quarries/:id" element={<AdminQuarryDetailPage />} />
          <Route path="materials" element={<AdminMaterialsListPage />} />
          <Route path="materials/:id" element={<AdminMaterialsListPage />} />
          <Route path="destinations" element={<AdminDestinationsListPage />} />
          <Route path="destination-requests" element={<AdminDestinationRequestsPage />} />

          {/* Commercial & Pricing */}
          <Route path="pricing" element={<AdminPricingCenterPage />} />
          <Route path="pricing/materials" element={<AdminMaterialPricesPage />} />
          <Route path="pricing/haulage" element={<AdminHaulageRatesPage />} />
          <Route path="pricing/loading" element={<AdminDiscountsFuelPage />} />
          <Route path="pricing/customers" element={<AdminCustomerPricesPage />} />
          <Route path="pricing/discounts" element={<AdminDiscountsFuelPage />} />
          <Route path="pricing/promotions" element={<AdminPromotionsPage />} />
          <Route path="pricing/fuel" element={<AdminDiscountsFuelPage />} />

          {/* Finance & Sub-Ledger */}
          <Route path="finance" element={<AdminFinanceDashboardPage />} />
          <Route path="finance/accounts" element={<AdminFinanceAccountsPage />} />
          <Route path="finance/invoices" element={<AdminFinanceInvoicesPage />} />
          <Route path="finance/invoices/:id" element={<AdminFinanceInvoicesPage />} />
          <Route path="finance/payments" element={<AdminFinancePaymentsPage />} />
          <Route path="finance/payments/:id" element={<AdminFinancePaymentsPage />} />
          <Route path="finance/credit" element={<AdminFinanceCreditPage />} />
          <Route path="finance/statements" element={<AdminFinanceStatementsPage />} />

          {/* Operational Exceptions Center */}
          <Route path="exceptions" element={<AdminExceptionsListPage />} />

          {/* Management Reports Center & Modules */}
          <Route path="reports" element={<AdminReportsIndexPage />} />
          <Route path="reports/sales" element={<AdminSalesReportPage />} />
          <Route path="reports/customers" element={<AdminCustomersReportPage />} />
          <Route path="reports/quarries" element={<AdminQuarriesReportPage />} />
          <Route path="reports/materials" element={<AdminMaterialsReportPage />} />
          <Route path="reports/destinations" element={<AdminDestinationsReportPage />} />
          <Route path="reports/haulage" element={<AdminHaulageReportPage />} />
          <Route path="reports/finance" element={<AdminFinanceReportPage />} />
          <Route path="reports/receivables" element={<AdminReceivablesAgingReportPage />} />
          <Route path="reports/payments" element={<AdminPaymentsReportPage />} />
          <Route path="reports/fleet" element={<AdminFleetReportPage />} />
          <Route path="reports/drivers" element={<AdminDriversReportPage />} />
          <Route path="reports/loading" element={<AdminLoadingReportPage />} />
          <Route path="reports/deliveries" element={<AdminDeliveriesReportPage />} />
          <Route path="reports/cancellations" element={<AdminCancellationsReportPage />} />

          {/* Administration */}
          <Route path="users" element={<AdminUsersListPage />} />
          <Route path="roles" element={<AdminRolesPage />} />
          <Route path="audit" element={<AdminAuditTrailPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
