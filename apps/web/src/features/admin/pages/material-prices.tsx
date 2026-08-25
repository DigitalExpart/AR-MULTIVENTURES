import { useState, useEffect } from 'react';
import { Plus, Coins, Calendar, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { adminApi } from '@ar-multiventures/api';
import type { MaterialPriceRecord, Quarry, Material } from '@ar-multiventures/types';

export function AdminMaterialPricesPage() {
  const [prices, setPrices] = useState<MaterialPriceRecord[]>([]);
  const [quarries, setQuarries] = useState<Quarry[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuarryId, setSelectedQuarryId] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [newRate, setNewRate] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pList, qList, mList] = await Promise.all([
        adminApi.getMaterialPrices(),
        adminApi.getQuarries(),
        adminApi.getMaterials(),
      ]);
      setPrices(pList);
      setQuarries(qList);
      setMaterials(mList);
      if (qList.length > 0) setSelectedQuarryId(qList[0].id);
      if (mList.length > 0) setSelectedMaterialId(mList[0].id);
    } catch (err) {
      console.error('Failed to load material prices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await adminApi.saveMaterialPrice({
        quarryId: selectedQuarryId,
        materialId: selectedMaterialId,
        pricePerUnit: Number(newRate),
        effectiveFrom,
      });
      setIsModalOpen(false);
      setNewRate('');
      await loadData();
    } catch (err) {
      console.error('Failed to save material price:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Quarry Aggregate Material Sourcing Rates"
        description="Standard baseline pricing per tonne by certified extraction quarry with full historical audit preservation."
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin' },
          { label: 'Pricing Center', href: '/admin/pricing' },
          { label: 'Material Prices' },
        ]}
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Schedule New Rate
          </Button>
        }
      />

      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Extraction Quarry</th>
                <th className="py-3 px-4">Material Aggregate</th>
                <th className="py-3 px-4">Rate / Tonne</th>
                <th className="py-3 px-4">Effective Date Window</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Authorized By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-caption text-neutral-400">
                    Loading pricing schedule...
                  </td>
                </tr>
              ) : (
                prices.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-neutral-900">
                      {p.quarryName}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-neutral-800">
                      {p.materialName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-primary-800 text-body">
                      {formatNaira(p.pricePerUnit)} / T
                    </td>
                    <td className="py-3.5 px-4 font-mono text-caption text-neutral-600">
                      From {formatDate(p.effectiveFrom)} {p.effectiveTo ? `to ${formatDate(p.effectiveTo)}` : '(Current)'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {p.isActive ? 'Active Rate' : 'Expired'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-caption text-neutral-500">
                      {p.createdBy || 'Executive Management'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Schedule Rate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center border border-primary-200">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-body font-bold text-neutral-950">Schedule Quarry Material Price</h3>
                  <p className="text-caption text-neutral-500">Preserves historical pricing without mutating past orders.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrice} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-caption font-bold text-neutral-700 block">Sourcing Quarry *</label>
                <select
                  value={selectedQuarryId}
                  onChange={(e) => setSelectedQuarryId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm font-semibold text-neutral-900"
                  required
                >
                  {quarries.map((q) => (
                    <option key={q.id} value={q.id}>{q.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-caption font-bold text-neutral-700 block">Material Aggregate *</label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm font-semibold text-neutral-900"
                  required
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="New Unit Rate (₦ / Tonne) *"
                  type="number"
                  placeholder="e.g. 8800"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  required
                />
                <Input
                  label="Effective From Date *"
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  required
                />
              </div>

              <div className="p-4 bg-neutral-50 border-t border-neutral-200 -mx-5 -mb-5 mt-6 flex items-center justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isSaving} className="font-bold">
                  Schedule Effective Rate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
