import type { IDeliveryRepository } from '../interfaces';
import type {
  DeliveryTripRecord,
  TripWeighbridgeRecord,
  TripProofOfDelivery,
  OrderFulfillmentSummary,
  TripAssignmentPayload,
  WeighbridgeCapturePayload,
  PodSubmissionPayload,
  OperationsDashboardKPIs,
  TripStatus,
  Delivery
} from '@ar-multiventures/types';
import { calculateOrderFulfillment, calculateNetWeight, calculateWeightVariance } from '@ar-multiventures/business-logic';
import { mockFleetTrucks, mockDrivers } from './fleet-repository';

export const mockTrips: DeliveryTripRecord[] = [
  {
    id: 'trp-01',
    requisitionId: 'req-01',
    requisitionNumber: 'REQ-2026-000041',
    customerId: 'cus-buildcorp',
    customerName: 'BuildCorp Nigeria Limited',
    tripNumber: 'TRP-2026-000081',
    tripIndex: 1,
    totalTripsInOrder: 5,
    plannedQuantityTonnes: 30.00,
    materialId: 'mat-01',
    materialName: 'Granite 3/4 Inch (20mm Aggregate)',
    quarryId: 'qry-01',
    quarryName: 'Abeokuta North High-Grade Quarry',
    destinationId: 'dest-01',
    destinationName: 'Dangote Refinery Complex Site, Lekki',
    destinationAddress: 'Block 4, Industrial Zone, Lekki Free Trade Zone, Lagos',
    truckId: 'trk-01',
    truckRegistration: 'KJA-104-XA',
    driverId: 'drv-01',
    driverName: 'Ibrahim Musa',
    driverPhone: '+234 803 111 2233',
    status: 'DELIVERED',
    scheduledDate: '2026-08-25',
    quarryArrivalAt: '2026-08-25T07:15:00Z',
    loadingStartedAt: '2026-08-25T07:45:00Z',
    loadingCompletedAt: '2026-08-25T08:30:00Z',
    dispatchedAt: '2026-08-25T08:45:00Z',
    arrivedSiteAt: '2026-08-25T13:10:00Z',
    deliveredAt: '2026-08-25T14:00:00Z',
    completedAt: '2026-08-25T14:05:00Z',
    weighbridge: {
      id: 'wb-01',
      tripId: 'trp-01',
      weighbridgeTicketNumber: 'WB-ABK-990142',
      loadingTicketNumber: 'LDT-0825-11',
      grossWeightTonnes: 45.40,
      tareWeightTonnes: 15.20,
      netWeightTonnes: 30.20,
      plannedWeightTonnes: 30.00,
      varianceTonnes: 0.20,
      variancePercent: 0.67,
      loadingOfficerName: 'Engr. Segun Adeyemi',
      loadingBay: 'BAY-01 (Primary Hopper)',
      ticketStoragePath: 'quarry_tickets/wb_990142.pdf',
      recordedAt: '2026-08-25T08:30:00Z',
    },
    pod: {
      id: 'pod-01',
      tripId: 'trp-01',
      requisitionId: 'req-01',
      customerId: 'cus-buildcorp',
      receiverName: 'Engr. Babatunde Alabi',
      receiverPhone: '+234 802 334 9988',
      receivedByDesignation: 'Site Receiving Engineer',
      deliveredQuantityTonnes: 30.20,
      deliveryTime: '2026-08-25T14:00:00Z',
      signatureStoragePath: 'pod_signatures/sig_trp01.png',
      photoStoragePaths: ['pod_photos/trp01_offload.jpg'],
      driverRemarks: 'Offloaded at Bay A without bottleneck',
      receiverRemarks: 'High grade 3/4 inch aggregate confirmed and tested on site',
      createdAt: '2026-08-25T14:05:00Z',
    },
    createdAt: '2026-08-25T06:00:00Z',
  },
  {
    id: 'trp-02',
    requisitionId: 'req-01',
    requisitionNumber: 'REQ-2026-000041',
    customerId: 'cus-buildcorp',
    customerName: 'BuildCorp Nigeria Limited',
    tripNumber: 'TRP-2026-000082',
    tripIndex: 2,
    totalTripsInOrder: 5,
    plannedQuantityTonnes: 30.00,
    materialId: 'mat-01',
    materialName: 'Granite 3/4 Inch (20mm Aggregate)',
    quarryId: 'qry-01',
    quarryName: 'Abeokuta North High-Grade Quarry',
    destinationId: 'dest-01',
    destinationName: 'Dangote Refinery Complex Site, Lekki',
    destinationAddress: 'Block 4, Industrial Zone, Lekki Free Trade Zone, Lagos',
    truckId: 'trk-02',
    truckRegistration: 'LSR-492-YY',
    driverId: 'drv-02',
    driverName: 'Babatunde Adeleke',
    driverPhone: '+234 805 222 3344',
    status: 'DELIVERED',
    scheduledDate: '2026-08-25',
    quarryArrivalAt: '2026-08-25T08:00:00Z',
    loadingStartedAt: '2026-08-25T08:45:00Z',
    loadingCompletedAt: '2026-08-25T09:30:00Z',
    dispatchedAt: '2026-08-25T09:45:00Z',
    arrivedSiteAt: '2026-08-25T14:30:00Z',
    deliveredAt: '2026-08-25T15:15:00Z',
    completedAt: '2026-08-25T15:20:00Z',
    weighbridge: {
      id: 'wb-02',
      tripId: 'trp-02',
      weighbridgeTicketNumber: 'WB-ABK-990145',
      loadingTicketNumber: 'LDT-0825-14',
      grossWeightTonnes: 45.10,
      tareWeightTonnes: 15.05,
      netWeightTonnes: 30.05,
      plannedWeightTonnes: 30.00,
      varianceTonnes: 0.05,
      variancePercent: 0.17,
      loadingOfficerName: 'Engr. Segun Adeyemi',
      loadingBay: 'BAY-02',
      recordedAt: '2026-08-25T09:30:00Z',
    },
    pod: {
      id: 'pod-02',
      tripId: 'trp-02',
      requisitionId: 'req-01',
      customerId: 'cus-buildcorp',
      receiverName: 'Engr. Babatunde Alabi',
      receiverPhone: '+234 802 334 9988',
      receivedByDesignation: 'Site Receiving Engineer',
      deliveredQuantityTonnes: 30.05,
      deliveryTime: '2026-08-25T15:15:00Z',
      signatureStoragePath: 'pod_signatures/sig_trp02.png',
      driverRemarks: 'Smooth transit via Sagamu-Epe corridor',
      receiverRemarks: 'Offloaded successfully',
      createdAt: '2026-08-25T15:20:00Z',
    },
    createdAt: '2026-08-25T06:00:00Z',
  },
  {
    id: 'trp-03',
    requisitionId: 'req-01',
    requisitionNumber: 'REQ-2026-000041',
    customerId: 'cus-buildcorp',
    customerName: 'BuildCorp Nigeria Limited',
    tripNumber: 'TRP-2026-000083',
    tripIndex: 3,
    totalTripsInOrder: 5,
    plannedQuantityTonnes: 30.00,
    materialId: 'mat-01',
    materialName: 'Granite 3/4 Inch (20mm Aggregate)',
    quarryId: 'qry-01',
    quarryName: 'Abeokuta North High-Grade Quarry',
    destinationId: 'dest-01',
    destinationName: 'Dangote Refinery Complex Site, Lekki',
    destinationAddress: 'Block 4, Industrial Zone, Lekki Free Trade Zone, Lagos',
    truckId: 'trk-01',
    truckRegistration: 'KJA-104-XA',
    driverId: 'drv-01',
    driverName: 'Ibrahim Musa',
    driverPhone: '+234 803 111 2233',
    status: 'IN_TRANSIT',
    scheduledDate: '2026-08-26',
    quarryArrivalAt: '2026-08-26T07:00:00Z',
    loadingStartedAt: '2026-08-26T07:30:00Z',
    loadingCompletedAt: '2026-08-26T08:15:00Z',
    dispatchedAt: '2026-08-26T08:30:00Z',
    weighbridge: {
      id: 'wb-03',
      tripId: 'trp-03',
      weighbridgeTicketNumber: 'WB-ABK-990201',
      loadingTicketNumber: 'LDT-0826-03',
      grossWeightTonnes: 45.35,
      tareWeightTonnes: 15.20,
      netWeightTonnes: 30.15,
      plannedWeightTonnes: 30.00,
      varianceTonnes: 0.15,
      variancePercent: 0.50,
      loadingOfficerName: 'Engr. Segun Adeyemi',
      loadingBay: 'BAY-01',
      recordedAt: '2026-08-26T08:15:00Z',
    },
    createdAt: '2026-08-26T06:00:00Z',
  },
  {
    id: 'trp-04',
    requisitionId: 'req-01',
    requisitionNumber: 'REQ-2026-000041',
    customerId: 'cus-buildcorp',
    customerName: 'BuildCorp Nigeria Limited',
    tripNumber: 'TRP-2026-000084',
    tripIndex: 4,
    totalTripsInOrder: 5,
    plannedQuantityTonnes: 30.00,
    materialId: 'mat-01',
    materialName: 'Granite 3/4 Inch (20mm Aggregate)',
    quarryId: 'qry-01',
    quarryName: 'Abeokuta North High-Grade Quarry',
    destinationId: 'dest-01',
    destinationName: 'Dangote Refinery Complex Site, Lekki',
    destinationAddress: 'Block 4, Industrial Zone, Lekki Free Trade Zone, Lagos',
    truckId: 'trk-02',
    truckRegistration: 'LSR-492-YY',
    driverId: 'drv-02',
    driverName: 'Babatunde Adeleke',
    driverPhone: '+234 805 222 3344',
    status: 'LOADING',
    scheduledDate: '2026-08-26',
    quarryArrivalAt: '2026-08-26T09:00:00Z',
    loadingStartedAt: '2026-08-26T09:30:00Z',
    createdAt: '2026-08-26T06:00:00Z',
  },
  {
    id: 'trp-05',
    requisitionId: 'req-01',
    requisitionNumber: 'REQ-2026-000041',
    customerId: 'cus-buildcorp',
    customerName: 'BuildCorp Nigeria Limited',
    tripNumber: 'TRP-2026-000085',
    tripIndex: 5,
    totalTripsInOrder: 5,
    plannedQuantityTonnes: 30.00,
    materialId: 'mat-01',
    materialName: 'Granite 3/4 Inch (20mm Aggregate)',
    quarryId: 'qry-01',
    quarryName: 'Abeokuta North High-Grade Quarry',
    destinationId: 'dest-01',
    destinationName: 'Dangote Refinery Complex Site, Lekki',
    destinationAddress: 'Block 4, Industrial Zone, Lekki Free Trade Zone, Lagos',
    truckId: 'trk-03',
    truckRegistration: 'APP-883-ZZ',
    driverId: 'drv-03',
    driverName: 'Chinedu Okonkwo',
    driverPhone: '+234 802 777 8899',
    status: 'SCHEDULED',
    scheduledDate: '2026-08-26',
    createdAt: '2026-08-26T06:00:00Z',
  },
];

