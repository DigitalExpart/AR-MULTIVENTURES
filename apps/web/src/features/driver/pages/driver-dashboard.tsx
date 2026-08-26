import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Navigation,
  FileCheck
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { deliveryApi, fleetApi } from '@ar-multiventures/api';
import type { DeliveryTripRecord, DriverRecord } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

export function DriverDashboardPage() {
  const [driver, setDriver] = useState<DriverRecord | null>(null);
  const [trips, setTrips] = useState<DeliveryTripRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDriverData() {
      setIsLoading(true);
      try {
        const [d, tList] = await Promise.all([
          fleetApi.getDriverById('drv-01'),
          deliveryApi.getDriverTrips('drv-01'),
        ]);
        setDriver(d);
        setTrips(tList);
      } catch (err) {
        console.error('Failed to load driver dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDriverData();
  }, []);

  const activeTrip = trips.find((t) =>
    ['ASSIGNED', 'SCHEDULED', 'AT_QUARRY', 'LOADING', 'LOADED', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED'].includes(t.status)
  ) || trips[0];

  const completedTrips = trips.filter((t) => t.status === 'DELIVERED' || t.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-20">
      {/* Mobile Top App Bar */}
      <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-800 text-white flex items-center justify-center font-black">
            ARM
          </div>
          <div>
            <h1 className="text-body font-black tracking-tight text-white">
              Driver Portal
            </h1>
            <p className="text-caption text-neutral-400 font-mono">
              {driver ? `${driver.firstName} ${driver.lastName}` : 'Driver Portal'} · {driver?.assignedTruckRegistration || 'KJA-104-XA'}
            </p>
          </div>
        </div>
        <div className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-700 text-emerald-400 rounded-full text-[11px] font-mono font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          ON DUTY
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-5">
        {/* Active Trip Hero Card */}
        {activeTrip ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase font-bold text-primary-400">
              <span>Current Assigned Mission</span>
              <span className="text-neutral-400">{activeTrip.tripNumber}</span>
            </div>

            <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-primary-950 border border-primary-600 text-primary-300">
                    {activeTrip.status.replace('_', ' ')}
                  </span>
                  <h2 className="text-h3 font-black text-white mt-2">
                    {activeTrip.plannedQuantityTonnes} Tonnes Granite
                  </h2>
                  <p className="text-caption text-neutral-400">
                    {activeTrip.materialName || 'Aggregate'}
                  </p>
                </div>
              </div>

              {/* Waypoints */}
              <div className="space-y-3 pt-2 border-t border-neutral-700/80 text-body-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-900/80 text-primary-300 flex items-center justify-center text-caption shrink-0 mt-0.5 font-bold">
                    A
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-neutral-400 block font-bold">
                      Quarry Pickup
                    </span>
                    <span className="font-bold text-white text-body-sm">
                      {activeTrip.quarryName || 'Abeokuta Quarry'}
                    </span>
                  </div>
                </div>

                <div className="w-0.5 h-4 bg-neutral-700 ml-3"></div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-900/80 text-emerald-300 flex items-center justify-center text-caption shrink-0 mt-0.5 font-bold">
                    B
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-neutral-400 block font-bold">
                      Destination Site
                    </span>
                    <span className="font-bold text-white text-body-sm">
                      {activeTrip.destinationName || 'Lekki Site'}
                    </span>
                    <p className="text-caption text-neutral-400 mt-0.5">
                      {activeTrip.destinationAddress || 'Lekki Free Trade Zone, Lagos'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Big Action CTA */}
              <Link to={`/driver/trips/${activeTrip.id}`} className="block pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full font-black text-body justify-center py-4 bg-primary-800 hover:bg-primary-700 shadow-lg text-white"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Open Trip Controls & POD
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-neutral-800 rounded-2xl border border-neutral-700 space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-white">All Trips Completed</h3>
            <p className="text-caption text-neutral-400">
              No pending trips currently assigned. Check back with dispatch.
            </p>
          </div>
        )}

        {/* Quick Driver Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-neutral-800/80 border border-neutral-700 rounded-xl">
            <span className="text-[11px] font-mono uppercase text-neutral-400">Assigned Truck</span>
            <div className="text-body font-mono font-black text-white mt-1">
              {driver?.assignedTruckRegistration || 'KJA-104-XA'}
            </div>
            <span className="text-[10px] text-neutral-500 font-sans">30T Tipper</span>
          </div>

          <div className="p-4 bg-neutral-800/80 border border-neutral-700 rounded-xl">
            <span className="text-[11px] font-mono uppercase text-neutral-400">Delivered Trips</span>
            <div className="text-body font-mono font-black text-emerald-400 mt-1">
              {completedTrips.length} Trips
            </div>
            <span className="text-[10px] text-neutral-500 font-sans">Verified with POD</span>
          </div>
        </div>

        {/* Recent Driver History */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-body-sm font-bold text-white">
            <span>Trip History</span>
            <Link to="/driver/trips" className="text-caption text-primary-400 hover:underline">
              View All ({trips.length})
            </Link>
          </div>

          <div className="space-y-2">
            {trips.slice(0, 3).map((t) => (
              <Link
                key={t.id}
                to={`/driver/trips/${t.id}`}
                className="p-3.5 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 rounded-xl flex items-center justify-between transition-colors block"
              >
                <div>
                  <div className="font-mono font-bold text-primary-300 text-body-sm">
                    {t.tripNumber}
                  </div>
                  <div className="text-caption text-neutral-400 truncate max-w-[200px]">
                    {t.destinationName}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase',
                      t.status === 'DELIVERED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                        : 'bg-primary-950 text-primary-300 border border-primary-700'
                    )}
                  >
                    {t.status}
                  </span>
                  <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                    {t.plannedQuantityTonnes} T
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
