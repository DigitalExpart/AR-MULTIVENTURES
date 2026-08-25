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
import { MockAdminRepository } from '../mock/admin-repository';

export class SupabaseAdminRepository implements IAdminRepository {
  private fallbackMock = new MockAdminRepository();

  async getDashboardKPIs() {
    try {
      const { data: reqs } = await supabase.from('requisitions').select('status, total_amount_snapshot');
      const { count: customerCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
      const { count: quarryCount } = await supabase.from('quarries').select('*', { count: 'exact', head: true });

      if (!reqs) return this.fallbackMock.getDashboardKPIs();

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
        totalCustomers: customerCount || 0,
        activeQuarries: quarryCount || 0,
        statusBreakdown,
      };
    } catch {
      return this.fallbackMock.getDashboardKPIs();
    }
  }

  async getRequisitions(filters?: { search?: string; status?: string; quarryId?: string }): Promise<Requisition[]> {
    try {
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

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status.toUpperCase() as any);
      }
      if (filters?.quarryId && filters.quarryId !== 'all') {
        query = query.eq('quarry_id', filters.quarryId);
      }

      const { data, error } = await query;
      if (error || !data) return this.fallbackMock.getRequisitions(filters);

      return data.map((row: any) => {
        const firstItem = row.requisition_items?.[0];
        return {
          id: row.id,
          referenceNumber: row.requisition_number,
          customerId: row.customer_id,
          quarryId: row.quarry_id,
          quarryName: row.quarries?.name || 'Assigned Quarry',
          materialId: firstItem?.material_id || '',
          materialName: firstItem?.materials?.name || 'Standard Aggregate',
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
    } catch {
      return this.fallbackMock.getRequisitions(filters);
    }
  }

  async getRequisitionById(id: string): Promise<Requisition | null> {
    try {
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

      if (error || !row) return this.fallbackMock.getRequisitionById(id);

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
    } catch {
      return this.fallbackMock.getRequisitionById(id);
    }
  }

  async transitionRequisitionStatus(id: string, status: string, reason?: string): Promise<void> {
    const { data, error } = await supabase.rpc('transition_requisition_status', {
      p_requisition_id: id,
      p_target_status: status.toUpperCase() as any,
      p_reason: reason || null,
    });

    if (error) {
      throw new Error(error.message || `Failed to transition status to ${status}`);
    }

    const resObj = data as any;
    if (resObj && !resObj.success) {
      throw new Error(resObj.error || `Failed to transition status to ${status}`);
    }
  }

  async getCustomers(filters?: { search?: string; status?: string }) {
    try {
      const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      if (!data) return this.fallbackMock.getCustomers(filters);
      return data.map((c) => ({
        id: c.id,
        accountNumber: c.account_number,
        companyName: c.company_name,
        contactName: c.trade_name || 'Procurement Officer',
        phone: c.phone,
        email: c.email,
        creditStatus: c.credit_limit > 0 ? 'ACTIVE_CREDIT' : 'PREPAID_ONLY',
        creditLimit: Number(c.credit_limit),
        paymentTermsDays: c.payment_terms_days,
        status: c.status,
        activeOrdersCount: 1,
        createdAt: c.created_at,
      }));
    } catch {
      return this.fallbackMock.getCustomers(filters);
    }
  }

  async getCustomerById(id: string) {
    try {
      const { data: customer } = await supabase.from('customers').select('*').eq('id', id).single();
      if (!customer) return this.fallbackMock.getCustomerById(id);
      const { data: addresses } = await supabase.from('customer_addresses').select('*').eq('customer_id', id);
      const { data: contacts } = await supabase.from('customer_contacts').select('*').eq('customer_id', id);

      return {
        id: customer.id,
        accountNumber: customer.account_number,
        companyName: customer.company_name,
        contactName: customer.trade_name || 'Key Contact',
        phone: customer.phone,
        email: customer.email,
        creditStatus: customer.credit_limit > 0 ? 'ACTIVE_CREDIT' : 'PREPAID_ONLY',
        creditLimit: Number(customer.credit_limit),
        paymentTermsDays: customer.payment_terms_days,
        status: customer.status,
        createdAt: customer.created_at,
        addresses: addresses || [],
        contacts: contacts || [],
        requisitions: await this.getRequisitions(),
      };
    } catch {
      return this.fallbackMock.getCustomerById(id);
    }
  }

  async getQuarries(): Promise<Quarry[]> {
    return this.fallbackMock.getQuarries();
  }

  async saveQuarry(quarry: Partial<Quarry>): Promise<Quarry> {
    return this.fallbackMock.saveQuarry(quarry);
  }

  async toggleQuarryStatus(id: string, isActive: boolean): Promise<void> {
    await supabase.from('quarries').update({ is_active: isActive }).eq('id', id);
  }

  async getMaterials(): Promise<Material[]> {
    return this.fallbackMock.getMaterials();
  }

  async saveMaterial(material: Partial<Material>): Promise<Material> {
    return this.fallbackMock.saveMaterial(material);
  }

  async getDestinations() {
    return this.fallbackMock.getDestinations();
  }

  async saveDestination(destination: any) {
    return this.fallbackMock.saveDestination(destination);
  }

  async getDestinationRequests() {
    return this.fallbackMock.getDestinationRequests();
  }

  async reviewDestinationRequest(id: string, status: 'APPROVED' | 'REJECTED', reason?: string) {
    await supabase
      .from('destination_requests')
      .update({
        status,
        rejection_reason: reason || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);
  }

  async getMaterialPrices() {
    return this.fallbackMock.getMaterialPrices();
  }

  async saveMaterialPrice(payload: any) {
    await this.fallbackMock.saveMaterialPrice(payload);
  }

  async getHaulageRates() {
    return this.fallbackMock.getHaulageRates();
  }

  async saveHaulageRate(payload: any) {
    await this.fallbackMock.saveHaulageRate(payload);
  }

  async getCustomerPrices() {
    return this.fallbackMock.getCustomerPrices();
  }

  async saveCustomerPrice(payload: any) {
    await this.fallbackMock.saveCustomerPrice(payload);
  }

  async getPromotions() {
    return this.fallbackMock.getPromotions();
  }

  async savePromotion(payload: any) {
    await this.fallbackMock.savePromotion(payload);
  }

  async getAuditLogs(filters?: { entity?: string; action?: string }) {
    try {
      const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
      if (!data) return this.fallbackMock.getAuditLogs(filters);
      return data.map((a) => ({
        id: a.id,
        actorName: 'Operations Staff',
        action: a.action,
        entityType: a.entity_type,
        entityId: a.entity_id || undefined,
        reference: a.entity_id ? `ID: ${a.entity_id.slice(0, 8)}...` : undefined,
        oldValues: a.old_values as any,
        newValues: a.new_values as any,
        ipAddress: a.ip_address || undefined,
        createdAt: a.created_at,
      }));
    } catch {
      return this.fallbackMock.getAuditLogs(filters);
    }
  }

  async getUsers() {
    return this.fallbackMock.getUsers();
  }

  async updateUserRole(userId: string, roleCode: string) {
    await this.fallbackMock.updateUserRole(userId, roleCode);
  }

  async toggleUserStatus(userId: string, isActive: boolean) {
    await this.fallbackMock.toggleUserStatus(userId, isActive);
  }

  async getRoles() {
    return this.fallbackMock.getRoles();
  }
}