export class MockDeliveryRepository implements IDeliveryRepository {
  private trips = [...mockTrips];

  // Legacy compatibility
  async list(customerId?: string): Promise<Delivery[]> {
    await new Promise((r) => setTimeout(r, 100));
    return this.trips.map((t) => ({
      id: t.id,
      orderId: t.requisitionId,
      orderReference: t.requisitionNumber || 'REQ-2026-000041',
      materialName: t.materialName || 'Granite Aggregate',
      quantity: t.plannedQuantityTonnes,
      unit: 'Tonnes',
      quarryName: t.quarryName || 'Quarry',
      destination: t.destinationName || 'Lekki',
      destinationAddress: t.destinationAddress || 'Lagos',
      truckRegistration: t.truckRegistration || 'KJA-104-XA',
      driverName: t.driverName || 'Driver',
      driverPhone: t.driverPhone || '+234 800 000 0000',
      status: (t.status === 'DELIVERED' ? 'delivered' : t.status === 'IN_TRANSIT' ? 'in_transit' : 'loading') as any,
      dispatchedAt: t.dispatchedAt,
      deliveredAt: t.deliveredAt,
      createdAt: t.createdAt,
    }));
  }

  async getActiveDelivery(customerId?: string): Promise<Delivery | null> {
    const list = await this.list(customerId);
    return list.find((d) => d.status === 'in_transit' || d.status === 'loading') || list[0] || null;
  }

