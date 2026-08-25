import { OrderStatusBadge } from './order-status-badge';
import type { OrderStatus } from '@/types/common';

export function StatusBadge({ status, size = 'sm', className }: { status: string; size?: 'sm' | 'md'; className?: string }) {
  const normStatus = (status?.toLowerCase() || 'draft') as OrderStatus;
  return <OrderStatusBadge status={normStatus} size={size} className={className} />;
}

export { OrderStatusBadge };
