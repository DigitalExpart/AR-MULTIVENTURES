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
import {
  calculateReceivablesAging,
  calculatePeriodComparison,
  calculateFleetUtilizationRate,
  getDateRangeForPeriod,
  formatNaira,
} from '@ar-multiventures/business-logic';

export class MockReportRepository implements IReportRepository {
  async getExecutiveDashboardKPIs(filter?: DateRangeFilter): Promise<ExecutiveDashboardKPIs> {
    await new Promise((r) => setTimeout(r, 120));
    const activeFilter = filter || getDateRangeForPeriod('this_month');

    return {
      totalRequisitions: {
        value: 48,
        previousValue: 42,
        percentageChange: 14.3,
        formattedValue: '48 Requisitions',
      },
      approvedOrders: {
        value: 39,
        previousValue: 34,
        percentageChange: 14.7,
        formattedValue: '39 Orders',
      },
      completedOrders: {
        value: 28,
        previousValue: 24,
        percentageChange: 16.7,
        formattedValue: '28 Delivered',
      },
      totalOrderValue: {
        value: 58450000,
        previousValue: 52000000,
        percentageChange: 12.4,
        formattedValue: formatNaira(58450000),
      },
      paymentsReceived: {
        value: 46200000,
        previousValue: 41000000,
        percentageChange: 12.7,
        formattedValue: formatNaira(46200000),
      },
      outstandingReceivables: {
        value: 12250000,
        previousValue: 11000000,
        percentageChange: 11.4,
        formattedValue: formatNaira(12250000),
      },
      outstandingCreditExposure: {
        value: 35000000,
        previousValue: 35000000,
        percentageChange: 0.0,
        formattedValue: formatNaira(35000000),
      },
      tonnesOrdered: {
        value: 4850,
        previousValue: 4300,
        percentageChange: 12.8,
        formattedValue: '4,850 Tonnes',
      },
      tonnesLoaded: {
        value: 4120,
        previousValue: 3750,
        percentageChange: 9.9,
        formattedValue: '4,120 Tonnes',
      },
      tonnesDelivered: {
        value: 3890,
        previousValue: 3500,
        percentageChange: 11.1,
        formattedValue: '3,890 Tonnes',
      },
      tripsInTransit: 6,
      activeCustomers: 14,
      period: activeFilter,
    };
  }

