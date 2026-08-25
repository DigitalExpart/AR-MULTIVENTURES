import type { IFinanceRepository } from '../interfaces';
import type {
  FinanceDashboardKPIs,
  CustomerFinancialSummary,
  InvoiceRecord,
  InvoiceItem,
  PaymentRecord,
  CustomerStatement,
  CreditEvaluationResult,
  InvoiceType,
  CustomerCreditStatus,
} from '@ar-multiventures/types';

export class MockFinanceRepository implements IFinanceRepository {
  private customerSummaries: CustomerFinancialSummary[] = [
    {
      customerId: 'cus-buildcorp',
      accountNumber: 'CUS-000001',
      companyName: 'BuildCorp Nigeria Limited',
      totalDebit: 15500000,
      totalCredit: 12300000,
      outstandingReceivable: 3200000,
      creditStatus: 'ACTIVE_CREDIT',
      creditLimit: 15000000,
      creditPeriodDays: 14,
      availableCredit: 11800000,
      creditUtilizationPercent: 21.3,
      overdueAmount: 0,
      overdueInvoicesCount: 0,
      currency: 'NGN',
    },
    {
      customerId: 'cus-juliusb',
      accountNumber: 'CUS-000002',
      companyName: 'Julius Berger Civil Works',
      totalDebit: 48000000,
      totalCredit: 43500000,
      outstandingReceivable: 4500000,
      creditStatus: 'ACTIVE_CREDIT',
      creditLimit: 50000000,
      creditPeriodDays: 30,
      availableCredit: 45500000,
      creditUtilizationPercent: 9.0,
      overdueAmount: 0,
      overdueInvoicesCount: 0,
      currency: 'NGN',
    },
    {
      customerId: 'cus-hitech',
      accountNumber: 'CUS-000003',
      companyName: 'Hi-Tech Construction Ltd',
      totalDebit: 8500000,
      totalCredit: 8500000,
      outstandingReceivable: 0,
      creditStatus: 'NO_CREDIT',
      creditLimit: 0,
      creditPeriodDays: 0,
      availableCredit: 0,
      creditUtilizationPercent: 0,
      overdueAmount: 0,
      overdueInvoicesCount: 0,
      currency: 'NGN',
    },
  ];

  private invoices: InvoiceRecord[] = [
    {
      id: 'inv-01',
      customerId: 'cus-buildcorp',
      customerName: 'BuildCorp Nigeria Limited',
      requisitionId: 'req-01',
      requisitionNumber: 'REQ-2026-000142',
      invoiceNumber: 'INV-2026-000041',
      invoiceType: 'TAX_INVOICE',
      issueDate: '2026-08-20',
      dueDate: '2026-09-03',
      currency: 'NGN',
      subtotal: 1020000,
      discountAmount: 0,
      loadingAmount: 60000,
      haulageAmount: 255000,
      fuelAdjustmentAmount: 6375,
      taxAmount: 0,
      totalAmount: 1341375,
      amountPaid: 1341375,
      outstandingAmount: 0,
      status: 'PAID',
      items: [
        {
          id: 'item-01',
          invoiceId: 'inv-01',
          description: '3/4" Granite Aggregate (30 Tonnes)',
          quantity: 30,
          unit: 'tonnes',
          unitPrice: 8500,
          lineTotal: 1020000,
        },
      ],
      createdAt: '2026-08-20T10:00:00Z',
    },
    {
      id: 'inv-02',
      customerId: 'cus-buildcorp',
      customerName: 'BuildCorp Nigeria Limited',
      requisitionId: 'req-02',
      requisitionNumber: 'REQ-2026-000143',
      invoiceNumber: 'INV-2026-000042',
      invoiceType: 'TAX_INVOICE',
      issueDate: '2026-08-22',
      dueDate: '2026-09-05',
      currency: 'NGN',
      subtotal: 2400000,
      discountAmount: 72000,
      loadingAmount: 150000,
      haulageAmount: 680000,
      fuelAdjustmentAmount: 17000,
      taxAmount: 0,
      totalAmount: 3175000,
      amountPaid: 0,
      outstandingAmount: 3175000,
      status: 'ISSUED',
      items: [
        {
          id: 'item-02',
          invoiceId: 'inv-02',
          description: '20mm Granite Aggregate (60 Tonnes)',
          quantity: 60,
          unit: 'tonnes',
          unitPrice: 8000,
          lineTotal: 2400000,
        },
      ],
      createdAt: '2026-08-22T14:30:00Z',
    },
  ];

