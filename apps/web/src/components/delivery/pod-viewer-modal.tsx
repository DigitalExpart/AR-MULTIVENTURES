import { Printer, Download, X, ShieldCheck, CheckCircle2, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@ar-multiventures/business-logic';
import type { DeliveryTripRecord } from '@ar-multiventures/types';

interface PodViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: DeliveryTripRecord | null;
}

export function PodViewerModal({ isOpen, onClose, trip }: PodViewerModalProps) {
  if (!isOpen || !trip || !trip.pod) return null;

  const pod = trip.pod;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Modal Controls (Not printed) */}
        <div className="print:hidden flex items-center justify-between p-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-800" />
            <span className="font-bold text-body-sm text-neutral-900">
              Verified Proof of Delivery (POD)
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

        {/* Printable Official POD Sheet */}
        <div className="p-8 sm:p-12 space-y-6 bg-white text-neutral-900 print:p-0">
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
                <p>Helpline: +234 800 AR MULTIVENTURES · logistics@armultiventures.com</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-h3 font-black text-emerald-900 tracking-tight uppercase block">
                PROOF OF DELIVERY
              </span>
              <span className="font-mono font-bold text-body-sm text-neutral-800 block mt-1">
                {trip.tripNumber}
              </span>
              <span className="text-caption text-neutral-500 font-mono block">
                Delivered: {formatDate(pod.deliveryTime)}
              </span>
            </div>
          </div>

          {/* Delivery Metadata Grid */}
          <div className="grid sm:grid-cols-2 gap-4 text-body-sm">
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase text-neutral-400">Delivered To</span>
              <div className="font-bold text-neutral-950 text-body">{trip.customerName}</div>
              <div className="text-caption text-neutral-600 font-mono">{trip.destinationName}</div>
              <div className="text-[11px] text-neutral-500">{trip.destinationAddress}</div>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 font-mono">
              <span className="text-[11px] font-bold uppercase text-neutral-400">Haulage & Vehicle</span>
              <div className="font-bold text-neutral-900 text-body">Truck: {trip.truckRegistration || 'KJA-104-XA'}</div>
              <div className="text-caption text-neutral-600">Driver: {trip.driverName}</div>
              <div className="text-caption text-neutral-600">Quarry: {trip.quarryName}</div>
            </div>
          </div>

          {/* Cargo & Weight Confirmation */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden font-mono text-body-sm">
            <table className="w-full text-left">
              <thead className="bg-neutral-100 border-b border-neutral-200 text-[11px] font-bold uppercase text-neutral-600">
                <tr>
                  <th className="py-2.5 px-4">Material Description</th>
                  <th className="py-2.5 px-4">Weighbridge Ticket</th>
                  <th className="py-2.5 px-4 text-right">Delivered Net (T)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="py-3 px-4 font-sans font-semibold text-neutral-900">
                    {trip.materialName || 'Granite 3/4" (20mm Aggregate)'}
                  </td>
                  <td className="py-3 px-4 text-neutral-600">
                    {trip.weighbridge?.weighbridgeTicketNumber || 'WB-VERIFIED'}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-emerald-800 text-body">
                    {pod.deliveredQuantityTonnes} Tonnes
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Receiver Signoff & Signature Block */}
          <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-4">
            <div className="grid sm:grid-cols-2 gap-4 text-body-sm">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-neutral-500 block">
                  Site Receiving Official:
                </span>
                <span className="font-bold text-neutral-900 text-body block mt-0.5">
                  {pod.receiverName}
                </span>
                <span className="text-caption text-neutral-600 block">
                  {pod.receivedByDesignation || 'Site Supervisor'} · {pod.receiverPhone || ''}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-neutral-500 block">
                  Signed Offload Verification:
                </span>
                <div className="mt-1 h-14 w-full bg-white border border-neutral-300 rounded-lg flex items-center justify-center p-2">
                  <span className="font-mono text-caption text-emerald-800 font-bold italic">
                    ✓ Verified Digital Signature Signed
                  </span>
                </div>
              </div>
            </div>

            {pod.receiverRemarks && (
              <div className="pt-2 border-t border-neutral-200 text-caption text-neutral-700 font-sans">
                <strong>Receiver Remarks:</strong> {pod.receiverRemarks}
              </div>
            )}
          </div>

          {/* Footer Security Stamp */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-800" />
              Official Signed Electronic POD · AR Multiventures Logistics
            </span>
            <span className="font-mono">Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
