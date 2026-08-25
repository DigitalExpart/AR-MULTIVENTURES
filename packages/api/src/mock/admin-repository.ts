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
import {
  mockRequisitions,
  mockQuarries,
  mockMaterials,
  mockCustomerProfile,
} from './mock-db';

export class MockAdminRepository implements IAdminRepository {
  private requisitions: Requisition[] = [...mockRequisitions];
  private quarries: Quarry[] = [...mockQuarries];
  private materials: Material[] = [...mockMaterials];

  private customers = [
    {
      id: 'cus-buildcorp',
      accountNumber: 'CUS-000001',
      companyName: 'BuildCorp Nigeria Limited',
      contactName: 'Adebayo Ogundimu',
      phone: '+234 812 345 6789',
      email: 'operations@buildcorpng.com',
      creditStatus: 'ACTIVE_CREDIT',
      creditLimit: 15000000,
      paymentTermsDays: 14,
      status: 'ACTIVE',
      activeOrdersCount: 2,
      createdAt: '2026-01-15T08:00:00Z',
    },
    {
      id: 'cus-juliusb',
      accountNumber: 'CUS-000002',
      companyName: 'Julius Berger Civil Works',
      contactName: 'Engr. Emeka Nwosu',
      phone: '+234 803 555 1212',
      email: 'procurement@jb-ng.com',
      creditStatus: 'ACTIVE_CREDIT',
      creditLimit: 50000000,
      paymentTermsDays: 30,
      status: 'ACTIVE',
      activeOrdersCount: 4,
      createdAt: '2026-02-10T10:30:00Z',
    },
    {
      id: 'cus-hitech',
      accountNumber: 'CUS-000003',
      companyName: 'Hi-Tech Construction Ltd',
      contactName: 'Femi Adebayo',
      phone: '+234 802 888 9900',
      email: 'sites@hitech-lagos.com',
      creditStatus: 'PREPAID_ONLY',
      creditLimit: 0,
      paymentTermsDays: 0,
      status: 'ACTIVE',
      activeOrdersCount: 1,
      createdAt: '2026-03-01T14:15:00Z',
    },
  ];

  private destinations = [
    {
      id: 'dst-01',
      code: 'DST-LEK-01',
      name: 'Lekki Coastal & Phase 1 Zone',
      state: 'Lagos',
      city: 'Lekki',
      areaZone: 'Lekki Corridor',
      addressDescription: 'Lekki Phase 1, Coastal Road & Freedom Way axis',
      activeTariffsCount: 4,
      isActive: true,
    },
    {
      id: 'dst-02',
      code: 'DST-VI-02',
      name: 'Victoria Island Commercial Hub',
      state: 'Lagos',
      city: 'Victoria Island',
      areaZone: 'Lagos Island Zone',
      addressDescription: 'Ahmadu Bello, Kofo Abayomi, Adeola Odeku axis',
      activeTariffsCount: 3,
      isActive: true,
    },
    {
      id: 'dst-03',
      code: 'DST-EPE-03',
      name: 'Epe Expressway Construction Corridor',
      state: 'Lagos',
      city: 'Epe',
      areaZone: 'Epe Corridor',
      addressDescription: 'KM 10-40 Lekki-Epe Expressway construction zone',
      activeTariffsCount: 3,
      isActive: true,
    },
    {
      id: 'dst-04',
      code: 'DST-IKJ-04',
      name: 'Ikeja Industrial Zone',
      state: 'Lagos',
      city: 'Ikeja',
      areaZone: 'Ikeja / Mainland',
      addressDescription: 'Allen Avenue, Commercial Avenue, Oba Akran axis',
      activeTariffsCount: 2,
      isActive: true,
    },
  ];

  private destinationRequests: DestinationRequestItem[] = [
    {
      id: 'dreq-01',
      customerId: 'cus-juliusb',
      customerName: 'Julius Berger Civil Works',
      requestedName: 'Badagry Deep Sea Port Site Base',
      state: 'Lagos',
      city: 'Badagry',
      fullAddress: 'KM 12 Badagry Coastal Road, Badagry LGA, Lagos',
      landmark: 'Opposite Naval Base',
      siteContactName: 'Engr. Kenneth',
      siteContactPhone: '+234 803 111 2233',
      status: 'PENDING',
      createdAt: '2026-08-24T14:30:00Z',
    },
    {
      id: 'dreq-02',
      customerId: 'cus-buildcorp',
      customerName: 'BuildCorp Nigeria Limited',
      requestedName: 'Dangote Refinery Site 4',
      state: 'Lagos',
      city: 'Ibeju-Lekki',
      fullAddress: 'Free Trade Zone, Lekki Expressway, Lagos',
      landmark: 'Gate 3 Extension',
      siteContactName: 'Babajide Cole',
      siteContactPhone: '+234 812 000 4455',
      status: 'APPROVED',
      reviewedBy: 'Operations Manager',
      reviewedAt: '2026-08-25T09:15:00Z',
      createdAt: '2026-08-23T11:20:00Z',
    },
  ];

