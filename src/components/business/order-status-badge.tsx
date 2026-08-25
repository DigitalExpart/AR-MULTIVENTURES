import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/common';
import {
  FileEdit, Send, CheckCircle2, Clock, CreditCard,
  Calendar, Loader2, Truck, PackageCheck, CircleCheckBig,
  XCircle, Ban, PauseCircle
} from 'lucide-react';
import type { ReactNode } from 'react';

interface StatusConfig {
  label: string;
  icon: ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  draft: {
    label: 'Draft',
    icon: <FileEdit className="h-3.5 w-3.5" />,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
    borderColor: 'border-neutral-300',
    dotColor: 'bg-neutral-400',
  },
  submitted: {
    label: 'Submitted',
    icon: <Send className="h-3.5 w-3.5" />,
    color: 'text-info-700',
    bgColor: 'bg-info-50',
    borderColor: 'border-info-200',
    dotColor: 'bg-info-500',
  },
  approved: {
    label: 'Approved',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    color: 'text-success-700',
    bgColor: 'bg-success-50',
    borderColor: 'border-success-200',
    dotColor: 'bg-success-500',
  },
  payment_pending: {
    label: 'Payment Pending',
    icon: <Clock className="h-3.5 w-3.5" />,
    color: 'text-warning-800',
    bgColor: 'bg-warning-50',
    borderColor: 'border-warning-200',
    dotColor: 'bg-warning-500',
  },
  payment_confirmed: {
    label: 'Payment Confirmed',
    icon: <CreditCard className="h-3.5 w-3.5" />,
    color: 'text-success-700',
    bgColor: 'bg-success-50',
    borderColor: 'border-success-200',
    dotColor: 'bg-success-500',
  },
  loading_scheduled: {
    label: 'Loading Scheduled',
    icon: <Calendar className="h-3.5 w-3.5" />,
    color: 'text-info-700',
    bgColor: 'bg-info-50',
    borderColor: 'border-info-200',
    dotColor: 'bg-info-500',
  },
  loading: {
    label: 'Loading',
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    color: 'text-accent-800',
    bgColor: 'bg-accent-50',
    borderColor: 'border-accent-200',
    dotColor: 'bg-accent-500',
  },
  dispatched: {
    label: 'Dispatched',
    icon: <Truck className="h-3.5 w-3.5" />,
    color: 'text-primary-700',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
    dotColor: 'bg-primary-500',
  },
  delivered: {
    label: 'Delivered',
    icon: <PackageCheck className="h-3.5 w-3.5" />,
    color: 'text-success-700',
    bgColor: 'bg-success-50',
    borderColor: 'border-success-200',
    dotColor: 'bg-success-500',
  },
  completed: {
    label: 'Completed',
    icon: <CircleCheckBig className="h-3.5 w-3.5" />,
    color: 'text-success-700',
    bgColor: 'bg-success-50',
    borderColor: 'border-success-200',
    dotColor: 'bg-success-600',
  },
  cancelled: {
    label: 'Cancelled',
    icon: <XCircle className="h-3.5 w-3.5" />,
    color: 'text-error-700',
    bgColor: 'bg-error-50',
    borderColor: 'border-error-200',
    dotColor: 'bg-error-500',
  },
  rejected: {
    label: 'Rejected',
    icon: <Ban className="h-3.5 w-3.5" />,
    color: 'text-error-700',
    bgColor: 'bg-error-50',
    borderColor: 'border-error-200',
    dotColor: 'bg-error-500',
  },
  on_hold: {
    label: 'On Hold',
    icon: <PauseCircle className="h-3.5 w-3.5" />,
    color: 'text-warning-800',
    bgColor: 'bg-warning-50',
    borderColor: 'border-warning-200',
    dotColor: 'bg-warning-500',
  },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export function OrderStatusBadge({ status, size = 'md', className }: OrderStatusBadgeProps) {
  const config = ORDER_STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-md',
        config.bgColor,
        config.color,
        size === 'sm' ? 'px-1.5 py-0.5 text-caption' : 'px-2 py-1 text-small',
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotColor)} />
      {config.icon}
      {config.label}
    </span>
  );
}