  async getSalesReport(filter?: DateRangeFilter): Promise<SalesReportData> {
    await new Promise((r) => setTimeout(r, 150));
    return {
      summary: {
        totalSalesValue: 58450000,
        approvedSalesValue: 52100000,
        completedSalesValue: 38500000,
        totalOrdersCount: 48,
        averageOrderValue: 1217708,
      },
      ordersByStatus: {
        APPROVED: 18,
        IN_TRANSIT: 6,
        DELIVERED: 22,
        REJECTED: 2,
      },
      topCustomers: [
        { customerName: 'BuildCorp Nigeria Limited', orderCount: 14, totalValue: 24500000 },
        { customerName: 'Dangote Construction Lekki', orderCount: 12, totalValue: 18200000 },
        { customerName: 'Julius Berger Site Operations', orderCount: 10, totalValue: 12400000 },
        { customerName: 'Apex Civil Engineering', orderCount: 8, totalValue: 3350000 },
      ],
      topQuarries: [
        { quarryName: 'Abeokuta North High-Grade Quarry', tonnes: 2850, totalValue: 34200000 },
        { quarryName: 'Sagamu Interchange Quarry', tonnes: 1450, totalValue: 17400000 },
        { quarryName: 'Ibadan South Quarry Hub', tonnes: 550, totalValue: 6850000 },
      ],
      topMaterials: [
        { materialName: 'Granite 3/4 Inch (20mm Aggregate)', tonnes: 2600, totalValue: 31200000 },
        { materialName: 'Granite 1/2 Inch (12mm Aggregate)', tonnes: 1200, totalValue: 15600000 },
        { materialName: 'Stone Base Material', tonnes: 750, totalValue: 8250000 },
        { materialName: 'Granite Dust', tonnes: 300, totalValue: 3400000 },
      ],
      topDestinations: [
        { destinationName: 'Dangote Refinery Complex Site, Lekki', tripCount: 65, totalValue: 24500000 },
        { destinationName: 'Epe Expressway Flyover Site', tripCount: 35, totalValue: 14200000 },
        { destinationName: 'Ikeja Commercial Development', tripCount: 28, totalValue: 11250000 },
        { destinationName: 'Sagamu Industrial Park', tripCount: 18, totalValue: 8500000 },
      ],
      rows: [
        {
          requisitionId: 'req-01',
          referenceNumber: 'REQ-2026-000041',
          customerName: 'BuildCorp Nigeria Limited',
          quarryName: 'Abeokuta North High-Grade Quarry',
          destinationName: 'Dangote Refinery Complex Site, Lekki',
          materialName: 'Granite 3/4 Inch (20mm Aggregate)',
          quantityTonnes: 150,
          orderValue: 2450000,
          status: 'APPROVED',
          createdAt: '2026-08-25T08:00:00Z',
        },
        {
          requisitionId: 'req-02',
          referenceNumber: 'REQ-2026-000042',
          customerName: 'Julius Berger Site Operations',
          quarryName: 'Sagamu Interchange Quarry',
          destinationName: 'Epe Expressway Flyover Site',
          materialName: 'Stone Base Material',
          quantityTonnes: 90,
          orderValue: 1350000,
          status: 'DELIVERED',
          createdAt: '2026-08-24T10:30:00Z',
        },
        {
          requisitionId: 'req-03',
          referenceNumber: 'REQ-2026-000043',
          customerName: 'Apex Civil Engineering',
          quarryName: 'Abeokuta North High-Grade Quarry',
          destinationName: 'Ikeja Commercial Development',
          materialName: 'Granite 1/2 Inch (12mm Aggregate)',
          quantityTonnes: 60,
          orderValue: 980000,
          status: 'IN_TRANSIT',
          createdAt: '2026-08-26T07:15:00Z',
        },
      ],
    };
  }

  async getReceivablesAgingReport(asOfDate?: string): Promise<ReceivablesAgingReportData> {
    await new Promise((r) => setTimeout(r, 120));
    const mockInvoices = [
      {
        id: 'inv-01',
        customerId: 'cus-buildcorp',
        customerName: 'BuildCorp Nigeria Limited',
        customerReference: 'CUS-2026-00001',
        dueDate: '2026-09-10', // Current
        totalAmount: 2450000,
        amountPaid: 1000000,
      },
      {
        id: 'inv-02',
        customerId: 'cus-buildcorp',
        customerName: 'BuildCorp Nigeria Limited',
        customerReference: 'CUS-2026-00001',
        dueDate: '2026-08-10', // 1-30 days overdue
        totalAmount: 1800000,
        amountPaid: 0,
      },
      {
        id: 'inv-03',
        customerId: 'cus-dangote',
        customerName: 'Dangote Construction Lekki',
        customerReference: 'CUS-2026-00002',
        dueDate: '2026-07-20', // 31-60 days overdue
        totalAmount: 4200000,
        amountPaid: 1200000,
      },
      {
        id: 'inv-04',
        customerId: 'cus-julius',
        customerName: 'Julius Berger Site Operations',
        customerReference: 'CUS-2026-00003',
        dueDate: '2026-05-15', // 90+ days overdue
        totalAmount: 5800000,
        amountPaid: 2000000,
      },
    ];

    return calculateReceivablesAging(mockInvoices, asOfDate || '2026-08-26T12:00:00Z');
  }