  private payments: PaymentRecord[] = [
    {
      id: 'pay-01',
      customerId: 'cus-buildcorp',
      customerName: 'BuildCorp Nigeria Limited',
      paymentReference: 'PAY-2026-000015',
      paymentMethod: 'BANK_TRANSFER',
      amount: 1341375,
      allocatedAmount: 1341375,
      unallocatedAmount: 0,
      currency: 'NGN',
      paymentDate: '2026-08-21',
      status: 'CONFIRMED',
      bankReference: 'GTB-TRF-889922',
      confirmedBy: 'Accounts Officer',
      confirmedAt: '2026-08-21T11:00:00Z',
      createdAt: '2026-08-21T10:30:00Z',
    },
    {
      id: 'pay-02',
      customerId: 'cus-buildcorp',
      customerName: 'BuildCorp Nigeria Limited',
      paymentReference: 'PAY-2026-000016',
      paymentMethod: 'BANK_TRANSFER',
      amount: 2000000,
      allocatedAmount: 0,
      unallocatedAmount: 2000000,
      currency: 'NGN',
      paymentDate: '2026-08-25',
      status: 'PENDING',
      bankReference: 'ZENITH-DEP-112233',
      notes: 'Direct deposit for August batch supplies',
      createdAt: '2026-08-25T16:00:00Z',
    },
  ];

  async getDashboardKPIs(): Promise<FinanceDashboardKPIs> {
    await new Promise((r) => setTimeout(r, 100));
    const totalReceivables = this.customerSummaries.reduce((sum, c) => sum + c.outstandingReceivable, 0);
    const paymentsReceived = this.payments
      .filter((p) => p.status === 'CONFIRMED')
      .reduce((sum, p) => sum + p.amount, 0);
    const outstandingInvoicesCount = this.invoices.filter((i) => i.status === 'ISSUED' || i.status === 'PARTIALLY_PAID').length;
    const totalCreditExposure = totalReceivables;
    const totalCreditLimit = this.customerSummaries.reduce((sum, c) => sum + c.creditLimit, 0);

    return {
      totalReceivables,
      paymentsReceived,
      outstandingInvoicesCount,
      overdueReceivables: 0,
      totalCreditExposure,
      totalCreditLimit,
    };
  }

  async getCustomerFinancialSummary(customerId: string): Promise<CustomerFinancialSummary> {
    await new Promise((r) => setTimeout(r, 100));
    const found = this.customerSummaries.find((c) => c.customerId === customerId);
    if (found) return found;
    return {
      customerId,
      accountNumber: 'CUS-000001',
      companyName: 'Client Account',
      totalDebit: 0,
      totalCredit: 0,
      outstandingReceivable: 0,
      creditStatus: 'NO_CREDIT',
      creditLimit: 0,
      creditPeriodDays: 0,
      availableCredit: 0,
      creditUtilizationPercent: 0,
      overdueAmount: 0,
      overdueInvoicesCount: 0,
      currency: 'NGN',
    };
  }

  async getAllCustomerFinancialSummaries(): Promise<CustomerFinancialSummary[]> {
    await new Promise((r) => setTimeout(r, 100));
    return this.customerSummaries;
  }

