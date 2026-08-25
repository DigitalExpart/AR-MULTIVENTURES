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

export type PaymentMethod = 'bank_transfer' | 'credit' | 'card' | 'cheque';

export type DeliveryStatus = 'pending' | 'loading' | 'dispatched' | 'in_transit' | 'delivered';

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';

export type TransportationType = 'company' | 'self' | 'third_party';
