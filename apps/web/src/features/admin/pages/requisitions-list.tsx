import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight, Mountain, Layers, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/business/status-badge';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { adminApi } from '@ar-multiventures/api';
import type { Requisition, Quarry } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

export function AdminRequisitionsListPage() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [quarries, setQuarries] = useState<Quarry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedQuarry, setSelectedQuarry] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [reqs, qList] = await Promise.all([
          adminApi.getRequisitions({
            search: searchQuery || undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            quarryId: selectedQuarry !== 'all' ? selectedQuarry : undefined,
          }),
          adminApi.getQuarries(),
        ]);
        setRequisitions(reqs);
        setQuarries(qList);
      } catch (err) {
        console.error('Failed to load requisitions:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [searchQuery, selectedStatus, selectedQuarry]);

  const statusTabs = [
    { label: 'All Orders', value: 'all' },
    { label: 'Pending Approval', value: 'submitted' },
    { label: 'Approved', value: 'approved' },
    { label: 'Payment Pending', value: 'payment_pending' },
    { label: 'Loading Scheduled', value: 'loading_scheduled' },
    { label: 'In Transit', value: 'dispatched' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Material Requisitions Management"
        description="Comprehensive enterprise operational registry for customer supply orders and loading bay dispatch."
        breadcrumbs={[{ label: 'Admin Command', href: '/admin' }, { label: 'Requisitions' }]}
      />

      {/* Filter & Search Bar */}
      <Card padding="sm" className="bg-white border-neutral-200 space-y-3">
        {/* Status Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1 border-b border-neutral-100">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-body-sm font-semibold whitespace-nowrap transition-colors',
                selectedStatus === tab.value
                  ? 'bg-primary-700 text-white font-bold'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Quarry Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search reference (REQ-...), destination, or material..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-primary-600 focus:bg-white"
            />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedQuarry}
              onChange={(e) => setSelectedQuarry(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-primary-600"
            >
              <option value="all">All Sourcing Quarries</option>
              {quarries.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Enterprise Data Table */}
      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Requisition #</th>
                <th className="py-3 px-4">Delivery Date</th>
                <th className="py-3 px-4">Extraction Quarry</th>
                <th className="py-3 px-4">Aggregate & Tonnage</th>
                <th className="py-3 px-4">Destination Site</th>
                <th className="py-3 px-4">Logistics</th>
                <th className="py-3 px-4">Commercial Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-caption text-neutral-400">
                    Loading enterprise requisitions...
                  </td>
                </tr>
              ) : requisitions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <p className="text-body-sm font-semibold text-neutral-600">No requisitions matching filters.</p>
                    <p className="text-caption text-neutral-400 mt-1">Try resetting search or status filters.</p>
                  </td>
                </tr>
              ) : (
                requisitions.map((req) => (
                  <tr key={req.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/admin/requisitions/${req.id}`}
                        className="font-mono font-bold text-primary-800 hover:underline"
                      >
                        {req.referenceNumber}
                      </Link>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {formatDate(req.createdAt)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-neutral-800">
                      {formatDate(req.requestedDeliveryDate)}
                    </td>
                    <td className="py-3.5 px-4 text-caption font-semibold text-neutral-800 max-w-[140px] truncate">
                      {req.quarryName}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-900">{req.materialName}</div>
                      <div className="text-caption text-neutral-500 font-mono">{req.quantity} Tonnes</div>
                    </td>
                    <td className="py-3.5 px-4 text-caption text-neutral-600 max-w-[160px] truncate">
                      {req.destination}
                    </td>
                    <td className="py-3.5 px-4 text-caption">
                      <span className="font-semibold uppercase text-neutral-700">
                        {req.transportationType === 'self' ? 'Self-Pickup' : 'AR Haulage'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                      {formatNaira(req.pricing.total)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to={`/admin/requisitions/${req.id}`}>
                        <Button variant="outline" size="xs" leftIcon={<Eye className="h-3.5 w-3.5" />}>
                          Details
                        </Button>
                      </Link>
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