  private materialPrices: MaterialPriceRecord[] = [
    {
      id: 'mp-01',
      quarryId: 'qry-abeokuta',
      quarryName: 'Abeokuta North Quarry Complex',
      materialId: 'mat-granite-34',
      materialName: '3/4" Granite Aggregate',
      pricePerUnit: 8500,
      currency: 'NGN',
      effectiveFrom: '2026-01-01',
      effectiveTo: null,
      isActive: true,
      createdBy: 'Sales Director',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'mp-02',
      quarryId: 'qry-abeokuta',
      quarryName: 'Abeokuta North Quarry Complex',
      materialId: 'mat-granite-12',
      materialName: '1/2" Granite Aggregate',
      pricePerUnit: 9000,
      currency: 'NGN',
      effectiveFrom: '2026-01-01',
      effectiveTo: null,
      isActive: true,
      createdBy: 'Sales Director',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'mp-03',
      quarryId: 'qry-abeokuta',
      quarryName: 'Abeokuta North Quarry Complex',
      materialId: 'mat-granite-20mm',
      materialName: '20mm Granite Aggregate',
      pricePerUnit: 8000,
      currency: 'NGN',
      effectiveFrom: '2026-01-01',
      effectiveTo: null,
      isActive: true,
      createdBy: 'Sales Director',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'mp-04',
      quarryId: 'qry-ishiagu',
      quarryName: 'Ishiagu Granite Quarry Hub',
      materialId: 'mat-granite-20mm',
      materialName: '20mm Granite Aggregate',
      pricePerUnit: 7800,
      currency: 'NGN',
      effectiveFrom: '2026-01-01',
      effectiveTo: null,
      isActive: true,
      createdBy: 'Sales Director',
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];

  private haulageRates: HaulageRateRecord[] = [
    {
      id: 'hr-01',
      quarryId: 'qry-abeokuta',
      quarryName: 'Abeokuta North Quarry Complex',
      destinationId: 'dst-01',
      destinationName: 'Lekki Coastal & Phase 1 Zone',
      truckTypeId: 'trk-30t',
      truckTypeName: '30 Tonne Heavy Tipper (10-Wheeler)',
      ratePerTrip: 85000,
      ratePerTonne: 2833.33,
      minimumTonnage: 30,
      currency: 'NGN',
      effectiveFrom: '2026-01-01',
      effectiveTo: null,
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'hr-02',
      quarryId: 'qry-abeokuta',
      quarryName: 'Abeokuta North Quarry Complex',
      destinationId: 'dst-02',
      destinationName: 'Victoria Island Commercial Hub',
      truckTypeId: 'trk-30t',
      truckTypeName: '30 Tonne Heavy Tipper (10-Wheeler)',
      ratePerTrip: 80000,
      ratePerTonne: 2666.67,
      minimumTonnage: 30,
      currency: 'NGN',
      effectiveFrom: '2026-01-01',
      effectiveTo: null,
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'hr-03',
      quarryId: 'qry-ibadan',
      quarryName: 'Ibadan Central Rock & Aggregate Works',
      destinationId: 'dst-03',
      destinationName: 'Epe Expressway Construction Corridor',
      truckTypeId: 'trk-30t',
      truckTypeName: '30 Tonne Heavy Tipper (10-Wheeler)',
      ratePerTrip: 140000,
      ratePerTonne: 2333.33,
      minimumTonnage: 30,
      currency: 'NGN',
      effectiveFrom: '2026-01-01',
      effectiveTo: null,
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];

  private customerPrices: CustomerPriceRecord[] = [
    {
      id: 'cp-01',
      customerId: 'cus-juliusb',
      customerName: 'Julius Berger Civil Works',
      quarryId: 'qry-abeokuta',
      quarryName: 'Abeokuta North Quarry Complex',
      materialId: 'mat-granite-34',
      materialName: '3/4" Granite Aggregate',
      standardPrice: 8500,
      specialPricePerUnit: 7800,
      difference: -700,
      currency: 'NGN',
      effectiveFrom: '2026-01-01',
      effectiveTo: '2026-12-31',
      notes: 'Master supply agreement 2026 (50,000 Tonnes Commitment)',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];

  private promotions: PromotionalPriceRecord[] = [
    {
      id: 'promo-01',
      name: 'South-West Infrastructure Stimulus Promo',
      quarryId: 'qry-abeokuta',
      quarryName: 'Abeokuta North Quarry Complex',
      materialId: 'mat-granite-34',
      materialName: '3/4" Granite Aggregate',
      promoPricePerUnit: 8100,
      discountPercentage: null,
      currency: 'NGN',
      effectiveFrom: '2026-08-01T00:00:00Z',
      effectiveTo: '2026-09-30T23:59:59Z',
      status: 'ACTIVE',
      notes: 'Special promotional price for South-West road corridor projects',
      createdAt: '2026-08-01T00:00:00Z',
    },
  ];

  private auditLogs: AuditLogEntry[] = [
    {
      id: 'aud-01',
      actorName: 'Oluwaseun Adeyemi',
      actorEmail: 'operations@armultiventures.com',
      action: 'REQUISITION_APPROVED',
      entityType: 'requisition',
      entityId: 'req-01',
      reference: 'REQ-2026-000142',
      oldValues: { status: 'SUBMITTED' },
      newValues: { status: 'APPROVED', approved_by: 'Oluwaseun Adeyemi' },
      ipAddress: '102.89.44.12',
      createdAt: '2026-08-25T10:30:00Z',
    },
    {
      id: 'aud-02',
      actorName: 'Folake Bankole',
      actorEmail: 'pricing@armultiventures.com',
      action: 'MATERIAL_PRICE_UPDATED',
      entityType: 'material_price',
      entityId: 'mp-01',
      reference: '3/4" Granite @ Abeokuta',
      oldValues: { price: 8200 },
      newValues: { price: 8500, reason: 'Quarry energy surcharge increase' },
      ipAddress: '197.210.64.91',
      createdAt: '2026-08-24T16:45:00Z',
    },
    {
      id: 'aud-03',
      actorName: 'Tunde Bakare',
      actorEmail: 'admin@armultiventures.com',
      action: 'CUSTOMER_CREDIT_INCREASED',
      entityType: 'customer',
      entityId: 'cus-buildcorp',
      reference: 'BuildCorp Nigeria Limited',
      oldValues: { credit_limit: 10000000 },
      newValues: { credit_limit: 15000000 },
      ipAddress: '102.89.33.10',
      createdAt: '2026-08-23T11:00:00Z',
    },
  ];

  private users: AdminUser[] = [
    {
      id: 'usr-admin-01',
      email: 'admin@armultiventures.com',
      firstName: 'Tunde',
      lastName: 'Bakare',
      phone: '+234 800 AR ADMIN',
      roleCode: 'SUPER_ADMIN',
      roleName: 'Super Administrator',
      isActive: true,
      isSuperAdmin: true,
      createdAt: '2026-01-01T00:00:00Z',
      lastLoginAt: '2026-08-25T20:15:00Z',
    },
    {
      id: 'usr-ops-02',
      email: 'operations@armultiventures.com',
      firstName: 'Oluwaseun',
      lastName: 'Adeyemi',
      phone: '+234 803 444 7788',
      roleCode: 'OPERATIONS',
      roleName: 'Operations & Logistics Manager',
      isActive: true,
      isSuperAdmin: false,
      createdAt: '2026-01-10T00:00:00Z',
      lastLoginAt: '2026-08-25T18:30:00Z',
    },
    {
      id: 'usr-sales-03',
      email: 'sales@armultiventures.com',
      firstName: 'Folake',
      lastName: 'Bankole',
      phone: '+234 812 333 9900',
      roleCode: 'SALES',
      roleName: 'Sales & Procurement Officer',
      isActive: true,
      isSuperAdmin: false,
      createdAt: '2026-02-01T00:00:00Z',
      lastLoginAt: '2026-08-25T14:10:00Z',
    },
  ];

  async getDashboardKPIs() {
    await new Promise((r) => setTimeout(r, 100));
    const pendingApproval = this.requisitions.filter((r) => r.status === 'submitted').length;
    const approvedOrders = this.requisitions.filter((r) => r.status === 'approved').length;
    const totalOrderValue = this.requisitions.reduce((sum, r) => sum + (r.pricing.total || 0), 0);

    const statusBreakdown: Record<string, number> = {};
    for (const req of this.requisitions) {
      statusBreakdown[req.status] = (statusBreakdown[req.status] || 0) + 1;
    }

    return {
      todayRequisitions: this.requisitions.length,
      pendingApproval,
      approvedOrders,
      totalOrderValue,
      totalCustomers: this.customers.length,
      activeQuarries: this.quarries.filter((q) => q.isActive).length,
      statusBreakdown,
    };
  }

  async getRequisitions(filters?: { search?: string; status?: string; quarryId?: string }) {
    await new Promise((r) => setTimeout(r, 150));
    let list = [...this.requisitions];
    if (filters?.status && filters.status !== 'all') {
      list = list.filter((r) => r.status.toLowerCase() === filters.status?.toLowerCase());
    }
    if (filters?.quarryId && filters.quarryId !== 'all') {
      list = list.filter((r) => r.quarryId === filters.quarryId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.referenceNumber.toLowerCase().includes(q) ||
          r.destination.toLowerCase().includes(q) ||
          r.materialName.toLowerCase().includes(q)
      );
    }
    return list;
  }

  async getRequisitionById(id: string) {
    await new Promise((r) => setTimeout(r, 100));
    return this.requisitions.find((r) => r.id === id || r.referenceNumber === id) || null;
  }

  async transitionRequisitionStatus(id: string, status: string, reason?: string) {
    await new Promise((r) => setTimeout(r, 200));
    const req = this.requisitions.find((r) => r.id === id || r.referenceNumber === id);
    if (!req) throw new Error('Requisition not found');
    const oldStatus = req.status;
    req.status = status.toLowerCase() as any;

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorName: 'Oluwaseun Adeyemi',
      actorEmail: 'operations@armultiventures.com',
      action: `REQUISITION_${status.toUpperCase()}`,
      entityType: 'requisition',
      entityId: req.id,
      reference: req.referenceNumber,
      oldValues: { status: oldStatus },
      newValues: { status, reason },
      ipAddress: '102.89.44.12',
      createdAt: new Date().toISOString(),
    });
  }

  async getCustomers(filters?: { search?: string; status?: string }) {
    await new Promise((r) => setTimeout(r, 100));
    let list = [...this.customers];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((c) => c.companyName.toLowerCase().includes(q) || c.accountNumber.toLowerCase().includes(q));
    }
    return list;
  }

