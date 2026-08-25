import { useState, useEffect } from 'react';
import { BadgePercent, Shield, AlertTriangle, CheckCircle2, Edit2, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { formatNaira } from '@ar-multiventures/business-logic';
import { financeApi } from '@ar-multiventures/api';
import type { CustomerFinancialSummary, CustomerCreditStatus } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

export function AdminFinanceCreditPage() {
  const [summaries, setSummaries] = useState<CustomerFinancialSummary[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerFinancialSummary | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newLimit, setNewLimit] = useState('');
  const [newDays, setNewDays] = useState('14');
  const [newStatus, setNewStatus] = useState<CustomerCreditStatus>('ACTIVE_CREDIT');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await financeApi.getAllCustomerFinancialSummaries();
      setSummaries(list);
    } catch (err) {
      console.error('Failed to load credit profiles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEdit = (c: CustomerFinancialSummary) => {
    setSelectedCustomer(c);
    setNewLimit(c.creditLimit.toString());
    setNewDays(c.creditPeriodDays.toString());
    setNewStatus(c.creditStatus);
    setIsEditModalOpen(true);
  };

  const handleSaveCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setIsSaving(true);
    try {
      await financeApi.updateCustomerCreditProfile(selectedCustomer.customerId, {
        creditLimit: Number(newLimit),
        creditPeriodDays: Number(newDays),
        creditStatus: newStatus,
      });
      setIsEditModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to update credit terms:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Corporate Credit Facility & Risk Exposure"
        description="Monitor corporate credit limits, payment periods, exposure utilization gauges, and manage credit agreements."
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin' },
          { label: 'Finance', href: '/admin/finance' },
          { label: 'Credit Facilities' },
        ]}
      />

      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Account #</th>
                <th className="py-3 px-4">Corporate Contractor</th>
                <th className="py-3 px-4">Facility Status</th>
                <th className="py-3 px-4 font-mono">Approved Limit</th>
                <th className="py-3 px-4 font-mono">Current Exposure</th>
                <th className="py-3 px-4 font-mono">Available Credit</th>
                <th className="py-3 px-4 w-44">Utilization Gauge</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-caption text-neutral-400">
                    Loading credit profiles...
                  </td>
                </tr>
              ) : (
                summaries.map((c) => (
                  <tr key={c.customerId} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary-800">
                      {c.accountNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-950">
                      {c.companyName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[11px] font-bold uppercase',
                          c.creditStatus === 'ACTIVE_CREDIT' && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                          c.creditStatus === 'NO_CREDIT' && 'bg-neutral-100 text-neutral-600',
                          c.creditStatus === 'SUSPENDED_CREDIT' && 'bg-red-50 text-red-800 border border-red-200'
                        )}
                      >
                        {c.creditStatus === 'ACTIVE_CREDIT' ? `Net ${c.creditPeriodDays}D Active` : c.creditStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                      {c.creditLimit > 0 ? formatNaira(c.creditLimit) : '₦0.00'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                      {formatNaira(c.outstandingReceivable)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      {formatNaira(c.availableCredit)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span>{c.creditUtilizationPercent}%</span>
                          {c.creditUtilizationPercent >= 80 && (
                            <span className="text-amber-700 font-bold flex items-center gap-0.5">
                              <AlertTriangle className="h-3 w-3" /> High
                            </span>
                          )}
                        </div>
                        <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              c.creditUtilizationPercent >= 90
                                ? 'bg-red-600'
                                : c.creditUtilizationPercent >= 70
                                ? 'bg-amber-500'
                                : 'bg-primary-700'
                            )}
                            style={{ width: `${Math.min(100, c.creditUtilizationPercent)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => openEdit(c)}
                        leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                      >
                        Edit Terms
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Terms Modal */}
      {isEditModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center border border-primary-200">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-body font-bold text-neutral-950">Modify Credit Terms & Limit</h3>
                  <p className="text-caption text-neutral-500">{selectedCustomer.companyName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCredit} className="p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Credit Limit (₦) *"
                  type="number"
                  placeholder="e.g. 15000000"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  required
                />
                <Input
                  label="Payment Period (Days) *"
                  type="number"
                  placeholder="e.g. 14"
                  value={newDays}
                  onChange={(e) => setNewDays(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-caption font-bold text-neutral-700 block">Facility Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm font-semibold text-neutral-900"
                >
                  <option value="ACTIVE_CREDIT">ACTIVE_CREDIT (Allow Credit Sourcing)</option>
                  <option value="NO_CREDIT">NO_CREDIT (Prepaid Only)</option>
                  <option value="SUSPENDED_CREDIT">SUSPENDED_CREDIT (Temporarily Blocked)</option>
                </select>
              </div>

              <div className="p-4 bg-neutral-50 border-t border-neutral-200 -mx-5 -mb-5 mt-6 flex items-center justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isSaving} className="font-bold">
                  Save Credit Facility Terms
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
