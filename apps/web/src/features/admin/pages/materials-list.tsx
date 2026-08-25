import { useState, useEffect } from 'react';
import { Layers, Plus, Eye, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { adminApi } from '@ar-multiventures/api';
import type { Material } from '@ar-multiventures/types';

export function AdminMaterialsListPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const list = await adminApi.getMaterials();
        setMaterials(list);
      } catch (err) {
        console.error('Failed to load materials:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Granite Aggregates Catalog"
        description="Standardized material specifications, technical sieve grades, and quarry-level pricing."
        breadcrumbs={[{ label: 'Admin Command', href: '/admin' }, { label: 'Materials' }]}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-body-sm text-neutral-400">
            Loading aggregate materials...
          </div>
        ) : (
          materials.map((m) => (
            <Card key={m.id} padding="md" className="bg-white border-neutral-200 shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center border border-primary-200">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-950 text-body-sm leading-tight">{m.name}</h4>
                    <span className="font-mono text-caption text-neutral-500">{m.code}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="space-y-2 text-body-sm pt-1 border-t border-neutral-100">
                <div className="text-caption text-neutral-600 line-clamp-2">
                  {m.description || m.specification}
                </div>
                <div className="flex items-center justify-between text-caption pt-1">
                  <span className="text-neutral-500">Unit of Sourcing:</span>
                  <span className="font-bold uppercase text-neutral-900 font-mono">Tonnes</span>
                </div>
                <div className="flex items-center justify-between text-caption">
                  <span className="text-neutral-500">Typical Pricing Range:</span>
                  <span className="font-mono font-bold text-primary-800">₦7,800 – ₦9,000 / T</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
