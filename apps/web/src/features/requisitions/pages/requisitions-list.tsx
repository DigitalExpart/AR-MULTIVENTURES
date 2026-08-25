import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { PageTransition } from '@/components/motion/page-transition';
import { OrderStatusBadge } from '@/components/business/order-status-badge';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { requisitionApi } from '@ar-multiventures/api';
import type { Requisition } from '@ar-multiventures/types';

export function RequisitionsListPage() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadRequisitions() {
      const data = await requisitionApi.list();
      setRequisitions(data);
    }
    loadRequisitions();
  }, []);

  const filtered = requisitions.filter(
    (r) =>
      r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.quarryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTransition>
      <PageHeader
        title="Supply Requisitions"
        description="Manage batch requisitions, loading approvals, and haulage assignments."
        breadcrumbs={[{ label: 'Requisitions' }]}
        actions={
          <Link to="/app/requisitions/new">
            <Button variant="accent" leftIcon={<PlusCircle className="h-4 w-4" />} className="font-bold text-neutral-950">
              + New Requisition
            </Button>
          </Link>
        }
      />

      {/* Filter / Search Bar */}
      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by reference, material, quarry, destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-neutral-300 bg-white text-body-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>
      </div>

      <Card padding="none">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
                <th className="text-left px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Reference</th>
                <th className="text-left px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Material</th>
                <th className="text-left px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Quantity</th>
                <th className="text-left px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Quarry Source</th>
                <th className="text-left px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Destination</th>
                <th className="text-right px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Amount</th>
                <th className="text-right px-5 py-3.5 text-caption font-bold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="px-5 py-4 text-body-sm font-mono font-bold text-primary-700">
                    {req.referenceNumber}
                  </td>
                  <td className="px-5 py-4 text-body-sm font-medium text-neutral-900">
                    {req.materialName}
                  </td>
                  <td className="px-5 py-4 text-body-sm text-neutral-600 font-mono">
                    {req.quantity} {req.unit}
                  </td>
                  <td className="px-5 py-4 text-body-sm text-neutral-600">
                    {req.quarryName}
                  </td>
                  <td className="px-5 py-4 text-body-sm text-neutral-600 max-w-[180px] truncate">
                    {req.destination}
                  </td>
                  <td className="px-5 py-4 text-body-sm font-mono font-bold text-neutral-900 text-right">
                    {formatNaira(req.pricing.total)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <OrderStatusBadge status={req.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Alternative */}
        <div className="md:hidden divide-y divide-neutral-100 p-3 space-y-3">
          {filtered.map((req) => (
            <div key={req.id} className="p-3.5 bg-surface-secondary rounded-lg border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-body-sm font-bold text-primary-700">{req.referenceNumber}</span>
                <OrderStatusBadge status={req.status} size="sm" />
              </div>
              <div>
                <p className="text-body font-bold text-neutral-900">{req.materialName}</p>
                <p className="text-caption text-neutral-500">{req.quantity} {req.unit} · {req.quarryName}</p>
              </div>
              <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-caption">
                <span className="text-neutral-500 truncate max-w-[180px]">Site: {req.destination}</span>
                <span className="font-mono font-bold text-neutral-900 text-body-sm">{formatNaira(req.pricing.total)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageTransition>
  );
}
