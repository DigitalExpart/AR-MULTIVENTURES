export interface AuditLogEntry {
  id: string;
  organizationId?: string;
  actorUserId?: string;
  actorName: string;
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  reference?: string;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  ipAddress?: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleCode: string;
  roleName: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface DestinationRequestItem {
  id: string;
  customerId: string;
  customerName: string;
  requestedName: string;
  state: string;
  city: string;
  fullAddress: string;
  landmark?: string;
  siteContactName: string;
  siteContactPhone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface MaterialPriceRecord {
  id: string;
  quarryId: string;
  quarryName: string;
  materialId: string;
  materialName: string;
  pricePerUnit: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
}

export interface HaulageRateRecord {
  id: string;
  quarryId: string;
  quarryName: string;
  destinationId: string;
  destinationName: string;
  truckTypeId: string;
  truckTypeName: string;
  ratePerTrip: number;
  ratePerTonne: number;
  minimumTonnage: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CustomerPriceRecord {
  id: string;
  customerId: string;
  customerName: string;
  quarryId: string;
  quarryName: string;
  materialId: string;
  materialName: string;
  standardPrice: number;
  specialPricePerUnit: number;
  difference: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PromotionalPriceRecord {
  id: string;
  name: string;
  quarryId?: string | null;
  quarryName?: string;
  materialId?: string | null;
  materialName?: string;
  promoPricePerUnit?: number | null;
  discountPercentage?: number | null;
  currency: string;
  effectiveFrom: string;
  effectiveTo: string;
  status: 'ACTIVE' | 'UPCOMING' | 'EXPIRED';
  notes?: string;
  createdAt: string;
}

export interface PricingOverviewAlerts {
  unpricedMaterialsCount: number;
  unmappedHaulageRoutesCount: number;
  expiringPromotionsCount: number;
  expiredCustomerRatesCount: number;
}
