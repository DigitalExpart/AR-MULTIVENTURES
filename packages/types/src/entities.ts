import type { OrderStatus, DeliveryStatus, PaymentStatus, PaymentMethod, InvoiceStatus } from './status';

export interface Order {
  id: string;
  referenceNumber: string;
  requisitionId: string;
  customerId: string;
  materialName: string;
  quantity: number;
  unit: string;
  quarryName: string;
  destination: string;
  truckRegistration?: string;
  driverName?: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  orderReference: string;
  materialName: string;
  quantity: number;
  unit: string;
  quarryName: string;
  destination: string;
  destinationAddress: string;
  truckRegistration: string;
  driverName: string;
  driverPhone: string;
  status: DeliveryStatus;
  dispatchedAt?: string;
  estimatedArrival?: string;
  deliveredAt?: string;
  currentCheckpoint?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderReference: string;
  customerId: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  issuedAt: string;
  paidAt?: string;
}

export interface Payment {
  id: string;
  referenceNumber: string;
  invoiceId?: string;
  orderId?: string;
  orderReference?: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  description: string;
  paidAt?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  referenceNumber: string;
  type: 'credit' | 'debit';
  amount: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'order' | 'delivery' | 'payment' | 'alert' | 'general';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}
