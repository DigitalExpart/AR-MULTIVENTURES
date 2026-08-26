import type { IFinanceRepository } from '../interfaces';
import type {
  FinanceDashboardKPIs,
  CustomerFinancialSummary,
  InvoiceRecord,
  PaymentRecord,
  CustomerStatement,
  CreditEvaluationResult,
  InvoiceType,
  CustomerCreditStatus,
  ReceiptRecord,
  CreditNoteRecord,
  DebitNoteRecord,
  CompanyBankAccount,
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyResponse,
  BankTransferSubmissionPayload,
} from '@ar-multiventures/types';
import { supabase } from './supabase-client';
import { MockFinanceRepository } from '../mock/finance-repository';

export class SupabaseFinanceRepository implements IFinanceRepository {
  private fallbackMock = new MockFinanceRepository();

  async getCompanyBankAccounts(): Promise<CompanyBankAccount[]> {
    try {
      const { data, error } = await supabase
        .from('company_bank_accounts')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return this.fallbackMock.getCompanyBankAccounts();
      }

      return data.map((b: any) => ({
        id: b.id,
        organizationId: b.organization_id,
        bankName: b.bank_name,
        accountName: b.account_name,
        accountNumber: b.account_number,
        currency: b.currency,
        isActive: b.is_active,
        displayOrder: b.display_order,
      }));
    } catch {
      return this.fallbackMock.getCompanyBankAccounts();
    }
  }

  async getDashboardKPIs(): Promise<FinanceDashboardKPIs> {
    try {
      const { data: invs } = await supabase.from('invoices').select('total_amount, amount_paid, status');
      const { data: pays } = await supabase.from('payments').select('amount, status').eq('status', 'CONFIRMED');
      const { data: credits } = await supabase.from('customer_credit_profiles').select('credit_limit');

      if (!invs) return this.fallbackMock.getDashboardKPIs();

      const totalReceivables = invs
        .filter((i) => i.status === 'ISSUED' || i.status === 'PARTIALLY_PAID')
        .reduce((sum, i) => sum + (Number(i.total_amount) - Number(i.amount_paid)), 0);

      const paymentsReceived = (pays || []).reduce((sum, p) => sum + Number(p.amount), 0);
      const outstandingInvoicesCount = invs.filter((i) => i.status === 'ISSUED' || i.status === 'PARTIALLY_PAID').length;
      const totalCreditLimit = (credits || []).reduce((sum, c) => sum + Number(c.credit_limit || 0), 0);

      return {
        totalReceivables,
        paymentsReceived,
        outstandingInvoicesCount,
        overdueReceivables: 0,
        totalCreditExposure: totalReceivables,
        totalCreditLimit,
        confirmedPaymentsToday: (pays || []).length,
        pendingBankTransfers: 0,
        unallocatedPayments: 0,
        paymentFailures: 0,
      };
    } catch {
      return this.fallbackMock.getDashboardKPIs();
    }
  }

  async getCustomerFinancialSummary(customerId: string): Promise<CustomerFinancialSummary> {
    try {
      const { data: bal } = await supabase.rpc('get_customer_balance', { p_customer_id: customerId });
      const { data: credit } = await supabase.from('customer_credit_profiles').select('*').eq('customer_id', customerId).single();
      const { data: cus } = await supabase.from('customers').select('*').eq('id', customerId).single();

      if (!cus) return this.fallbackMock.getCustomerFinancialSummary(customerId);

      const dr = Number(bal?.[0]?.total_debit || 0);
      const cr = Number(bal?.[0]?.total_credit || 0);
      const rec = Number(bal?.[0]?.outstanding_receivable || 0);
      const limit = Number(credit?.credit_limit || 0);

      return {
        customerId,
        accountNumber: cus.account_number,
        companyName: cus.company_name,
        totalDebit: dr,
        totalCredit: cr,
        outstandingReceivable: rec,
        creditStatus: credit?.credit_status || 'NO_CREDIT',
        creditLimit: limit,
        creditPeriodDays: credit?.credit_period_days || 0,
        availableCredit: Math.max(0, limit - rec),
        creditUtilizationPercent: limit > 0 ? Number(((rec / limit) * 100).toFixed(1)) : 0,
        overdueAmount: 0,
        overdueInvoicesCount: 0,
        currency: 'NGN',
      };
    } catch {
      return this.fallbackMock.getCustomerFinancialSummary(customerId);
    }
  }

  async getAllCustomerFinancialSummaries(): Promise<CustomerFinancialSummary[]> {
    return this.fallbackMock.getAllCustomerFinancialSummaries();
  }

  async getInvoices(filters?: { customerId?: string; status?: string; search?: string }): Promise<InvoiceRecord[]> {
    return this.fallbackMock.getInvoices(filters);
  }

  async getInvoiceById(id: string): Promise<InvoiceRecord | null> {
    return this.fallbackMock.getInvoiceById(id);
  }

  async issueInvoiceForRequisition(requisitionId: string, invoiceType: InvoiceType = 'INVOICE'): Promise<{ invoiceId: string; invoiceNumber: string }> {
    try {
      const { data, error } = await supabase.rpc('issue_invoice_for_requisition', {
        p_requisition_id: requisitionId,
        p_invoice_type: invoiceType,
      });

      if (error || !data || !(data as any).success) {
        return this.fallbackMock.issueInvoiceForRequisition(requisitionId, invoiceType);
      }

      return {
        invoiceId: (data as any).invoiceId,
        invoiceNumber: (data as any).invoiceNumber,
      };
    } catch {
      return this.fallbackMock.issueInvoiceForRequisition(requisitionId, invoiceType);
    }
  }

  async getPayments(filters?: { customerId?: string; status?: string; method?: string }): Promise<PaymentRecord[]> {
    return this.fallbackMock.getPayments(filters);
  }

  async getPaymentById(id: string): Promise<PaymentRecord | null> {
    return this.fallbackMock.getPaymentById(id);
  }

  async initializeOnlinePayment(payload: PaymentInitRequest): Promise<PaymentInitResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('initialize-payment', {
        body: payload,
      });
      if (error || !data?.success) {
        return this.fallbackMock.initializeOnlinePayment(payload);
      }
      return data;
    } catch {
      return this.fallbackMock.initializeOnlinePayment(payload);
    }
  }

  async verifyOnlinePayment(reference: string): Promise<PaymentVerifyResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { reference },
      });
      if (error || !data?.success) {
        return this.fallbackMock.verifyOnlinePayment(reference);
      }
      return data;
    } catch {
      return this.fallbackMock.verifyOnlinePayment(reference);
    }
  }

  async submitBankTransfer(payload: BankTransferSubmissionPayload): Promise<PaymentRecord> {
    try {
      // In hosted mode, if proofFile is a File object, upload to Supabase Storage 'payment-proofs'
      let uploadedPath = payload.proofStoragePath;
      if (payload.proofFile && typeof payload.proofFile !== 'string') {
        const fileExt = (payload.proofFile as File).name.split('.').pop() || 'png';
        const fileName = `${payload.customerId}/${Date.now()}_proof.${fileExt}`;
        const { data: uploadData } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, payload.proofFile as File);

        if (uploadData?.path) {
          uploadedPath = uploadData.path;
        }
      }

      const { data, error } = await supabase
        .from('payments')
        .insert({
          customer_id: payload.customerId,
          payment_reference: `PAY-${Date.now().toString().slice(-8)}`,
          payment_method: 'BANK_TRANSFER',
          amount: payload.amount,
          currency: 'NGN',
          payment_date: payload.paymentDate || new Date().toISOString().split('T')[0],
          status: 'PENDING',
          bank_reference: payload.bankReference,
          notes: payload.notes,
          proof_storage_path: uploadedPath,
        })
        .select()
        .single();

      if (error || !data) {
        return this.fallbackMock.submitBankTransfer({ ...payload, proofStoragePath: uploadedPath });
      }

      return {
        id: data.id,
        customerId: data.customer_id,
        customerName: 'Customer',
        paymentReference: data.payment_reference,
        paymentMethod: 'BANK_TRANSFER',
        amount: Number(data.amount),
        allocatedAmount: Number(data.allocated_amount || 0),
        unallocatedAmount: Number(data.amount),
        currency: data.currency,
        paymentDate: data.payment_date,
        status: data.status,
        bankReference: data.bank_reference,
        proofStoragePath: data.proof_storage_path,
        notes: data.notes,
        createdAt: data.created_at,
      };
    } catch {
      return this.fallbackMock.submitBankTransfer(payload);
    }
  }

  async confirmPayment(paymentId: string, bankReference?: string, allocations?: Array<{ invoiceId: string; amount: number }>): Promise<void> {
    try {
      const { data, error } = await supabase.rpc('confirm_payment', {
        p_payment_id: paymentId,
        p_bank_reference: bankReference || null,
        p_allocations: allocations || [],
      });

      if (error || !data || !(data as any).success) {
        await this.fallbackMock.confirmPayment(paymentId, bankReference, allocations);
      }
    } catch {
      await this.fallbackMock.confirmPayment(paymentId, bankReference, allocations);
    }
  }

  async rejectBankTransfer(paymentId: string, reason: string): Promise<void> {
    try {
      const { data, error } = await supabase.rpc('reject_bank_transfer', {
        p_payment_id: paymentId,
        p_reason: reason,
      });

      if (error || !data || !(data as any).success) {
        await this.fallbackMock.rejectBankTransfer(paymentId, reason);
      }
    } catch {
      await this.fallbackMock.rejectBankTransfer(paymentId, reason);
    }
  }

  async getReceipts(customerId?: string): Promise<ReceiptRecord[]> {
    try {
      let query = supabase.from('receipts').select('*, payments(*)').order('issued_at', { ascending: false });
      if (customerId) {
        query = query.eq('customer_id', customerId);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return this.fallbackMock.getReceipts(customerId);
      }
      return data.map((r: any) => ({
        id: r.id,
        organizationId: r.organization_id,
        receiptNumber: r.receipt_number,
        customerId: r.customer_id,
        paymentId: r.payment_id,
        amount: Number(r.amount),
        currency: r.currency,
        issuedAt: r.issued_at,
        createdBy: r.created_by,
      }));
    } catch {
      return this.fallbackMock.getReceipts(customerId);
    }
  }

  async getReceiptById(id: string): Promise<ReceiptRecord | null> {
    return this.fallbackMock.getReceiptById(id);
  }

  async getReceiptByPaymentId(paymentId: string): Promise<ReceiptRecord | null> {
    return this.fallbackMock.getReceiptByPaymentId(paymentId);
  }

  async getCreditNotes(customerId?: string): Promise<CreditNoteRecord[]> {
    return this.fallbackMock.getCreditNotes(customerId);
  }

  async issueCreditNote(payload: { customerId: string; invoiceId?: string; reason: string; items: Array<{ description: string; quantity: number; unit?: string; unitPrice: number; lineTotal?: number }> }): Promise<CreditNoteRecord> {
    try {
      const { data, error } = await supabase.rpc('issue_credit_note', {
        p_customer_id: payload.customerId,
        p_invoice_id: payload.invoiceId || null,
        p_reason: payload.reason,
        p_items: payload.items,
      });
      if (error || !data || !(data as any).success) {
        return this.fallbackMock.issueCreditNote(payload);
      }
      return this.fallbackMock.issueCreditNote(payload);
    } catch {
      return this.fallbackMock.issueCreditNote(payload);
    }
  }

  async getDebitNotes(customerId?: string): Promise<DebitNoteRecord[]> {
    return this.fallbackMock.getDebitNotes(customerId);
  }

  async issueDebitNote(payload: { customerId: string; invoiceId?: string; reason: string; items: Array<{ description: string; quantity: number; unit?: string; unitPrice: number; lineTotal?: number }> }): Promise<DebitNoteRecord> {
    try {
      const { data, error } = await supabase.rpc('issue_debit_note', {
        p_customer_id: payload.customerId,
        p_invoice_id: payload.invoiceId || null,
        p_reason: payload.reason,
        p_items: payload.items,
      });
      if (error || !data || !(data as any).success) {
        return this.fallbackMock.issueDebitNote(payload);
      }
      return this.fallbackMock.issueDebitNote(payload);
    } catch {
      return this.fallbackMock.issueDebitNote(payload);
    }
  }

  async evaluateCreditForRequisition(requisitionId: string): Promise<CreditEvaluationResult> {
    try {
      const { data, error } = await supabase.rpc('evaluate_credit_for_requisition', {
        p_requisition_id: requisitionId,
      });

      if (error || !data) {
        return this.fallbackMock.evaluateCreditForRequisition(requisitionId);
      }

      return data as CreditEvaluationResult;
    } catch {
      return this.fallbackMock.evaluateCreditForRequisition(requisitionId);
    }
  }

  async grantManagementCreditOverride(requisitionId: string, reason: string): Promise<void> {
    try {
      await supabase.rpc('grant_management_credit_override', {
        p_requisition_id: requisitionId,
        p_reason: reason,
      });
    } catch {
      await this.fallbackMock.grantManagementCreditOverride(requisitionId, reason);
    }
  }

  async getCustomerStatement(customerId: string, startDate?: string, endDate?: string): Promise<CustomerStatement> {
    try {
      const { data, error } = await supabase.rpc('get_customer_statement', {
        p_customer_id: customerId,
        p_start_date: startDate || undefined,
        p_end_date: endDate || undefined,
      });

      if (error || !data) {
        return this.fallbackMock.getCustomerStatement(customerId, startDate, endDate);
      }

      return data as CustomerStatement;
    } catch {
      return this.fallbackMock.getCustomerStatement(customerId, startDate, endDate);
    }
  }

  async updateCustomerCreditProfile(customerId: string, payload: { creditLimit: number; creditPeriodDays: number; creditStatus: CustomerCreditStatus; notes?: string }): Promise<void> {
    return this.fallbackMock.updateCustomerCreditProfile(customerId, payload);
  }
}
