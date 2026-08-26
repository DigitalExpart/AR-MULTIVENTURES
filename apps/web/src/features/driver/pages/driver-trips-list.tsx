import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Navigation, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { deliveryApi } from '@ar-multiventures/api';
import type { DeliveryTripRecord } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

export function DriverTripsListPage() {
  const [trips, setTrips] = useState<DeliveryTripRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTrips() {
      setIsLoading(true);
      try {
        const data = await deliveryApi.getDriverTrips('drv-01');
        setTrips(data);
      } catch (err) {
        console.error('Failed to load trips:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTrips();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-16">
      <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link to="/driver" className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-body font-black text-white">Assigned Trips Log</h1>
            <p className="text-caption text-neutral-400 font-mono">Driver Musa Ibrahim</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-caption text-neutral-400">Loading trips...</div>
        ) : trips.length === 0 ? (
          <div className="p-8 text-center text-caption text-neutral-400">No trips found.</div>
        ) : (
          trips.map((t) => (
            <Link
              key={t.id}
              to={`/driver/trips/${t.id}`}
              className="p-4 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 rounded-xl block transition-all shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-primary-400 text-body-sm">{t.tripNumber}</span>
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase',
                    t.status === 'DELIVERED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                      : 'bg-primary-950 text-primary-300 border border-primary-700'
                  )}
                >
                  {t.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-body-sm">{t.destinationName}</h3>
                <p className="text-caption text-neutral-400 mt-0.5">
                  {t.materialName} · {t.plannedQuantityTonnes} Tonnes
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-700/80 flex items-center justify-between text-caption text-neutral-400">
                <span>Quarry: {t.quarryName}</span>
                <span className="flex items-center gap-1 font-bold text-primary-400">
                  Open Controls <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
