import { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { fleetApi } from '@ar-multiventures/api';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import type { TruckMaintenanceRecord, TruckRecord } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

export function AdminFleetMaintenancePage() {
  const [records, setRecords] = useState<TruckMaintenanceRecord[]>([]);
  const [trucks, setTrucks] = useState<TruckRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [truckId, setTruckId] = useState('trk-01');
  const [maintenanceType, setMaintenanceType] = useState('ROUTINE_SERVICE');
  const [description, setDescription] = useState('');
  const [serviceProvider, setServiceProvider] = useState('AR Central Fleet Workshop');
  const [cost, setCost] = useState('150000');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'>('COMPLETED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recList, trkList] = await Promise.all([
        fleetApi.getTruckMaintenanceRecords(),
        fleetApi.getTrucks(),
      ]);
      setRecords(recList);
      setTrucks(trkList);
    } catch (err) {
      console.error('Failed to load maintenance records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      await fleetApi.saveMaintenanceRecord({
        truckId,
        maintenanceType,
        description: description.trim(),
        serviceProvider: serviceProvider.trim(),
        cost: Number(cost) || 0,
        serviceDate,
        status,
      });

      setIsModalOpen(false);
      setDescription('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save maintenance record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTruckPlate = (id: string) => {
    return trucks.find((t) => t.id === id)?.registrationNumber || 'KJA-104-XA';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Fleet Maintenance & Service Logs"
          description="Log preventive maintenance, tire replacements, hydraulic repairs, and engine overhauls to preserve road safety and asset uptime."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Fleet', href: '/admin/fleet/trucks' },
            { label: 'Maintenance' },
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
            Record Maintenance Service
          </Button>
        </div>
      </div>

      {/* Maintenance Records Table */}
      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Service Date</th>
                <th className="py-3 px-4">Truck Plate</th>
                <th className="py-3 px-4">Maintenance Type</th>
                <th className="py-3 px-4">Work Performed</th>
                <th className="py-3 px-4">Service Provider</th>
                <th className="py-3 px-4 font-mono text-right">Cost (₦)</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-caption text-neutral-400 font-mono">
                    Loading maintenance logs...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-body-sm text-neutral-500">
                    No maintenance records logged.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-caption text-neutral-600">
                      {formatDate(r.serviceDate)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-primary-800">
                      {getTruckPlate(r.truckId)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-neutral-100 text-neutral-800">
                        {r.maintenanceType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-900 font-medium max-w-sm">
                      {r.description}
                    </td>
                    <td className="py-3.5 px-4 text-caption text-neutral-600">
                      {r.serviceProvider || 'AR Workshop'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900 text-right">
                      {formatNaira(r.cost)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase',
                          r.status === 'COMPLETED' && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                          r.status === 'IN_PROGRESS' && 'bg-amber-50 text-amber-800 border border-amber-200',
                          r.status === 'SCHEDULED' && 'bg-neutral-100 text-neutral-700'
                        )}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Maintenance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 my-6">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-900 text-white flex items-center justify-center font-bold">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-body font-bold text-neutral-950">Record Fleet Maintenance</h3>
                  <p className="text-caption text-neutral-500">Log repair or scheduled servicing</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-caption font-bold text-neutral-700 mb-1">
                    Select Truck *
                  </label>
                  <select
                    value={truckId}
                    onChange={(e) => setTruckId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-body-sm font-mono"
                  >
                    {trucks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.registrationNumber} ({t.make} {t.model})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-caption font-bold text-neutral-700 mb-1">
                    Maintenance Category *
                  </label>
                  <select
                    value={maintenanceType}
                    onChange={(e) => setMaintenanceType(e.target.value)}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-body-sm"
                  >
                    <option value="ROUTINE_SERVICE">Routine Periodic Service</option>
                    <option value="TIRE_REPLACEMENT">Tire Replacement (Heavy Load)</option>
                    <option value="BRAKE_SYSTEM">Brake System Overhaul</option>
                    <option value="HYDRAULIC_HOIST">Hydraulic Hoist Servicing</option>
                    <option value="ENGINE_OVERHAUL">Engine & Transmission Overhaul</option>
                    <option value="ELECTRICAL">Auto-Electrical System</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-caption font-bold text-neutral-700 mb-1">
                  Description of Work Performed *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Changed primary and secondary fuel filters, 15W40 heavy diesel engine oil, and greased all chassis points."
                  required
                  className="w-full h-20 p-2.5 border border-neutral-300 rounded-xl text-caption"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Service Provider / Workshop *"
                  value={serviceProvider}
                  onChange={(e) => setServiceProvider(e.target.value)}
                  required
                />
                <Input
                  label="Total Cost (₦) *"
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-caption font-bold text-neutral-700 mb-1">
                    Service Date *
                  </label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-body-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-caption font-bold text-neutral-700 mb-1">
                    Service Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-body-sm"
                  >
                    <option value="COMPLETED">Completed & Cleared</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="SCHEDULED">Scheduled</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 -mx-6 -mb-6 border-t border-neutral-200 flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting} className="font-bold">
                  Save Maintenance Log
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