  async getCustomerById(id: string) {
    await new Promise((r) => setTimeout(r, 100));
    const cus = this.customers.find((c) => c.id === id || c.accountNumber === id);
    if (!cus) return null;
    return {
      ...cus,
      addresses: [
        { label: 'Lekki Coastal Site', address: 'Plot 4, Coastal Road, Lekki Phase 1', isDefault: true },
        { label: 'Head Office', address: 'Plot 12, Commercial Avenue, Victoria Island', isDefault: false },
      ],
      contacts: [
        { name: cus.contactName, role: 'Managing Director / Procurement', phone: cus.phone, email: cus.email },
        { name: 'Engr. Kolade', role: 'Site Project Engineer', phone: '+234 818 999 0011', email: 'kolade@build.ng' },
      ],
      requisitions: this.requisitions,
    };
  }

  async getQuarries() {
    await new Promise((r) => setTimeout(r, 100));
    return this.quarries;
  }

  async saveQuarry(payload: Partial<Quarry>) {
    await new Promise((r) => setTimeout(r, 200));
    const idx = this.quarries.findIndex((q) => q.id === payload.id);
    if (idx >= 0) {
      this.quarries[idx] = { ...this.quarries[idx], ...payload };
      return this.quarries[idx];
    } else {
      const newQ: Quarry = {
        id: `qry-${Date.now()}`,
        name: payload.name || 'New Quarry',
        code: payload.code || `QRY-0${this.quarries.length + 1}`,
        location: payload.location || 'Ogun State',
        state: payload.state || 'Ogun',
        region: payload.region || 'South West',
        operationalCapacityTonsPerDay: payload.operationalCapacityTonsPerDay || 5000,
        supportedMaterials: [],
        isActive: true,
      };
      this.quarries.push(newQ);
      return newQ;
    }
  }

