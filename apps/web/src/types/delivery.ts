import type { DeliveryStatus } from './common';

export interface Delivery {
  id: string;
  orderId: string;
  orderReference: string;
  materialName: string;
  quantity: number;
  quarryName: string;
  destination: string;
  truckRegistration: string;
  driverName: string;
  driverPhone: string;
  status: DeliveryStatus;
  dispatchedAt?: string;
  estimatedArrival?: string;
  deliveredAt?: string;
  createdAt: string;
}
