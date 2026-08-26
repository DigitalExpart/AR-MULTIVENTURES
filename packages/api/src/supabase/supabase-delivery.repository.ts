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
import { supabase } from './supabase-client';

export class SupabaseDeliveryRepository implements IDeliveryRepository {
  async list(customerId?: string): Promise<Delivery[]> {
    let query = supabase.from('delivery_trips').select('*').order('created_at', { ascending: false });
    if (customerId) query = query.eq('customer_id', customerId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list deliveries: ${error.message}`);
    return (data || []).map((t: any) => ({
      id: t.id,
      orderId: t.requisition_id,
      orderReference: t.trip_number,
      materialName: 'Granite Aggregate',
      quantity: Number(t.planned_quantity_tonnes),
      unit: 'Tonnes',
      quarryName: 'Quarry Origin',
      destination: 'Site Destination',
      destinationAddress: 'Delivery Address',
      truckRegistration: 'Truck',
      driverName: 'Driver',
      driverPhone: '',
      status: t.status === 'DELIVERED' ? 'delivered' : t.status === 'IN_TRANSIT' ? 'in_transit' : 'loading',
      dispatchedAt: t.dispatched_at,
      deliveredAt: t.delivered_at,
      createdAt: t.created_at,
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

  async getTrips(filters?: { customerId?: string; requisitionId?: string; status?: TripStatus; driverId?: string; quarryId?: string }): Promise<DeliveryTripRecord[]> {
    let query = supabase
      .from('delivery_trips')
      .select(`
        *,
        trucks(registration_number, make, model),
        drivers(first_name, last_name, phone_number),
        quarries(name),
        destinations(name, address),
        materials(name),
        trip_weighbridge_records(*),
        trip_proof_of_delivery(*)
      `)
      .order('trip_index', { ascending: true });

    if (filters?.customerId) query = query.eq('customer_id', filters.customerId);
    if (filters?.requisitionId) query = query.eq('requisition_id', filters.requisitionId);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.driverId) query = query.eq('driver_id', filters.driverId);
    if (filters?.quarryId) query = query.eq('quarry_id', filters.quarryId);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch trips: ${error.message}`);

    return (data || []).map((t: any) => ({
      id: t.id,
      organizationId: t.organization_id,
      requisitionId: t.requisition_id,
      customerId: t.customer_id,
      tripNumber: t.trip_number,
      tripIndex: t.trip_index,
      totalTripsInOrder: t.total_trips_in_order,
      plannedQuantityTonnes: Number(t.planned_quantity_tonnes),
      materialId: t.material_id,
      materialName: t.materials?.name,
      quarryId: t.quarry_id,
      quarryName: t.quarries?.name,
      destinationId: t.destination_id,
      destinationName: t.destinations?.name,
      destinationAddress: t.destinations?.address,
      truckId: t.truck_id,
      truckRegistration: t.trucks?.registration_number,
      driverId: t.driver_id,
      driverName: t.drivers ? `${t.drivers.first_name} ${t.drivers.last_name}` : undefined,
      driverPhone: t.drivers?.phone_number,
      status: t.status,
      scheduledDate: t.scheduled_date,
      quarryArrivalAt: t.quarry_arrival_at,
      loadingStartedAt: t.loading_started_at,
      loadingCompletedAt: t.loading_completed_at,
      dispatchedAt: t.dispatched_at,
      arrivedSiteAt: t.arrived_site_at,
      deliveredAt: t.delivered_at,
      completedAt: t.completed_at,
      notes: t.notes,
      weighbridge: t.trip_weighbridge_records?.[0]
        ? {
            id: t.trip_weighbridge_records[0].id,
            tripId: t.trip_weighbridge_records[0].trip_id,
            weighbridgeTicketNumber: t.trip_weighbridge_records[0].weighbridge_ticket_number,
            grossWeightTonnes: Number(t.trip_weighbridge_records[0].gross_weight_tonnes),
            tareWeightTonnes: Number(t.trip_weighbridge_records[0].tare_weight_tonnes),
            netWeightTonnes: Number(t.trip_weighbridge_records[0].net_weight_tonnes),
            plannedWeightTonnes: Number(t.trip_weighbridge_records[0].planned_weight_tonnes),
            varianceTonnes: Number(t.trip_weighbridge_records[0].variance_tonnes),
            variancePercent: Number(t.trip_weighbridge_records[0].variance_percent),
            loadingBay: t.trip_weighbridge_records[0].loading_bay,
            recordedAt: t.trip_weighbridge_records[0].created_at,
          }
        : undefined,
      pod: t.trip_proof_of_delivery?.[0]
        ? {
            id: t.trip_proof_of_delivery[0].id,
            tripId: t.trip_proof_of_delivery[0].trip_id,
            requisitionId: t.trip_proof_of_delivery[0].requisition_id,
            customerId: t.trip_proof_of_delivery[0].customer_id,
            receiverName: t.trip_proof_of_delivery[0].receiver_name,
            receiverPhone: t.trip_proof_of_delivery[0].receiver_phone,
            receivedByDesignation: t.trip_proof_of_delivery[0].received_by_designation,
            deliveredQuantityTonnes: Number(t.trip_proof_of_delivery[0].delivered_quantity_tonnes),
            deliveryTime: t.trip_proof_of_delivery[0].delivery_time,
            signatureStoragePath: t.trip_proof_of_delivery[0].signature_storage_path,
            createdAt: t.trip_proof_of_delivery[0].created_at,
          }
        : undefined,
      createdAt: t.created_at,
    }));
  }

