import type { OrderStatus } from './common';

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
  truckRegistration: string;
  driverName: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}
