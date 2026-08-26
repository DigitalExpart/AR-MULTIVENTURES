import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/public-layout';
import { AppLayout } from '@/components/layout/app-layout';
import { AdminLayout } from '@/components/layout/admin-layout';
import { LandingPage } from '@/pages/landing/landing-page';
import { LoginPage } from '@/features/auth/pages/login';
import { RegisterPage } from '@/features/auth/pages/register';
import { ForgotPasswordPage } from '@/features/auth/pages/forgot-password';

// Customer Portal Pages
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
import { DriverDashboardPage } from '@/features/driver/pages/driver-dashboard';
import { DriverTripsListPage } from '@/features/driver/pages/driver-trips-list';
import { DriverTripDetailPage } from '@/features/driver/pages/driver-trip-detail';

// Quarry Operations Pages
import { QuarryQueuePage } from '@/features/quarry/pages/quarry-queue';

// Admin Operations & Dispatch Pages
import { AdminOperationsDashboardPage } from '@/features/admin/operations/dashboard';
import { AdminOperationsDispatchPage } from '@/features/admin/operations/dispatch';

// Admin Fleet Pages
import { AdminFleetTrucksPage } from '@/features/admin/fleet/trucks';
import { AdminFleetDriversPage } from '@/features/admin/fleet/drivers';
import { AdminFleetMaintenancePage } from '@/features/admin/fleet/maintenance';

// Admin Catalog & Customer Pages
import { AdminDashboardPage } from '@/features/admin/pages/dashboard';
import { AdminRequisitionsListPage } from '@/features/admin/pages/requisitions-list';
import { AdminRequisitionDetailPage } from '@/features/admin/pages/requisition-detail';
import { AdminCustomersListPage } from '@/features/admin/pages/customers-list';
import { AdminCustomerDetailPage } from '@/features/admin/pages/customer-detail';
import { AdminQuarriesListPage } from '@/features/admin/pages/quarries-list';
import { AdminNewQuarryPage } from '@/features/admin/pages/new-quarry';
import { AdminQuarryDetailPage } from '@/features/admin/pages/quarry-detail';
import { AdminMaterialsListPage } from '@/features/admin/pages/materials-list';
import { AdminDestinationsListPage } from '@/features/admin/pages/destinations-list';
import { AdminDestinationRequestsPage } from '@/features/admin/pages/destination-requests';

// Admin Commercial & Pricing Pages
import { AdminPricingCenterPage } from '@/features/admin/pages/pricing-center';
import { AdminMaterialPricesPage } from '@/features/admin/pages/material-prices';
import { AdminHaulageRatesPage } from '@/features/admin/pages/haulage-rates';
import { AdminCustomerPricesPage } from '@/features/admin/pages/customer-prices';
import { AdminPromotionsPage } from '@/features/admin/pages/promotions';
import { AdminDiscountsFuelPage } from '@/features/admin/pages/discounts-fuel';

// Admin Finance & Sub-Ledger Pages
import { AdminFinanceDashboardPage } from '@/features/admin/finance/dashboard';
import { AdminFinanceAccountsPage } from '@/features/admin/finance/accounts';
import { AdminFinanceInvoicesPage } from '@/features/admin/finance/invoices';
import { AdminFinancePaymentsPage } from '@/features/admin/finance/payments';
import { AdminFinanceCreditPage } from '@/features/admin/finance/credit';
import { AdminFinanceStatementsPage } from '@/features/admin/finance/statements';

// Admin Exception Center
import { AdminExceptionsListPage } from '@/features/admin/exceptions/pages/exceptions-list';

// Admin Reports Catalog & Individual Modules
import { AdminReportsIndexPage } from '@/features/admin/reports/reports-index';
import { AdminSalesReportPage } from '@/features/admin/reports/sales-report';
import { AdminCustomersReportPage } from '@/features/admin/reports/customers-report';
import { AdminQuarriesReportPage } from '@/features/admin/reports/quarries-report';
import { AdminMaterialsReportPage } from '@/features/admin/reports/materials-report';
import { AdminDestinationsReportPage } from '@/features/admin/reports/destinations-report';
import { AdminHaulageReportPage } from '@/features/admin/reports/haulage-report';
import { AdminFinanceReportPage } from '@/features/admin/reports/finance-report';
import { AdminReceivablesAgingReportPage } from '@/features/admin/reports/receivables-aging-report';
import { AdminPaymentsReportPage } from '@/features/admin/reports/payments-report';
import { AdminFleetReportPage } from '@/features/admin/reports/fleet-report';
import { AdminDriversReportPage } from '@/features/admin/reports/drivers-report';
import { AdminLoadingReportPage } from '@/features/admin/reports/loading-report';
import { AdminDeliveriesReportPage } from '@/features/admin/reports/deliveries-report';
import { AdminCancellationsReportPage } from '@/features/admin/reports/cancellations-report';

// Admin Administration Pages
import { AdminUsersListPage } from '@/features/admin/pages/users-list';
import { AdminRolesPage } from '@/features/admin/pages/roles';
import { AdminAuditTrailPage } from '@/features/admin/pages/audit-trail';
import { AdminSettingsPage } from '@/features/admin/pages/settings';

import { NotFoundPage } from '@/pages/not-found';

export function App() {
  return (
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
  );
}