  async getById(id: string): Promise<Delivery | null> {
    const list = await this.list();
    return list.find((d) => d.id === id) || null;
  }

  // Phase 7 Multi-Trip APIs
  async getTrips(filters?: { customerId?: string; requisitionId?: string; status?: TripStatus; driverId?: string; quarryId?: string }): Promise<DeliveryTripRecord[]> {
    await new Promise((r) => setTimeout(r, 100));
    return this.trips.filter((t) => {
      if (filters?.customerId && t.customerId !== filters.customerId) return false;
      if (filters?.requisitionId && t.requisitionId !== filters.requisitionId) return false;
      if (filters?.status && t.status !== filters.status) return false;
      if (filters?.driverId && t.driverId !== filters.driverId) return false;
      if (filters?.quarryId && t.quarryId !== filters.quarryId) return false;
      return true;
    });
  }

  async getTripById(id: string): Promise<DeliveryTripRecord | null> {
    await new Promise((r) => setTimeout(r, 80));
    return this.trips.find((t) => t.id === id || t.tripNumber === id) || null;
  }

  async scheduleRequisitionTrips(requisitionId: string, tripCapacities: number[] = [30, 30, 30, 30, 30]): Promise<{ requisitionId: string; totalTrips: number; trips: DeliveryTripRecord[] }> {
    await new Promise((r) => setTimeout(r, 200));
    const created: DeliveryTripRecord[] = tripCapacities.map((cap, i) => ({
      id: `trp-${Date.now().toString().slice(-6)}-${i + 1}`,
      requisitionId,
      requisitionNumber: 'REQ-2026-000041',
      customerId: 'cus-buildcorp',
      customerName: 'BuildCorp Nigeria Limited',
      tripNumber: `TRP-2026-${String(Math.floor(100000 + Math.random() * 900000))}`,
      tripIndex: i + 1,
      totalTripsInOrder: tripCapacities.length,
      plannedQuantityTonnes: cap,
      materialName: 'Granite 3/4 Inch (20mm Aggregate)',
      quarryName: 'Abeokuta North High-Grade Quarry',
      destinationName: 'Dangote Refinery Complex Site, Lekki',
      destinationAddress: 'Lekki Free Trade Zone, Lagos',
      status: 'PLANNED',
      createdAt: new Date().toISOString(),
    }));
    this.trips.unshift(...created);
    return { requisitionId, totalTrips: created.length, trips: created };
  }