  async getQuarryReport(filter?: DateRangeFilter): Promise<QuarryReportRow[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [
      {
        quarryId: 'qry-01',
        quarryName: 'Abeokuta North High-Grade Quarry',
        location: 'Abeokuta, Ogun State',
        totalTrips: 95,
        plannedTonnes: 2850,
        loadedTonnes: 2865.4,
        deliveredTonnes: 2600.0,
        materialSalesValue: 34200000,
        haulageSalesValue: 12800000,
        averageVarianceTonnes: 0.16,
        averageVariancePercent: 0.54,
      },
      {
        quarryId: 'qry-02',
        quarryName: 'Sagamu Interchange Quarry',
        location: 'Sagamu, Ogun State',
        totalTrips: 48,
        plannedTonnes: 1440,
        loadedTonnes: 1438.2,
        deliveredTonnes: 1200.0,
        materialSalesValue: 17280000,
        haulageSalesValue: 6100000,
        averageVarianceTonnes: -0.04,
        averageVariancePercent: -0.13,
      },
      {
        quarryId: 'qry-03',
        quarryName: 'Ibadan South Quarry Hub',
        location: 'Ibadan, Oyo State',
        totalTrips: 20,
        plannedTonnes: 600,
        loadedTonnes: 602.8,
        deliveredTonnes: 540.0,
        materialSalesValue: 7200000,
        haulageSalesValue: 2400000,
        averageVarianceTonnes: 0.14,
        averageVariancePercent: 0.47,
      },
    ];
  }

  async getMaterialReport(filter?: DateRangeFilter): Promise<MaterialReportRow[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [
      {
        materialId: 'mat-01',
        materialName: 'Granite 3/4 Inch (20mm Aggregate)',
        orderCount: 28,
        quantitySoldTonnes: 2600,
        quantityLoadedTonnes: 2612.4,
        quantityDeliveredTonnes: 2400,
        averageUnitPrice: 12000,
        totalRevenue: 31200000,
      },
      {
        materialId: 'mat-02',
        materialName: 'Granite 1/2 Inch (12mm Aggregate)',
        orderCount: 14,
        quantitySoldTonnes: 1200,
        quantityLoadedTonnes: 1204.5,
        quantityDeliveredTonnes: 1100,
        averageUnitPrice: 13000,
        totalRevenue: 15600000,
      },
      {
        materialId: 'mat-03',
        materialName: 'Stone Base Material',
        orderCount: 9,
        quantitySoldTonnes: 750,
        quantityLoadedTonnes: 748.9,
        quantityDeliveredTonnes: 690,
        averageUnitPrice: 11000,
        totalRevenue: 8250000,
      },
      {
        materialId: 'mat-04',
        materialName: 'Granite Dust',
        orderCount: 4,
        quantitySoldTonnes: 300,
        quantityLoadedTonnes: 301.2,
        quantityDeliveredTonnes: 300,
        averageUnitPrice: 9500,
        totalRevenue: 2850000,
      },
    ];
  }

  async getDestinationReport(filter?: DateRangeFilter): Promise<DestinationReportRow[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [
      {
        destinationId: 'dest-01',
        destinationName: 'Dangote Refinery Complex Site, Lekki',
        state: 'Lagos State',
        totalTrips: 65,
        totalTonnes: 1950,
        haulageRevenue: 9750000,
        averageDeliveryHours: 4.8,
        completedDeliveries: 58,
        deliveryExceptionsCount: 1,
        primaryQuarryOrigin: 'Abeokuta North High-Grade Quarry',
      },
      {
        destinationId: 'dest-02',
        destinationName: 'Epe Expressway Flyover Site',
        state: 'Lagos State',
        totalTrips: 35,
        totalTonnes: 1050,
        haulageRevenue: 4725000,
        averageDeliveryHours: 3.6,
        completedDeliveries: 32,
        deliveryExceptionsCount: 0,
        primaryQuarryOrigin: 'Sagamu Interchange Quarry',
      },
      {
        destinationId: 'dest-03',
        destinationName: 'Ikeja Commercial Development',
        state: 'Lagos State',
        totalTrips: 28,
        totalTonnes: 840,
        haulageRevenue: 3780000,
        averageDeliveryHours: 3.2,
        completedDeliveries: 26,
        deliveryExceptionsCount: 0,
        primaryQuarryOrigin: 'Abeokuta North High-Grade Quarry',
      },
    ];
  }

