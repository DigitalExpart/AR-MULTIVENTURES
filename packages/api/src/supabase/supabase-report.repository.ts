import type { IReportRepository } from '../interfaces';
import type {
  DateRangeFilter,
  ExecutiveDashboardKPIs,
  SalesReportData,
  ReceivablesAgingReportData,
  QuarryReportRow,
  MaterialReportRow,
  DestinationReportRow,
  HaulageReportRow,
  FinanceReportData,
  PaymentReportRow,
  FleetUtilizationRow,
  DriverReportRow,
  LoadingReportRow,
  DeliveryReportRow,
  CancellationReportRow,
} from '@ar-multiventures/types';
import { supabase } from './supabase-client';
import { formatNaira, getDateRangeForPeriod } from '@ar-multiventures/business-logic';

export class SupabaseReportRepository implements IReportRepository {
  async getExecutiveDashboardKPIs(filter?: DateRangeFilter): Promise<ExecutiveDashboardKPIs> {
    const activeFilter = filter || getDateRangeForPeriod('this_month');
    const { data, error } = await supabase.rpc('rpc_get_executive_kpis', {
      p_start_date: activeFilter.startDate,
      p_end_date: activeFilter.endDate,
    });

    if (error) throw new Error(`Failed to load executive KPIs from Supabase: ${error.message}`);

    const res = data || {};
    return {
      totalRequisitions: {
        value: res.totalRequisitions || 0,
        formattedValue: `${res.totalRequisitions || 0} Requisitions`,
      },
      approvedOrders: {
        value: res.approvedOrders || 0,
        formattedValue: `${res.approvedOrders || 0} Orders`,
      },
      completedOrders: {
        value: res.completedOrders || 0,
        formattedValue: `${res.completedOrders || 0} Delivered`,
      },
      totalOrderValue: {
        value: Number(res.totalOrderValue || 0),
        formattedValue: formatNaira(Number(res.totalOrderValue || 0)),
      },
      paymentsReceived: {
        value: Number(res.paymentsReceived || 0),
        formattedValue: formatNaira(Number(res.paymentsReceived || 0)),
      },
      outstandingReceivables: {
        value: Number(res.outstandingReceivables || 0),
        formattedValue: formatNaira(Number(res.outstandingReceivables || 0)),
      },
      outstandingCreditExposure: {
        value: Number(res.outstandingCreditExposure || 0),
        formattedValue: formatNaira(Number(res.outstandingCreditExposure || 0)),
      },
      tonnesOrdered: {
        value: Number(res.tonnesOrdered || 0),
        formattedValue: `${Number(res.tonnesOrdered || 0).toLocaleString()} Tonnes`,
      },
      tonnesLoaded: {
        value: Number(res.tonnesLoaded || 0),
        formattedValue: `${Number(res.tonnesLoaded || 0).toLocaleString()} Tonnes`,
      },
      tonnesDelivered: {
        value: Number(res.tonnesDelivered || 0),
        formattedValue: `${Number(res.tonnesDelivered || 0).toLocaleString()} Tonnes`,
      },
      tripsInTransit: res.tripsInTransit || 0,
      activeCustomers: res.activeCustomers || 0,
      period: activeFilter,
    };
  }

  async getSalesReport(filter?: DateRangeFilter): Promise<SalesReportData> {
    const { data, error } = await supabase.from('view_sales_summary').select('*');
    if (error) throw new Error(`Failed to load sales report: ${error.message}`);
    const rows = (data || []).map((r: any) => ({
      requisitionId: r.requisition_id,
      referenceNumber: r.reference_number,
      customerName: r.customer_name,
      quarryName: r.quarry_name,
      destinationName: r.destination_name,
      materialName: 'Granite Aggregate',
      quantityTonnes: 30,
      orderValue: Number(r.total_amount || 0),
      status: r.status,
      createdAt: r.created_at,
    }));

    const totalSalesValue = rows.reduce((sum: number, r: any) => sum + r.orderValue, 0);

    return {
      summary: {
        totalSalesValue,
        approvedSalesValue: rows.filter((r) => r.status === 'APPROVED' || r.status === 'DELIVERED').reduce((sum: number, r: any) => sum + r.orderValue, 0),
        completedSalesValue: rows.filter((r) => r.status === 'DELIVERED').reduce((sum: number, r: any) => sum + r.orderValue, 0),
        totalOrdersCount: rows.length,
        averageOrderValue: rows.length > 0 ? totalSalesValue / rows.length : 0,
      },
      ordersByStatus: {},
      topCustomers: [],
      topQuarries: [],
      topMaterials: [],
      topDestinations: [],
      rows,
    };
  }

