import { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { fleetApi } from '@ar-multiventures/api';
import type { TruckRecord, TruckOwnershipType, TruckMaintenanceStatus } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

export function AdminFleetTrucksPage() {
  const [trucks, setTrucks] = useState<TruckRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // New Truck Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [regNumber, setRegNumber] = useState('');
  const [make, setMake] = useState('Mack');
  const [model, setModel] = useState('Granite 400');
  const [capacity, setCapacity] = useState('30.00');
  const [ownership, setOwnership] = useState<TruckOwnershipType>('COMPANY');
  const [contractorName, setContractorName] = useState('');
  const [insuranceExpiry, setInsuranceExpiry] = useState('2027-06-30');
  const [roadworthinessExpiry, setRoadworthinessExpiry] = useState('2027-05-31');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTrucks = async () => {
    setIsLoading(true);
    try {
      const data = await fleetApi.getTrucks();
      setTrucks(data);
    } catch (err) {
      console.error('Failed to load trucks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrucks();
  }, []);

  const handleSaveTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber.trim()) return;

    setIsSubmitting(true);
    try {
      await fleetApi.saveTruck({
        registrationNumber: regNumber.trim().toUpperCase(),
        make: make.trim(),
        model: model.trim(),
        capacityTonnes: Number(capacity) || 30.00,
        ownershipType: ownership,
        contractorName: ownership === 'CONTRACTOR' ? contractorName.trim() : undefined,
        insuranceExpiry,
        roadworthinessExpiry,
        notes: notes.trim() || undefined,
        isActive: true,
        maintenanceStatus: 'OPERATIONAL',
      });

      setIsModalOpen(false);
      setRegNumber('');
      await loadTrucks();
    } catch (err: any) {
      alert(err.message || 'Failed to save truck');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTrucks = trucks.filter((t) => {
    if (statusFilter !== 'ALL' && t.maintenanceStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.registrationNumber.toLowerCase().includes(q) ||
        t.make.toLowerCase().includes(q) ||
        t.model.toLowerCase().includes(q) ||
        t.contractorName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Heavy Fleet & Truck Registry"
          description="Manage company tippers, contractor fleets, capacity ratings, maintenance statuses, and critical document expiries."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Fleet', href: '/admin/fleet/trucks' },
            { label: 'Trucks' },
          ]}
        />

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
            className="font-bold shadow-2xs"
          >
            Register New Truck
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Fleet' },
            { id: 'OPERATIONAL', label: 'Operational' },
            { id: 'DUE_FOR_SERVICE', label: 'Due for Service' },
            { id: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-caption font-bold transition-all',
                statusFilter === tab.id
                  ? 'bg-white text-primary-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search plate #, make, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-body-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-800"
          />
        </div>
      </div>

      {/* Main Trucks Table */}
      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Registration #</th>
                <th className="py-3 px-4">Make & Model</th>
                <th className="py-3 px-4">Ownership</th>
                <th className="py-3 px-4 font-mono">Capacity (T)</th>
                <th className="py-3 px-4">Assigned Driver</th>
                <th className="py-3 px-4">Insurance Expiry</th>
                <th className="py-3 px-4">Roadworthiness</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-caption text-neutral-400 font-mono">
                    Loading fleet database...
                  </td>
                </tr>
              ) : filteredTrucks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-body-sm text-neutral-500">
                    No trucks match selected filter.
                  </td>
                </tr>
              ) : (
                filteredTrucks.map((trk) => (
                  <tr key={trk.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary-800">
                      {trk.registrationNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-neutral-900">{trk.make} {trk.model}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">Year {trk.yearOfManufacture || 2022}</div>
                    </td>
                    <td className="py-3.5 px-4 text-caption">
                      <span className="font-semibold uppercase text-neutral-700 font-mono">
                        {trk.ownershipType}
                      </span>
                      {trk.contractorName && (
                        <div className="text-[11px] text-neutral-500 truncate max-w-[150px]">
                          {trk.contractorName}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                      {trk.capacityTonnes} Tonnes
                    </td>
                    <td className="py-3.5 px-4 text-caption text-neutral-700 font-medium">
                      {trk.currentDriverName || <span className="text-neutral-400 font-mono">Unassigned</span>}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-caption text-neutral-700">
                      {trk.insuranceExpiry || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-caption text-neutral-700">
                      {trk.roadworthinessExpiry || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase',
                          trk.maintenanceStatus === 'OPERATIONAL' && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                          trk.maintenanceStatus === 'DUE_FOR_SERVICE' && 'bg-amber-50 text-amber-800 border border-amber-200',
                          trk.maintenanceStatus === 'UNDER_MAINTENANCE' && 'bg-red-50 text-red-700 border border-red-200'
                        )}
                      >
                        {trk.maintenanceStatus.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Truck Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 my-6">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-900 text-white flex items-center justify-center font-bold">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-body font-bold text-neutral-950">Register New Fleet Truck</h3>
                  <p className="text-caption text-neutral-500">Heavy aggregate haulage asset registration</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTruck} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Plate Registration Number *"
                  placeholder="e.g. KJA-902-YZ"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-caption font-bold text-neutral-700 mb-1">
                    Ownership Type *
                  </label>
                  <select
                    value={ownership}
                    onChange={(e) => setOwnership(e.target.value as TruckOwnershipType)}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-body-sm"
                  >
                    <option value="COMPANY">Company Owned</option>
                    <option value="CONTRACTOR">Contractor Leased</option>
                    <option value="THIRD_PARTY">Third Party Logistics</option>
                  </select>
                </div>
              </div>

              {ownership === 'CONTRACTOR' && (
                <Input
                  label="Contractor / Leasing Entity *"
                  placeholder="e.g. Apex Haulage Nigeria Ltd"
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  required
                />
              )}

              <div className="grid grid-cols-3 gap-3">
                <Input label="Make *" value={make} onChange={(e) => setMake(e.target.value)} required />
                <Input label="Model *" value={model} onChange={(e) => setModel(e.target.value)} required />
                <Input label="Capacity (Tonnes) *" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-caption font-bold text-neutral-700 mb-1">
                    Insurance Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={insuranceExpiry}
                    onChange={(e) => setInsuranceExpiry(e.target.value)}
                    required
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-body-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-caption font-bold text-neutral-700 mb-1">
                    Roadworthiness Expiry *
                  </label>
                  <input
                    type="date"
                    value={roadworthinessExpiry}
                    onChange={(e) => setRoadworthinessExpiry(e.target.value)}
                    required
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-body-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-caption font-bold text-neutral-700 mb-1">
                  Asset Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-16 p-2.5 border border-neutral-300 rounded-xl text-caption"
                />
              </div>

              <div className="p-4 bg-neutral-50 -mx-6 -mb-6 border-t border-neutral-200 flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting} className="font-bold">
                  Save Truck to Fleet
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