  async getHaulageReport(filter?: DateRangeFilter): Promise<HaulageReportRow[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [
      {
        quarryName: 'Abeokuta North High-Grade Quarry',
        destinationName: 'Dangote Refinery Complex Site, Lekki',
        tripCount: 65,
        tonnesHauled: 1950,
        totalHaulageRevenue: 9750000,
        averageHaulagePerTrip: 150000,
        truckType: '30T Heavy Tipper',
      },
      {
        quarryName: 'Sagamu Interchange Quarry',
        destinationName: 'Epe Expressway Flyover Site',
        tripCount: 35,
        tonnesHauled: 1050,
        totalHaulageRevenue: 4725000,
        averageHaulagePerTrip: 135000,
        truckType: '30T Heavy Tipper',
      },
      {
        quarryName: 'Abeokuta North High-Grade Quarry',
        destinationName: 'Ikeja Commercial Development',
        tripCount: 28,
        tonnesHauled: 840,
        totalHaulageRevenue: 3780000,
        averageHaulagePerTrip: 135000,
        truckType: '30T Heavy Tipper',
      },
    ];
  }

  async getFinanceReport(filter?: DateRangeFilter): Promise<FinanceReportData> {
    await new Promise((r) => setTimeout(r, 100));
    return {
      invoicedTotal: 58450000,
      confirmedReceiptsTotal: 46200000,
      outstandingReceivablesTotal: 12250000,
      overdueReceivablesTotal: 6800000,
      creditExposureTotal: 35000000,
      unallocatedCashTotal: 1450000,
      paymentMethodDistribution: {
        PAYSTACK_GATEWAY: 28400000,
        DIRECT_BANK_TRANSFER: 17800000,
      },
      recentTransactionsCount: 42,
    };
  }

  async getPaymentsReport(filter?: DateRangeFilter): Promise<PaymentReportRow[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [
      {
        paymentNumber: 'PAY-2026-000021',
        customerName: 'BuildCorp Nigeria Limited',
        amount: 2450000,
        paymentMethod: 'PAYSTACK_GATEWAY',
        status: 'CONFIRMED',
        gatewayReference: 'pstk_ref_9981244',
        date: '2026-08-25T11:30:00Z',
      },
      {
        paymentNumber: 'PAY-2026-000022',
        customerName: 'Dangote Construction Lekki',
        amount: 5000000,
        paymentMethod: 'DIRECT_BANK_TRANSFER',
        status: 'CONFIRMED',
        bankReference: 'ZENITH-TRF-449120',
        date: '2026-08-24T14:15:00Z',
      },
      {
        paymentNumber: 'PAY-2026-000023',
        customerName: 'Julius Berger Site Operations',
        amount: 3200000,
        paymentMethod: 'DIRECT_BANK_TRANSFER',
        status: 'PENDING',
        bankReference: 'GTB-NIP-998231',
        date: '2026-08-26T09:00:00Z',
      },
    ];
  }

