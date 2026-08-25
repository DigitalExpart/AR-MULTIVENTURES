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
} from '@ar-multiventures/types';
import { supabase } from './supabase-client';
import { MockFinanceRepository } from '../mock/finance-repository';

export class SupabaseFinanceRepository implements IFinanceRepository {
  private fallbackMock = new MockFinanceRepository();

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

  async getPayments(filters?: { customerId?: string; status?: string }): Promise<PaymentRecord[]> {
    return this.fallbackMock.getPayments(filters);
  }

  async getPaymentById(id: string): Promise<PaymentRecord | null> {
    return this.fallbackMock.getPaymentById(id);
  }

  async submitBankTransfer(payload: { customerId: string; amount: number; bankReference?: string; notes?: string }): Promise<PaymentRecord> {
    return this.fallbackMock.submitBankTransfer(payload);
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
