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
  TripStatus,
  DateRangeFilter,
  ExecutiveDashboardKPIs,
  SalesReportData,
  ReceivablesAgingReportData,
  QuarryReportRow,
  MaterialReportRow,
  DestinationReportRow,
  HaulageReportRow,
  FinanceReportData,
  PaymentReportRow,
  FleetUtilizationRow,
  DriverReportRow,
  LoadingReportRow,
  DeliveryReportRow,
  CancellationReportRow,
  AppNotification,
  NotificationPreference,
  OperationalException
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
  updateStatus(id: string, status: Requisition['status']): Promise<Requisition>;
}

export interface IOrderRepository {
  list(customerId?: string): Promise<Order[]>;
  getById(id: string): Promise<Order | null>;
}

export interface IDeliveryRepository {
  list(customerId?: string): Promise<Delivery[]>;
  getActiveDelivery(customerId?: string): Promise<Delivery | null>;
  getById(id: string): Promise<Delivery | null>;
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
  list(customerId?: string): Promise<Payment[]>;
  getById(id: string): Promise<Payment | null>;
}

export interface IResourceRepository {
  getQuarries(): Promise<Quarry[]>;
  getMaterials(): Promise<Material[]>;
  getDestinations(): Promise<any[]>;
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
  getRequisitions(filters?: { status?: string; quarryId?: string; search?: string }): Promise<Requisition[]>;
  getRequisitionById(id: string): Promise<Requisition | null>;
  getCustomers(filters?: { search?: string; status?: string }): Promise<any[]>;
  getCustomerById(id: string): Promise<any>;
  getQuarries(): Promise<Quarry[]>;
  getQuarryById(id: string): Promise<Quarry | null>;
  saveQuarry(quarry: Partial<Quarry>): Promise<Quarry>;
  getMaterials(): Promise<Material[]>;
  saveMaterial(material: Partial<Material>): Promise<Material>;
  getDestinations(): Promise<any[]>;
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
  getAuditLogs(filters?: { entity?: string; action?: string; userId?: string }): Promise<import('@ar-multiventures/types').AuditLogEntry[]>;
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
  issueInvoiceForRequisition(requisitionId: string, invoiceType?: InvoiceType): Promise<{ invoiceId: string; invoiceNumber: string } | InvoiceRecord>;
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
  issueCreditNote(payload: any): Promise<CreditNoteRecord>;
  getDebitNotes(customerId?: string): Promise<DebitNoteRecord[]>;
  issueDebitNote(payload: any): Promise<DebitNoteRecord>;
  evaluateCreditForRequisition(requisitionId: string): Promise<CreditEvaluationResult>;
  grantManagementCreditOverride(requisitionId: string, reason: string): Promise<void>;
  getCustomerStatement(customerId: string, startDate?: string, endDate?: string): Promise<CustomerStatement>;
  updateCustomerCreditProfile(customerId: string, payload: any): Promise<void>;
}

export interface IReportRepository {
  getExecutiveDashboardKPIs(filter?: DateRangeFilter): Promise<ExecutiveDashboardKPIs>;
  getSalesReport(filter?: DateRangeFilter): Promise<SalesReportData>;
  getReceivablesAgingReport(asOfDate?: string): Promise<ReceivablesAgingReportData>;
  getQuarryReport(filter?: DateRangeFilter): Promise<QuarryReportRow[]>;
  getMaterialReport(filter?: DateRangeFilter): Promise<MaterialReportRow[]>;
  getDestinationReport(filter?: DateRangeFilter): Promise<DestinationReportRow[]>;
  getHaulageReport(filter?: DateRangeFilter): Promise<HaulageReportRow[]>;
  getFinanceReport(filter?: DateRangeFilter): Promise<FinanceReportData>;
  getPaymentsReport(filter?: DateRangeFilter): Promise<PaymentReportRow[]>;
  getFleetUtilizationReport(filter?: DateRangeFilter): Promise<FleetUtilizationRow[]>;
  getDriverReport(filter?: DateRangeFilter): Promise<DriverReportRow[]>;
  getLoadingReport(filter?: DateRangeFilter): Promise<LoadingReportRow[]>;
  getDeliveryReport(filter?: DateRangeFilter): Promise<DeliveryReportRow[]>;
  getCancellationReport(filter?: DateRangeFilter): Promise<CancellationReportRow[]>;
}

export interface INotificationRepository {
  getNotifications(filters?: { userId?: string; customerId?: string; isRead?: boolean }): Promise<AppNotification[]>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(userId?: string): Promise<void>;
  getPreferences(userId: string): Promise<NotificationPreference[]>;
  updatePreference(userId: string, preference: Partial<NotificationPreference>): Promise<void>;
}

export interface IExceptionRepository {
  getExceptions(filters?: { isResolved?: boolean; severity?: string }): Promise<OperationalException[]>;
  resolveException(id: string, notes?: string): Promise<void>;
}
