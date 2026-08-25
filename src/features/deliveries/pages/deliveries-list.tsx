import { PageHeader } from '@/components/layout/page-header';
import { PageTransition } from '@/components/motion/page-transition';
import { EmptyState } from '@/components/business/empty-state';
import { Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DeliveriesListPage() {
  const navigate = useNavigate();
  return (
    <PageTransition>
      <PageHeader
        title="Deliveries"
        description="Track your material deliveries"
        breadcrumbs={[{ label: 'Deliveries' }]}
      />
      <EmptyState
        variant="no-deliveries"
        title="No active deliveries"
        description="Your deliveries will appear here once orders are dispatched from the quarry."
        icon={<Truck className="h-10 w-10" />}
        action={{ label: 'View Orders', onClick: () => navigate('/app/orders') }}
      />
    </PageTransition>
  );
}
