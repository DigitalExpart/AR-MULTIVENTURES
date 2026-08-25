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
  customerId: string;
  customerName: string;
  paymentReference: string;
  paymentMethod: PaymentMethod;
  amount: number;
  allocatedAmount: number;
  unallocatedAmount: number;
  currency: string;
  paymentDate: string;
  status: PaymentRecordStatus;
  bankReference?: string;
  externalReference?: string;
  notes?: string;
  confirmedBy?: string;
  confirmedAt?: string;
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
}
