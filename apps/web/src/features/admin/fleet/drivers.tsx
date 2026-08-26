import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Truck,
  FileCheck
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { fleetApi } from '@ar-multiventures/api';
import type { DriverRecord, DriverAvailabilityStatus } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

export function AdminFleetDriversPage() {
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // New Driver Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+234 ');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('CLASS_E (Articulated Heavy Commercial)');
  const [licenseExpiry, setLicenseExpiry] = useState('2028-12-31');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      const data = await fleetApi.getDrivers();
      setDrivers(data);
    } catch (err) {
      console.error('Failed to load drivers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !licenseNumber.trim()) return;

    setIsSubmitting(true);
    try {
      await fleetApi.saveDriver({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        licenseNumber: licenseNumber.trim().toUpperCase(),
        licenseCategory,
        licenseExpiry,
        address: address.trim() || undefined,
        availabilityStatus: 'AVAILABLE',
        isActive: true,
      });

      setIsModalOpen(false);
      setFirstName('');
      setLastName('');
      setLicenseNumber('');
      await loadDrivers();
    } catch (err: any) {
      alert(err.message || 'Failed to save driver');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDrivers = drivers.filter((d) => {
    if (statusFilter !== 'ALL' && d.availabilityStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.firstName.toLowerCase().includes(q) ||
        d.lastName.toLowerCase().includes(q) ||
        d.licenseNumber.toLowerCase().includes(q) ||
        d.phoneNumber.includes(q) ||
        d.assignedTruckRegistration?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Heavy Haulage Drivers Roster"
          description="Manage certified articulated truck drivers, license categories, FRSC expirations, truck assignments, and duty status."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Fleet', href: '/admin/fleet/trucks' },
            { label: 'Drivers' },
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
            Register Certified Driver
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Drivers' },
            { id: 'AVAILABLE', label: 'Available on Duty' },
            { id: 'ASSIGNED_TO_TRIP', label: 'Assigned to Trip' },
            { id: 'ON_LEAVE', label: 'On Leave' },
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
            placeholder="Search driver, license, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-body-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-800"
          />
        </div>
      </div>

      {/* Driver Roster Table */}
      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Driver Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">License Number</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">License Expiry</th>
                <th className="py-3 px-4">Assigned Truck</th>
                <th className="py-3 px-4">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-caption text-neutral-400 font-mono">
                    Loading drivers roster...
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-body-sm text-neutral-500">
                    No drivers match current filter.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((drv) => (
                  <tr key={drv.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-neutral-900">
                      {drv.firstName} {drv.lastName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-caption text-neutral-700">
                      {drv.phoneNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-primary-800">
                      {drv.licenseNumber}
                    </td>
                    <td className="py-3.5 px-4 text-caption text-neutral-600">
                      {drv.licenseCategory}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-caption text-neutral-700">
                      {drv.licenseExpiry}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                      {drv.assignedTruckRegistration ? (
                        <span className="flex items-center gap-1.5">
                          <Truck className="h-3.5 w-3.5 text-primary-800" />
                          {drv.assignedTruckRegistration}
                        </span>
                      ) : (
                        <span className="text-neutral-400 font-sans font-normal">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase',
                          drv.availabilityStatus === 'AVAILABLE' && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                          drv.availabilityStatus === 'ASSIGNED_TO_TRIP' && 'bg-blue-50 text-blue-800 border border-blue-200',
                          drv.availabilityStatus === 'ON_LEAVE' && 'bg-amber-50 text-amber-800 border border-amber-200'
                        )}
                      >
                        {drv.availabilityStatus.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Driver Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 my-6">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-900 text-white flex items-center justify-center font-bold">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-body font-bold text-neutral-950">Register Certified Driver</h3>
                  <p className="text-caption text-neutral-500">Add heavy truck operator to roster</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDriver} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name *" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                <Input label="Last Name *" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input label="Phone Number *" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                <Input
                  label="FRSC Driver License # *"
                  placeholder="e.g. FRSC-LA-992144"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-caption font-bold text-neutral-700 mb-1">
                    License Category *
                  </label>
                  <select
                    value={licenseCategory}
                    onChange={(e) => setLicenseCategory(e.target.value)}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-body-sm"
                  >
                    <option value="CLASS_E (Articulated Heavy Commercial)">CLASS_E (Articulated Heavy Commercial)</option>
                    <option value="CLASS_D (Truck / Commercial)">CLASS_D (Truck / Commercial)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-caption font-bold text-neutral-700 mb-1">
                    License Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                    required
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-body-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-caption font-bold text-neutral-700 mb-1">
                  Residential Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 14 Quarry Road, Abeokuta"
                  className="w-full h-16 p-2.5 border border-neutral-300 rounded-xl text-caption"
                />
              </div>

              <div className="p-4 bg-neutral-50 -mx-6 -mb-6 border-t border-neutral-200 flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting} className="font-bold">
                  Save Driver
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
