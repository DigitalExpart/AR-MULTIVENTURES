import {
  MockAuthRepository,
  MockCustomerRepository,
  MockRequisitionRepository,
  MockOrderRepository,
  MockDeliveryRepository,
  MockInvoiceRepository,
  MockPaymentRepository,
  MockResourceRepository,
} from './mock/repositories';
import { MockAdminRepository } from './mock/admin-repository';
import { MockFinanceRepository } from './mock/finance-repository';

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

import type {
  IAuthRepository,
  ICustomerRepository,
  IRequisitionRepository,
  IOrderRepository,
  IDeliveryRepository,
  IInvoiceRepository,
  IPaymentRepository,
  IResourceRepository,
  IAdminRepository,
  IFinanceRepository,
} from './interfaces';

export * from './interfaces';
export * from './mock/mock-db';
export * from './mock/admin-repository';
export * from './mock/finance-repository';
export * from './supabase';

// Determine active data provider (Explicit 'supabase' | 'mock')
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
export const mockInvoiceApi = new MockInvoiceRepository();
export const mockPaymentApi = new MockPaymentRepository();
export const mockResourceApi = new MockResourceRepository();
export const mockAdminApi = new MockAdminRepository();
export const mockFinanceApi = new MockFinanceRepository();

// Supabase Singletons
export const supabaseAuthApi = new SupabaseAuthRepository();
export const supabaseCustomerApi = new SupabaseCustomerRepository();
export const supabaseRequisitionApi = new SupabaseRequisitionRepository();
export const supabaseResourceApi = new SupabaseResourceRepository();
export const supabaseAdminApi = new SupabaseAdminRepository();
export const supabaseFinanceApi = new SupabaseFinanceRepository();

// Active Exported Repositories (Auto-bound based on configured data provider)
export const authApi: IAuthRepository = useSupabase ? supabaseAuthApi : mockAuthApi;
export const customerApi: ICustomerRepository = useSupabase ? supabaseCustomerApi : mockCustomerApi;
export const requisitionApi: IRequisitionRepository = useSupabase ? supabaseRequisitionApi : mockRequisitionApi;
export const orderApi: IOrderRepository = mockOrderApi;
export const deliveryApi: IDeliveryRepository = mockDeliveryApi;
export const invoiceApi: IInvoiceRepository = mockInvoiceApi;
export const paymentApi: IPaymentRepository = mockPaymentApi;
export const resourceApi: IResourceRepository = useSupabase ? supabaseResourceApi : mockResourceApi;
export const adminApi: IAdminRepository = useSupabase ? supabaseAdminApi : mockAdminApi;
export const financeApi: IFinanceRepository = useSupabase ? supabaseFinanceApi : mockFinanceApi;

export { isSupabaseConfigured, useSupabase, dataProviderMode };
