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

export class SupabaseFinanceRepository implements IFinanceRepository {
  async getCompanyBankAccounts(): Promise<CompanyBankAccount[]> {
    const { data, error } = await supabase
      .from('company_bank_accounts')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw new Error(`Failed to load company bank accounts: ${error.message}`);

    return (data || []).map((b: any) => ({
      id: b.id,
      organizationId: b.organization_id,
      bankName: b.bank_name,
      accountName: b.account_name,
      accountNumber: b.account_number,
      currency: b.currency,
      isActive: b.is_active,
      displayOrder: b.display_order,
    }));
  }

  async getDashboardKPIs(): Promise<FinanceDashboardKPIs> {
    const [invsRes, paysRes, creditsRes] = await Promise.all([
      supabase.from('invoices').select('total_amount, amount_paid, status'),
      supabase.from('payments').select('amount, status').eq('status', 'CONFIRMED'),
      supabase.from('customer_credit_profiles').select('credit_limit'),
    ]);

    if (invsRes.error) throw new Error(`Failed to fetch invoices for KPIs: ${invsRes.error.message}`);
    if (paysRes.error) throw new Error(`Failed to fetch payments for KPIs: ${paysRes.error.message}`);

    const invs = invsRes.data || [];
    const pays = paysRes.data || [];
    const credits = creditsRes.data || [];

    const totalInvoiced = invs.reduce((sum: number, i: any) => sum + Number(i.total_amount || 0), 0);
    const totalCollected = pays.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
    const outstandingReceivables = invs.reduce(
      (sum: number, i: any) => sum + (Number(i.total_amount || 0) - Number(i.amount_paid || 0)),
      0
    );
    const creditExposure = credits.reduce((sum: number, c: any) => sum + Number(c.credit_limit || 0), 0);

    return {
      totalInvoiced,
      totalCollected,
      outstandingReceivables,
      overdueReceivables: 0,
      creditExposure,
      unallocatedCash: 0,
      pendingTransfersCount: 0,
      recentTransactionsCount: invs.length + pays.length,
    };
  }

  async getCustomerFinancialSummary(customerId: string): Promise<CustomerFinancialSummary> {
    const { data: cus, error: cusErr } = await supabase
      .from('customers')
      .select('id, name, reference_number')
      .eq('id', customerId)
      .single();

    if (cusErr) throw new Error(`Failed to fetch customer summary: ${cusErr.message}`);

    const { data: credit } = await supabase
      .from('customer_credit_profiles')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    const { data: invs } = await supabase
      .from('invoices')
      .select('total_amount, amount_paid')
      .eq('customer_id', customerId);

    const totalInvoiced = (invs || []).reduce((sum: number, i: any) => sum + Number(i.total_amount || 0), 0);
    const outstanding = (invs || []).reduce(
      (sum: number, i: any) => sum + (Number(i.total_amount || 0) - Number(i.amount_paid || 0)),
      0
    );

    return {
      customerId: cus.id,
      customerName: cus.name,
      customerReference: cus.reference_number,
      accountBalance: -outstanding,
      totalInvoiced,
      totalPaid: totalInvoiced - outstanding,
      outstandingInvoicesCount: (invs || []).filter((i: any) => Number(i.total_amount) > Number(i.amount_paid)).length,
      creditLimit: Number(credit?.credit_limit || 0),
      availableCredit: Number(credit?.available_credit || 0),
      creditStatus: (credit?.credit_status as CustomerCreditStatus) || 'NO_CREDIT',
      creditOverdueDays: credit?.overdue_days || 0,
      overdueAmount: 0,
    };
  }

  async getAllCustomerFinancialSummaries(): Promise<CustomerFinancialSummary[]> {
    const { data: customers, error } = await supabase.from('customers').select('id');
    if (error) throw new Error(`Failed to fetch customers: ${error.message}`);
    return Promise.all((customers || []).map((c: any) => this.getCustomerFinancialSummary(c.id)));
  }

