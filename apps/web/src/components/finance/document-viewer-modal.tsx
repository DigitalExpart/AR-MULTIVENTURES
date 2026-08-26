import { Printer, Download, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import type { InvoiceRecord, CustomerStatement, PaymentRecord, ReceiptRecord } from '@ar-multiventures/types';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'INVOICE' | 'PROFORMA' | 'STATEMENT' | 'RECEIPT';
  invoice?: InvoiceRecord | null;
  statement?: CustomerStatement | null;
  payment?: PaymentRecord | null;
  receipt?: ReceiptRecord | null;
}

export function DocumentViewerModal({
  isOpen,
  onClose,
  documentType,
  invoice,
  statement,
  payment,
  receipt,
}: DocumentViewerModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Modal Controls (Not printed) */}
        <div className="print:hidden flex items-center justify-between p-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2">
            <span className="font-bold text-body-sm text-neutral-900">
              Official Document View ({documentType})
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

        {/* Printable Document Sheet */}
        <div className="p-8 sm:p-12 space-y-8 bg-white text-neutral-900 print:p-0">
          {/* Document Header with Official Branding */}
          <div className="flex items-start justify-between border-b-2 border-primary-800 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary-800 text-white flex items-center justify-center font-black text-base">
                  ARM
                </div>
                <div>
                  <h1 className="text-h3 font-black tracking-tight text-neutral-950">
                    AR MULTIVENTURES
                  </h1>
                  <p className="text-[10px] font-mono font-bold text-primary-800 uppercase tracking-widest">
                    Granite Supply & Heavy Haulage Management
                  </p>
                </div>
              </div>
              <div className="text-caption text-neutral-500 pt-2 space-y-0.5">
                <p>Victoria Island Industrial Hub, Lagos, Nigeria</p>
                <p>Helpline: +234 800 AR MULTIVENTURES · operations@armultiventures.com</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-h2 font-black text-primary-900 tracking-tight uppercase block">
                {documentType === 'TAX_INVOICE' || documentType === 'INVOICE'
                  ? 'TAX INVOICE'
                  : documentType === 'PROFORMA'
                  ? 'PROFORMA INVOICE'
                  : documentType === 'STATEMENT'
                  ? 'ACCOUNT STATEMENT'
                  : 'OFFICIAL RECEIPT'}
              </span>
              <span className="font-mono font-bold text-body-sm text-neutral-700 block mt-1">
                {receipt?.receiptNumber || invoice?.invoiceNumber || payment?.paymentReference || `STMT-${statement?.accountNumber}`}
              </span>
              <span className="text-caption text-neutral-500 font-mono block">
                Date: {formatDate(receipt?.issuedAt || invoice?.issueDate || payment?.paymentDate || statement?.endDate || new Date().toISOString())}
              </span>
            </div>
          </div>

          {/* INVOICE VIEW */}
          {invoice && documentType !== 'RECEIPT' && (
            <div className="space-y-6">
              {/* Customer & Order Metadata Grid */}
              <div className="grid sm:grid-cols-2 gap-6 text-body-sm">
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                  <span className="text-[11px] font-mono font-bold uppercase text-neutral-400">Billed To</span>
                  <div className="font-bold text-neutral-950 text-body">{invoice.customerName}</div>
                  <div className="text-caption text-neutral-600">Client Requisition: {invoice.requisitionNumber}</div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 text-right sm:text-left">
                  <span className="text-[11px] font-mono font-bold uppercase text-neutral-400">Payment Terms</span>
                  <div className="font-bold text-neutral-900">Due: {formatDate(invoice.dueDate)}</div>
                  <div className="text-caption font-semibold uppercase text-primary-800">
                    Status: {invoice.status}
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-left text-body-sm">
                <thead className="bg-neutral-100 border-y border-neutral-200 text-[11px] font-mono font-bold uppercase text-neutral-600">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right">Total (₦)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 font-mono">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-3 font-sans font-semibold text-neutral-900">{item.description}</td>
                      <td className="py-3 px-3 text-right">{item.quantity} {item.unit}</td>
                      <td className="py-3 px-3 text-right">{formatNaira(item.unitPrice)}</td>
                      <td className="py-3 px-3 text-right font-bold">{formatNaira(item.lineTotal)}</td>
                    </tr>
                  ))}
                  {invoice.loadingAmount > 0 && (
                    <tr>
                      <td className="py-2 px-3 font-sans text-neutral-700">Quarry Weighbridge & Loading Bay Ticket</td>
                      <td className="py-2 px-3 text-right">—</td>
                      <td className="py-2 px-3 text-right">—</td>
                      <td className="py-2 px-3 text-right">{formatNaira(invoice.loadingAmount)}</td>
                    </tr>
                  )}
                  {invoice.haulageAmount > 0 && (
                    <tr>
                      <td className="py-2 px-3 font-sans text-neutral-700">Heavy Fleet Haulage Freight</td>
                      <td className="py-2 px-3 text-right">—</td>
                      <td className="py-2 px-3 text-right">—</td>
                      <td className="py-2 px-3 text-right">{formatNaira(invoice.haulageAmount)}</td>
                    </tr>
                  )}
                  {invoice.fuelAdjustmentAmount > 0 && (
                    <tr>
                      <td className="py-2 px-3 font-sans text-neutral-700">Logistics Fuel Adjustment Surcharge</td>
                      <td className="py-2 px-3 text-right">—</td>
                      <td className="py-2 px-3 text-right">—</td>
                      <td className="py-2 px-3 text-right">{formatNaira(invoice.fuelAdjustmentAmount)}</td>
                    </tr>
                  )}
                  {invoice.discountAmount > 0 && (
                    <tr className="text-emerald-800">
                      <td className="py-2 px-3 font-sans font-semibold">Contract Volume Discount</td>
                      <td className="py-2 px-3 text-right">—</td>
                      <td className="py-2 px-3 text-right">—</td>
                      <td className="py-2 px-3 text-right">-{formatNaira(invoice.discountAmount)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div className="flex justify-end pt-4 border-t-2 border-neutral-300">
                <div className="w-72 space-y-2 text-body-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Invoice Total:</span>
                    <span className="font-black text-h3 text-primary-900">{formatNaira(invoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-caption text-neutral-600">
                    <span>Amount Paid:</span>
                    <span>{formatNaira(invoice.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-neutral-200 font-bold text-neutral-900">
                    <span>Balance Outstanding:</span>
                    <span className="text-red-700">{formatNaira(invoice.outstandingAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATEMENT VIEW */}
          {statement && documentType === 'STATEMENT' && (
            <div className="space-y-6">
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex justify-between text-body-sm">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase text-neutral-400">Account</span>
                  <div className="font-bold text-neutral-900">{statement.customerName} ({statement.accountNumber})</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono font-bold uppercase text-neutral-400">Period</span>
                  <div className="font-mono text-neutral-800">{formatDate(statement.startDate)} – {formatDate(statement.endDate)}</div>
                </div>
              </div>

              <table className="w-full text-left text-caption font-mono">
                <thead className="bg-neutral-100 border-y border-neutral-200 font-bold uppercase text-neutral-600">
                  <tr>
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2">Doc #</th>
                    <th className="py-2 px-3 font-sans">Description</th>
                    <th className="py-2 px-2 text-right">Debit (₦)</th>
                    <th className="py-2 px-2 text-right">Credit (₦)</th>
                    <th className="py-2 px-2 text-right">Balance (₦)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {statement.transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="py-2 px-2">{formatDate(t.transactionDate)}</td>
                      <td className="py-2 px-2 font-bold">{t.documentNumber}</td>
                      <td className="py-2 px-3 font-sans text-neutral-800">{t.description}</td>
                      <td className="py-2 px-2 text-right">{t.debit > 0 ? formatNaira(t.debit) : '—'}</td>
                      <td className="py-2 px-2 text-right text-emerald-800">{t.credit > 0 ? formatNaira(t.credit) : '—'}</td>
                      <td className="py-2 px-2 text-right font-bold">{formatNaira(t.runningBalance || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-4 bg-primary-50 rounded-xl border border-primary-200 flex justify-between font-mono font-bold text-body-sm">
                <span>Closing Statement Balance:</span>
                <span className="text-primary-900 text-body font-black">{formatNaira(statement.closingBalance)}</span>
              </div>
            </div>
          )}

          {/* RECEIPT VIEW */}
          {(receipt || payment) && documentType === 'RECEIPT' && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4 text-body-sm">
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                  <span className="text-[11px] font-mono font-bold uppercase text-neutral-400">Received From</span>
                  <div className="font-bold text-neutral-950 text-body">{receipt?.customerName || payment?.customerName}</div>
                  <div className="text-caption text-neutral-600 font-mono">Payment Ref: {receipt?.paymentReference || payment?.paymentReference}</div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 text-right sm:text-left">
                  <span className="text-[11px] font-mono font-bold uppercase text-neutral-400">Payment Channel</span>
                  <div className="font-bold text-neutral-900 uppercase">{(receipt?.paymentMethod || payment?.paymentMethod || 'PAYSTACK').replace('_', ' ')}</div>
                  <div className="text-caption font-semibold uppercase text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Confirmed & Ledger Credited
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between font-mono">
                <div>
                  <span className="text-[11px] uppercase font-bold text-emerald-800 block">Total Amount Paid</span>
                  <span className="text-caption text-emerald-700">Authoritative Sub-Ledger Posting</span>
                </div>
                <div className="text-h2 font-black text-emerald-950">
                  {formatNaira(receipt?.amount || payment?.amount || 0)}
                </div>
              </div>
            </div>
          )}

          {/* Document Footer Guarantee */}
          <div className="pt-6 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary-700" />
              Official Computer-Generated Document · AR Multiventures Financial Ledger
            </span>
            <span className="font-mono">Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
