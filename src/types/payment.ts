import type { PaymentStatus } from './common';

export interface Payment {
  id: string;
  referenceNumber: string;
  invoiceId?: string;
  orderId?: string;
  orderReference?: string;
  customerId: string;
  amount: number;
  method: 'bank_transfer' | 'card' | 'cash' | 'credit';
  status: PaymentStatus;
  description: string;
  paidAt?: string;
  createdAt: string;
}
