import { useState, useEffect } from 'react';
import { Sparkles, Plus, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { adminApi } from '@ar-multiventures/api';
import type { PromotionalPriceRecord } from '@ar-multiventures/types';

export function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<PromotionalPriceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const list = await adminApi.getPromotions();
        setPromotions(list);
      } catch (err) {
        console.error('Failed to load promotions:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Promotional Aggregate Campaigns"
        description="Temporary promotional aggregate discounts and regional stimulus pricing taking precedence over standard quarry rates."
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin' },
          { label: 'Pricing Center', href: '/admin/pricing' },
          { label: 'Promotions' },
        ]}
      />

      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-body-sm text-neutral-400">Loading promotional campaigns...</div>
        ) : (
          promotions.map((p) => (
            <Card key={p.id} padding="md" className="bg-white border-neutral-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-950 text-body">{p.name}</h4>
                    <span className="text-caption text-neutral-500 font-medium">
                      Scope: {p.quarryName} · {p.materialName}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded text-caption font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {p.status}
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-neutral-100 text-body-sm">
                <div>
                  <span className="text-caption text-neutral-500 block">Promotional Sourcing Rate</span>
                  <span className="font-mono font-bold text-primary-800 text-body">
                    {p.promoPricePerUnit ? `${formatNaira(p.promoPricePerUnit)} / Tonne` : `${p.discountPercentage}% Off`}
                  </span>
                </div>
                <div>
                  <span className="text-caption text-neutral-500 block">Campaign Validity Window</span>
                  <span className="font-mono font-medium text-neutral-800">
                    {formatDate(p.effectiveFrom)} – {formatDate(p.effectiveTo)}
                  </span>
                </div>
                <div>
                  <span className="text-caption text-neutral-500 block">Campaign Notes</span>
                  <span className="text-caption text-neutral-700">{p.notes || 'General stimulus'}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
