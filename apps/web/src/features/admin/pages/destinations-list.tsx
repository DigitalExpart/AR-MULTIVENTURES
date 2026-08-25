import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, MapPinned, Truck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { adminApi } from '@ar-multiventures/api';

export function AdminDestinationsListPage() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const list = await adminApi.getDestinations();
        setDestinations(list);
      } catch (err) {
        console.error('Failed to load destinations:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Delivery Destinations & Zones"
        description="Standardized logistics delivery corridors and approved construction sites across Lagos and South-West Nigeria."
        breadcrumbs={[{ label: 'Admin Command', href: '/admin' }, { label: 'Destinations' }]}
        action={
          <div className="flex items-center gap-3">
            <Link to="/admin/destination-requests">
              <Button variant="outline" size="sm" leftIcon={<MapPinned className="h-4 w-4" />}>
                Review Site Requests
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-body-sm text-neutral-400">
            Loading delivery destinations...
          </div>
        ) : (
          destinations.map((d) => (
            <Card key={d.id} padding="md" className="bg-white border-neutral-200 shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center border border-primary-200">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-950 text-body-sm leading-tight">{d.name}</h4>
                    <span className="font-mono text-caption text-neutral-500">{d.code}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {d.state}
                </span>
              </div>

              <p className="text-caption text-neutral-600 line-clamp-2">
                {d.addressDescription}
              </p>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-caption">
                <span className="text-neutral-500 flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-neutral-400" /> Active Haulage Tariffs
                </span>
                <span className="font-mono font-bold text-primary-800">
                  {d.activeTariffsCount} Routes Mapped
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