  async assignTrip(payload: TripAssignmentPayload): Promise<DeliveryTripRecord> {
    await new Promise((r) => setTimeout(r, 150));
    const trip = this.trips.find((t) => t.id === payload.tripId);
    if (!trip) throw new Error('Trip not found');

    trip.truckId = payload.truckId;
    trip.truckRegistration = payload.truckId === 'trk-01' ? 'KJA-104-XA' : payload.truckId === 'trk-02' ? 'LSR-492-YY' : 'APP-883-ZZ';
    trip.driverId = payload.driverId;
    trip.driverName = payload.driverId === 'drv-01' ? 'Ibrahim Musa' : payload.driverId === 'drv-02' ? 'Babatunde Adeleke' : 'Chinedu Okonkwo';
    trip.driverPhone = '+234 803 111 2233';
    trip.scheduledDate = payload.scheduledDate || new Date().toISOString().split('T')[0];
    trip.status = 'ASSIGNED';
    trip.notes = payload.notes || trip.notes;
    trip.updatedAt = new Date().toISOString();
    return trip;
  }

  async recordQuarryCheckin(tripId: string): Promise<DeliveryTripRecord> {
    await new Promise((r) => setTimeout(r, 120));
    const trip = this.trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');
    trip.status = 'AT_QUARRY';
    trip.quarryArrivalAt = new Date().toISOString();
    trip.updatedAt = new Date().toISOString();
    return trip;
  }