  async toggleQuarryStatus(id: string, isActive: boolean) {
    const q = this.quarries.find((x) => x.id === id);
    if (q) q.isActive = isActive;
  }

  async getMaterials() {
    await new Promise((r) => setTimeout(r, 100));
    return this.materials;
  }

  async saveMaterial(payload: Partial<Material>) {
    await new Promise((r) => setTimeout(r, 200));
    const idx = this.materials.findIndex((m) => m.id === payload.id);
    if (idx >= 0) {
      this.materials[idx] = { ...this.materials[idx], ...payload };
      return this.materials[idx];
    } else {
      const newM: Material = {
        id: `mat-${Date.now()}`,
        name: payload.name || 'New Material',
        code: payload.code || 'GR-NEW',
        category: payload.category || 'granite',
        specification: payload.specification || 'Standard Spec',
        description: payload.description || '',
        unit: 'tonnes',
        isAvailable: true,
      };
      this.materials.push(newM);
      return newM;
    }
  }

  async getDestinations() {
    await new Promise((r) => setTimeout(r, 100));
    return this.destinations;
  }

  async saveDestination(payload: any) {
    await new Promise((r) => setTimeout(r, 150));
    const idx = this.destinations.findIndex((d) => d.id === payload.id);
    if (idx >= 0) {
      this.destinations[idx] = { ...this.destinations[idx], ...payload };
      return this.destinations[idx];
    } else {
      const newD = {
        id: `dst-${Date.now()}`,
        code: `DST-0${this.destinations.length + 1}`,
        name: payload.name,
        state: payload.state,
        city: payload.city,
        areaZone: payload.areaZone || 'Zone',
        addressDescription: payload.addressDescription || '',
        activeTariffsCount: 0,
        isActive: true,
      };
      this.destinations.push(newD);
      return newD;
    }
  }

