import { useState, useEffect } from 'react';
import { MapPinned, CheckCircle2, XCircle, Clock, Building2, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { formatDate } from '@ar-multiventures/business-logic';
import { adminApi } from '@ar-multiventures/api';
import type { DestinationRequestItem } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

export function AdminDestinationRequestsPage() {
  const [requests, setRequests] = useState<DestinationRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const list = await adminApi.getDestinationRequests();
      setRequests(list);
    } catch (err) {
      console.error('Failed to load destination requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    await adminApi.reviewDestinationRequest(id, status);
    await loadRequests();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Custom Site Delivery Requests"
        description="Review customer-submitted delivery destinations and link them to approved regional haulage tariffs."
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin' },
          { label: 'Destinations', href: '/admin/destinations' },
          { label: 'Site Requests' },
        ]}
      />

      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-body-sm text-neutral-400">Loading site requests...</div>
        ) : requests.length === 0 ? (
          <Card padding="lg" className="text-center py-12">
            <p className="text-body-sm text-neutral-500">No destination requests pending review.</p>
          </Card>
        ) : (
          requests.map((req) => (
            <Card key={req.id} padding="md" className="bg-white border-neutral-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-bold text-neutral-950 text-body">{req.requestedName}</h4>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[11px] font-bold uppercase',
                        req.status === 'APPROVED' && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                        req.status === 'REJECTED' && 'bg-red-50 text-red-800 border border-red-200',
                        req.status === 'PENDING' && 'bg-amber-50 text-amber-800 border border-amber-200'
                      )}
                    >
                      {req.status}
                    </span>
                  </div>
                  <div className="text-caption text-neutral-500 flex items-center gap-2 mt-0.5">
                    <span>Submitted by <strong>{req.customerName}</strong></span>
                    <span>· {formatDate(req.createdAt)}</span>
                  </div>
                </div>

                {req.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => handleReview(req.id, 'REJECTED')}
                      leftIcon={<XCircle className="h-3.5 w-3.5" />}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => handleReview(req.id, 'APPROVED')}
                      leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                      className="font-bold"
                    >
                      Approve Site & Create Route
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-3 gap-4 text-body-sm">
                <div>
                  <span className="text-caption text-neutral-500 block">Full Physical Address</span>
                  <span className="font-medium text-neutral-900">{req.fullAddress}</span>
                </div>
                <div>
                  <span className="text-caption text-neutral-500 block">Key Landmark</span>
                  <span className="font-medium text-neutral-900">{req.landmark || 'None specified'}</span>
                </div>
                <div>
                  <span className="text-caption text-neutral-500 block">Site Engineer Contact</span>
                  <span className="font-medium text-neutral-900">{req.siteContactName} ({req.siteContactPhone})</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