  async getTripById(id: string): Promise<DeliveryTripRecord | null> {
    const list = await this.getTrips();
    return list.find((t) => t.id === id || t.tripNumber === id) || null;
  }

  async scheduleRequisitionTrips(requisitionId: string, tripCapacities: number[] = [30, 30, 30, 30, 30]): Promise<{ requisitionId: string; totalTrips: number; trips: DeliveryTripRecord[] }> {
    const { data, error } = await supabase.rpc('schedule_requisition_trips', {
      p_requisition_id: requisitionId,
      p_trip_capacities: tripCapacities,
    });
    if (error) throw new Error(`Failed to schedule trips in Supabase: ${error.message}`);
    const trips = await this.getTrips({ requisitionId });
    return { requisitionId, totalTrips: trips.length, trips };
  }

  async assignTrip(payload: TripAssignmentPayload): Promise<DeliveryTripRecord> {
    const { data, error } = await supabase.rpc('assign_trip_truck_and_driver', {
      p_trip_id: payload.tripId,
      p_truck_id: payload.truckId,
      p_driver_id: payload.driverId,
      p_scheduled_date: payload.scheduledDate,
      p_notes: payload.notes,
    });
    if (error) throw new Error(`Failed to assign trip: ${error.message}`);
    const updated = await this.getTripById(payload.tripId);
    if (!updated) throw new Error('Failed to retrieve updated trip');
    return updated;
  }

