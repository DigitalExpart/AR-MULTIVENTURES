import type { IAdminRepository } from '../interfaces';
import type {
  Requisition,
  Quarry,
  Material,
  DestinationRequestItem,
  MaterialPriceRecord,
  HaulageRateRecord,
  CustomerPriceRecord,
  PromotionalPriceRecord,
  AuditLogEntry,
  AdminUser,
} from '@ar-multiventures/types';
import { supabase } from './supabase-client';

export class SupabaseAdminRepository implements IAdminRepository {
  async getDashboardKPIs() {
    const [reqsRes, custRes, quarryRes] = await Promise.all([
      supabase.from('requisitions').select('status, total_amount_snapshot'),
      supabase.from('customers').select('*', { count: 'exact', head: true }),
      supabase.from('quarries').select('*', { count: 'exact', head: true }),
    ]);

    if (reqsRes.error) throw new Error(`Failed to fetch dashboard KPIs: ${reqsRes.error.message}`);

    const reqs = reqsRes.data || [];
    const pendingApproval = reqs.filter((r) => r.status === 'SUBMITTED').length;
    const approvedOrders = reqs.filter((r) => r.status === 'APPROVED').length;
    const totalOrderValue = reqs.reduce((sum, r) => sum + Number(r.total_amount_snapshot || 0), 0);

    const statusBreakdown: Record<string, number> = {};
    for (const r of reqs) {
      statusBreakdown[r.status] = (statusBreakdown[r.status] || 0) + 1;
    }

    return {
      todayRequisitions: reqs.length,
      pendingApproval,
      approvedOrders,
      totalOrderValue,
      totalCustomers: custRes.count || 0,
      activeQuarries: quarryRes.count || 0,
      statusBreakdown,
    };
  }

  async getRequisitions(filters?: { search?: string; status?: string; quarryId?: string }): Promise<Requisition[]> {
    let query = supabase
      .from('requisitions')
      .select(`
        *,
        quarries ( name ),
        requisition_items (
          id,
          material_id,
          quantity,
          unit_price,
          total_price,
          materials ( name )
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.quarryId) {
      query = query.eq('quarry_id', filters.quarryId);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to load requisitions: ${error.message}`);

    return (data || []).map((row: any) => {
      const item = row.requisition_items?.[0];
      return {
        id: row.id,
        referenceNumber: row.reference_number,
        customerId: row.customer_id,
        quarryId: row.quarry_id,
        quarryName: row.quarries?.name || 'Unknown Quarry',
        destinationId: row.destination_id,
        materialId: item?.material_id || '',
        materialName: item?.materials?.name || 'Unknown Material',
        quantity: Number(item?.quantity || 0),
        unit: 'Tonnes',
        materialPricePerUnit: Number(item?.unit_price || 0),
        haulagePricePerUnit: 0,
        subtotal: Number(row.subtotal_snapshot || 0),
        vatAmount: Number(row.vat_snapshot || 0),
        totalAmount: Number(row.total_amount_snapshot || 0),
        paymentMethod: row.payment_method || 'PAYSTACK',
        siteContactName: row.site_contact_name || '',
        siteContactPhone: row.site_contact_phone || '',
        deliveryAddress: row.delivery_address || '',
        status: row.status,
        financialClearanceStatus: row.financial_clearance_status || 'PENDING',
        approvalNotes: row.approval_notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });
  }

  async getRequisitionById(id: string): Promise<Requisition | null> {
    const { data: row, error } = await supabase
      .from('requisitions')
      .select(`
        *,
        quarries ( name ),
        requisition_items (
          id,
          material_id,
          quantity,
          unit_price,
          total_price,
          materials ( name )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to load requisition ${id}: ${error.message}`);
    }
    if (!row) return null;

    const item = row.requisition_items?.[0];
    return {
      id: row.id,
      referenceNumber: row.reference_number,
      customerId: row.customer_id,
      quarryId: row.quarry_id,
      quarryName: row.quarries?.name || 'Unknown Quarry',
      destinationId: row.destination_id,
      materialId: item?.material_id || '',
      materialName: item?.materials?.name || 'Unknown Material',
      quantity: Number(item?.quantity || 0),
      unit: 'Tonnes',
      materialPricePerUnit: Number(item?.unit_price || 0),
      haulagePricePerUnit: 0,
      subtotal: Number(row.subtotal_snapshot || 0),
      vatAmount: Number(row.vat_snapshot || 0),
      totalAmount: Number(row.total_amount_snapshot || 0),
      paymentMethod: row.payment_method || 'PAYSTACK',
      siteContactName: row.site_contact_name || '',
      siteContactPhone: row.site_contact_phone || '',
      deliveryAddress: row.delivery_address || '',
      status: row.status,
      financialClearanceStatus: row.financial_clearance_status || 'PENDING',
      approvalNotes: row.approval_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getCustomers(filters?: { search?: string; status?: string }) {
    let query = supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    const { data, error } = await query;
    if (error) throw new Error(`Failed to load customers: ${error.message}`);
    return data || [];
  }

  async getCustomerById(id: string) {
    const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to load customer ${id}: ${error.message}`);
    }
    return data;
  }

  async getQuarries(): Promise<Quarry[]> {
    const { data, error } = await supabase.from('quarries').select('*').order('name');
    if (error) throw new Error(`Failed to load quarries: ${error.message}`);
    return data || [];
  }

  async getQuarryById(id: string): Promise<Quarry | null> {
    const { data, error } = await supabase.from('quarries').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to load quarry ${id}: ${error.message}`);
    }
    return data;
  }