  async getFleetUtilizationReport(filter?: DateRangeFilter): Promise<FleetUtilizationRow[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [
      {
        truckId: 'trk-01',
        registrationNumber: 'KJA-104-XA',
        makeModel: 'Mack Granite 400',
        ownershipType: 'COMPANY',
        capacityTonnes: 30,
        maintenanceStatus: 'OPERATIONAL',
        tripsCompleted: 34,
        tonnesHauled: 1020,
        utilizationRatePercent: calculateFleetUtilizationRate(34, 26, 1.5),
        maintenanceCostTotal: 185000,
      },
      {
        truckId: 'trk-02',
        registrationNumber: 'LSR-492-YY',
        makeModel: 'Sinotruk HOWO 371',
        ownershipType: 'COMPANY',
        capacityTonnes: 30,
        maintenanceStatus: 'OPERATIONAL',
        tripsCompleted: 31,
        tonnesHauled: 930,
        utilizationRatePercent: calculateFleetUtilizationRate(31, 26, 1.5),
        maintenanceCostTotal: 0,
      },
      {
        truckId: 'trk-03',
        registrationNumber: 'APP-883-ZZ',
        makeModel: 'Mercedes Actros 3340',
        ownershipType: 'COMPANY',
        capacityTonnes: 30,
        maintenanceStatus: 'OPERATIONAL',
        tripsCompleted: 28,
        tonnesHauled: 840,
        utilizationRatePercent: calculateFleetUtilizationRate(28, 26, 1.5),
        maintenanceCostTotal: 0,
      },
      {
        truckId: 'trk-04',
        registrationNumber: 'EKY-712-BC',
        makeModel: 'MAN TGS 33.400',
        ownershipType: 'CONTRACTOR',
        capacityTonnes: 30,
        maintenanceStatus: 'DUE_FOR_SERVICE',
        tripsCompleted: 18,
        tonnesHauled: 540,
        utilizationRatePercent: calculateFleetUtilizationRate(18, 26, 1.5),
        maintenanceCostTotal: 120000,
      },
      {
        truckId: 'trk-05',
        registrationNumber: 'BDG-301-QK',
        makeModel: 'Mack Vision CXU613',
        ownershipType: 'COMPANY',
        capacityTonnes: 30,
        maintenanceStatus: 'UNDER_MAINTENANCE',
        tripsCompleted: 0,
        tonnesHauled: 0,
        utilizationRatePercent: 0,
        maintenanceCostTotal: 950000,
      },
    ];
  }

  async getDriverReport(filter?: DateRangeFilter): Promise<DriverReportRow[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [
      {
        driverId: 'drv-01',
        driverName: 'Ibrahim Musa',
        phoneNumber: '+234 803 111 2233',
        licenseCategory: 'CLASS_E (Articulated)',
        licenseExpiry: '2027-11-14',
        tripsAssigned: 35,
        tripsCompleted: 34,
        tonnesDelivered: 1020,
        podCompletionRatePercent: 100.0,
        exceptionsCount: 0,
      },
      {
        driverId: 'drv-02',
        driverName: 'Babatunde Adeleke',
        phoneNumber: '+234 805 222 3344',
        licenseCategory: 'CLASS_E (Articulated)',
        licenseExpiry: '2028-02-28',
        tripsAssigned: 32,
        tripsCompleted: 31,
        tonnesDelivered: 930,
        podCompletionRatePercent: 100.0,
        exceptionsCount: 0,
      },
      {
        driverId: 'drv-03',
        driverName: 'Chinedu Okonkwo',
        phoneNumber: '+234 802 777 8899',
        licenseCategory: 'CLASS_E (Articulated)',
        licenseExpiry: '2027-09-30',
        tripsAssigned: 29,
        tripsCompleted: 28,
        tonnesDelivered: 840,
        podCompletionRatePercent: 96.6,
        exceptionsCount: 1,
      },
    ];
  }

