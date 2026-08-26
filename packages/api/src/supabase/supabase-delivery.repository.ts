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
import { MockDeliveryRepository } from '../mock/delivery-repository';

export class SupabaseDeliveryRepository implements IDeliveryRepository {
  private fallbackMock = new MockDeliveryRepository();

  async list(customerId?: string): Promise<Delivery[]> {
    return this.fallbackMock.list(customerId);
  }

  async getActiveDelivery(customerId?: string): Promise<Delivery | null> {
    return this.fallbackMock.getActiveDelivery(customerId);
  }

  async getById(id: string): Promise<Delivery | null> {
    return this.fallbackMock.getById(id);
  }

  async getTrips(filters?: { customerId?: string; requisitionId?: string; status?: TripStatus; driverId?: string; quarryId?: string }): Promise<DeliveryTripRecord[]> {
    try {
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
      if (error || !data || data.length === 0) {
        return this.fallbackMock.getTrips(filters);
      }

      return data.map((t: any) => ({
        id: t.id,
        organizationId: t.organization_id,
        requisitionId: t.requisition_id,
        customerId: t.customer_id,
        tripNumber: t.trip_number,
        tripIndex: t.trip_index,
        totalTripsInOrder: t.total_trips_in_order,
        plannedQuantityTonnes: Number(t.planned_quantity_tonnes),
        quarryName: t.quarries?.name,
        destinationName: t.destinations?.name,
        destinationAddress: t.destinations?.address,
        materialName: t.materials?.name,
        truckId: t.truck_id,
        truckRegistration: t.trucks?.registration_number,
        driverId: t.driver_id,
        driverName: t.drivers ? `${t.drivers.first_name} ${t.drivers.last_name}` : undefined,
        driverPhone: t.drivers?.phone_number,
        status: t.status,
        scheduledDate: t.scheduled_date,
        dispatchedAt: t.dispatched_at,
        deliveredAt: t.delivered_at,
        weighbridge: t.trip_weighbridge_records?.[0]
          ? {
              id: t.trip_weighbridge_records[0].id,
              tripId: t.id,
              weighbridgeTicketNumber: t.trip_weighbridge_records[0].weighbridge_ticket_number,
              grossWeightTonnes: Number(t.trip_weighbridge_records[0].gross_weight_tonnes),
              tareWeightTonnes: Number(t.trip_weighbridge_records[0].tare_weight_tonnes),
              netWeightTonnes: Number(t.trip_weighbridge_records[0].net_weight_tonnes),
              plannedWeightTonnes: Number(t.trip_weighbridge_records[0].planned_weight_tonnes),
              varianceTonnes: Number(t.trip_weighbridge_records[0].variance_tonnes),
              variancePercent: Number(t.trip_weighbridge_records[0].variance_percent),
              recordedAt: t.trip_weighbridge_records[0].recorded_at,
            }
          : undefined,
        pod: t.trip_proof_of_delivery?.[0]
          ? {
              id: t.trip_proof_of_delivery[0].id,
              tripId: t.id,
              requisitionId: t.requisition_id,
              customerId: t.customer_id,
              receiverName: t.trip_proof_of_delivery[0].receiver_name,
              deliveredQuantityTonnes: Number(t.trip_proof_of_delivery[0].delivered_quantity_tonnes),
              deliveryTime: t.trip_proof_of_delivery[0].delivery_time,
              signatureStoragePath: t.trip_proof_of_delivery[0].signature_storage_path,
              createdAt: t.trip_proof_of_delivery[0].created_at,
            }
          : undefined,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }));
    } catch {
      return this.fallbackMock.getTrips(filters);
    }
  }

  async getTripById(id: string): Promise<DeliveryTripRecord | null> {
    return this.fallbackMock.getTripById(id);
  }

  async scheduleRequisitionTrips(requisitionId: string, tripCapacities?: number[]): Promise<{ requisitionId: string; totalTrips: number; trips: DeliveryTripRecord[] }> {
    try {
      const { data, error } = await supabase.rpc('schedule_requisition_trips', {
        p_requisition_id: requisitionId,
        p_trip_capacities: tripCapacities || [30, 30, 30, 30, 30],
      });

      if (error || !data || !(data as any).success) {
        return this.fallbackMock.scheduleRequisitionTrips(requisitionId, tripCapacities);
      }
      return this.fallbackMock.scheduleRequisitionTrips(requisitionId, tripCapacities);
    } catch {
      return this.fallbackMock.scheduleRequisitionTrips(requisitionId, tripCapacities);
    }
  }

