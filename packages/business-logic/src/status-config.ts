import type { OrderStatus } from '@ar-multiventures/types';

export interface OrderStatusMeta {
  code: OrderStatus;
  label: string;
  description: string;
  category: 'draft' | 'pending' | 'in_progress' | 'completed' | 'cancelled';
  badgeStyle: {
    bg: string;
    text: string;
    border: string;
    dot: string;
  };
}

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  'draft',
  'submitted',
  'approved',
  'payment_pending',
  'payment_confirmed',
  'loading_scheduled',
  'loading',
  'dispatched',
  'delivered',
  'completed',
  'cancelled',
  'rejected',
  'on_hold',
];

export const ORDER_STATUS_METADATA: Record<OrderStatus, OrderStatusMeta> = {
  draft: {
    code: 'draft',
    label: 'Draft',
    description: 'Requisition draft saved and not yet submitted.',
    category: 'draft',
    badgeStyle: {
      bg: 'bg-neutral-100',
      text: 'text-neutral-700',
      border: 'border-neutral-200',
      dot: 'bg-neutral-400',
    },
  },
  submitted: {
    code: 'submitted',
    label: 'Submitted',
    description: 'Requisition submitted and awaiting operational review.',
    category: 'pending',
    badgeStyle: {
      bg: 'bg-info-50',
      text: 'text-info-700',
      border: 'border-info-200',
      dot: 'bg-info-500',
    },
  },
  approved: {
    code: 'approved',
    label: 'Approved',
    description: 'Requisition approved by AR Multiventures operations.',
    category: 'in_progress',
    badgeStyle: {
      bg: 'bg-success-50',
      text: 'text-success-700',
      border: 'border-success-200',
      dot: 'bg-success-500',
    },
  },
  payment_pending: {
    code: 'payment_pending',
    label: 'Payment Pending',
    description: 'Awaiting customer payment confirmation.',
    category: 'pending',
    badgeStyle: {
      bg: 'bg-warning-50',
      text: 'text-warning-800',
      border: 'border-warning-200',
      dot: 'bg-warning-500',
    },
  },
  payment_confirmed: {
    code: 'payment_confirmed',
    label: 'Payment Confirmed',
    description: 'Payment verified; order queued for quarry schedule.',
    category: 'in_progress',
    badgeStyle: {
      bg: 'bg-success-50',
      text: 'text-success-700',
      border: 'border-success-200',
      dot: 'bg-success-500',
    },
  },
  loading_scheduled: {
    code: 'loading_scheduled',
    label: 'Loading Scheduled',
    description: 'Quarry loading bay slot scheduled with assigned fleet.',
    category: 'in_progress',
    badgeStyle: {
      bg: 'bg-info-50',
      text: 'text-info-700',
      border: 'border-info-200',
      dot: 'bg-info-500',
    },
  },
  loading: {
    code: 'loading',
    label: 'Loading at Quarry',
    description: 'Truck currently at quarry scale / loading bay.',
    category: 'in_progress',
    badgeStyle: {
      bg: 'bg-accent-50',
      text: 'text-accent-900',
      border: 'border-accent-200',
      dot: 'bg-accent-500',
    },
  },
  dispatched: {
    code: 'dispatched',
    label: 'Dispatched / In Transit',
    description: 'Loaded truck en route to destination site.',
    category: 'in_progress',
    badgeStyle: {
      bg: 'bg-primary-50',
      text: 'text-primary-700',
      border: 'border-primary-200',
      dot: 'bg-primary-500',
    },
  },
  delivered: {
    code: 'delivered',
    label: 'Delivered to Site',
    description: 'Material offloaded and received at destination.',
    category: 'completed',
    badgeStyle: {
      bg: 'bg-success-50',
      text: 'text-success-700',
      border: 'border-success-200',
      dot: 'bg-success-600',
    },
  },
  completed: {
    code: 'completed',
    label: 'Completed',
    description: 'Delivery signed, weighbridge verified, transaction closed.',
    category: 'completed',
    badgeStyle: {
      bg: 'bg-success-50',
      text: 'text-success-800',
      border: 'border-success-200',
      dot: 'bg-success-700',
    },
  },
  cancelled: {
    code: 'cancelled',
    label: 'Cancelled',
    description: 'Requisition or order was cancelled.',
    category: 'cancelled',
    badgeStyle: {
      bg: 'bg-error-50',
      text: 'text-error-700',
      border: 'border-error-200',
      dot: 'bg-error-500',
    },
  },
  rejected: {
    code: 'rejected',
    label: 'Rejected',
    description: 'Order rejected during review or quarry check.',
    category: 'cancelled',
    badgeStyle: {
      bg: 'bg-error-50',
      text: 'text-error-700',
      border: 'border-error-200',
      dot: 'bg-error-500',
    },
  },
  on_hold: {
    code: 'on_hold',
    label: 'On Hold',
    description: 'Order temporarily paused for operational inspection.',
    category: 'pending',
    badgeStyle: {
      bg: 'bg-warning-50',
      text: 'text-warning-800',
      border: 'border-warning-200',
      dot: 'bg-warning-500',
    },
  },
};
