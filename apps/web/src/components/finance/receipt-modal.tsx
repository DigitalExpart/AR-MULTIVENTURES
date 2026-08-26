import { Printer, Download, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import type { ReceiptRecord, PaymentRecord } from '@ar-multiventures/types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ReceiptRecord | null;
  payment?: PaymentRecord | null;
}

export function ReceiptModal({ isOpen, onClose, receipt, payment }: ReceiptModalProps) {
  if (!isOpen || (!receipt && !payment)) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNumber = receipt?.receiptNumber || payment?.receiptNumber || `REC-${payment?.paymentReference?.replace('PAY-', '') || '2026-000001'}`;
  const amount = receipt?.amount || payment?.amount || 0;
  const paymentRef = receipt?.paymentReference || payment?.paymentReference || '—';
  const customerName = receipt?.customerName || payment?.customerName || 'Valued Client';
  const paymentMethod = receipt?.paymentMethod || payment?.paymentMethod || 'PAYSTACK';
  const issuedDate = receipt?.issuedAt || payment?.confirmedAt || payment?.paymentDate || new Date().toISOString();
  const invoiceNumber = receipt?.invoiceNumber || payment?.invoiceNumber || 'INV-SETTLED';

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Modal Controls (Not printed) */}
        <div className="print:hidden flex items-center justify-between p-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2">
            <span className="font-bold text-body-sm text-neutral-900">
              Official Payment Receipt View
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="xs" onClick={handlePrint} leftIcon={<Printer className="h-3.5 w-3.5" />}>
              Print / Save PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Sheet */}
        <div className="p-8 sm:p-12 space-y-8 bg-white text-neutral-900 print:p-0">
          {/* Header Branding */}
          <div className="flex items-start justify-between border-b-2 border-primary-900 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary-900 text-white flex items-center justify-center font-black text-base">
                  ARM
                </div>
                <div>
                  <h1 className="text-h3 font-black tracking-tight text-neutral-950">
                    AR MULTIVENTURES
                  </h1>
                  <p className="text-[10px] font-mono font-bold text-primary-900 uppercase tracking-widest">
                    Granite Supply & Heavy Haulage Management
                  </p>
                </div>
              </div>
              <div className="text-caption text-neutral-500 pt-2 space-y-0.5">
                <p>Victoria Island Industrial Hub, Lagos, Nigeria</p>
                <p>Helpline: +234 800 AR MULTIVENTURES · finance@armultiventures.com</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-h3 font-black text-emerald-900 tracking-tight uppercase block">
                OFFICIAL RECEIPT
              </span>
              <span className="font-mono font-bold text-body-sm text-neutral-800 block mt-1">
                {receiptNumber}
              </span>
              <span className="text-caption text-neutral-500 font-mono block">
                Date: {formatDate(issuedDate)}
              </span>
            </div>
          </div>

          {/* Receipt Data Grid */}
          <div className="grid sm:grid-cols-2 gap-4 text-body-sm">
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase text-neutral-400">Received From</span>
              <div className="font-bold text-neutral-950 text-body">{customerName}</div>
              <div className="text-caption text-neutral-600 font-mono">Payment Ref: {paymentRef}</div>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 text-right sm:text-left">
              <span className="text-[11px] font-mono font-bold uppercase text-neutral-400">Payment Channel</span>
              <div className="font-bold text-neutral-900 uppercase">{paymentMethod.replace('_', ' ')}</div>
              <div className="text-caption font-semibold uppercase text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Ledger Credited & Settled
              </div>
            </div>
          </div>

          {/* Settlement Details */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-neutral-100 border-b border-neutral-200 text-[11px] font-mono font-bold uppercase text-neutral-600">
                <tr>
                  <th className="py-2.5 px-4">Description / Reference</th>
                  <th className="py-2.5 px-4 text-right">Applied Amount (₦)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-mono">
                <tr>
                  <td className="py-3 px-4 font-sans font-semibold text-neutral-900">
                    Settlement for Supply Invoice #{invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-right font-bold">{formatNaira(amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount Paid Box */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between font-mono">
            <div>
              <span className="text-[11px] uppercase font-bold text-emerald-800 block">Total Amount Paid</span>
              <span className="text-caption text-emerald-700">Authoritative Sub-Ledger Posting</span>
            </div>
            <div className="text-h2 font-black text-emerald-950">
              {formatNaira(amount)}
            </div>
          </div>

          {/* Footer Security Stamp */}
          <div className="pt-6 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-800" />
              Official Computer-Generated Financial Document · AR Multiventures Sub-Ledger
            </span>
            <span className="font-mono">Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
