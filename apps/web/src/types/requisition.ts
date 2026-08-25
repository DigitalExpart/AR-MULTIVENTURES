import type { OrderStatus } from './common';

export interface Requisition {
  id: string;
  referenceNumber: string;
  customerId: string;
  quarryId: string;
  quarryName: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  destination: string;
  destinationAddress: string;
  truckId?: string;
  truckRegistration?: string;
  deliveryDate?: string;
  status: OrderStatus;
  pricing: RequisitionPricing;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequisitionPricing {
  materialCost: number;
  loadingCharges: number;
  haulageCharges: number;
  otherCharges: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface NewRequisitionForm {
  quarryId: string;
  materialId: string;
  quantity: number;
  transportationType: 'company' | 'self' | 'third_party';
  truckId?: string;
  destination: string;
  destinationAddress: string;
  deliveryDate: string;
  notes?: string;
}
