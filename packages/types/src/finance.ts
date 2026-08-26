export type InvoiceType = 'PROFORMA' | 'INVOICE' | 'TAX_INVOICE';
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'VOID' | 'CANCELLED';

export type FinancialTransactionType =
  | 'OPENING_BALANCE_DR'
  | 'OPENING_BALANCE_CR'
  | 'INVOICE'
  | 'DEBIT_NOTE'
  | 'PAYMENT'
  | 'CREDIT_NOTE'
  | 'ADJUSTMENT';

export type PaymentMethod =
  | 'BANK_TRANSFER'
  | 'PAYSTACK'
  | 'FLUTTERWAVE'
  | 'CASH'
  | 'ACCOUNT_CREDIT'
  | 'OTHER';

export type PaymentRecordStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REVERSED' | 'REFUNDED';
export type CustomerCreditStatus = 'NO_CREDIT' | 'ACTIVE_CREDIT' | 'SUSPENDED_CREDIT' | 'OVERDUE_LOCKED';
export type FinancialClearanceStatus = 'PENDING' | 'PAYMENT_CLEARED' | 'CREDIT_APPROVED' | 'MANAGEMENT_OVERRIDE' | 'BLOCKED';

export type PaymentGatewayProvider = 'PAYSTACK' | 'FLUTTERWAVE' | 'MANUAL_BANK_TRANSFER';
export type PaymentEnvironment = 'TEST' | 'LIVE';

export interface CompanyBankAccount {
  id: string;
  organizationId?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  currency: string;
  isActive: boolean;
  displayOrder: number;
}

export interface ReceiptRecord {
  id: string;
  organizationId?: string;
  receiptNumber: string;
  customerId: string;
  customerName?: string;
  paymentId: string;
  paymentReference?: string;
  paymentMethod?: PaymentMethod;
  amount: number;
  currency: string;
  issuedAt: string;
  createdBy?: string;
  invoiceNumber?: string;
  allocatedAmount?: number;
}

export interface CreditNoteItem {
  id?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

export interface CreditNoteRecord {
  id: string;
  organizationId?: string;
  customerId: string;
  customerName?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  creditNoteNumber: string;
  reason: string;
  amount: number;
  currency: string;
  issueDate: string;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  items?: CreditNoteItem[];
  createdAt: string;
}

export interface DebitNoteItem {
  id?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

export interface DebitNoteRecord {
  id: string;
  organizationId?: string;
  customerId: string;
  customerName?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  debitNoteNumber: string;
  reason: string;
  amount: number;
  currency: string;
  issueDate: string;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  items?: DebitNoteItem[];
  createdAt: string;
}

export interface PaymentAttemptRecord {
  id: string;
  paymentId?: string;
  customerId: string;
  invoiceId: string;
  provider: PaymentGatewayProvider;
  providerReference: string;
  internalReference: string;
  accessCode?: string;
  authorizationUrl?: string;
  amount: number;
  amountKobo: number;
  currency: string;
  environment: PaymentEnvironment;
  status: PaymentRecordStatus;
  failureReason?: string;
  expiresAt: string;
  initializedAt: string;
  verifiedAt?: string;
}

export interface PaymentInitRequest {
  invoiceId: string;
  provider?: PaymentGatewayProvider;
  callbackUrl?: string;
}

export interface PaymentInitResponse {
  success: boolean;
  reference: string;
  providerReference: string;
  amount: number;
  amountKobo: number;
  currency: string;
  authorizationUrl: string;
  accessCode: string;
  reused?: boolean;
}

export interface PaymentVerifyResponse {
  success: boolean;
  paymentId: string;
  paymentReference: string;
  amount: number;
  allocatedAmount: number;
  receiptNumber?: string;
  receiptId?: string;
  issuedAt?: string;
  error?: string;
}

export interface BankTransferSubmissionPayload {
  customerId: string;
  invoiceId?: string;
  amount: number;
  paymentDate?: string;
  bankName: string;
  bankReference: string;
  proofFile?: File | string;
  proofStoragePath?: string;
  notes?: string;
}

export interface CustomerFinancialSummary {
  customerId: string;
  accountNumber: string;
  companyName: string;
  totalDebit: number;
  totalCredit: number;
  outstandingReceivable: number;
  creditStatus: CustomerCreditStatus;
  creditLimit: number;
  creditPeriodDays: number;
  availableCredit: number;
  creditUtilizationPercent: number;
  overdueAmount: number;
  overdueInvoicesCount: number;
  currency: string;
}

export interface AccountTransaction {
  id: string;
  customerId: string;
  transactionDate: string;
  postingDate: string;
  transactionType: FinancialTransactionType;
  referenceType: string;
  referenceId?: string;
  documentNumber: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance?: number;
  currency: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  materialId?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

export interface InvoiceRecord {
  id: string;
  organizationId?: string;
  customerId: string;
  customerName: string;
  requisitionId?: string;
  requisitionNumber?: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  issueDate: string;
  dueDate: string;
  currency: string;
  subtotal: number;
  discountAmount: number;
  loadingAmount: number;
  haulageAmount: number;
  fuelAdjustmentAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  notes?: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  organizationId?: string;
  customerId: string;
  customerName: string;
  paymentReference: string;
  paymentMethod: PaymentMethod;
  provider?: PaymentGatewayProvider;
  environment?: PaymentEnvironment;
  amount: number;
  allocatedAmount: number;
  unallocatedAmount: number;
  currency: string;
  paymentDate: string;
  status: PaymentRecordStatus;
  bankReference?: string;
  externalReference?: string;
  proofStoragePath?: string;
  rejectionReason?: string;
  notes?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  receiptNumber?: string;
  invoiceNumber?: string;
  createdAt: string;
}

export interface PaymentAllocation {
  id: string;
  paymentId: string;
  invoiceId: string;
  invoiceNumber: string;
  allocatedAmount: number;
  createdAt: string;
}

export interface CreditEvaluationResult {
  decision: 'APPROVED' | 'BLOCKED' | 'MANAGEMENT_REVIEW' | 'MANAGEMENT_OVERRIDE';
  creditLimit: number;
  currentExposure: number;
  requisitionValue: number;
  projectedExposure: number;
  availableCredit: number;
  overdueInvoicesCount?: number;
  reason: string;
  authorizedBy?: string;
}

export interface CustomerStatement {
  customerId: string;
  customerName: string;
  accountNumber: string;
  startDate: string;
  endDate: string;
  openingBalance: number;
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  transactions: AccountTransaction[];
}

export interface FinanceDashboardKPIs {
  totalReceivables: number;
  paymentsReceived: number;
  outstandingInvoicesCount: number;
  overdueReceivables: number;
  totalCreditExposure: number;
  totalCreditLimit: number;
  confirmedPaymentsToday?: number;
  pendingBankTransfers?: number;
  unallocatedPayments?: number;
  paymentFailures?: number;
}