  async recordWeighbridgeAndLoading(payload: WeighbridgeCapturePayload): Promise<DeliveryTripRecord> {
    await new Promise((r) => setTimeout(r, 180));
    const trip = this.trips.find((t) => t.id === payload.tripId);
    if (!trip) throw new Error('Trip not found');

    const netResult = calculateNetWeight(payload.grossWeightTonnes, payload.tareWeightTonnes);
    if (!netResult.isValid) throw new Error(netResult.error || 'Invalid weights');

    const varResult = calculateWeightVariance(netResult.netWeightTonnes, trip.plannedQuantityTonnes);

    trip.weighbridge = {
      id: `wb-${Date.now().toString().slice(-6)}`,
      tripId: payload.tripId,
      weighbridgeTicketNumber: payload.weighbridgeTicketNumber,
      loadingTicketNumber: payload.loadingTicketNumber || `LDT-${Date.now().toString().slice(-4)}`,
      grossWeightTonnes: payload.grossWeightTonnes,
      tareWeightTonnes: payload.tareWeightTonnes,
      netWeightTonnes: netResult.netWeightTonnes,
      plannedWeightTonnes: trip.plannedQuantityTonnes,
      varianceTonnes: varResult.varianceTonnes,
      variancePercent: varResult.variancePercent,
      loadingOfficerName: 'Quarry Dispatch Officer',
      loadingBay: payload.loadingBay || 'BAY-01',
      ticketStoragePath: payload.ticketStoragePath || (typeof payload.ticketFile === 'string' ? payload.ticketFile : 'quarry_tickets/wb_ticket.pdf'),
      remarks: payload.remarks,
      recordedAt: new Date().toISOString(),
    };

    trip.status = 'LOADED';
    trip.loadingCompletedAt = new Date().toISOString();
    trip.updatedAt = new Date().toISOString();
    return trip;
  }

  async dispatchTrip(tripId: string): Promise<DeliveryTripRecord> {
    await new Promise((r) => setTimeout(r, 150));
    const trip = this.trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');
    trip.status = 'DISPATCHED';
    trip.dispatchedAt = new Date().toISOString();
    trip.updatedAt = new Date().toISOString();
    return trip;
  }

  async recordTripPod(payload: PodSubmissionPayload): Promise<DeliveryTripRecord> {
    await new Promise((r) => setTimeout(r, 200));
    const trip = this.trips.find((t) => t.id === payload.tripId);
    if (!trip) throw new Error('Trip not found');

    trip.pod = {
      id: `pod-${Date.now().toString().slice(-6)}`,
      tripId: payload.tripId,
      requisitionId: trip.requisitionId,
      customerId: trip.customerId,
      receiverName: payload.receiverName,
      receiverPhone: payload.receiverPhone,
      receivedByDesignation: payload.receivedByDesignation || 'Site Receiving Engineer',
      deliveredQuantityTonnes: payload.deliveredQuantityTonnes,
      deliveryTime: new Date().toISOString(),
      signatureStoragePath: payload.signatureStoragePath || (typeof payload.signatureFile === 'string' ? payload.signatureFile : 'pod_signatures/customer_signature.png'),
      photoStoragePaths: payload.photoStoragePaths || ['pod_photos/site_offload.jpg'],
      driverRemarks: payload.driverRemarks,
      receiverRemarks: payload.receiverRemarks,
      createdAt: new Date().toISOString(),
    };

    trip.status = 'DELIVERED';
    trip.deliveredAt = new Date().toISOString();
    trip.completedAt = new Date().toISOString();
    trip.updatedAt = new Date().toISOString();

    // Release assigned truck and driver availability without overwriting maintenance or inactive status
    if (trip.truckId) {
      const truck = mockFleetTrucks.find((t) => t.id === trip.truckId);
      if (truck) {
        truck.activeTripId = undefined;
        if (truck.availabilityStatus !== 'UNAVAILABLE' && truck.availabilityStatus !== 'INACTIVE') {
          truck.availabilityStatus = 'AVAILABLE';
        }
      }
    }

    if (trip.driverId) {
      const driver = mockDrivers.find((d) => d.id === trip.driverId);
      if (
        driver &&
        driver.isActive &&
        driver.availabilityStatus !== 'ON_LEAVE' &&
        driver.availabilityStatus !== 'SUSPENDED' &&
        driver.availabilityStatus !== 'TERMINATED'
      ) {
        driver.availabilityStatus = 'AVAILABLE';
      }
    }

    return trip;
  }

