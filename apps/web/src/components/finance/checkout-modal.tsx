import { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Upload,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { financeApi, paymentApi } from '@ar-multiventures/api';
import type { InvoiceRecord, CompanyBankAccount, PaymentVerifyResponse } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceRecord | null;
  onSuccess?: () => void;
}

type PaymentTab = 'PAYSTACK' | 'BANK_TRANSFER';
type CheckoutStep = 'METHOD_SELECT' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'TRANSFER_SUBMITTED';

export function CheckoutModal({ isOpen, onClose, invoice, onSuccess }: CheckoutModalProps) {
  const [activeTab, setActiveTab] = useState<PaymentTab>('PAYSTACK');
  const [step, setStep] = useState<CheckoutStep>('METHOD_SELECT');
  const [bankAccounts, setBankAccounts] = useState<CompanyBankAccount[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Bank Transfer Form State
  const [transferBank, setTransferBank] = useState('Guaranty Trust Bank (GTBank)');
  const [transferRef, setTransferRef] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [transferNotes, setTransferNotes] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Status & Progress State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<PaymentVerifyResponse | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('METHOD_SELECT');
      setErrorMessage(null);
      setVerificationResult(null);
      financeApi.getCompanyBankAccounts().then((accounts) => setBankAccounts(accounts));
    }
  }, [isOpen]);

  if (!isOpen || !invoice) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePaystackCheckout = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setStep('PROCESSING');

    try {
      // 1. Authoritative Payment Initialization
      const initRes = await financeApi.initializeOnlinePayment({
        invoiceId: invoice.id,
        provider: 'PAYSTACK',
      });

      // 2. In Test/Mock Mode or Hosted Mode, verify transaction
      const verifyRes = await financeApi.verifyOnlinePayment(initRes.reference);

      if (verifyRes.success) {
        setVerificationResult(verifyRes);
        setStep('SUCCESS');
        onSuccess?.();
      } else {
        setErrorMessage(verifyRes.error || 'Payment could not be verified by gateway.');
        setStep('FAILED');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during payment processing.');
      setStep('FAILED');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBankTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferRef.trim()) {
      setErrorMessage('Please enter the bank statement or teller reference.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await financeApi.submitBankTransfer({
        customerId: invoice.customerId,
        invoiceId: invoice.id,
        amount: invoice.outstandingAmount,
        bankName: transferBank,
        bankReference: transferRef.trim(),
        paymentDate: transferDate,
        proofFile: proofFile || undefined,
        notes: transferNotes.trim() || undefined,
      });

      setStep('TRANSFER_SUBMITTED');
      onSuccess?.();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit bank transfer record.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 bg-neutral-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-900 text-white flex items-center justify-center font-black">
              ARM
            </div>
            <div>
              <h2 className="text-body font-bold text-neutral-950">
                {step === 'SUCCESS'
                  ? 'Payment Verified & Confirmed'
                  : step === 'TRANSFER_SUBMITTED'
                  ? 'Deposit Recorded for Review'
                  : 'Secure Invoice Settlement'}
              </h2>
              <p className="text-caption text-neutral-500 font-mono">
                {invoice.invoiceNumber} · {invoice.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Invoice Summary Banner */}
        <div className="p-4 bg-primary-50/50 border-b border-primary-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase text-primary-800 tracking-wider">
              Authoritative Amount Due
            </span>
            <div className="text-h3 font-black font-mono text-primary-950">
              {formatNaira(invoice.outstandingAmount)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono font-bold uppercase text-neutral-500">
              Payment Due Date
            </span>
            <div className="text-caption font-bold text-neutral-800">
              {formatDate(invoice.dueDate)}
            </div>
          </div>
        </div>

        {/* STEP 1: METHOD SELECTION */}
        {step === 'METHOD_SELECT' && (
          <div className="p-6 space-y-6">
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('PAYSTACK')}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-caption font-bold transition-all',
                  activeTab === 'PAYSTACK'
                    ? 'bg-white text-primary-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                )}
              >
                <CreditCard className="h-4 w-4 text-emerald-800" />
                Paystack Gateway (Instant)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('BANK_TRANSFER')}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-caption font-bold transition-all',
                  activeTab === 'BANK_TRANSFER'
                    ? 'bg-white text-primary-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                )}
              >
                <Building2 className="h-4 w-4 text-primary-800" />
                Direct Bank Transfer
              </button>
            </div>

            {/* Paystack Online Flow */}
            {activeTab === 'PAYSTACK' && (
              <div className="space-y-5">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-body-sm">
                    <ShieldCheck className="h-4 w-4 text-emerald-800" />
                    Instant Payment & Automated Ledger Posting
                  </div>
                  <p className="text-caption text-emerald-800 leading-relaxed">
                    Pay securely using Debit Card, Direct Bank Transfer, or USSD via Paystack. Your sub-ledger will be credited instantly and an official receipt generated.
                  </p>
                </div>

                <div className="space-y-2 text-caption text-neutral-600 bg-neutral-50 p-4 rounded-xl border border-neutral-200 font-mono">
                  <div className="flex justify-between">
                    <span>Invoice Subtotal:</span>
                    <span>{formatNaira(invoice.subtotal)}</span>
                  </div>
                  {invoice.haulageAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Haulage & Freight:</span>
                      <span>{formatNaira(invoice.haulageAmount)}</span>
                    </div>
                  )}
                  {invoice.loadingAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Loading Charges:</span>
                      <span>{formatNaira(invoice.loadingAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-neutral-200 font-bold text-neutral-900 text-body-sm">
                    <span>Total Outstanding:</span>
                    <span className="text-primary-900">{formatNaira(invoice.outstandingAmount)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full font-bold justify-center"
                    onClick={handlePaystackCheckout}
                    isLoading={isLoading}
                    leftIcon={<ShieldCheck className="h-5 w-5" />}
                  >
                    Proceed to Paystack Secure Checkout
                  </Button>
                </div>

                <div className="text-center text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-800" />
                  256-Bit Encrypted · Verified by Paystack Gateway
                </div>
              </div>
            )}

            {/* Direct Bank Transfer Flow */}
            {activeTab === 'BANK_TRANSFER' && (
              <form onSubmit={handleBankTransferSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-mono font-bold uppercase text-neutral-500">
                    Designated Company Deposit Accounts:
                  </label>
                  <div className="grid gap-2">
                    {bankAccounts.map((acc) => (
                      <div
                        key={acc.id}
                        className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between text-body-sm"
                      >
                        <div>
                          <div className="font-bold text-neutral-900">{acc.bankName}</div>
                          <div className="font-mono text-caption text-neutral-600">
                            {acc.accountName}
                          </div>
                          <div className="font-mono font-bold text-primary-900 text-body-sm">
                            {acc.accountNumber}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => handleCopy(acc.accountNumber, acc.id)}
                          leftIcon={<Copy className="h-3.5 w-3.5" />}
                        >
                          {copiedId === acc.id ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Bank Reference / Teller Number *"
                    placeholder="e.g. GTB-TRF-982143"
                    value={transferRef}
                    onChange={(e) => setTransferRef(e.target.value)}
                    required
                  />
                  <Input
                    type="date"
                    label="Transfer Date *"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-caption font-bold text-neutral-700">
                    Upload Proof of Payment (Optional)
                  </label>
                  <div className="border-2 border-dashed border-neutral-200 rounded-xl p-3 text-center bg-neutral-50/50 hover:bg-neutral-50 cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="proof-upload"
                    />
                    <label htmlFor="proof-upload" className="cursor-pointer block">
                      <Upload className="h-5 w-5 text-neutral-400 mx-auto mb-1" />
                      <span className="text-caption font-semibold text-primary-800">
                        {proofFile ? proofFile.name : 'Click to attach teller slip or transfer receipt'}
                      </span>
                      <span className="block text-[11px] text-neutral-400 mt-0.5">
                        PNG, JPG or PDF up to 10MB
                      </span>
                    </label>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-caption text-red-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {errorMessage}
                  </div>
                )}

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-tight">
                  <strong>Notice:</strong> Bank transfers are verified by Accounts before posting sub-ledger credits and updating financial clearances.
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full font-bold justify-center"
                    isLoading={isLoading}
                  >
                    Submit Transfer for Accounts Verification
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* STEP 2: PROCESSING / SPINNER */}
        {step === 'PROCESSING' && (
          <div className="p-12 text-center space-y-4">
            <RefreshCw className="h-10 w-10 text-primary-800 animate-spin mx-auto" />
            <h3 className="text-body font-bold text-neutral-900">
              Verifying Payment with Gateway...
            </h3>
            <p className="text-caption text-neutral-500 max-w-sm mx-auto">
              Please wait while we confirm the settlement with Paystack and post the sub-ledger credit.
            </p>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'SUCCESS' && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-h3 font-black text-neutral-950">Payment Confirmed!</h3>
              <p className="text-caption text-neutral-600">
                Official Receipt #{verificationResult?.receiptNumber || 'REC-ISSUED'}
              </p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-body-sm font-mono space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-neutral-500">Payment Reference:</span>
                <span className="font-bold text-neutral-900">{verificationResult?.paymentReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Settled Amount:</span>
                <span className="font-black text-emerald-800">{formatNaira(verificationResult?.amount || invoice.outstandingAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Invoice:</span>
                <span className="font-bold text-neutral-900">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Financial Clearance:</span>
                <span className="font-bold text-emerald-800">CLEARED (LOADING READY)</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="primary" onClick={onClose} className="font-bold">
                Done & View Statement
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: FAILED */}
        {step === 'FAILED' && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-700 flex items-center justify-center mx-auto border border-red-200">
              <AlertCircle className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-h3 font-black text-neutral-950">Payment Unsuccessful</h3>
              <p className="text-caption text-neutral-600 max-w-sm mx-auto">
                {errorMessage || 'The payment gateway could not confirm the transaction. No funds were debited to your sub-ledger.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setStep('METHOD_SELECT')} className="font-bold">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: TRANSFER SUBMITTED */}
        {step === 'TRANSFER_SUBMITTED' && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto border border-amber-200">
              <Clock className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-h3 font-black text-neutral-950">Bank Deposit Recorded</h3>
              <p className="text-caption text-neutral-600 max-w-sm mx-auto">
                Your deposit details have been transmitted to AR Multiventures Accounts. Once bank reconciliation is verified, your sub-ledger and official receipt will update.
              </p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-body-sm font-mono space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-neutral-500">Bank Reference:</span>
                <span className="font-bold text-neutral-900">{transferRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Submitted Amount:</span>
                <span className="font-black text-neutral-900">{formatNaira(invoice.outstandingAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Review Status:</span>
                <span className="font-bold text-amber-800">PENDING ACCOUNTS VERIFICATION</span>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="primary" onClick={onClose} className="font-bold">
                Back to Invoices
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
