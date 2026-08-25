import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Mountain, ArrowLeft, MapPin, Gauge, Layers, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { adminApi } from '@ar-multiventures/api';
import type { Quarry } from '@ar-multiventures/types';

export function AdminQuarryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [quarry, setQuarry] = useState<Quarry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setIsLoading(true);
      try {
        const list = await adminApi.getQuarries();
        const found = list.find((q) => q.id === id || q.code === id) || null;
        setQuarry(found);
      } catch (err) {
        console.error('Failed to load quarry:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (isLoading) {
    return <div className="py-20 text-center text-body-sm text-neutral-500">Loading quarry profile...</div>;
  }

  if (!quarry) {
    return (
      <div className="py-20 text-center space-y-3">
        <h3 className="text-h3 font-bold text-neutral-900">Quarry Not Found</h3>
        <Link to="/admin/quarries">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Quarries
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={quarry.name}
        description={`Extraction Hub Code: ${quarry.code} · ${quarry.location}, ${quarry.state}`}
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin' },
          { label: 'Quarries', href: '/admin/quarries' },
          { label: quarry.name },
        ]}
      />

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <Card padding="md" className="bg-white border-neutral-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200">
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center font-bold text-lg border border-primary-200">
                <Mountain className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-950 text-body">{quarry.name}</h3>
                <span className="font-mono text-caption text-neutral-500">{quarry.code}</span>
              </div>
            </div>

            <div className="space-y-3 text-body-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Status:</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-caption border border-emerald-200">
                  {quarry.isActive ? 'OPERATIONAL' : 'INACTIVE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Daily Loading Capacity:</span>
                <span className="font-mono font-bold text-neutral-900">
                  {quarry.operationalCapacityTonsPerDay.toLocaleString()} Tonnes / Day
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Location:</span>
                <span className="font-semibold text-neutral-900">{quarry.location}, {quarry.state}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <Card padding="none" className="bg-white border-neutral-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h4 className="text-body-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                <Layers className="h-4 w-4 text-neutral-500" />
                Available Granite Aggregates & Stock
              </h4>
            </div>

            <div className="p-4 grid sm:grid-cols-2 gap-3">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="font-bold text-neutral-900">3/4" Granite Aggregate</span>
                <p className="text-caption text-neutral-500 mt-0.5">High-grade structural concrete & road aggregate</p>
                <div className="mt-2 text-caption font-mono font-bold text-primary-800">Standard Rate: ₦8,500/T</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="font-bold text-neutral-900">1/2" Granite Aggregate</span>
                <p className="text-caption text-neutral-500 mt-0.5">Asphalt paving & precast concrete works</p>
                <div className="mt-2 text-caption font-mono font-bold text-primary-800">Standard Rate: ₦9,000/T</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="font-bold text-neutral-900">20mm Granite Aggregate</span>
                <p className="text-caption text-neutral-500 mt-0.5">General civil foundations & slab casting</p>
                <div className="mt-2 text-caption font-mono font-bold text-primary-800">Standard Rate: ₦8,000/T</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="font-bold text-neutral-900">Stone Dust (Granite Powder)</span>
                <p className="text-caption text-neutral-500 mt-0.5">Interlocking paving stones & block molding</p>
                <div className="mt-2 text-caption font-mono font-bold text-primary-800">Standard Rate: ₦4,500/T</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