  async getInvoices(filters?: { customerId?: string; status?: string; requisitionId?: string }): Promise<InvoiceRecord[]> {
    let query = supabase.from('invoices').select('*').order('created_at', { ascending: false });
    if (filters?.customerId) query = query.eq('customer_id', filters.customerId);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.requisitionId) query = query.eq('requisition_id', filters.requisitionId);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch invoices: ${error.message}`);

    return (data || []).map((i: any) => ({
      id: i.id,
      organizationId: i.organization_id,
      invoiceNumber: i.invoice_number,
      requisitionId: i.requisition_id,
      requisitionReference: i.requisition_reference,
      customerId: i.customer_id,
      customerName: i.customer_name,
      customerReference: i.customer_reference,
      invoiceType: i.invoice_type,
      materialTotal: Number(i.material_total || 0),
      haulageTotal: Number(i.haulage_total || 0),
      subtotal: Number(i.subtotal || 0),
      vatAmount: Number(i.vat_amount || 0),
      totalAmount: Number(i.total_amount || 0),
      amountPaid: Number(i.amount_paid || 0),
      status: i.status,
      paymentTerms: i.payment_terms,
      issueDate: i.issue_date,
      dueDate: i.due_date,
      items: i.items || [],
      createdAt: i.created_at,
      updatedAt: i.updated_at,
    }));
  }

  async getInvoiceById(id: string): Promise<InvoiceRecord | null> {
    const { data, error } = await supabase.from('invoices').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch invoice ${id}: ${error.message}`);
    }
    if (!data) return null;
    return {
      id: data.id,
      organizationId: data.organization_id,
      invoiceNumber: data.invoice_number,
      requisitionId: data.requisition_id,
      customerId: data.customer_id,
      customerName: data.customer_name,
      customerReference: data.customer_reference,
      invoiceType: data.invoice_type,
      materialTotal: Number(data.material_total || 0),
      haulageTotal: Number(data.haulage_total || 0),
      subtotal: Number(data.subtotal || 0),
      vatAmount: Number(data.vat_amount || 0),
      totalAmount: Number(data.total_amount || 0),
      amountPaid: Number(data.amount_paid || 0),
      status: data.status,
      paymentTerms: data.payment_terms,
      issueDate: data.issue_date,
      dueDate: data.due_date,
      items: data.items || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async issueInvoiceForRequisition(requisitionId: string, invoiceType: InvoiceType = 'PROFORMA'): Promise<InvoiceRecord> {
    const { data, error } = await supabase.rpc('issue_invoice_for_requisition', {
      p_requisition_id: requisitionId,
      p_invoice_type: invoiceType,
    });
    if (error) throw new Error(`Failed to issue invoice in Supabase: ${error.message}`);
    const invoice = await this.getInvoiceById(data);
    if (!invoice) throw new Error('Invoice was created but could not be retrieved');
    return invoice;
  }

  async getPayments(filters?: { customerId?: string; status?: string }): Promise<PaymentRecord[]> {
    let query = supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (filters?.customerId) query = query.eq('customer_id', filters.customerId);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch payments: ${error.message}`);

    return (data || []).map((p: any) => ({
      id: p.id,
      organizationId: p.organization_id,
      paymentNumber: p.payment_number,
      customerId: p.customer_id,
      customerName: p.customer_name,
      customerReference: p.customer_reference,
      amount: Number(p.amount || 0),
      allocatedAmount: Number(p.allocated_amount || 0),
      unallocatedAmount: Number(p.unallocated_amount || 0),
      paymentMethod: p.payment_method,
      paymentChannel: p.payment_channel,
      status: p.status,
      bankReference: p.bank_reference,
      gatewayReference: p.gateway_reference,
      proofStoragePath: p.proof_storage_path,
      allocations: p.allocations || [],
      confirmedAt: p.confirmed_at,
      createdAt: p.created_at,
    }));
  }

  async getPaymentById(id: string): Promise<PaymentRecord | null> {
    const { data, error } = await supabase.from('payments').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch payment ${id}: ${error.message}`);
    }
    if (!data) return null;
    return {
      id: data.id,
      organizationId: data.organization_id,
      paymentNumber: data.payment_number,
      customerId: data.customer_id,
      customerName: data.customer_name,
      amount: Number(data.amount || 0),
      allocatedAmount: Number(data.allocated_amount || 0),
      unallocatedAmount: Number(data.unallocated_amount || 0),
      paymentMethod: data.payment_method,
      paymentChannel: data.payment_channel,
      status: data.status,
      bankReference: data.bank_reference,
      gatewayReference: data.gateway_reference,
      proofStoragePath: data.proof_storage_path,
      allocations: data.allocations || [],
      confirmedAt: data.confirmed_at,
      createdAt: data.created_at,
    };
  }

  async initializeOnlinePayment(payload: PaymentInitRequest): Promise<PaymentInitResponse> {
    const { data, error } = await supabase.functions.invoke('initialize-payment', {
      body: payload,
    });
    if (error) throw new Error(`Payment initialization failed: ${error.message}`);
    return data as PaymentInitResponse;
  }

  async verifyOnlinePayment(reference: string): Promise<PaymentVerifyResponse> {
    const { data, error } = await supabase.functions.invoke('verify-payment', {
      body: { reference },
    });
    if (error) throw new Error(`Payment verification failed: ${error.message}`);
    return data as PaymentVerifyResponse;
  }

  async submitBankTransfer(payload: BankTransferSubmissionPayload): Promise<PaymentRecord> {
    let uploadedPath = payload.proofStoragePath;
    if (payload.proofOfPaymentFile && typeof payload.proofOfPaymentFile !== 'string') {
      const file = payload.proofOfPaymentFile as File;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `transfers/${fileName}`;
      const { error: uploadErr } = await supabase.storage.from('payment-proofs').upload(filePath, file);
      if (uploadErr) throw new Error(`Failed to upload payment receipt: ${uploadErr.message}`);
      uploadedPath = filePath;
    }

    const { data, error } = await supabase.rpc('submit_bank_transfer_payment', {
      p_customer_id: payload.customerId,
      p_amount: payload.amount,
      p_bank_reference: payload.bankReference,
      p_company_bank_account_id: payload.companyBankAccountId,
      p_payer_bank_name: payload.payerBankName,
      p_payer_account_name: payload.payerAccountName,
      p_proof_storage_path: uploadedPath,
      p_invoice_id: payload.invoiceId,
    });

    if (error) throw new Error(`Failed to submit bank transfer: ${error.message}`);
    const payment = await this.getPaymentById(data);
    if (!payment) throw new Error('Bank transfer submitted but payment record could not be fetched');
    return payment;
  }

  async confirmPayment(paymentId: string, bankReference?: string, allocations?: Array<{ invoiceId: string; amount: number }>): Promise<void> {
    const { error } = await supabase.rpc('confirm_and_allocate_payment', {
      p_payment_id: paymentId,
      p_bank_reference: bankReference,
      p_allocations: allocations || [],
    });
    if (error) throw new Error(`Payment confirmation failed: ${error.message}`);
  }

  async rejectBankTransfer(paymentId: string, reason: string): Promise<void> {
    const { error } = await supabase.rpc('reject_bank_transfer_payment', {
      p_payment_id: paymentId,
      p_reason: reason,
    });
    if (error) throw new Error(`Rejection failed: ${error.message}`);
  }

  async getReceipts(customerId?: string): Promise<ReceiptRecord[]> {
    let query = supabase.from('receipts').select('*').order('created_at', { ascending: false });
    if (customerId) query = query.eq('customer_id', customerId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch receipts: ${error.message}`);
    return (data || []).map((r: any) => ({
      id: r.id,
      organizationId: r.organization_id,
      receiptNumber: r.receipt_number,
      paymentId: r.payment_id,
      customerId: r.customer_id,
      customerName: r.customer_name,
      amount: Number(r.amount),
      paymentMethod: r.payment_method,
      bankReference: r.bank_reference,
      gatewayReference: r.gateway_reference,
      allocatedInvoices: r.allocated_invoices || [],
      issuedAt: r.issued_at,
      issuedBy: r.issued_by,
      receiptStoragePath: r.receipt_storage_path,
      createdAt: r.created_at,
    }));
  }

  async getReceiptById(id: string): Promise<ReceiptRecord | null> {
    const { data, error } = await supabase.from('receipts').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch receipt ${id}: ${error.message}`);
    }
    return data as ReceiptRecord;
  }

  async getReceiptByPaymentId(paymentId: string): Promise<ReceiptRecord | null> {
    const { data, error } = await supabase.from('receipts').select('*').eq('payment_id', paymentId).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch receipt for payment ${paymentId}: ${error.message}`);
    }
    return data as ReceiptRecord;
  }

  async getCreditNotes(customerId?: string): Promise<CreditNoteRecord[]> {
    let query = supabase.from('credit_notes').select('*').order('created_at', { ascending: false });
    if (customerId) query = query.eq('customer_id', customerId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch credit notes: ${error.message}`);
    return data || [];
  }

  async issueCreditNote(payload: { customerId: string; invoiceId?: string; amount: number; reason: string; notes?: string }): Promise<CreditNoteRecord> {
    const { data, error } = await supabase.rpc('issue_credit_note', {
      p_customer_id: payload.customerId,
      p_invoice_id: payload.invoiceId,
      p_amount: payload.amount,
      p_reason: payload.reason,
      p_notes: payload.notes,
    });
    if (error) throw new Error(`Failed to issue credit note: ${error.message}`);
    return data as CreditNoteRecord;
  }

  async getDebitNotes(customerId?: string): Promise<DebitNoteRecord[]> {
    let query = supabase.from('debit_notes').select('*').order('created_at', { ascending: false });
    if (customerId) query = query.eq('customer_id', customerId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch debit notes: ${error.message}`);
    return data || [];
  }

  async issueDebitNote(payload: { customerId: string; invoiceId?: string; amount: number; reason: string; notes?: string }): Promise<DebitNoteRecord> {
    const { data, error } = await supabase.rpc('issue_debit_note', {
      p_customer_id: payload.customerId,
      p_invoice_id: payload.invoiceId,
      p_amount: payload.amount,
      p_reason: payload.reason,
      p_notes: payload.notes,
    });
    if (error) throw new Error(`Failed to issue debit note: ${error.message}`);
    return data as DebitNoteRecord;
  }

  async evaluateCreditForRequisition(requisitionId: string): Promise<CreditEvaluationResult> {
    const { data, error } = await supabase.rpc('evaluate_requisition_financial_clearance', {
      p_requisition_id: requisitionId,
    });
    if (error) throw new Error(`Failed to evaluate credit clearance: ${error.message}`);
    return data as CreditEvaluationResult;
  }

  async grantManagementCreditOverride(requisitionId: string, reason: string): Promise<void> {
    const { error } = await supabase.rpc('grant_management_credit_override', {
      p_requisition_id: requisitionId,
      p_reason: reason,
    });
    if (error) throw new Error(`Credit override failed: ${error.message}`);
  }

  async getCustomerStatement(customerId: string, startDate?: string, endDate?: string): Promise<CustomerStatement> {
    const { data, error } = await supabase.rpc('get_customer_statement_report', {
      p_customer_id: customerId,
      p_start_date: startDate || '2026-01-01',
      p_end_date: endDate || new Date().toISOString().split('T')[0],
    });
    if (error) throw new Error(`Failed to generate statement: ${error.message}`);
    return data as CustomerStatement;
  }

  async updateCustomerCreditProfile(customerId: string, payload: { creditLimit: number; creditTermsDays: number; creditStatus: CustomerCreditStatus; notes?: string }): Promise<void> {
    const { error } = await supabase
      .from('customer_credit_profiles')
      .update({
        credit_limit: payload.creditLimit,
        credit_terms_days: payload.creditTermsDays,
        credit_status: payload.creditStatus,
        notes: payload.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('customer_id', customerId);

    if (error) throw new Error(`Failed to update credit profile: ${error.message}`);
  }
}