  async getLoadingReport(filter?: DateRangeFilter): Promise<LoadingReportRow[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [
      {
        tripNumber: 'TRP-2026-000081',
        quarryName: 'Abeokuta North High-Grade Quarry',
        truckRegistration: 'KJA-104-XA',
        driverName: 'Ibrahim Musa',
        loadingBay: 'BAY-01 (Primary Hopper)',
        plannedTonnes: 30.0,
        grossWeightTonnes: 45.4,
        tareWeightTonnes: 15.2,
        netWeightTonnes: 30.2,
        varianceTonnes: 0.2,
        variancePercent: 0.67,
        weighbridgeTicketNumber: 'WB-ABK-990142',
        loadedAt: '2026-08-25T08:30:00Z',
      },
      {
        tripNumber: 'TRP-2026-000082',
        quarryName: 'Abeokuta North High-Grade Quarry',
        truckRegistration: 'LSR-492-YY',
        driverName: 'Babatunde Adeleke',
        loadingBay: 'BAY-02',
        plannedTonnes: 30.0,
        grossWeightTonnes: 45.1,
        tareWeightTonnes: 15.05,
        netWeightTonnes: 30.05,
        varianceTonnes: 0.05,
        variancePercent: 0.17,
        weighbridgeTicketNumber: 'WB-ABK-990145',
        loadedAt: '2026-08-25T09:30:00Z',
      },
      {
        tripNumber: 'TRP-2026-000083',
        quarryName: 'Abeokuta North High-Grade Quarry',
        truckRegistration: 'KJA-104-XA',
        driverName: 'Ibrahim Musa',
        loadingBay: 'BAY-01',
        plannedTonnes: 30.0,
        grossWeightTonnes: 45.35,
        tareWeightTonnes: 15.2,
        netWeightTonnes: 30.15,
        varianceTonnes: 0.15,
        variancePercent: 0.5,
        weighbridgeTicketNumber: 'WB-ABK-990201',
        loadedAt: '2026-08-26T08:15:00Z',
      },
    ];
  }

  async getDeliveryReport(filter?: DateRangeFilter): Promise<DeliveryReportRow[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [
      {
        tripNumber: 'TRP-2026-000081',
        customerName: 'BuildCorp Nigeria Limited',
        truckRegistration: 'KJA-104-XA',
        driverName: 'Ibrahim Musa',
        quarryName: 'Abeokuta North High-Grade Quarry',
        destinationName: 'Dangote Refinery Complex Site, Lekki',
        dispatchedAt: '2026-08-25T08:45:00Z',
        deliveredAt: '2026-08-25T14:00:00Z',
        durationHours: 5.25,
        deliveredTonnes: 30.2,
        status: 'DELIVERED',
        podReceiverName: 'Engr. Babatunde Alabi',
      },
      {
        tripNumber: 'TRP-2026-000082',
        customerName: 'BuildCorp Nigeria Limited',
        truckRegistration: 'LSR-492-YY',
        driverName: 'Babatunde Adeleke',
        quarryName: 'Abeokuta North High-Grade Quarry',
        destinationName: 'Dangote Refinery Complex Site, Lekki',
        dispatchedAt: '2026-08-25T09:45:00Z',
        deliveredAt: '2026-08-25T15:15:00Z',
        durationHours: 5.5,
        deliveredTonnes: 30.05,
        status: 'DELIVERED',
        podReceiverName: 'Engr. Babatunde Alabi',
      },
      {
        tripNumber: 'TRP-2026-000083',
        customerName: 'BuildCorp Nigeria Limited',
        truckRegistration: 'KJA-104-XA',
        driverName: 'Ibrahim Musa',
        quarryName: 'Abeokuta North High-Grade Quarry',
        destinationName: 'Dangote Refinery Complex Site, Lekki',
        dispatchedAt: '2026-08-26T08:30:00Z',
        deliveredAt: '—',
        durationHours: 0,
        deliveredTonnes: 0,
        status: 'IN_TRANSIT',
      },
    ];
  }

  async getCancellationReport(filter?: DateRangeFilter): Promise<CancellationReportRow[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [
      {
        requisitionNumber: 'REQ-2026-000012',
        customerName: 'Prime Build Construction',
        orderValue: 1850000,
        cancellationReason: 'Client delayed foundation concrete casting schedule',
        cancelledBy: 'Amina Bello (Sales Admin)',
        cancelledAt: '2026-08-18T14:20:00Z',
        previousStatus: 'SUBMITTED',
      },
      {
        requisitionNumber: 'REQ-2026-000028',
        customerName: 'Westpoint Infrastructure Ltd',
        orderValue: 950000,
        cancellationReason: 'Duplicate order entered by site manager',
        cancelledBy: 'Engr. Segun Adeyemi',
        cancelledAt: '2026-08-21T09:10:00Z',
        previousStatus: 'SUBMITTED',
      },
    ];
  }
}
