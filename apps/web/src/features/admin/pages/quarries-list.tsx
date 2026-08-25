import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mountain, Plus, Eye, CheckCircle2, XCircle, MapPin, Gauge } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { adminApi } from '@ar-multiventures/api';
import type { Quarry } from '@ar-multiventures/types';

export function AdminQuarriesListPage() {
  const [quarries, setQuarries] = useState<Quarry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadQuarries = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getQuarries();
      setQuarries(data);
    } catch (err) {
      console.error('Failed to load quarries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuarries();
  }, []);

  const handleToggleActive = async (id: string, current: boolean) => {
    await adminApi.toggleQuarryStatus(id, !current);
    await loadQuarries();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Quarry Network Master"
        description="Certified granite extraction hubs, daily loading capacities, and active regional supply points."
        breadcrumbs={[{ label: 'Admin Command', href: '/admin' }, { label: 'Quarries' }]}
        action={
          <Link to="/admin/quarries/new">
            <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Add Quarry Hub
            </Button>
          </Link>
        }
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-body-sm text-neutral-400">
            Loading certified quarries...
          </div>
        ) : (
          quarries.map((q) => (
            <Card key={q.id} padding="md" className="bg-white border-neutral-200 shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center border border-primary-200">
                    <Mountain className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-950 text-body-sm leading-tight">{q.name}</h4>
                    <span className="font-mono text-caption text-neutral-500">{q.code}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleActive(q.id, q.isActive)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-colors ${
                    q.isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {q.isActive ? 'Active Hub' : 'Inactive'}
                </button>
              </div>

              <div className="space-y-2 text-body-sm pt-1 border-t border-neutral-100">
                <div className="flex items-center justify-between text-caption">
                  <span className="text-neutral-500 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-neutral-400" /> Location
                  </span>
                  <span className="font-semibold text-neutral-900">{q.location}, {q.state}</span>
                </div>
                <div className="flex items-center justify-between text-caption">
                  <span className="text-neutral-500 flex items-center gap-1.5">
                    <Gauge className="h-3.5 w-3.5 text-neutral-400" /> Daily Loading Capacity
                  </span>
                  <span className="font-mono font-bold text-neutral-900">
                    {q.operationalCapacityTonsPerDay.toLocaleString()} Tonnes / Day
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <Link to={`/admin/quarries/${q.id}`} className="w-full">
                  <Button variant="outline" size="xs" className="w-full">
                    Manage Quarry Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
