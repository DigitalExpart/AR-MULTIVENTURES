import type { OrderStatus, TransportationType } from './status';

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
  transportationType: TransportationType;
  truckId?: string;
  truckRegistration?: string;
  destination: string;
  destinationAddress: string;
  requestedDeliveryDate: string;
  status: OrderStatus;
  pricing: RequisitionPricing;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewRequisitionPayload {
  quarryId: string;
  materialId: string;
  quantity: number;
  transportationType: TransportationType;
  truckId?: string;
  destination: string;
  destinationAddress: string;
  deliveryDate: string;
  notes?: string;
  expectedTotal?: number;
}

export interface PriceQuoteBreakdown {
  currency: string;
  quantity: number;
  material: {
    unitPrice: number;
    quantity: number;
    amount: number;
    source: string;
    ruleId?: string | null;
  };
  loading: {
    ratePerTonne: number;
    ratePerTrip: number;
    amount: number;
  };
  haulage: {
    amount: number;
    source: string;
    ruleId?: string | null;
  };
  fuelAdjustment: {
    percentage: number;
    amount: number;
  };
  discounts: Array<{
    name: string;
    amount: number;
    ruleId?: string | null;
  }>;
  subtotal: number;
  totalDiscount: number;
  total: number;
  requiresReview: boolean;
  reviewReasons?: string[];
  quotedAt: string;
  validUntil: string;
}

export interface PriceQuoteRequest {
  quarryId: string;
  materialId: string;
  quantity: number;
  transportationType: TransportationType;
  truckTypeId?: string;
  destinationId?: string;
  deliveryDate?: string;
}
