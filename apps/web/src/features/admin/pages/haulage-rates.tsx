import { useState, useEffect } from 'react';
import { Truck, Plus, MapPin, Mountain } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { adminApi } from '@ar-multiventures/api';
import type { HaulageRateRecord } from '@ar-multiventures/types';

export function AdminHaulageRatesPage() {
  const [rates, setRates] = useState<HaulageRateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const list = await adminApi.getHaulageRates();
        setRates(list);
      } catch (err) {
        console.error('Failed to load haulage rates:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Heavy Fleet Haulage Freight Tariffs"
        description="Approved logistics route pricing per trip and per tonne by extraction quarry, destination corridor, and truck classification."
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin' },
          { label: 'Pricing Center', href: '/admin/pricing' },
          { label: 'Haulage Tariffs' },
        ]}
      />

      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Extraction Quarry</th>
                <th className="py-3 px-4">Delivery Destination Corridor</th>
                <th className="py-3 px-4">Truck Classification</th>
                <th className="py-3 px-4">Trip Freight Rate</th>
                <th className="py-3 px-4">Effective From</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-caption text-neutral-400">
                    Loading haulage tariffs...
                  </td>
                </tr>
              ) : (
                rates.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-neutral-900">
                      {r.quarryName}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-neutral-800">
                      {r.destinationName}
                    </td>
                    <td className="py-3.5 px-4 text-caption font-semibold text-neutral-700">
                      {r.truckTypeName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-primary-800 text-body">
                      {formatNaira(r.ratePerTrip)} / Trip
                    </td>
                    <td className="py-3.5 px-4 font-mono text-caption text-neutral-600">
                      {formatDate(r.effectiveFrom)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active Tariff
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