  async recordQuarryCheckin(tripId: string): Promise<DeliveryTripRecord> {
    const { data, error } = await supabase
      .from('delivery_trips')
      .update({ status: 'AT_QUARRY', quarry_arrival_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', tripId)
      .select()
      .single();
    if (error) throw new Error(`Failed to record quarry checkin: ${error.message}`);
    const updated = await this.getTripById(tripId);
    if (!updated) throw new Error('Trip not found');
    return updated;
  }

  async recordWeighbridgeAndLoading(payload: WeighbridgeCapturePayload): Promise<DeliveryTripRecord> {
    const { data, error } = await supabase.rpc('record_weighbridge_and_loading', {
      p_trip_id: payload.tripId,
      p_weighbridge_ticket_number: payload.weighbridgeTicketNumber,
      p_gross_weight: payload.grossWeightTonnes,
      p_tare_weight: payload.tareWeightTonnes,
      p_loading_ticket_number: payload.loadingTicketNumber,
      p_loading_bay: payload.loadingBay,
      p_ticket_storage_path: payload.ticketStoragePath,
      p_remarks: payload.remarks,
    });
    if (error) throw new Error(`Failed to capture weighbridge record: ${error.message}`);
    const updated = await this.getTripById(payload.tripId);
    if (!updated) throw new Error('Trip not found');
    return updated;
  }

  async dispatchTrip(tripId: string): Promise<DeliveryTripRecord> {
    const { data, error } = await supabase.rpc('dispatch_trip', { p_trip_id: tripId });
    if (error) throw new Error(`Failed to dispatch trip: ${error.message}`);
    const updated = await this.getTripById(tripId);
    if (!updated) throw new Error('Trip not found');
    return updated;
  }

  async recordTripPod(payload: PodSubmissionPayload): Promise<DeliveryTripRecord> {
    const { data, error } = await supabase.rpc('record_trip_pod', {
      p_trip_id: payload.tripId,
      p_receiver_name: payload.receiverName,
      p_delivered_quantity: payload.deliveredQuantityTonnes,
      p_signature_storage_path: payload.signatureStoragePath || 'pod_signatures/default_sig.png',
      p_receiver_phone: payload.receiverPhone,
      p_receiver_designation: payload.receivedByDesignation,
      p_photo_storage_paths: payload.photoStoragePaths || [],
      p_driver_remarks: payload.driverRemarks,
      p_receiver_remarks: payload.receiverRemarks,
    });
    if (error) throw new Error(`Failed to record POD: ${error.message}`);
    const updated = await this.getTripById(payload.tripId);
    if (!updated) throw new Error('Trip not found');
    return updated;
  }

  async getOrderFulfillmentSummary(requisitionId: string): Promise<OrderFulfillmentSummary> {
    const { data, error } = await supabase.rpc('get_requisition_fulfillment_summary', {
      p_requisition_id: requisitionId,
    });
    if (error) throw new Error(`Failed to get fulfillment summary: ${error.message}`);
    return data as OrderFulfillmentSummary;
  }

  async getCustomerFulfillments(customerId?: string): Promise<OrderFulfillmentSummary[]> {
    const trips = await this.getTrips({ customerId });
    const reqIds = Array.from(new Set(trips.map((t) => t.requisitionId)));
    const summaries = await Promise.all(reqIds.map((id) => this.getOrderFulfillmentSummary(id)));
    return summaries;
  }

  async getDriverTrips(driverId?: string): Promise<DeliveryTripRecord[]> {
    return this.getTrips({ driverId });
  }

  async getQuarryQueue(quarryId?: string): Promise<{ scheduled: DeliveryTripRecord[]; atQuarry: DeliveryTripRecord[]; loading: DeliveryTripRecord[]; loaded: DeliveryTripRecord[] }> {
    const trips = await this.getTrips({ quarryId });
    return {
      scheduled: trips.filter((t) => t.status === 'SCHEDULED' || t.status === 'ASSIGNED'),
      atQuarry: trips.filter((t) => t.status === 'AT_QUARRY'),
      loading: trips.filter((t) => t.status === 'LOADING'),
      loaded: trips.filter((t) => t.status === 'LOADED'),
    };
  }

  async getOperationsKPIs(): Promise<OperationsDashboardKPIs> {
    const trips = await this.getTrips();
    return {
      scheduledTripsToday: trips.filter((t) => t.status === 'SCHEDULED' || t.status === 'ASSIGNED').length,
      trucksAtQuarry: trips.filter((t) => t.status === 'AT_QUARRY').length,
      activeLoadingCount: trips.filter((t) => t.status === 'LOADING').length,
      dispatchedInTransit: trips.filter((t) => t.status === 'IN_TRANSIT' || t.status === 'DISPATCHED').length,
      completedDeliveriesToday: trips.filter((t) => t.status === 'DELIVERED').length,
      tonnesDeliveredToday: trips
        .filter((t) => t.status === 'DELIVERED')
        .reduce((sum, t) => sum + (t.pod?.deliveredQuantityTonnes || t.weighbridge?.netWeightTonnes || 30), 0),
      activeExceptionsCount: 0,
    };
  }
}