  async getReceivablesAgingReport(asOfDate?: string): Promise<ReceivablesAgingReportData> {
    const { data, error } = await supabase.from('view_customer_receivables_aging').select('*');
    if (error) throw new Error(`Failed to load receivables aging: ${error.message}`);

    const rows = (data || []).map((r: any) => ({
      customerId: r.customer_id,
      customerName: r.customer_name,
      customerReference: r.customer_reference,
      currentAmount: Number(r.bucket_current || 0),
      days1To30: Number(r.bucket_1_30 || 0),
      days31To60: Number(r.bucket_31_60 || 0),
      days61To90: Number(r.bucket_61_90 || 0),
      days90Plus: Number(r.bucket_90_plus || 0),
      totalOutstanding: Number(r.total_outstanding || 0),
    }));

    return {
      totalOutstanding: rows.reduce((sum: number, r: any) => sum + r.totalOutstanding, 0),
      totalCurrent: rows.reduce((sum: number, r: any) => sum + r.currentAmount, 0),
      total1To30: rows.reduce((sum: number, r: any) => sum + r.days1To30, 0),
      total31To60: rows.reduce((sum: number, r: any) => sum + r.days31To60, 0),
      total61To90: rows.reduce((sum: number, r: any) => sum + r.days61To90, 0),
      total90Plus: rows.reduce((sum: number, r: any) => sum + r.days90Plus, 0),
      customersCount: rows.length,
      rows,
    };
  }

  async getQuarryReport(filter?: DateRangeFilter): Promise<QuarryReportRow[]> {
    const { data, error } = await supabase.from('view_quarry_performance').select('*');
    if (error) throw new Error(`Failed to load quarry report: ${error.message}`);
    return (data || []).map((q: any) => ({
      quarryId: q.quarry_id,
      quarryName: q.quarry_name,
      location: q.state,
      totalTrips: Number(q.total_trips || 0),
      plannedTonnes: Number(q.planned_tonnes || 0),
      loadedTonnes: Number(q.actual_loaded_tonnes || 0),
      deliveredTonnes: 0,
      materialSalesValue: 0,
      haulageSalesValue: 0,
      averageVarianceTonnes: Number(q.avg_variance_tonnes || 0),
      averageVariancePercent: 0,
    }));
  }

  async getMaterialReport(filter?: DateRangeFilter): Promise<MaterialReportRow[]> {
    return [];
  }

  async getDestinationReport(filter?: DateRangeFilter): Promise<DestinationReportRow[]> {
    return [];
  }

  async getHaulageReport(filter?: DateRangeFilter): Promise<HaulageReportRow[]> {
    return [];
  }

  async getFinanceReport(filter?: DateRangeFilter): Promise<FinanceReportData> {
    return {
      invoicedTotal: 0,
      confirmedReceiptsTotal: 0,
      outstandingReceivablesTotal: 0,
      overdueReceivablesTotal: 0,
      creditExposureTotal: 0,
      unallocatedCashTotal: 0,
      paymentMethodDistribution: {},
      recentTransactionsCount: 0,
    };
  }

  async getPaymentsReport(filter?: DateRangeFilter): Promise<PaymentReportRow[]> {
    const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to load payments report: ${error.message}`);
    return (data || []).map((p: any) => ({
      paymentNumber: p.payment_number,
      customerName: 'Customer',
      amount: Number(p.amount),
      paymentMethod: p.payment_method,
      status: p.status,
      bankReference: p.bank_reference,
      gatewayReference: p.gateway_reference,
      date: p.created_at,
    }));
  }

  async getFleetUtilizationReport(filter?: DateRangeFilter): Promise<FleetUtilizationRow[]> {
    const { data, error } = await supabase.from('view_fleet_utilization').select('*');
    if (error) throw new Error(`Failed to load fleet utilization report: ${error.message}`);
    return (data || []).map((f: any) => ({
      truckId: f.truck_id,
      registrationNumber: f.registration_number,
      makeModel: `${f.make} ${f.model}`,
      ownershipType: f.ownership_type,
      capacityTonnes: Number(f.capacity_tonnes),
      maintenanceStatus: f.maintenance_status,
      tripsCompleted: Number(f.completed_trips || 0),
      tonnesHauled: Number(f.total_tonnes_hauled || 0),
      utilizationRatePercent: 0,
      maintenanceCostTotal: Number(f.total_maintenance_cost || 0),
    }));
  }

  async getDriverReport(filter?: DateRangeFilter): Promise<DriverReportRow[]> {
    return [];
  }

  async getLoadingReport(filter?: DateRangeFilter): Promise<LoadingReportRow[]> {
    return [];
  }

  async getDeliveryReport(filter?: DateRangeFilter): Promise<DeliveryReportRow[]> {
    return [];
  }

  async getCancellationReport(filter?: DateRangeFilter): Promise<CancellationReportRow[]> {
    return [];
  }
}
