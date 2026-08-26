import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Upload,
  PenTool,
  RotateCcw,
  Check,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { deliveryApi } from '@ar-multiventures/api';
import type { DeliveryTripRecord } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

export function DriverTripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<DeliveryTripRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // POD Modal State
  const [isPodOpen, setIsPodOpen] = useState(false);
  const [receiverName, setReceiverName] = useState('Engr. Babatunde Alabi');
  const [receiverPhone, setReceiverPhone] = useState('+234 802 334 9988');
  const [receiverDesignation, setReceiverDesignation] = useState('Site Receiving Engineer');
  const [deliveredQuantity, setDeliveredQuantity] = useState('30.20');
  const [driverRemarks, setDriverRemarks] = useState('');
  const [receiverRemarks, setReceiverRemarks] = useState('Quality and aggregate grading approved on delivery');
  const [hasSigned, setHasSigned] = useState(false);

  // Canvas for Digital Signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const loadTrip = async () => {
    setIsLoading(true);
    try {
      const data = await deliveryApi.getTripById(id || 'trp-03');
      setTrip(data);
      if (data?.weighbridge?.netWeightTonnes) {
        setDeliveredQuantity(String(data.weighbridge.netWeightTonnes));
      }
    } catch (err) {
      console.error('Failed to load trip detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrip();
  }, [id]);

  // Drawing helpers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSigned(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#059669';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  // Workflow Handlers
  const handleCheckin = async () => {
    if (!trip) return;
    setActionLoading(true);
    try {
      await deliveryApi.recordQuarryCheckin(trip.id);
      await loadTrip();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispatch = async () => {
    if (!trip) return;
    setActionLoading(true);
    try {
      await deliveryApi.dispatchTrip(trip.id);
      await loadTrip();
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitPod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;
    setActionLoading(true);
    try {
      await deliveryApi.recordTripPod({
        tripId: trip.id,
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        receivedByDesignation: receiverDesignation.trim(),
        deliveredQuantityTonnes: Number(deliveredQuantity) || trip.plannedQuantityTonnes,
        signatureStoragePath: 'pod_signatures/driver_capture.png',
        photoStoragePaths: ['pod_photos/site_offload.jpg'],
        driverRemarks: driverRemarks.trim() || undefined,
        receiverRemarks: receiverRemarks.trim() || undefined,
      });
      setIsPodOpen(false);
      await loadTrip();
    } catch (err: any) {
      alert(err.message || 'Failed to submit POD');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading || !trip) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4">
        <span className="text-caption text-neutral-400 font-mono">Loading trip mission...</span>
      </div>
    );
  }

  const isDelivered = trip.status === 'DELIVERED' || trip.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-28">
      {/* Header */}
      <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link to="/driver" className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-body font-black text-white">{trip.tripNumber}</h1>
            <p className="text-caption text-neutral-400 font-mono">
              Trip {trip.tripIndex} of {trip.totalTripsInOrder}
            </p>
          </div>
        </div>

        <span
          className={cn(
            'px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase',
            isDelivered
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
              : 'bg-primary-950 text-primary-300 border border-primary-700'
          )}
        >
          {trip.status}
        </span>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Mission Summary Card */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-primary-400 tracking-wider">
              Cargo Specification
            </span>
            <div className="text-h3 font-black text-white">
              {trip.plannedQuantityTonnes} Tonnes Granite
            </div>
            <p className="text-caption text-neutral-400">{trip.materialName}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-700/80 text-caption font-mono">
            <div>
              <span className="text-neutral-500 block">Truck Registration:</span>
              <span className="text-white font-bold text-body-sm">{trip.truckRegistration || 'KJA-104-XA'}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Assigned Driver:</span>
              <span className="text-white font-bold text-body-sm">{trip.driverName || 'Musa Ibrahim'}</span>
            </div>
          </div>
        </div>

        {/* Route Details Card */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 space-y-4">
          <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 tracking-wider">
            Route & Offload Location
          </span>

          <div className="space-y-4 text-body-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-900 text-primary-300 flex items-center justify-center text-caption font-bold shrink-0 mt-0.5">
                A
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-neutral-500 block">Pickup Quarry</span>
                <span className="font-bold text-white text-body-sm">{trip.quarryName}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center text-caption font-bold shrink-0 mt-0.5">
                B
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-neutral-500 block">Delivery Destination</span>
                <span className="font-bold text-white text-body-sm">{trip.destinationName}</span>
                <p className="text-caption text-neutral-400 mt-0.5">{trip.destinationAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weighbridge Ticket Card */}
        {trip.weighbridge ? (
          <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Weighbridge Verified
              </span>
              <span className="text-caption font-mono text-neutral-400">
                Ticket #{trip.weighbridge.weighbridgeTicketNumber}
              </span>
            </div>

            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-700 grid grid-cols-3 gap-2 text-center font-mono">
              <div>
                <span className="text-[10px] text-neutral-500 block">Gross Weight</span>
                <span className="font-bold text-white text-body-sm">{trip.weighbridge.grossWeightTonnes} T</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block">Tare Weight</span>
                <span className="font-bold text-white text-body-sm">{trip.weighbridge.tareWeightTonnes} T</span>
              </div>
              <div className="bg-emerald-950/60 rounded-lg p-1 border border-emerald-800">
                <span className="text-[10px] text-emerald-400 block font-bold">Net Loaded</span>
                <span className="font-black text-emerald-300 text-body-sm">{trip.weighbridge.netWeightTonnes} T</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-neutral-800/60 border border-neutral-700 rounded-2xl text-center text-caption text-neutral-400">
            Awaiting Quarry Weighbridge Capture
          </div>
        )}

        {/* Delivered Confirmation View */}
        {isDelivered && trip.pod && (
          <div className="p-5 bg-emerald-950/80 border border-emerald-700 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="h-5 w-5" />
              Proof of Delivery Confirmed
            </div>
            <div className="p-3 bg-neutral-900 rounded-xl space-y-1.5 text-body-sm font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-400">Received By:</span>
                <span className="text-white font-bold">{trip.pod.receiverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Delivered Quantity:</span>
                <span className="text-emerald-400 font-bold">{trip.pod.deliveredQuantityTonnes} Tonnes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Time:</span>
                <span className="text-white">{new Date(trip.pod.deliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Action Footer */}
      {!isDelivered && (
        <div className="fixed bottom-0 inset-x-0 bg-neutral-950 border-t border-neutral-800 p-4 z-40 max-w-md mx-auto">
          {trip.status === 'ASSIGNED' || trip.status === 'SCHEDULED' ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full font-black text-body justify-center py-4 bg-primary-800 hover:bg-primary-700 text-white"
              onClick={handleCheckin}
              isLoading={actionLoading}
            >
              1. Record Arrival at Quarry
            </Button>
          ) : trip.status === 'AT_QUARRY' || trip.status === 'LOADING' ? (
            <div className="space-y-2 text-center">
              <span className="text-caption text-amber-400 font-mono block">
                Loading & Weighbridge in progress by quarry officer
              </span>
              <Button
                variant="primary"
                size="lg"
                className="w-full font-black text-body justify-center py-4 bg-primary-800 hover:bg-primary-700 text-white"
                onClick={handleDispatch}
                isLoading={actionLoading}
              >
                2. Confirm Loaded & Begin Transit
              </Button>
            </div>
          ) : trip.status === 'LOADED' ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full font-black text-body justify-center py-4 bg-emerald-800 hover:bg-emerald-700 text-white"
              onClick={handleDispatch}
              isLoading={actionLoading}
            >
              2. Start Delivery (Depart Quarry)
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="w-full font-black text-body justify-center py-4 bg-emerald-800 hover:bg-emerald-700 text-white shadow-xl"
              onClick={() => setIsPodOpen(true)}
              leftIcon={<PenTool className="h-5 w-5" />}
            >
              3. Capture Proof of Delivery (POD)
            </Button>
          )}
        </div>
      )}

      {/* POD Submission Modal */}
      {isPodOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-700 w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-emerald-400" />
                <h3 className="font-black text-white text-body">Proof of Delivery Capture</h3>
              </div>
              <button
                onClick={() => setIsPodOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitPod} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                    Receiver Full Name *
                  </label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-body-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                    Receiver Phone *
                  </label>
                  <input
                    type="tel"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    required
                    className="w-full p-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-body-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                    Receiver Designation
                  </label>
                  <input
                    type="text"
                    value={receiverDesignation}
                    onChange={(e) => setReceiverDesignation(e.target.value)}
                    className="w-full p-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-body-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                    Delivered Quantity (T) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={deliveredQuantity}
                    onChange={(e) => setDeliveredQuantity(e.target.value)}
                    required
                    className="w-full p-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-body-sm font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Digital Signature Canvas */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono text-neutral-400">
                    Client Receiving Signature *
                  </label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[11px] font-mono text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> Clear
                  </button>
                </div>
                <div className="border border-neutral-700 rounded-xl bg-neutral-950 p-1">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={120}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[120px] bg-neutral-950 rounded-lg cursor-crosshair touch-none"
                  />
                </div>
                <span className="text-[10px] text-neutral-500 block">
                  Draw signature on touchscreen or using mouse
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                  Offload Site Remarks / Quality Verification
                </label>
                <textarea
                  value={receiverRemarks}
                  onChange={(e) => setReceiverRemarks(e.target.value)}
                  className="w-full h-16 p-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-caption focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full font-black text-body justify-center py-3.5 bg-emerald-800 hover:bg-emerald-700 text-white"
                  isLoading={actionLoading}
                  disabled={!hasSigned}
                >
                  Confirm & Complete Delivery (POD)
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
