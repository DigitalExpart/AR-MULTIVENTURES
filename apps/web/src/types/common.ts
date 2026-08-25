export type OrderStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'payment_pending'
  | 'payment_confirmed'
  | 'loading_scheduled'
  | 'loading'
  | 'dispatched'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'on_hold';

export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';

export type DeliveryStatus = 'pending' | 'loading' | 'dispatched' | 'in_transit' | 'delivered';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}