  async saveQuarry(quarry: Partial<Quarry>): Promise<Quarry> {
    if (quarry.id) {
      const { data, error } = await supabase.from('quarries').update(quarry).eq('id', quarry.id).select().single();
      if (error) throw new Error(`Failed to update quarry: ${error.message}`);
      return data;
    }
    const { data, error } = await supabase.from('quarries').insert(quarry).select().single();
    if (error) throw new Error(`Failed to create quarry: ${error.message}`);
    return data;
  }

  async getMaterials(): Promise<Material[]> {
    const { data, error } = await supabase.from('materials').select('*').order('name');
    if (error) throw new Error(`Failed to load materials: ${error.message}`);
    return data || [];
  }

  async saveMaterial(material: Partial<Material>): Promise<Material> {
    if (material.id) {
      const { data, error } = await supabase.from('materials').update(material).eq('id', material.id).select().single();
      if (error) throw new Error(`Failed to update material: ${error.message}`);
      return data;
    }
    const { data, error } = await supabase.from('materials').insert(material).select().single();
    if (error) throw new Error(`Failed to create material: ${error.message}`);
    return data;
  }

  async getDestinations() {
    const { data, error } = await supabase.from('destinations').select('*').order('name');
    if (error) throw new Error(`Failed to load destinations: ${error.message}`);
    return data || [];
  }

  async getDestinationRequests(): Promise<DestinationRequestItem[]> {
    const { data, error } = await supabase.from('destination_requests').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to load destination requests: ${error.message}`);
    return data || [];
  }

  async reviewDestinationRequest(id: string, decision: 'APPROVED' | 'REJECTED', notes?: string) {
    const { error } = await supabase
      .from('destination_requests')
      .update({ status: decision, review_notes: notes, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(`Failed to review destination request: ${error.message}`);
  }

  async getMaterialPrices(quarryId?: string): Promise<MaterialPriceRecord[]> {
    let query = supabase.from('material_prices').select('*').order('effective_date', { ascending: false });
    if (quarryId) query = query.eq('quarry_id', quarryId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to load material prices: ${error.message}`);
    return data || [];
  }

  async saveMaterialPrice(record: Partial<MaterialPriceRecord>): Promise<MaterialPriceRecord> {
    const { data, error } = await supabase.from('material_prices').insert(record).select().single();
    if (error) throw new Error(`Failed to save material price: ${error.message}`);
    return data;
  }

  async getHaulageRates(): Promise<HaulageRateRecord[]> {
    const { data, error } = await supabase.from('haulage_rates').select('*').order('effective_date', { ascending: false });
    if (error) throw new Error(`Failed to load haulage rates: ${error.message}`);
    return data || [];
  }

  async saveHaulageRate(record: Partial<HaulageRateRecord>): Promise<HaulageRateRecord> {
    const { data, error } = await supabase.from('haulage_rates').insert(record).select().single();
    if (error) throw new Error(`Failed to save haulage rate: ${error.message}`);
    return data;
  }

  async getCustomerPrices(customerId?: string): Promise<CustomerPriceRecord[]> {
    let query = supabase.from('customer_prices').select('*').order('effective_date', { ascending: false });
    if (customerId) query = query.eq('customer_id', customerId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to load customer prices: ${error.message}`);
    return data || [];
  }

  async saveCustomerPrice(record: Partial<CustomerPriceRecord>): Promise<CustomerPriceRecord> {
    const { data, error } = await supabase.from('customer_prices').insert(record).select().single();
    if (error) throw new Error(`Failed to save customer price: ${error.message}`);
    return data;
  }

  async getPromotions(): Promise<PromotionalPriceRecord[]> {
    const { data, error } = await supabase.from('promotions').select('*').order('start_date', { ascending: false });
    if (error) throw new Error(`Failed to load promotions: ${error.message}`);
    return data || [];
  }

  async savePromotion(record: Partial<PromotionalPriceRecord>): Promise<PromotionalPriceRecord> {
    const { data, error } = await supabase.from('promotions').insert(record).select().single();
    if (error) throw new Error(`Failed to save promotion: ${error.message}`);
    return data;
  }

  async getAuditLogs(filters?: { action?: string; userId?: string }): Promise<AuditLogEntry[]> {
    let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (filters?.action) query = query.eq('action', filters.action);
    if (filters?.userId) query = query.eq('user_id', filters.userId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to load audit logs: ${error.message}`);
    return (data || []).map((l: any) => ({
      id: l.id,
      userId: l.user_id,
      userName: l.user_name || 'System Staff',
      action: l.action,
      entityType: l.entity_type,
      entityId: l.entity_id,
      reference: l.reference,
      oldValue: l.old_value,
      newValue: l.new_value,
      ipAddress: l.ip_address,
      createdAt: l.created_at,
    }));
  }

  async getUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to load users: ${error.message}`);
    return data || [];
  }

  async updateUserStatus(id: string, status: string): Promise<void> {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
    if (error) throw new Error(`Failed to update user status: ${error.message}`);
  }

  async updateUserRole(id: string, role: string): Promise<void> {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) throw new Error(`Failed to update user role: ${error.message}`);
  }
}
