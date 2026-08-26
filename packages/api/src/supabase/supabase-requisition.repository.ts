import type { IRequisitionRepository } from '../interfaces';
import type { Requisition, NewRequisitionPayload, PriceQuoteRequest, PriceQuoteBreakdown } from '@ar-multiventures/types';
import { supabase } from './supabase-client';

export class SupabaseRequisitionRepository implements IRequisitionRepository {
  async list(customerId?: string): Promise<Requisition[]> {
    let query = supabase
      .from('requisitions')
      .select(`
        *,
        quarries ( name ),
        requisition_items (
          id,
          material_id,
          quantity,
          unit,
          unit_price_snapshot,
          line_total,
          materials ( name )
        )
      `)
      .order('created_at', { ascending: false });

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to list requisitions from Supabase: ${error.message}`);
    }

    return data.map((row: any) => {
      const firstItem = row.requisition_items?.[0];
      const materialName = firstItem?.materials?.name || 'Standard Aggregate';

      return {
        id: row.id,
        referenceNumber: row.requisition_number,
        customerId: row.customer_id,
        quarryId: row.quarry_id,
        quarryName: row.quarries?.name || 'Assigned Quarry',
        materialId: firstItem?.material_id || '',
        materialName: materialName,
        quantity: Number(firstItem?.quantity || 30),
        unit: firstItem?.unit || 'tonnes',
        transportationType: row.transportation_option === 'SELF_PICKUP' ? 'self' : 'company',
        destination: row.destination_name_cache,
        destinationAddress: row.destination_address_cache,
        requestedDeliveryDate: row.requested_delivery_date,
        status: (row.status || 'DRAFT').toLowerCase() as any,
        pricing: {
          materialCost: Number(row.material_amount_snapshot || 0),
          loadingCharges: Number(row.loading_amount_snapshot || 0),
          haulageCharges: Number(row.haulage_amount_snapshot || 0),
          otherCharges: Number(row.other_charges_snapshot || 0),
          discount: Number(row.discount_amount_snapshot || 0),
          subtotal: Number(row.total_amount_snapshot || 0),
          tax: 0,
          total: Number(row.total_amount_snapshot || 0),
        },
        notes: row.notes || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });
  }

  async getById(id: string): Promise<Requisition | null> {
    const { data: row, error } = await supabase
      .from('requisitions')
      .select(`
        *,
        quarries ( name ),
        requisition_items (
          id,
          material_id,
          quantity,
          unit,
          unit_price_snapshot,
          line_total,
          materials ( name )
        )
      `)
      .or(`id.eq.${id},requisition_number.eq.${id}`)
      .single();

    if (error || !row) {
      return null;
    }

    const firstItem = (row as any).requisition_items?.[0];
    return {
      id: row.id,
      referenceNumber: row.requisition_number,
      customerId: row.customer_id,
      quarryId: row.quarry_id,
      quarryName: (row as any).quarries?.name || 'Assigned Quarry',
      materialId: firstItem?.material_id || '',
      materialName: firstItem?.materials?.name || 'Selected Material',
      quantity: Number(firstItem?.quantity || 30),
      unit: firstItem?.unit || 'tonnes',
      transportationType: row.transportation_option === 'SELF_PICKUP' ? 'self' : 'company',
      destination: row.destination_name_cache,
      destinationAddress: row.destination_address_cache,
      requestedDeliveryDate: row.requested_delivery_date,
      status: (row.status || 'DRAFT').toLowerCase() as any,
      pricing: {
        materialCost: Number(row.material_amount_snapshot || 0),
        loadingCharges: Number(row.loading_amount_snapshot || 0),
        haulageCharges: Number(row.haulage_amount_snapshot || 0),
        otherCharges: Number(row.other_charges_snapshot || 0),
        discount: Number(row.discount_amount_snapshot || 0),
        subtotal: Number(row.total_amount_snapshot || 0),
        tax: 0,
        total: Number(row.total_amount_snapshot || 0),
      },
      notes: row.notes || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async calculatePriceQuote(request: PriceQuoteRequest): Promise<PriceQuoteBreakdown> {
    // 1. Get primary organization
    const { data: org } = await supabase.from('organizations').select('id').limit(1).single();
    const orgId = org?.id || '00000000-0000-0000-0000-000000000000';

    // 2. Get user customer ID
    const { data: customerUser } = await supabase
      .from('customer_users')
      .select('customer_id')
      .limit(1)
      .single();

    const customerId = customerUser?.customer_id || null;

    // 3. Invoke PostgreSQL calculate_requisition_price RPC
    const { data: quote, error } = await supabase.rpc('calculate_requisition_price', {
      p_organization_id: orgId,
      p_customer_id: customerId,
      p_quarry_id: request.quarryId,
      p_material_id: request.materialId,
      p_quantity: request.quantity,
      p_transportation_option: request.transportationType === 'self' ? 'SELF_PICKUP' : 'SUPPLY_AND_HAULAGE',
      p_truck_type_id: request.truckTypeId || null,
      p_destination_id: request.destinationId || null,
      p_delivery_date: request.deliveryDate || new Date().toISOString().split('T')[0],
    });

    if (error || !quote) {
      throw new Error(error?.message || 'Failed to calculate commercial price quote');
    }

    return quote as unknown as PriceQuoteBreakdown;
  }

  async create(payload: NewRequisitionPayload): Promise<Requisition> {
    // 1. Get primary organization
    const { data: org } = await supabase.from('organizations').select('id').limit(1).single();
    const orgId = org?.id || '00000000-0000-0000-0000-000000000000';

    // 2. Get customer linked to current user
    const { data: customerUser } = await supabase
      .from('customer_users')
      .select('customer_id')
      .limit(1)
      .single();

    if (!customerUser?.customer_id) {
      throw new Error('No authenticated customer account relationship found.');
    }

    const customerId = customerUser.customer_id;

    // 3. Insert Requisition header in DRAFT state
    const { data: createdReq, error: reqError } = await supabase
      .from('requisitions')
      .insert({
        organization_id: orgId,
        customer_id: customerId,
        quarry_id: payload.quarryId,
        transportation_option: payload.transportationType === 'self' ? 'SELF_PICKUP' : 'SUPPLY_AND_HAULAGE',
        status: 'DRAFT',
        payment_status: 'UNPAID',
        requested_delivery_date: payload.deliveryDate,
        destination_name_cache: payload.destination,
        destination_address_cache: payload.destinationAddress,
        notes: payload.notes || null,
        material_amount_snapshot: 0,
        loading_amount_snapshot: 0,
        haulage_amount_snapshot: 0,
        other_charges_snapshot: 0,
        discount_amount_snapshot: 0,
        total_amount_snapshot: 0,
      })
      .select()
      .single();

    if (reqError || !createdReq) {
      throw new Error(reqError?.message || 'Failed to create requisition draft');
    }

    // 4. Insert Requisition Item
    const { error: itemError } = await supabase.from('requisition_items').insert({
      requisition_id: createdReq.id,
      material_id: payload.materialId,
      quantity: payload.quantity,
      unit: 'tonnes',
      unit_price_snapshot: 0,
      line_total: 0,
    });

    if (itemError) {
      throw new Error(itemError.message || 'Failed to add item to requisition');
    }

    // 5. Invoke Transactional submit_requisition RPC to evaluate authoritative price and freeze snapshot
    const { data: submitResult, error: submitError } = await supabase.rpc('submit_requisition', {
      p_requisition_id: createdReq.id,
      p_expected_total: payload.expectedTotal || null,
      p_notes: payload.notes || null,
    });

    if (submitError) {
      throw new Error(submitError.message || 'Failed to submit requisition');
    }

    const resObj = submitResult as any;
    if (resObj && !resObj.success) {
      if (resObj.error === 'PRICE_CHANGED_CONFIRMATION_REQUIRED') {
        throw new Error(
          `Pricing has changed since your estimate was generated. Previous: ₦${resObj.previousTotal?.toLocaleString()}, Current: ₦${resObj.currentTotal?.toLocaleString()}. Please review and confirm.`
        );
      }
      throw new Error(resObj.error || 'Failed to submit requisition');
    }

    const quote = resObj?.quote;

    return {
      id: createdReq.id,
      referenceNumber: resObj?.requisitionNumber || createdReq.requisition_number,
      customerId: createdReq.customer_id,
      quarryId: createdReq.quarry_id,
      quarryName: 'Assigned Quarry',
      materialId: payload.materialId,
      materialName: 'Selected Aggregate',
      quantity: payload.quantity,
      unit: 'tonnes',
      transportationType: payload.transportationType,
      destination: payload.destination,
      destinationAddress: payload.destinationAddress,
      requestedDeliveryDate: payload.deliveryDate,
      status: 'submitted',
      pricing: {
        materialCost: Number(quote?.material?.amount || 0),
        loadingCharges: Number(quote?.loading?.amount || 0),
        haulageCharges: Number(quote?.haulage?.amount || 0),
        otherCharges: Number(quote?.fuelAdjustment?.amount || 0),
        discount: Number(quote?.totalDiscount || 0),
        subtotal: Number(quote?.subtotal || 0),
        tax: 0,
        total: Number(quote?.total || 0),
      },
      notes: payload.notes,
      createdAt: createdReq.created_at,
      updatedAt: new Date().toISOString(),
    };
  }
}
