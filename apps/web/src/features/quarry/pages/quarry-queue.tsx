import { useState, useEffect } from 'react';
import {
  Truck,
  Scale,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Plus,
  RefreshCw,
  Building2,
  Search,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { deliveryApi } from '@ar-multiventures/api';
import { calculateNetWeight, calculateWeightVariance } from '@ar-multiventures/business-logic';
import type { DeliveryTripRecord } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

type QuarryTab = 'SCHEDULED' | 'AT_QUARRY' | 'LOADING' | 'LOADED';

export function QuarryQueuePage() {
  const [activeTab, setActiveTab] = useState<QuarryTab>('AT_QUARRY');
  const [queue, setQueue] = useState<{
    scheduled: DeliveryTripRecord[];
    atQuarry: DeliveryTripRecord[];
    loading: DeliveryTripRecord[];
    loaded: DeliveryTripRecord[];
  }>({
    scheduled: [],
    atQuarry: [],
    loading: [],
    loaded: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<DeliveryTripRecord | null>(null);
  const [isWeighbridgeModalOpen, setIsWeighbridgeModalOpen] = useState(false);

  // Weighbridge Form State
  const [ticketNumber, setTicketNumber] = useState('');
  const [loadingTicket, setLoadingTicket] = useState('');
  const [grossWeight, setGrossWeight] = useState('45.40');
  const [tareWeight, setTareWeight] = useState('15.20');
  const [loadingBay, setLoadingBay] = useState('BAY-01');
  const [remarks, setRemarks] = useState('Clean 3/4 inch aggregate loading verified');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadQueue = async () => {
    setIsLoading(true);
    try {
      const data = await deliveryApi.getQuarryQueue('qry-01');
      setQueue(data);
    } catch (err) {
      console.error('Failed to load quarry queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleCheckin = async (tripId: string) => {
    try {
      await deliveryApi.recordQuarryCheckin(tripId);
      await loadQueue();
    } catch (err: any) {
      alert(err.message || 'Checkin failed');
    }
  };

  const openWeighbridgeCapture = (trip: DeliveryTripRecord) => {
    setSelectedTrip(trip);
    setTicketNumber(`WB-ABK-${Math.floor(100000 + Math.random() * 900000)}`);
    setLoadingTicket(`LDT-0826-${Math.floor(10 + Math.random() * 90)}`);
    setIsWeighbridgeModalOpen(true);
  };

  const handleWeighbridgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) return;

    const gross = Number(grossWeight);
    const tare = Number(tareWeight);

    if (gross <= tare) {
      alert('Gross weight must be strictly greater than tare weight');
      return;
    }

    setIsSubmitting(true);
    try {
      await deliveryApi.recordWeighbridgeAndLoading({
        tripId: selectedTrip.id,
        weighbridgeTicketNumber: ticketNumber.trim(),
        loadingTicketNumber: loadingTicket.trim(),
        grossWeightTonnes: gross,
        tareWeightTonnes: tare,
        loadingBay,
        remarks: remarks.trim() || undefined,
      });

      setIsWeighbridgeModalOpen(false);
      await loadQueue();
    } catch (err: any) {
      alert(err.message || 'Weighbridge capture failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const netCalc = calculateNetWeight(Number(grossWeight) || 0, Number(tareWeight) || 0);
  const varCalc = selectedTrip
    ? calculateWeightVariance(netCalc.netWeightTonnes, selectedTrip.plannedQuantityTonnes)
    : { varianceTonnes: 0, variancePercent: 0 };

  const currentList =
    activeTab === 'SCHEDULED'
      ? queue.scheduled
      : activeTab === 'AT_QUARRY'
      ? queue.atQuarry
      : activeTab === 'LOADING'
      ? queue.loading
      : queue.loaded;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header Banner */}
      <div className="bg-primary-950 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-primary-800">
        <div>
          <div className="flex items-center gap-2 text-primary-300 font-mono text-caption uppercase font-bold tracking-wider">
            <Building2 className="h-4 w-4 text-primary-400" />
            Abeokuta North High-Grade Quarry · Loading Bay Operations
          </div>
          <h1 className="text-h2 font-black tracking-tight text-white mt-1">
            Quarry Dispatch & Weighbridge Dock
          </h1>
          <p className="text-body-sm text-primary-200/80 mt-1 max-w-xl">
            Live truck arrival check-in, hopper loading allocation, manual weighbridge net weight verification, and exit clearance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadQueue}
            className="border-primary-700 bg-primary-900 text-white hover:bg-primary-800"
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh Dock
          </Button>
        </div>
      </div>

      {/* Queue Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-neutral-100 rounded-2xl">
        {[
          { id: 'AT_QUARRY', label: 'At Quarry Queue', count: queue.atQuarry.length, color: 'text-amber-800' },
          { id: 'LOADING', label: 'Loading in Progress', count: queue.loading.length, color: 'text-blue-800' },
          { id: 'LOADED', label: 'Loaded / Weighbridge Ready', count: queue.loaded.length, color: 'text-emerald-800' },
          { id: 'SCHEDULED', label: 'Scheduled Ahead', count: queue.scheduled.length, color: 'text-neutral-600' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as QuarryTab)}
            className={cn(
              'flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-caption font-bold transition-all',
              activeTab === tab.id
                ? 'bg-white text-primary-950 shadow-sm border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            <span>{tab.label}</span>
            <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-neutral-100', tab.color)}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Active Dock Queue Table */}
      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Trip #</th>
                <th className="py-3 px-4">Truck & Driver</th>
                <th className="py-3 px-4">Material Specification</th>
                <th className="py-3 px-4 font-mono">Planned (T)</th>
                <th className="py-3 px-4">Destination Site</th>
                <th className="py-3 px-4">Arrival / Status</th>
                <th className="py-3 px-4 text-right">Loading Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-caption text-neutral-400 font-mono">
                    Loading quarry dock queue...
                  </td>
                </tr>
              ) : currentList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-body-sm text-neutral-500">
                    No trucks currently in this stage.
                  </td>
                </tr>
              ) : (
                currentList.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary-800">
                      {t.tripNumber}
                      <span className="text-[11px] text-neutral-400 block font-sans">
                        Trip {t.tripIndex} of {t.totalTripsInOrder}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-neutral-900">
                        {t.truckRegistration || 'KJA-104-XA'}
                      </div>
                      <div className="text-caption text-neutral-500">
                        {t.driverName || 'Ibrahim Musa'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-neutral-900">
                      {t.materialName || 'Granite 3/4" Aggregate'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                      {t.plannedQuantityTonnes} T
                    </td>
                    <td className="py-3.5 px-4 text-caption text-neutral-700 max-w-[200px] truncate">
                      {t.destinationName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase',
                          t.status === 'LOADED' && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                          t.status === 'LOADING' && 'bg-blue-50 text-blue-800 border border-blue-200',
                          t.status === 'AT_QUARRY' && 'bg-amber-50 text-amber-800 border border-amber-200',
                          t.status === 'SCHEDULED' && 'bg-neutral-100 text-neutral-700'
                        )}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {t.status === 'SCHEDULED' ? (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleCheckin(t.id)}
                          leftIcon={<Clock className="h-3.5 w-3.5" />}
                        >
                          Check In Truck
                        </Button>
                      ) : t.status === 'AT_QUARRY' || t.status === 'LOADING' ? (
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => openWeighbridgeCapture(t)}
                          leftIcon={<Scale className="h-3.5 w-3.5" />}
                          className="font-bold shadow-2xs"
                        >
                          Capture Weighbridge
                        </Button>
                      ) : (
                        <span className="text-caption font-mono text-emerald-800 font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {t.weighbridge?.netWeightTonnes} T Verified
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Weighbridge Capture Modal */}
      {isWeighbridgeModalOpen && selectedTrip && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 my-6">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-900 text-white flex items-center justify-center font-bold">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-body font-bold text-neutral-950">
                    Weighbridge Ticket & Loading Capture
                  </h3>
                  <p className="text-caption text-neutral-500 font-mono">
                    {selectedTrip.tripNumber} · {selectedTrip.truckRegistration}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWeighbridgeModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWeighbridgeSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Weighbridge Ticket # *"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  required
                />
                <Input
                  label="Quarry Loading Ticket #"
                  value={loadingTicket}
                  onChange={(e) => setLoadingTicket(e.target.value)}
                />
              </div>

              {/* Weight Inputs & Live Calculation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-caption font-bold text-neutral-700 mb-1">
                    Gross Weight (Tonnes) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(e.target.value)}
                    required
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-mono text-body-sm font-bold focus:ring-2 focus:ring-primary-800"
                  />
                  <span className="text-[11px] text-neutral-400">Loaded Truck + Cargo</span>
                </div>

                <div>
                  <label className="block text-caption font-bold text-neutral-700 mb-1">
                    Tare Weight (Tonnes) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={tareWeight}
                    onChange={(e) => setTareWeight(e.target.value)}
                    required
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-mono text-body-sm font-bold focus:ring-2 focus:ring-primary-800"
                  />
                  <span className="text-[11px] text-neutral-400">Empty Truck Weight</span>
                </div>
              </div>

              {/* Calculated Net Weight Result Box */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-emerald-800">
                    Net Weight (Gross - Tare)
                  </span>
                  <span className="text-h3 font-black text-emerald-950">
                    {netCalc.netWeightTonnes.toFixed(2)} Tonnes
                  </span>
                </div>
                <div className="flex items-center justify-between text-caption text-emerald-800 pt-1 border-t border-emerald-200">
                  <span>Planned: {selectedTrip.plannedQuantityTonnes} T</span>
                  <span className={cn('font-bold', varCalc.varianceTonnes >= 0 ? 'text-emerald-800' : 'text-amber-800')}>
                    Variance: {varCalc.varianceTonnes > 0 ? `+${varCalc.varianceTonnes}` : varCalc.varianceTonnes} T ({varCalc.variancePercent}%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-caption font-bold text-neutral-700 mb-1">
                    Loading Bay
                  </label>
                  <select
                    value={loadingBay}
                    onChange={(e) => setLoadingBay(e.target.value)}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-body-sm"
                  >
                    <option value="BAY-01">BAY-01 (Primary Hopper)</option>
                    <option value="BAY-02">BAY-02 (Secondary Bay)</option>
                    <option value="BAY-03">BAY-03 (Granite Dust Bay)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-caption font-bold text-neutral-700 mb-1">
                    Ticket Slip (Optional)
                  </label>
                  <div className="p-2 border border-dashed border-neutral-300 rounded-xl text-center bg-neutral-50 text-caption font-semibold text-primary-800 cursor-pointer">
                    Upload Scan
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-caption font-bold text-neutral-700 mb-1">
                  Loading Officer Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full h-16 p-2.5 border border-neutral-300 rounded-xl text-caption"
                />
              </div>

              <div className="p-4 bg-neutral-50 -mx-6 -mb-6 border-t border-neutral-200 flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setIsWeighbridgeModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="font-bold"
                >
                  Verify & Mark Loaded
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