  async getInvoices(filters?: { customerId?: string; status?: string; search?: string }): Promise<InvoiceRecord[]> {
    await new Promise((r) => setTimeout(r, 150));
    let list = [...this.invoices];
    if (filters?.customerId) {
      list = list.filter((i) => i.customerId === filters.customerId);
    }
    if (filters?.status && filters.status !== 'all') {
      list = list.filter((i) => i.status.toLowerCase() === filters.status?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q) ||
          i.requisitionNumber?.toLowerCase().includes(q)
      );
    }
    return list;
  }

  async getInvoiceById(id: string): Promise<InvoiceRecord | null> {
    await new Promise((r) => setTimeout(r, 100));
    return this.invoices.find((i) => i.id === id || i.invoiceNumber === id) || null;
  }

  async issueInvoiceForRequisition(requisitionId: string, invoiceType: InvoiceType = 'INVOICE'): Promise<{ invoiceId: string; invoiceNumber: string }> {
    await new Promise((r) => setTimeout(r, 200));
    const invNum = `INV-2026-0000${this.invoices.length + 10}`;
    const newInv: InvoiceRecord = {
      id: `inv-${Date.now()}`,
      customerId: 'cus-buildcorp',
      customerName: 'BuildCorp Nigeria Limited',
      requisitionId,
      requisitionNumber: 'REQ-2026-000142',
      invoiceNumber: invNum,
      invoiceType,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      currency: 'NGN',
      subtotal: 1020000,
      discountAmount: 0,
      loadingAmount: 60000,
      haulageAmount: 255000,
      fuelAdjustmentAmount: 6375,
      taxAmount: 0,
      totalAmount: 1341375,
      amountPaid: 0,
      outstandingAmount: 1341375,
      status: 'ISSUED',
      items: [
        {
          id: `item-${Date.now()}`,
          invoiceId: `inv-${Date.now()}`,
          description: '3/4" Granite Aggregate',
          quantity: 30,
          unit: 'tonnes',
          unitPrice: 8500,
          lineTotal: 1020000,
        },
      ],
      createdAt: new Date().toISOString(),
    };
    this.invoices.unshift(newInv);
    return { invoiceId: newInv.id, invoiceNumber: invNum };
  }

  async getPayments(filters?: { customerId?: string; status?: string }): Promise<PaymentRecord[]> {
    await new Promise((r) => setTimeout(r, 100));
    let list = [...this.payments];
    if (filters?.customerId) {
      list = list.filter((p) => p.customerId === filters.customerId);
    }
    if (filters?.status && filters.status !== 'all') {
      list = list.filter((p) => p.status.toLowerCase() === filters.status?.toLowerCase());
    }
    return list;
  }

  async getPaymentById(id: string): Promise<PaymentRecord | null> {
    await new Promise((r) => setTimeout(r, 100));
    return this.payments.find((p) => p.id === id || p.paymentReference === id) || null;
  }

  async submitBankTransfer(payload: { customerId: string; amount: number; bankReference?: string; notes?: string }): Promise<PaymentRecord> {
    await new Promise((r) => setTimeout(r, 200));
    const newPay: PaymentRecord = {
      id: `pay-${Date.now()}`,
      customerId: payload.customerId,
      customerName: 'BuildCorp Nigeria Limited',
      paymentReference: `PAY-2026-0000${this.payments.length + 20}`,
      paymentMethod: 'BANK_TRANSFER',
      amount: payload.amount,
      allocatedAmount: 0,
      unallocatedAmount: payload.amount,
      currency: 'NGN',
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      bankReference: payload.bankReference,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
    };
    this.payments.unshift(newPay);
    return newPay;
  }

  async confirmPayment(paymentId: string, bankReference?: string, allocations?: Array<{ invoiceId: string; amount: number }>): Promise<void> {
    await new Promise((r) => setTimeout(r, 250));
    const pay = this.payments.find((p) => p.id === paymentId);
    if (!pay) throw new Error('Payment record not found');
    pay.status = 'CONFIRMED';
    pay.confirmedBy = 'Accounts Officer';
    pay.confirmedAt = new Date().toISOString();
    if (bankReference) pay.bankReference = bankReference;

    if (allocations && allocations.length > 0) {
      let totalAlloc = 0;
      for (const alloc of allocations) {
        const inv = this.invoices.find((i) => i.id === alloc.invoiceId);
        if (inv) {
          inv.amountPaid += alloc.amount;
          inv.outstandingAmount = Math.max(0, inv.totalAmount - inv.amountPaid);
          inv.status = inv.outstandingAmount === 0 ? 'PAID' : 'PARTIALLY_PAID';
          totalAlloc += alloc.amount;
        }
      }
      pay.allocatedAmount = totalAlloc;
      pay.unallocatedAmount = pay.amount - totalAlloc;
    }
  }

  async evaluateCreditForRequisition(requisitionId: string): Promise<CreditEvaluationResult> {
    await new Promise((r) => setTimeout(r, 100));
    return {
      decision: 'APPROVED',
      creditLimit: 15000000,
      currentExposure: 3200000,
      requisitionValue: 1341375,
      projectedExposure: 4541375,
      availableCredit: 10458625,
      reason: 'WITHIN_APPROVED_CREDIT_FACILITY',
    };
  }

  async grantManagementCreditOverride(requisitionId: string, reason: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
  }

  async getCustomerStatement(customerId: string, startDate?: string, endDate?: string): Promise<CustomerStatement> {
    await new Promise((r) => setTimeout(r, 150));
    const sDate = startDate || '2026-08-01';
    const eDate = endDate || '2026-08-25';

    const txns = [
      {
        id: 'txn-01',
        customerId,
        transactionDate: '2026-08-01',
        postingDate: '2026-08-01T00:00:00Z',
        transactionType: 'OPENING_BALANCE_DR' as const,
        referenceType: 'MANUAL',
        documentNumber: 'OPB-2026-01',
        description: 'Opening Ledger Balance for August 2026',
        debit: 5000000,
        credit: 0,
        runningBalance: 5000000,
        currency: 'NGN',
      },
      {
        id: 'txn-02',
        customerId,
        transactionDate: '2026-08-10',
        postingDate: '2026-08-10T11:00:00Z',
        transactionType: 'PAYMENT' as const,
        referenceType: 'PAYMENT',
        documentNumber: 'PAY-2026-000010',
        description: 'Bank Transfer Payment (Zenith Direct)',
        debit: 0,
        credit: 5000000,
        runningBalance: 0,
        currency: 'NGN',
      },
      {
        id: 'txn-03',
        customerId,
        transactionDate: '2026-08-20',
        postingDate: '2026-08-20T10:00:00Z',
        transactionType: 'INVOICE' as const,
        referenceType: 'INVOICE',
        documentNumber: 'INV-2026-000041',
        description: 'Tax Invoice Supply #REQ-2026-000142',
        debit: 1341375,
        credit: 0,
        runningBalance: 1341375,
        currency: 'NGN',
      },
      {
        id: 'txn-04',
        customerId,
        transactionDate: '2026-08-21',
        postingDate: '2026-08-21T11:00:00Z',
        transactionType: 'PAYMENT' as const,
        referenceType: 'PAYMENT',
        documentNumber: 'PAY-2026-000015',
        description: 'Bank Transfer Payment #PAY-2026-000015',
        debit: 0,
        credit: 1341375,
        runningBalance: 0,
        currency: 'NGN',
      },
      {
        id: 'txn-05',
        customerId,
        transactionDate: '2026-08-22',
        postingDate: '2026-08-22T14:30:00Z',
        transactionType: 'INVOICE' as const,
        referenceType: 'INVOICE',
        documentNumber: 'INV-2026-000042',
        description: 'Tax Invoice Supply #REQ-2026-000143',
        debit: 3175000,
        credit: 0,
        runningBalance: 3175000,
        currency: 'NGN',
      },
    ];

    return {
      customerId,
      customerName: 'BuildCorp Nigeria Limited',
      accountNumber: 'CUS-000001',
      startDate: sDate,
      endDate: eDate,
      openingBalance: 0,
      totalDebit: 9516375,
      totalCredit: 6341375,
      closingBalance: 3175000,
      transactions: txns,
    };
  }

  async updateCustomerCreditProfile(customerId: string, payload: { creditLimit: number; creditPeriodDays: number; creditStatus: CustomerCreditStatus; notes?: string }): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
    const cus = this.customerSummaries.find((c) => c.customerId === customerId);
    if (cus) {
      cus.creditLimit = payload.creditLimit;
      cus.creditPeriodDays = payload.creditPeriodDays;
      cus.creditStatus = payload.creditStatus;
      cus.availableCredit = Math.max(0, payload.creditLimit - cus.outstandingReceivable);
    }
  }
}