  async getDestinationRequests() {
    await new Promise((r) => setTimeout(r, 100));
    return this.destinationRequests;
  }

  async reviewDestinationRequest(id: string, status: 'APPROVED' | 'REJECTED', reason?: string) {
    await new Promise((r) => setTimeout(r, 200));
    const req = this.destinationRequests.find((d) => d.id === id);
    if (req) {
      req.status = status;
      req.reviewedBy = 'Operations Manager';
      req.reviewedAt = new Date().toISOString();
      if (reason) req.rejectionReason = reason;
    }
  }

  async getMaterialPrices() {
    await new Promise((r) => setTimeout(r, 100));
    return this.materialPrices;
  }

  async saveMaterialPrice(payload: any) {
    await new Promise((r) => setTimeout(r, 200));
    const q = this.quarries.find((x) => x.id === payload.quarryId);
    const m = this.materials.find((x) => x.id === payload.materialId);
    const newPrice: MaterialPriceRecord = {
      id: `mp-${Date.now()}`,
      quarryId: payload.quarryId,
      quarryName: q?.name || 'Assigned Quarry',
      materialId: payload.materialId,
      materialName: m?.name || 'Selected Aggregate',
      pricePerUnit: Number(payload.pricePerUnit),
      currency: 'NGN',
      effectiveFrom: payload.effectiveFrom || new Date().toISOString().split('T')[0],
      effectiveTo: payload.effectiveTo || null,
      isActive: true,
      createdBy: 'Sales Director',
      createdAt: new Date().toISOString(),
    };
    this.materialPrices.unshift(newPrice);
  }

  async getHaulageRates() {
    await new Promise((r) => setTimeout(r, 100));
    return this.haulageRates;
  }