  async getOrderFulfillmentSummary(requisitionId: string): Promise<OrderFulfillmentSummary> {
    await new Promise((r) => setTimeout(r, 80));
    const orderTrips = this.trips.filter((t) => t.requisitionId === requisitionId);
    const orderedQuantity = 150.00;

    const progress = calculateOrderFulfillment(
      orderedQuantity,
      orderTrips.map((t) => ({
        status: t.status,
        plannedQuantityTonnes: t.plannedQuantityTonnes,
        netWeightTonnes: t.weighbridge?.netWeightTonnes,
        deliveredQuantityTonnes: t.pod?.deliveredQuantityTonnes,
      }))
    );

    return {
      requisitionId,
      referenceNumber: orderTrips[0]?.requisitionNumber || 'REQ-2026-000041',
      customerName: orderTrips[0]?.customerName || 'BuildCorp Nigeria Limited',
      destinationName: orderTrips[0]?.destinationName || 'Dangote Refinery Complex Site, Lekki',
      materialName: orderTrips[0]?.materialName || 'Granite 3/4 Inch (20mm Aggregate)',
      orderedQuantity: progress.ordered,
      plannedQuantity: progress.planned,
      loadedQuantity: progress.loaded,
      dispatchedQuantity: progress.dispatched,
      deliveredQuantity: progress.delivered,
      remainingQuantity: progress.remaining,
      fulfillmentPercent: progress.fulfillmentPercent,
      status: progress.isFullyDelivered ? 'DELIVERED' : progress.dispatched > 0 ? 'IN_TRANSIT' : 'SCHEDULED',
      trips: orderTrips,
    };
  }

  async getCustomerFulfillments(customerId?: string): Promise<OrderFulfillmentSummary[]> {
    await new Promise((r) => setTimeout(r, 100));
    const summary = await this.getOrderFulfillmentSummary('req-01');
    return [summary];
  }

  async getDriverTrips(driverId?: string): Promise<DeliveryTripRecord[]> {
    await new Promise((r) => setTimeout(r, 80));
    return this.trips.filter((t) => !driverId || t.driverId === driverId || t.driverId === 'drv-01');
  }

  async getQuarryQueue(quarryId?: string): Promise<{ scheduled: DeliveryTripRecord[]; atQuarry: DeliveryTripRecord[]; loading: DeliveryTripRecord[]; loaded: DeliveryTripRecord[] }> {
    await new Promise((r) => setTimeout(r, 100));
    return {
      scheduled: this.trips.filter((t) => t.status === 'SCHEDULED' || t.status === 'ASSIGNED'),
      atQuarry: this.trips.filter((t) => t.status === 'AT_QUARRY'),
      loading: this.trips.filter((t) => t.status === 'LOADING'),
      loaded: this.trips.filter((t) => t.status === 'LOADED'),
    };
  }

  async getOperationsKPIs(): Promise<OperationsDashboardKPIs> {
    await new Promise((r) => setTimeout(r, 80));
    return {
      scheduledTripsToday: this.trips.filter((t) => t.status === 'SCHEDULED' || t.status === 'ASSIGNED').length,
      trucksAtQuarry: this.trips.filter((t) => t.status === 'AT_QUARRY').length,
      activeLoadingCount: this.trips.filter((t) => t.status === 'LOADING').length,
      dispatchedInTransit: this.trips.filter((t) => t.status === 'IN_TRANSIT' || t.status === 'DISPATCHED').length,
      completedDeliveriesToday: this.trips.filter((t) => t.status === 'DELIVERED').length,
      tonnesDeliveredToday: this.trips
        .filter((t) => t.status === 'DELIVERED')
        .reduce((sum, t) => sum + (t.pod?.deliveredQuantityTonnes || t.weighbridge?.netWeightTonnes || 30), 0),
      activeExceptionsCount: 0,
    };
  }
}

export const mockDeliveryApi = new MockDeliveryRepository();
