import {
  MockAuthRepository,
  MockCustomerRepository,
  MockRequisitionRepository,
  MockOrderRepository,
  MockInvoiceRepository,
  MockPaymentRepository,
  MockResourceRepository,
} from './mock/repositories';
import { MockAdminRepository } from './mock/admin-repository';
import { MockFinanceRepository } from './mock/finance-repository';
import { MockFleetRepository } from './mock/fleet-repository';
import { MockDeliveryRepository } from './mock/delivery-repository';
import { MockReportRepository } from './mock/report-repository';
import { MockNotificationRepository } from './mock/notification-repository';
import { MockExceptionRepository } from './mock/exception-repository';

import {
  SupabaseAuthRepository,
  SupabaseCustomerRepository,
  SupabaseRequisitionRepository,
  SupabaseResourceRepository,
  SupabaseAdminRepository,
  SupabaseFinanceRepository,
  isSupabaseConfigured,
  supabase,
} from './supabase';
import { SupabaseFleetRepository } from './supabase/supabase-fleet.repository';
import { SupabaseDeliveryRepository } from './supabase/supabase-delivery.repository';
import { SupabaseReportRepository } from './supabase/supabase-report.repository';
import { SupabaseNotificationRepository } from './supabase/supabase-notification.repository';

import type {
  IAuthRepository,
  ICustomerRepository,
  IRequisitionRepository,
  IOrderRepository,
  IDeliveryRepository,
  IFleetRepository,
  IInvoiceRepository,
  IPaymentRepository,
  IResourceRepository,
  IAdminRepository,
  IFinanceRepository,
  IReportRepository,
  INotificationRepository,
  IExceptionRepository,
} from './interfaces';

export * from './interfaces';
export * from './mock/mock-db';
export * from './mock/admin-repository';
export * from './mock/finance-repository';
export * from './mock/fleet-repository';
export * from './mock/delivery-repository';
export * from './mock/report-repository';
export * from './mock/notification-repository';
export * from './mock/exception-repository';
export * from './supabase';

// Determine active data provider (Explicit 'supabase' | 'mock')
// NOTE: Production never silently falls back to mock data when Supabase mode fails.
const dataProviderMode =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DATA_PROVIDER) ||
  (typeof process !== 'undefined' && process.env?.VITE_DATA_PROVIDER) ||
  (isSupabaseConfigured ? 'supabase' : 'mock');

const useSupabase = dataProviderMode === 'supabase' && isSupabaseConfigured;

// Mock Singletons
export const mockAuthApi = new MockAuthRepository();
export const mockCustomerApi = new MockCustomerRepository();
export const mockRequisitionApi = new MockRequisitionRepository();
export const mockOrderApi = new MockOrderRepository();
export const mockDeliveryApi = new MockDeliveryRepository();
export const mockFleetApi = new MockFleetRepository();
export const mockInvoiceApi = new MockInvoiceRepository();
export const mockPaymentApi = new MockPaymentRepository();
export const mockResourceApi = new MockResourceRepository();
export const mockAdminApi = new MockAdminRepository();
export const mockFinanceApi = new MockFinanceRepository();
export const mockReportApi = new MockReportRepository();
export const mockNotificationApi = new MockNotificationRepository();
export const mockExceptionApi = new MockExceptionRepository();

// Supabase Singletons
export const supabaseAuthApi = new SupabaseAuthRepository();
export const supabaseCustomerApi = new SupabaseCustomerRepository();
export const supabaseRequisitionApi = new SupabaseRequisitionRepository();
export const supabaseResourceApi = new SupabaseResourceRepository();
export const supabaseAdminApi = new SupabaseAdminRepository();
export const supabaseFinanceApi = new SupabaseFinanceRepository();
export const supabaseFleetApi = new SupabaseFleetRepository();
export const supabaseDeliveryApi = new SupabaseDeliveryRepository();
export const supabaseReportApi = new SupabaseReportRepository();
export const supabaseNotificationApi = new SupabaseNotificationRepository();

// Active Exported Repositories (Auto-bound strictly based on configured data provider)
export const authApi: IAuthRepository = useSupabase ? supabaseAuthApi : mockAuthApi;
export const customerApi: ICustomerRepository = useSupabase ? supabaseCustomerApi : mockCustomerApi;
export const requisitionApi: IRequisitionRepository = useSupabase ? supabaseRequisitionApi : mockRequisitionApi;
export const orderApi: IOrderRepository = mockOrderApi;
export const deliveryApi: IDeliveryRepository = useSupabase ? supabaseDeliveryApi : mockDeliveryApi;
export const fleetApi: IFleetRepository = useSupabase ? supabaseFleetApi : mockFleetApi;
export const invoiceApi: IInvoiceRepository = mockInvoiceApi;
export const paymentApi: IPaymentRepository = mockPaymentApi;
export const resourceApi: IResourceRepository = useSupabase ? supabaseResourceApi : mockResourceApi;
export const adminApi: IAdminRepository = useSupabase ? supabaseAdminApi : mockAdminApi;
export const financeApi: IFinanceRepository = useSupabase ? supabaseFinanceApi : mockFinanceApi;
export const reportApi: IReportRepository = useSupabase ? supabaseReportApi : mockReportApi;
export const notificationApi: INotificationRepository = useSupabase ? supabaseNotificationApi : mockNotificationApi;
export const exceptionApi: IExceptionRepository = mockExceptionApi;

export { isSupabaseConfigured, useSupabase, dataProviderMode };
