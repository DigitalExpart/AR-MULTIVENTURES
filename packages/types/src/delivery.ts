export type TripStatus =
  | 'PLANNED'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'AT_QUARRY'
  | 'LOADING'
  | 'LOADED'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'ARRIVED'
  | 'DELIVERED'
  | 'POD_CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ON_HOLD';

export interface DeliveryTripRecord {
  id: string;
  organizationId?: string;
  requisitionId: string;
  requisitionNumber?: string;
  customerId: string;
  customerName?: string;
  tripNumber: string;
  tripIndex: number;
  totalTripsInOrder: number;
  plannedQuantityTonnes: number;
  materialId?: string;
  materialName?: string;
  quarryId?: string;
  quarryName?: string;
  destinationId?: string;
  destinationName?: string;
  destinationAddress?: string;
  truckId?: string;
  truckRegistration?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  status: TripStatus;
  scheduledDate?: string;
  quarryArrivalAt?: string;
  loadingStartedAt?: string;
  loadingCompletedAt?: string;
  dispatchedAt?: string;
  arrivedSiteAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  cancellationReason?: string;
  notes?: string;
  weighbridge?: TripWeighbridgeRecord;
  pod?: TripProofOfDelivery;
  createdAt: string;
  updatedAt?: string;
}

export interface TripWeighbridgeRecord {
  id: string;
  tripId: string;
  weighbridgeTicketNumber: string;
  loadingTicketNumber?: string;
  grossWeightTonnes: number;
  tareWeightTonnes: number;
  netWeightTonnes: number;
  plannedWeightTonnes: number;
  varianceTonnes: number;
  variancePercent: number;
  loadingOfficerId?: string;
  loadingOfficerName?: string;
  loadingBay?: string;
  ticketStoragePath?: string;
  remarks?: string;
  recordedAt: string;
}

export interface TripProofOfDelivery {
  id: string;
  tripId: string;
  requisitionId: string;
  customerId: string;
  receiverName: string;
  receiverPhone?: string;
  receivedByDesignation?: string;
  deliveredQuantityTonnes: number;
  deliveryTime: string;
  signatureStoragePath: string;
  photoStoragePaths?: string[];
  driverRemarks?: string;
  receiverRemarks?: string;
  recordedBy?: string;
  createdAt: string;
}

export interface OrderFulfillmentSummary {
  requisitionId: string;
  referenceNumber: string;
  customerName?: string;
  destinationName?: string;
  materialName?: string;
  orderedQuantity: number;
  plannedQuantity: number;
  loadedQuantity: number;
  dispatchedQuantity: number;
  deliveredQuantity: number;
  remainingQuantity: number;
  fulfillmentPercent: number;
  status: string;
  trips: DeliveryTripRecord[];
}

export interface TripAssignmentPayload {
  tripId: string;
  truckId: string;
  driverId: string;
  scheduledDate?: string;
  notes?: string;
}

export interface WeighbridgeCapturePayload {
  tripId: string;
  weighbridgeTicketNumber: string;
  loadingTicketNumber?: string;
  grossWeightTonnes: number;
  tareWeightTonnes: number;
  loadingBay?: string;
  ticketFile?: File | string;
  ticketStoragePath?: string;
  remarks?: string;
}

export interface PodSubmissionPayload {
  tripId: string;
  receiverName: string;
  receiverPhone?: string;
  receivedByDesignation?: string;
  deliveredQuantityTonnes: number;
  signatureFile?: File | string;
  signatureStoragePath?: string;
  photoFiles?: Array<File | string>;
  photoStoragePaths?: string[];
  driverRemarks?: string;
  receiverRemarks?: string;
}

export interface OperationsDashboardKPIs {
  scheduledTripsToday: number;
  trucksAtQuarry: number;
  activeLoadingCount: number;
  dispatchedInTransit: number;
  completedDeliveriesToday: number;
  tonnesDeliveredToday: number;
  activeExceptionsCount: number;
}
