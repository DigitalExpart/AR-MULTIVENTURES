export type ReportPeriod =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'this_year'
  | 'custom';

export interface DateRangeFilter {
  period: ReportPeriod;
  startDate: string;
  endDate: string;
}

export interface MetricWithComparison {
  value: number;
  previousValue?: number;
  percentageChange?: number;
  formattedValue: string;
}

export interface ExecutiveDashboardKPIs {
  totalRequisitions: MetricWithComparison;
  approvedOrders: MetricWithComparison;
  completedOrders: MetricWithComparison;
  totalOrderValue: MetricWithComparison;
  paymentsReceived: MetricWithComparison;
  outstandingReceivables: MetricWithComparison;
  outstandingCreditExposure: MetricWithComparison;
  tonnesOrdered: MetricWithComparison;
  tonnesLoaded: MetricWithComparison;
  tonnesDelivered: MetricWithComparison;
  tripsInTransit: number;
  activeCustomers: number;
  period: DateRangeFilter;
}

export interface SalesReportRow {
  requisitionId: string;
  referenceNumber: string;
  customerName: string;
  quarryName: string;
  destinationName: string;
  materialName: string;
  quantityTonnes: number;
  orderValue: number;
  status: string;
  createdAt: string;
}

export interface SalesReportData {
  summary: {
    totalSalesValue: number;
    approvedSalesValue: number;
    completedSalesValue: number;
    totalOrdersCount: number;
    averageOrderValue: number;
  };
  ordersByStatus: Record<string, number>;
  topCustomers: Array<{ customerName: string; orderCount: number; totalValue: number }>;
  topQuarries: Array<{ quarryName: string; tonnes: number; totalValue: number }>;
  topMaterials: Array<{ materialName: string; tonnes: number; totalValue: number }>;
  topDestinations: Array<{ destinationName: string; tripCount: number; totalValue: number }>;
  rows: SalesReportRow[];
}

export interface ReceivablesAgingRow {
  customerId: string;
  customerName: string;
  customerReference: string;
  currentAmount: number;
  days1To30: number;
  days31To60: number;
  days61To90: number;
  days90Plus: number;
  totalOutstanding: number;
}

export interface ReceivablesAgingReportData {
  totalOutstanding: number;
  totalCurrent: number;
  total1To30: number;
  total31To60: number;
  total61To90: number;
  total90Plus: number;
  customersCount: number;
  rows: ReceivablesAgingRow[];
}

export interface QuarryReportRow {
  quarryId: string;
  quarryName: string;
  location: string;
  totalTrips: number;
  plannedTonnes: number;
  loadedTonnes: number;
  deliveredTonnes: number;
  materialSalesValue: number;
  haulageSalesValue: number;
  averageVarianceTonnes: number;
  averageVariancePercent: number;
}

export interface MaterialReportRow {
  materialId: string;
  materialName: string;
  orderCount: number;
  quantitySoldTonnes: number;
  quantityLoadedTonnes: number;
  quantityDeliveredTonnes: number;
  averageUnitPrice: number;
  totalRevenue: number;
}

export interface DestinationReportRow {
  destinationId: string;
  destinationName: string;
  state: string;
  totalTrips: number;
  totalTonnes: number;
  haulageRevenue: number;
  averageDeliveryHours: number;
  completedDeliveries: number;
  deliveryExceptionsCount: number;
  primaryQuarryOrigin: string;
}

export interface HaulageReportRow {
  quarryName: string;
  destinationName: string;
  tripCount: number;
  tonnesHauled: number;
  totalHaulageRevenue: number;
  averageHaulagePerTrip: number;
  truckType: string;
}

export interface FinanceReportData {
  invoicedTotal: number;
  confirmedReceiptsTotal: number;
  outstandingReceivablesTotal: number;
  overdueReceivablesTotal: number;
  creditExposureTotal: number;
  unallocatedCashTotal: number;
  paymentMethodDistribution: Record<string, number>;
  recentTransactionsCount: number;
}

export interface PaymentReportRow {
  paymentNumber: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  status: 'CONFIRMED' | 'PENDING' | 'REJECTED';
  bankReference?: string;
  gatewayReference?: string;
  date: string;
}

export interface FleetUtilizationRow {
  truckId: string;
  registrationNumber: string;
  makeModel: string;
  ownershipType: string;
  capacityTonnes: number;
  maintenanceStatus: string;
  tripsCompleted: number;
  tonnesHauled: number;
  utilizationRatePercent: number;
  maintenanceCostTotal: number;
}

export interface DriverReportRow {
  driverId: string;
  driverName: string;
  phoneNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  tripsAssigned: number;
  tripsCompleted: number;
  tonnesDelivered: number;
  podCompletionRatePercent: number;
  exceptionsCount: number;
}

export interface LoadingReportRow {
  tripNumber: string;
  quarryName: string;
  truckRegistration: string;
  driverName: string;
  loadingBay: string;
  plannedTonnes: number;
  grossWeightTonnes: number;
  tareWeightTonnes: number;
  netWeightTonnes: number;
  varianceTonnes: number;
  variancePercent: number;
  weighbridgeTicketNumber: string;
  loadedAt: string;
}

export interface DeliveryReportRow {
  tripNumber: string;
  customerName: string;
  truckRegistration: string;
  driverName: string;
  quarryName: string;
  destinationName: string;
  dispatchedAt: string;
  deliveredAt: string;
  durationHours: number;
  deliveredTonnes: number;
  status: string;
  podReceiverName?: string;
}

export interface CancellationReportRow {
  requisitionNumber: string;
  customerName: string;
  orderValue: number;
  cancellationReason: string;
  cancelledBy: string;
  cancelledAt: string;
  previousStatus: string;
}
