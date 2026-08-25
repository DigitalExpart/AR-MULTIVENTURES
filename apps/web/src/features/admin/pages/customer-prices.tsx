import { useState, useEffect } from 'react';
import { BadgePercent, Plus, Building2, Layers } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { adminApi } from '@ar-multiventures/api';
import type { CustomerPriceRecord } from '@ar-multiventures/types';

export function AdminCustomerPricesPage() {
  const [rates, setRates] = useState<CustomerPriceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const list = await adminApi.getCustomerPrices();
        setRates(list);
      } catch (err) {
        console.error('Failed to load customer prices:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Customer Negotiated Rate Agreements"
        description="Contractual corporate price overrides taking top precedence in the commercial pricing engine."
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin' },
          { label: 'Pricing Center', href: '/admin/pricing' },
          { label: 'Customer Rates' },
        ]}
      />

      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Corporate Customer</th>
                <th className="py-3 px-4">Quarry & Aggregate</th>
                <th className="py-3 px-4">Standard Rate</th>
                <th className="py-3 px-4">Negotiated Rate</th>
                <th className="py-3 px-4">Contract Difference</th>
                <th className="py-3 px-4">Effective Window</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-caption text-neutral-400">
                    Loading negotiated client agreements...
                  </td>
                </tr>
              ) : (
                rates.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-neutral-900">
                      {r.customerName}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-900">{r.materialName}</div>
                      <div className="text-caption text-neutral-500">{r.quarryName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-500 line-through">
                      {formatNaira(r.standardPrice)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-800 text-body">
                      {formatNaira(r.specialPricePerUnit)} / T
                    </td>
                    <td className="py-3.5 px-4 font-mono text-caption text-emerald-700 font-bold">
                      {formatNaira(r.difference)} / T ({Math.round((r.difference / r.standardPrice) * 100)}%)
                    </td>
                    <td className="py-3.5 px-4 font-mono text-caption text-neutral-600">
                      {formatDate(r.effectiveFrom)} to {r.effectiveTo ? formatDate(r.effectiveTo) : 'Open'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active Override
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
