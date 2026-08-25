import type {
  User,
  CustomerProfile,
  Requisition,
  NewRequisitionPayload,
  Order,
  Delivery,
  Invoice,
  Payment,
  Quarry,
  Material,
  Truck,
  Notification
} from '@ar-multiventures/types';
import type { LoginFormValues, RegisterFormValues } from '@ar-multiventures/validation';

export interface IAuthRepository {
  login(credentials: LoginFormValues): Promise<{ user: User; token: string }>;
  register(data: RegisterFormValues): Promise<{ user: User; token: string }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

export interface ICustomerRepository {
  getProfile(customerId: string): Promise<CustomerProfile>;
  getNotifications(customerId: string): Promise<Notification[]>;
  markNotificationRead(notificationId: string): Promise<void>;
}

export interface IRequisitionRepository {
  list(customerId?: string): Promise<Requisition[]>;
  getById(id: string): Promise<Requisition | null>;
  create(payload: NewRequisitionPayload): Promise<Requisition>;
  calculatePriceQuote(request: import('@ar-multiventures/types').PriceQuoteRequest): Promise<import('@ar-multiventures/types').PriceQuoteBreakdown>;
}

export interface IOrderRepository {
  list(customerId?: string): Promise<Order[]>;
  getById(id: string): Promise<Order | null>;
}

export interface IDeliveryRepository {
  list(customerId?: string): Promise<Delivery[]>;
  getActiveDelivery(customerId?: string): Promise<Delivery | null>;
  getById(id: string): Promise<Delivery | null>;
}

export interface IInvoiceRepository {
  list(customerId?: string): Promise<Invoice[]>;
  getById(id: string): Promise<Invoice | null>;
}

export interface IPaymentRepository {
  list(customerId?: string): Promise<Payment[]>;
  getById(id: string): Promise<Payment | null>;
}

export interface IResourceRepository {
  getQuarries(): Promise<Quarry[]>;
  getMaterials(): Promise<Material[]>;
  getTrucks(): Promise<Truck[]>;
}

export interface IAdminRepository {
  getDashboardKPIs(): Promise<{
    todayRequisitions: number;
    pendingApproval: number;
    approvedOrders: number;
    totalOrderValue: number;
    totalCustomers: number;
    activeQuarries: number;
    statusBreakdown: Record<string, number>;
  }>;
  getRequisitions(filters?: { search?: string; status?: string; quarryId?: string }): Promise<Requisition[]>;
  getRequisitionById(id: string): Promise<Requisition | null>;
  transitionRequisitionStatus(id: string, status: string, reason?: string): Promise<void>;
  getCustomers(filters?: { search?: string; status?: string }): Promise<any[]>;
  getCustomerById(id: string): Promise<any | null>;
  getQuarries(): Promise<Quarry[]>;
  saveQuarry(quarry: Partial<Quarry>): Promise<Quarry>;
  toggleQuarryStatus(id: string, isActive: boolean): Promise<void>;
  getMaterials(): Promise<Material[]>;
  saveMaterial(material: Partial<Material>): Promise<Material>;
  getDestinations(): Promise<any[]>;
  saveDestination(destination: any): Promise<any>;
  getDestinationRequests(): Promise<import('@ar-multiventures/types').DestinationRequestItem[]>;
  reviewDestinationRequest(id: string, status: 'APPROVED' | 'REJECTED', reason?: string): Promise<void>;
  getMaterialPrices(): Promise<import('@ar-multiventures/types').MaterialPriceRecord[]>;
  saveMaterialPrice(payload: any): Promise<void>;
  getHaulageRates(): Promise<import('@ar-multiventures/types').HaulageRateRecord[]>;
  saveHaulageRate(payload: any): Promise<void>;
  getCustomerPrices(): Promise<import('@ar-multiventures/types').CustomerPriceRecord[]>;
  saveCustomerPrice(payload: any): Promise<void>;
  getPromotions(): Promise<import('@ar-multiventures/types').PromotionalPriceRecord[]>;
  savePromotion(payload: any): Promise<void>;
  getAuditLogs(filters?: { entity?: string; action?: string }): Promise<import('@ar-multiventures/types').AuditLogEntry[]>;
  getUsers(): Promise<import('@ar-multiventures/types').AdminUser[]>;
  updateUserRole(userId: string, roleCode: string): Promise<void>;
  toggleUserStatus(userId: string, isActive: boolean): Promise<void>;
  getRoles(): Promise<any[]>;
}

export interface IFinanceRepository {
  getDashboardKPIs(): Promise<import('@ar-multiventures/types').FinanceDashboardKPIs>;
  getCustomerFinancialSummary(customerId: string): Promise<import('@ar-multiventures/types').CustomerFinancialSummary>;
  getAllCustomerFinancialSummaries(): Promise<import('@ar-multiventures/types').CustomerFinancialSummary[]>;
  getInvoices(filters?: { customerId?: string; status?: string; search?: string }): Promise<import('@ar-multiventures/types').InvoiceRecord[]>;
  getInvoiceById(id: string): Promise<import('@ar-multiventures/types').InvoiceRecord | null>;
  issueInvoiceForRequisition(requisitionId: string, invoiceType?: import('@ar-multiventures/types').InvoiceType): Promise<{ invoiceId: string; invoiceNumber: string }>;
  getPayments(filters?: { customerId?: string; status?: string }): Promise<import('@ar-multiventures/types').PaymentRecord[]>;
  getPaymentById(id: string): Promise<import('@ar-multiventures/types').PaymentRecord | null>;
  submitBankTransfer(payload: { customerId: string; amount: number; bankReference?: string; notes?: string }): Promise<import('@ar-multiventures/types').PaymentRecord>;
  confirmPayment(paymentId: string, bankReference?: string, allocations?: Array<{ invoiceId: string; amount: number }>): Promise<void>;
  evaluateCreditForRequisition(requisitionId: string): Promise<import('@ar-multiventures/types').CreditEvaluationResult>;
  grantManagementCreditOverride(requisitionId: string, reason: string): Promise<void>;
  getCustomerStatement(customerId: string, startDate?: string, endDate?: string): Promise<import('@ar-multiventures/types').CustomerStatement>;
  updateCustomerCreditProfile(customerId: string, payload: { creditLimit: number; creditPeriodDays: number; creditStatus: import('@ar-multiventures/types').CustomerCreditStatus; notes?: string }): Promise<void>;
}