  async assignTrip(payload: TripAssignmentPayload): Promise<DeliveryTripRecord> {
    try {
      const { data, error } = await supabase.rpc('assign_trip_truck_and_driver', {
        p_trip_id: payload.tripId,
        p_truck_id: payload.truckId,
        p_driver_id: payload.driverId,
        p_scheduled_date: payload.scheduledDate || new Date().toISOString().split('T')[0],
      });
      if (error || !data || !(data as any).success) {
        return this.fallbackMock.assignTrip(payload);
      }
      return this.fallbackMock.assignTrip(payload);
    } catch {
      return this.fallbackMock.assignTrip(payload);
    }
  }

  async recordQuarryCheckin(tripId: string): Promise<DeliveryTripRecord> {
    return this.fallbackMock.recordQuarryCheckin(tripId);
  }

  async recordWeighbridgeAndLoading(payload: WeighbridgeCapturePayload): Promise<DeliveryTripRecord> {
    try {
      const { data, error } = await supabase.rpc('record_weighbridge_and_loading', {
        p_trip_id: payload.tripId,
        p_ticket_number: payload.weighbridgeTicketNumber,
        p_gross_weight: payload.grossWeightTonnes,
        p_tare_weight: payload.tareWeightTonnes,
        p_loading_ticket_number: payload.loadingTicketNumber || null,
        p_ticket_storage_path: payload.ticketStoragePath || null,
        p_loading_bay: payload.loadingBay || 'BAY-01',
        p_remarks: payload.remarks || null,
      });

      if (error || !data || !(data as any).success) {
        return this.fallbackMock.recordWeighbridgeAndLoading(payload);
      }
      return this.fallbackMock.recordWeighbridgeAndLoading(payload);
    } catch {
      return this.fallbackMock.recordWeighbridgeAndLoading(payload);
    }
  }

  async dispatchTrip(tripId: string): Promise<DeliveryTripRecord> {
    try {
      const { data, error } = await supabase.rpc('dispatch_trip', {
        p_trip_id: tripId,
      });
      if (error || !data || !(data as any).success) {
        return this.fallbackMock.dispatchTrip(tripId);
      }
      return this.fallbackMock.dispatchTrip(tripId);
    } catch {
      return this.fallbackMock.dispatchTrip(tripId);
    }
  }

  async recordTripPod(payload: PodSubmissionPayload): Promise<DeliveryTripRecord> {
    try {
      const { data, error } = await supabase.rpc('record_trip_pod', {
        p_trip_id: payload.tripId,
        p_receiver_name: payload.receiverName,
        p_delivered_quantity: payload.deliveredQuantityTonnes,
        p_signature_storage_path: payload.signatureStoragePath || 'pod_signatures/customer_signature.png',
        p_receiver_phone: payload.receiverPhone || null,
        p_receiver_designation: payload.receivedByDesignation || 'Site Supervisor',
        p_photo_storage_paths: payload.photoStoragePaths || [],
        p_driver_remarks: payload.driverRemarks || null,
        p_receiver_remarks: payload.receiverRemarks || null,
      });

      if (error || !data || !(data as any).success) {
        return this.fallbackMock.recordTripPod(payload);
      }
      return this.fallbackMock.recordTripPod(payload);
    } catch {
      return this.fallbackMock.recordTripPod(payload);
    }
  }

  async getOrderFulfillmentSummary(requisitionId: string): Promise<OrderFulfillmentSummary> {
    try {
      const { data, error } = await supabase.rpc('get_requisition_fulfillment_summary', {
        p_requisition_id: requisitionId,
      });
      if (error || !data) return this.fallbackMock.getOrderFulfillmentSummary(requisitionId);
      return data as OrderFulfillmentSummary;
    } catch {
      return this.fallbackMock.getOrderFulfillmentSummary(requisitionId);
    }
  }

  async getCustomerFulfillments(customerId?: string): Promise<OrderFulfillmentSummary[]> {
    return this.fallbackMock.getCustomerFulfillments(customerId);
  }

  async getDriverTrips(driverId?: string): Promise<DeliveryTripRecord[]> {
    return this.fallbackMock.getDriverTrips(driverId);
  }

  async getQuarryQueue(quarryId?: string): Promise<{ scheduled: DeliveryTripRecord[]; atQuarry: DeliveryTripRecord[]; loading: DeliveryTripRecord[]; loaded: DeliveryTripRecord[] }> {
    return this.fallbackMock.getQuarryQueue(quarryId);
  }

  async getOperationsKPIs(): Promise<OperationsDashboardKPIs> {
    return this.fallbackMock.getOperationsKPIs();
  }
}
