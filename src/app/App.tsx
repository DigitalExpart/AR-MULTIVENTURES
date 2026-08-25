import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/public-layout';
import { AppLayout } from '@/components/layout/app-layout';
import { LandingPage } from '@/pages/landing/landing-page';
import { LoginPage } from '@/features/auth/pages/login';
import { RegisterPage } from '@/features/auth/pages/register';
import { ForgotPasswordPage } from '@/features/auth/pages/forgot-password';
import { DashboardPage } from '@/features/dashboard/pages/dashboard';
import { RequisitionsListPage } from '@/features/requisitions/pages/requisitions-list';
import { NewRequisitionPage } from '@/features/requisitions/pages/new-requisition';
import { OrdersListPage } from '@/features/orders/pages/orders-list';
import { DeliveriesListPage } from '@/features/deliveries/pages/deliveries-list';
import { InvoicesListPage } from '@/features/invoices/pages/invoices-list';
import { PaymentsListPage } from '@/features/payments/pages/payments-list';
import { AccountPage } from '@/features/account/pages/account';
import { NotificationsPage } from '@/features/notifications/pages/notifications';

export function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Customer app routes */}
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="requisitions" element={<RequisitionsListPage />} />
        <Route path="requisitions/new" element={<NewRequisitionPage />} />
        <Route path="orders" element={<OrdersListPage />} />
        <Route path="deliveries" element={<DeliveriesListPage />} />
        <Route path="invoices" element={<InvoicesListPage />} />
        <Route path="payments" element={<PaymentsListPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<AccountPage />} />
      </Route>
    </Routes>
  );
}
