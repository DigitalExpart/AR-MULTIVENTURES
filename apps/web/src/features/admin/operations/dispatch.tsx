import { useState, useEffect } from 'react';
import {
  Truck,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Building2,
  Calendar,
  FileCheck,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { deliveryApi, fleetApi, requisitionApi } from '@ar-multiventures/api';
import type {
  DeliveryTripRecord,
  TruckRecord,
  DriverRecord,
  TripStatus,
  Requisition
} from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

type DispatchFilterTab = 'ALL' | 'UNASSIGNED' | 'QUARRY_QUEUE' | 'READY_DISPATCH' | 'IN_TRANSIT' | 'DELIVERED';

export function AdminOperationsDispatchPage() {
  const [trips, setTrips] = useState<DeliveryTripRecord[]>([]);
  const [trucks, setTrucks] = useState<TruckRecord[]>([]);
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [activeTab, setActiveTab] = useState<DispatchFilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Assignment Modal State
  const [selectedTrip, setSelectedTrip] = useState<DeliveryTripRecord | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTruckId, setSelectedTruckId] = useState('trk-01');
  const [selectedDriverId, setSelectedDriverId] = useState('drv-01');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Requisition Multi-Trip Creation Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [reqIdInput, setReqIdInput] = useState('req-01');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tList, trkList, drvList] = await Promise.all([
        deliveryApi.getTrips(),
        fleetApi.getTrucks(),
        fleetApi.getDrivers(),
      ]);
      setTrips(tList);
      setTrucks(trkList);
      setDrivers(drvList);
    } catch (err) {
      console.error('Failed to load dispatch operations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAssignModal = (trip: DeliveryTripRecord) => {
    setSelectedTrip(trip);
    setSelectedTruckId(trip.truckId || trucks.find((t) => t.maintenanceStatus === 'OPERATIONAL')?.id || 'trk-01');
    setSelectedDriverId(trip.driverId || drivers.find((d) => d.availabilityStatus === 'AVAILABLE')?.id || 'drv-01');
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) return;

    setIsSubmitting(true);
    try {
      await deliveryApi.assignTrip({
        tripId: selectedTrip.id,
        truckId: selectedTruckId,
        driverId: selectedDriverId,
        scheduledDate,
        notes: assignmentNotes.trim() || undefined,
      });

      setIsAssignModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Assignment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispatch = async (tripId: string) => {
    try {
      await deliveryApi.dispatchTrip(tripId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Dispatch failed');
    }
  };

  const handleScheduleOrderTrips = async () => {
    setIsSubmitting(true);
    try {
      await deliveryApi.scheduleRequisitionTrips(reqIdInput, [30, 30, 30, 30, 30]);
      setIsScheduleModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Scheduling failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTrips = trips.filter((t) => {
    if (activeTab === 'UNASSIGNED' && t.status !== 'PLANNED') return false;
    if (activeTab === 'QUARRY_QUEUE' && t.status !== 'AT_QUARRY' && t.status !== 'LOADING') return false;
    if (activeTab === 'READY_DISPATCH' && t.status !== 'LOADED') return false;
    if (activeTab === 'IN_TRANSIT' && t.status !== 'IN_TRANSIT' && t.status !== 'DISPATCHED') return false;
    if (activeTab === 'DELIVERED' && t.status !== 'DELIVERED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.tripNumber.toLowerCase().includes(q) ||
        t.customerName?.toLowerCase().includes(q) ||
        t.truckRegistration?.toLowerCase().includes(q) ||
        t.driverName?.toLowerCase().includes(q) ||
        t.destinationName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Fleet Dispatch & Trip Command Center"
          description="Schedule multi-trip orders, assign operational trucks and licensed drivers, monitor weighbridge clearances, and execute departures."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Operations', href: '/admin/operations' },
            { label: 'Dispatch' },
          ]}
        />

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsScheduleModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
            className="font-bold shadow-2xs"
          >
            Schedule Requisition Trips
          </Button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Trips', count: trips.length },
            { id: 'UNASSIGNED', label: 'Unassigned', count: trips.filter((t) => t.status === 'PLANNED').length },
            { id: 'QUARRY_QUEUE', label: 'At Quarry / Loading', count: trips.filter((t) => t.status === 'AT_QUARRY' || t.status === 'LOADING').length },
            { id: 'READY_DISPATCH', label: 'Ready to Dispatch', count: trips.filter((t) => t.status === 'LOADED').length },
            { id: 'IN_TRANSIT', label: 'In Transit', count: trips.filter((t) => t.status === 'IN_TRANSIT' || t.status === 'DISPATCHED').length },
            { id: 'DELIVERED', label: 'Delivered', count: trips.filter((t) => t.status === 'DELIVERED').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DispatchFilterTab)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-caption font-bold whitespace-nowrap transition-all flex items-center gap-1.5',
                activeTab === tab.id
                  ? 'bg-white text-primary-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 bg-neutral-100 text-neutral-700 rounded-full text-[10px] font-mono">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search trip #, truck, driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-body-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-800"
          />
        </div>
      </div>

      {/* Main Dispatch Operations Table */}
      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Trip #</th>
                <th className="py-3 px-4">Customer & Requisition</th>
                <th className="py-3 px-4">Assigned Truck</th>
                <th className="py-3 px-4">Assigned Driver</th>
                <th className="py-3 px-4 font-mono">Quantity (T)</th>
                <th className="py-3 px-4">Destination Site</th>
                <th className="py-3 px-4">Weighbridge</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Dispatch Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-caption text-neutral-400 font-mono">
                    Loading dispatch operations...
                  </td>
                </tr>
              ) : filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-body-sm text-neutral-500">
                    No trips match the active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary-800">
                      {t.tripNumber}
                      <span className="text-[11px] text-neutral-400 block font-sans">
                        Trip {t.tripIndex} of {t.totalTripsInOrder}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-neutral-900 truncate max-w-[170px]">
                        {t.customerName}
                      </div>
                      <div className="text-[11px] font-mono text-neutral-500">
                        {t.requisitionNumber}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {t.truckRegistration ? (
                        <span className="font-bold text-neutral-900">{t.truckRegistration}</span>
                      ) : (
                        <span className="text-amber-800 font-sans text-caption font-bold">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-caption">
                      {t.driverName ? (
                        <span className="font-medium text-neutral-900">{t.driverName}</span>
                      ) : (
                        <span className="text-neutral-400 font-mono">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                      {t.plannedQuantityTonnes} T
                    </td>
                    <td className="py-3.5 px-4 text-caption text-neutral-700 max-w-[180px] truncate">
                      {t.destinationName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-caption">
                      {t.weighbridge ? (
                        <span className="font-bold text-emerald-800">
                          {t.weighbridge.netWeightTonnes} T Net
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase',
                          t.status === 'DELIVERED' && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                          t.status === 'IN_TRANSIT' && 'bg-blue-50 text-blue-800 border border-blue-200',
                          t.status === 'LOADED' && 'bg-purple-50 text-purple-800 border border-purple-200',
                          t.status === 'LOADING' && 'bg-amber-50 text-amber-800 border border-amber-200',
                          t.status === 'AT_QUARRY' && 'bg-amber-50 text-amber-800 border border-amber-200',
                          t.status === 'ASSIGNED' && 'bg-neutral-100 text-neutral-800',
                          t.status === 'PLANNED' && 'bg-neutral-100 text-neutral-600'
                        )}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {t.status === 'PLANNED' || t.status === 'ASSIGNED' ? (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => openAssignModal(t)}
                            leftIcon={<Truck className="h-3.5 w-3.5" />}
                          >
                            {t.truckId ? 'Reassign' : 'Assign'}
                          </Button>
                        ) : null}

                        {t.status === 'LOADED' && (
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => handleDispatch(t.id)}
                            leftIcon={<Send className="h-3.5 w-3.5" />}
                            className="font-bold bg-emerald-800 hover:bg-emerald-700"
                          >
                            Dispatch
                          </Button>
                        )}

                        {t.status === 'DELIVERED' && t.pod && (
                          <span className="text-[11px] font-mono text-emerald-800 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> POD Signed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Truck & Driver Assignment Modal */}
      {isAssignModalOpen && selectedTrip && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 my-6">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-900 text-white flex items-center justify-center font-bold">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-body font-bold text-neutral-950">
                    Assign Truck & Driver to Mission
                  </h3>
                  <p className="text-caption text-neutral-500 font-mono">
                    {selectedTrip.tripNumber} · {selectedTrip.plannedQuantityTonnes} Tonnes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              {/* Trip Target Summary */}
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1 text-body-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Destination:</span>
                  <span className="font-bold text-neutral-900">{selectedTrip.destinationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Quarry:</span>
                  <span className="font-bold text-neutral-900">{selectedTrip.quarryName}</span>
                </div>
              </div>

              {/* Truck Selector */}
              <div>
                <label className="block text-caption font-bold text-neutral-700 mb-1">
                  Select Operational Truck *
                </label>
                <select
                  value={selectedTruckId}
                  onChange={(e) => setSelectedTruckId(e.target.value)}
                  required
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-body-sm font-mono focus:ring-2 focus:ring-primary-800"
                >
                  {trucks.map((trk) => (
                    <option
                      key={trk.id}
                      value={trk.id}
                      disabled={trk.maintenanceStatus !== 'OPERATIONAL' || !trk.isActive}
                    >
                      {trk.registrationNumber} — {trk.make} {trk.model} ({trk.capacityTonnes}T, {trk.ownershipType}) {trk.maintenanceStatus !== 'OPERATIONAL' ? `[${trk.maintenanceStatus}]` : ''}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-neutral-400">
                  Grounded or maintenance trucks are disabled
                </span>
              </div>

              {/* Driver Selector */}
              <div>
                <label className="block text-caption font-bold text-neutral-700 mb-1">
                  Select Available Driver *
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  required
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-body-sm focus:ring-2 focus:ring-primary-800"
                >
                  {drivers.map((drv) => (
                    <option
                      key={drv.id}
                      value={drv.id}
                      disabled={drv.availabilityStatus === 'ON_LEAVE' || drv.availabilityStatus === 'SUSPENDED'}
                    >
                      {drv.firstName} {drv.lastName} — {drv.licenseCategory} (Exp: {drv.licenseExpiry}) [{drv.availabilityStatus}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-caption font-bold text-neutral-700 mb-1">
                  Scheduled Dispatch Date *
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-body-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-caption font-bold text-neutral-700 mb-1">
                  Dispatcher Special Instructions (Optional)
                </label>
                <textarea
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  placeholder="e.g. Offload at Site Gate 2, contact receiver upon arrival."
                  className="w-full h-16 p-2.5 border border-neutral-300 rounded-xl text-caption"
                />
              </div>

              <div className="p-4 bg-neutral-50 -mx-6 -mb-6 border-t border-neutral-200 flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="font-bold"
                >
                  Confirm Mission Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Order Trips Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-body font-bold text-neutral-950">Schedule Multi-Trip Order</h3>
              <button onClick={() => setIsScheduleModalOpen(false)}>✕</button>
            </div>

            <div className="space-y-3 text-body-sm">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-relaxed font-mono">
                <ShieldCheck className="h-4 w-4 text-emerald-800 mb-1" />
                <strong>Financial Clearance Verified:</strong> Order REQ-2026-000041 (150T) is fully cleared for logistics dispatch.
              </div>
              <p className="text-caption text-neutral-600">
                This action will automatically generate 5 distinct 30 Tonne delivery trips in the dispatch pipeline.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
              <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleScheduleOrderTrips}
                isLoading={isSubmitting}
                className="font-bold"
              >
                Generate 5x 30T Trips
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