  async saveHaulageRate(payload: any) {
    await new Promise((r) => setTimeout(r, 200));
    const q = this.quarries.find((x) => x.id === payload.quarryId);
    const d = this.destinations.find((x) => x.id === payload.destinationId);
    const newRate: HaulageRateRecord = {
      id: `hr-${Date.now()}`,
      quarryId: payload.quarryId,
      quarryName: q?.name || 'Assigned Quarry',
      destinationId: payload.destinationId,
      destinationName: d?.name || 'Destination',
      truckTypeId: payload.truckTypeId || 'trk-30t',
      truckTypeName: '30 Tonne Heavy Tipper',
      ratePerTrip: Number(payload.ratePerTrip || 85000),
      ratePerTonne: Number(payload.ratePerTonne || 2833.33),
      minimumTonnage: 30,
      currency: 'NGN',
      effectiveFrom: payload.effectiveFrom || new Date().toISOString().split('T')[0],
      effectiveTo: payload.effectiveTo || null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.haulageRates.unshift(newRate);
  }

  async getCustomerPrices() {
    await new Promise((r) => setTimeout(r, 100));
    return this.customerPrices;
  }

  async saveCustomerPrice(payload: any) {
    await new Promise((r) => setTimeout(r, 200));
    const cus = this.customers.find((x) => x.id === payload.customerId);
    const q = this.quarries.find((x) => x.id === payload.quarryId);
    const m = this.materials.find((x) => x.id === payload.materialId);
    const standardPrice = 8500;
    const special = Number(payload.specialPricePerUnit);
    const newCp: CustomerPriceRecord = {
      id: `cp-${Date.now()}`,
      customerId: payload.customerId,
      customerName: cus?.companyName || 'Corporate Client',
      quarryId: payload.quarryId,
      quarryName: q?.name || 'Assigned Quarry',
      materialId: payload.materialId,
      materialName: m?.name || 'Material Aggregate',
      standardPrice,
      specialPricePerUnit: special,
      difference: special - standardPrice,
      currency: 'NGN',
      effectiveFrom: payload.effectiveFrom || new Date().toISOString().split('T')[0],
      effectiveTo: payload.effectiveTo || null,
      notes: payload.notes || 'Master supply negotiated rate',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.customerPrices.unshift(newCp);
  }

  async getPromotions() {
    await new Promise((r) => setTimeout(r, 100));
    return this.promotions;
  }

  async savePromotion(payload: any) {
    await new Promise((r) => setTimeout(r, 200));
    const q = this.quarries.find((x) => x.id === payload.quarryId);
    const m = this.materials.find((x) => x.id === payload.materialId);
    const newPromo: PromotionalPriceRecord = {
      id: `promo-${Date.now()}`,
      name: payload.name,
      quarryId: payload.quarryId || null,
      quarryName: q?.name || 'All Regional Quarries',
      materialId: payload.materialId || null,
      materialName: m?.name || 'All Aggregates',
      promoPricePerUnit: payload.promoPricePerUnit ? Number(payload.promoPricePerUnit) : null,
      discountPercentage: payload.discountPercentage ? Number(payload.discountPercentage) : null,
      currency: 'NGN',
      effectiveFrom: payload.effectiveFrom,
      effectiveTo: payload.effectiveTo,
      status: 'ACTIVE',
      notes: payload.notes,
      createdAt: new Date().toISOString(),
    };
    this.promotions.unshift(newPromo);
  }

  async getAuditLogs(filters?: { entity?: string; action?: string }) {
    await new Promise((r) => setTimeout(r, 100));
    let list = [...this.auditLogs];
    if (filters?.entity) {
      list = list.filter((a) => a.entityType === filters.entity);
    }
    if (filters?.action) {
      list = list.filter((a) => a.action.includes(filters.action!));
    }
    return list;
  }

  async getUsers() {
    await new Promise((r) => setTimeout(r, 100));
    return this.users;
  }

  async updateUserRole(userId: string, roleCode: string) {
    await new Promise((r) => setTimeout(r, 200));
    const u = this.users.find((x) => x.id === userId);
    if (u) {
      u.roleCode = roleCode;
      u.roleName = roleCode.replace('_', ' ');
    }
  }

  async toggleUserStatus(userId: string, isActive: boolean) {
    await new Promise((r) => setTimeout(r, 100));
    const u = this.users.find((x) => x.id === userId);
    if (u) u.isActive = isActive;
  }

  async getRoles() {
    await new Promise((r) => setTimeout(r, 100));
    return [
      {
        code: 'SUPER_ADMIN',
        name: 'Super Administrator',
        description: 'Full tenant & security access',
        permissions: ['customers.manage', 'requisitions.approve', 'pricing.manage', 'users.manage', 'reports.view'],
      },
      {
        code: 'MANAGEMENT',
        name: 'Executive Management',
        description: 'Executive visibility, financial reports, operational control',
        permissions: ['customers.view', 'requisitions.view', 'pricing.view', 'reports.view'],
      },
      {
        code: 'SALES',
        name: 'Sales & Procurement Officer',
        description: 'Customer management, requisition pricing, and order setup',
        permissions: ['customers.manage', 'requisitions.view', 'pricing.view'],
      },
      {
        code: 'OPERATIONS',
        name: 'Logistics & Operations Manager',
        description: 'Fleet routing, quarry loading bay management, fulfillment',
        permissions: ['requisitions.approve', 'quarries.manage', 'loading.manage', 'delivery.manage'],
      },
      {
        code: 'CUSTOMER',
        name: 'Contractor / Customer',
        description: 'Material requisitions and delivery tracking',
        permissions: ['requisitions.create', 'requisitions.view'],
      },
    ];
  }
}
