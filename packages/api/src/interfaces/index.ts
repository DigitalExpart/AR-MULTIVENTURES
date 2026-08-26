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
  Notification,
  PaymentRecord,
  InvoiceRecord,
  ReceiptRecord,
  CreditNoteRecord,
  DebitNoteRecord,
  CompanyBankAccount,
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyResponse,
  BankTransferSubmissionPayload,
  CustomerFinancialSummary,
  CustomerStatement,
  CreditEvaluationResult,
  FinanceDashboardKPIs,
  InvoiceType,
  CustomerCreditStatus,
  TruckRecord,
  DriverRecord,
  TruckMaintenanceRecord,
  TruckDocument,
  DriverDocument,
  FleetKPIs,
  DeliveryTripRecord,
  TripWeighbridgeRecord,
  TripProofOfDelivery,
  OrderFulfillmentSummary,
  TripAssignmentPayload,
  WeighbridgeCapturePayload,
  PodSubmissionPayload,
  OperationsDashboardKPIs,
  TripStatus
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
  // Legacy compatibility
  list(customerId?: string): Promise<Delivery[]>;
  getActiveDelivery(customerId?: string): Promise<Delivery | null>;
  getById(id: string): Promise<Delivery | null>;

  // Phase 7 Multi-Trip & Logistics APIs
  getTrips(filters?: { customerId?: string; requisitionId?: string; status?: TripStatus; driverId?: string; quarryId?: string }): Promise<DeliveryTripRecord[]>;
  getTripById(id: string): Promise<DeliveryTripRecord | null>;
  scheduleRequisitionTrips(requisitionId: string, tripCapacities?: number[]): Promise<{ requisitionId: string; totalTrips: number; trips: DeliveryTripRecord[] }>;
  assignTrip(payload: TripAssignmentPayload): Promise<DeliveryTripRecord>;
  recordQuarryCheckin(tripId: string): Promise<DeliveryTripRecord>;
  recordWeighbridgeAndLoading(payload: WeighbridgeCapturePayload): Promise<DeliveryTripRecord>;
  dispatchTrip(tripId: string): Promise<DeliveryTripRecord>;
  recordTripPod(payload: PodSubmissionPayload): Promise<DeliveryTripRecord>;
  getOrderFulfillmentSummary(requisitionId: string): Promise<OrderFulfillmentSummary>;
  getCustomerFulfillments(customerId?: string): Promise<OrderFulfillmentSummary[]>;
  getDriverTrips(driverId?: string): Promise<DeliveryTripRecord[]>;
  getQuarryQueue(quarryId?: string): Promise<{ scheduled: DeliveryTripRecord[]; atQuarry: DeliveryTripRecord[]; loading: DeliveryTripRecord[]; loaded: DeliveryTripRecord[] }>;
  getOperationsKPIs(): Promise<OperationsDashboardKPIs>;
}

export interface IFleetRepository {
  getTrucks(filters?: { isActive?: boolean; maintenanceStatus?: string; search?: string }): Promise<TruckRecord[]>;
  getTruckById(id: string): Promise<TruckRecord | null>;
  saveTruck(truck: Partial<TruckRecord>): Promise<TruckRecord>;
  getTruckMaintenanceRecords(truckId?: string): Promise<TruckMaintenanceRecord[]>;
  saveMaintenanceRecord(record: Partial<TruckMaintenanceRecord>): Promise<TruckMaintenanceRecord>;
  getDrivers(filters?: { isActive?: boolean; availabilityStatus?: string; search?: string }): Promise<DriverRecord[]>;
  getDriverById(id: string): Promise<DriverRecord | null>;
  saveDriver(driver: Partial<DriverRecord>): Promise<DriverRecord>;
  getFleetKPIs(): Promise<FleetKPIs>;
}

export interface IInvoiceRepository {
  list(customerId?: string): Promise<Invoice[]>;
  getById(id: string): Promise<Invoice | null>;
}

export interface IPaymentRepository {
  list(customerId?: string): Promise<PaymentRecord[]>;
  getById(id: string): Promise<PaymentRecord | null>;
  initializeOnlinePayment(payload: PaymentInitRequest): Promise<PaymentInitResponse>;
  verifyOnlinePayment(reference: string): Promise<PaymentVerifyResponse>;
  submitBankTransfer(payload: BankTransferSubmissionPayload): Promise<PaymentRecord>;
  getReceiptByPaymentId(paymentId: string): Promise<ReceiptRecord | null>;
  getCompanyBankAccounts(): Promise<CompanyBankAccount[]>;
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
  getDashboardKPIs(): Promise<FinanceDashboardKPIs>;
  getCustomerFinancialSummary(customerId: string): Promise<CustomerFinancialSummary>;
  getAllCustomerFinancialSummaries(): Promise<CustomerFinancialSummary[]>;
  getInvoices(filters?: { customerId?: string; status?: string; search?: string }): Promise<InvoiceRecord[]>;
  getInvoiceById(id: string): Promise<InvoiceRecord | null>;
  issueInvoiceForRequisition(requisitionId: string, invoiceType?: InvoiceType): Promise<{ invoiceId: string; invoiceNumber: string }>;
  getPayments(filters?: { customerId?: string; status?: string; method?: string }): Promise<PaymentRecord[]>;
  getPaymentById(id: string): Promise<PaymentRecord | null>;
  initializeOnlinePayment(payload: PaymentInitRequest): Promise<PaymentInitResponse>;
  verifyOnlinePayment(reference: string): Promise<PaymentVerifyResponse>;
  submitBankTransfer(payload: BankTransferSubmissionPayload): Promise<PaymentRecord>;
  confirmPayment(paymentId: string, bankReference?: string, allocations?: Array<{ invoiceId: string; amount: number }>): Promise<void>;
  rejectBankTransfer(paymentId: string, reason: string): Promise<void>;
  getCompanyBankAccounts(): Promise<CompanyBankAccount[]>;
  getReceipts(customerId?: string): Promise<ReceiptRecord[]>;
  getReceiptById(id: string): Promise<ReceiptRecord | null>;
  getReceiptByPaymentId(paymentId: string): Promise<ReceiptRecord | null>;
  getCreditNotes(customerId?: string): Promise<CreditNoteRecord[]>;
  issueCreditNote(payload: { customerId: string; invoiceId?: string; reason: string; items: Array<{ description: string; quantity: number; unit?: string; unitPrice: number; lineTotal?: number }> }): Promise<CreditNoteRecord>;
  getDebitNotes(customerId?: string): Promise<DebitNoteRecord[]>;
  issueDebitNote(payload: { customerId: string; invoiceId?: string; reason: string; items: Array<{ description: string; quantity: number; unit?: string; unitPrice: number; lineTotal?: number }> }): Promise<DebitNoteRecord>;
  evaluateCreditForRequisition(requisitionId: string): Promise<CreditEvaluationResult>;
  grantManagementCreditOverride(requisitionId: string, reason: string): Promise<void>;
  getCustomerStatement(customerId: string, startDate?: string, endDate?: string): Promise<CustomerStatement>;
  updateCustomerCreditProfile(customerId: string, payload: { creditLimit: number; creditPeriodDays: number; creditStatus: CustomerCreditStatus; notes?: string }): Promise<void>;
}
