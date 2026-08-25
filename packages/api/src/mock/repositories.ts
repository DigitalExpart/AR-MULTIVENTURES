import type {
  IAuthRepository,
  ICustomerRepository,
  IRequisitionRepository,
  IOrderRepository,
  IDeliveryRepository,
  IInvoiceRepository,
  IPaymentRepository,
  IResourceRepository
} from '../interfaces';
import type {
  User,
  CustomerProfile,
  Requisition,
  NewRequisitionPayload,
  Order,
  Delivery,
  Invoice,
  Payment,
  Quarry,
  Material,
  Truck,
  Notification
} from '@ar-multiventures/types';
import type { LoginFormValues, RegisterFormValues } from '@ar-multiventures/validation';
import {
  mockCustomerProfile,
  mockQuarries,
  mockMaterials,
  mockTrucks,
  mockRequisitions,
  mockOrders,
  mockDeliveries,
  mockActiveDelivery,
  mockInvoices,
  mockPayments,
  mockNotifications,
} from './mock-db';

export class MockAuthRepository implements IAuthRepository {
  private currentUser: User | null = mockCustomerProfile;

  async login(credentials: LoginFormValues): Promise<{ user: User; token: string }> {
    await new Promise((r) => setTimeout(r, 400));
    this.currentUser = mockCustomerProfile;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ar_auth_token', 'mock_jwt_token_buildcorp');
      localStorage.setItem('ar_auth_user', JSON.stringify(this.currentUser));
    }
    return { user: this.currentUser, token: 'mock_jwt_token_buildcorp' };
  }

  async register(data: RegisterFormValues): Promise<{ user: User; token: string }> {
    await new Promise((r) => setTimeout(r, 600));
    const newUser: CustomerProfile = {
      ...mockCustomerProfile,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      companyName: data.companyName || `${data.lastName} Enterprises`,
    };
    this.currentUser = newUser;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ar_auth_token', 'mock_jwt_token_new');
      localStorage.setItem('ar_auth_user', JSON.stringify(this.currentUser));
    }
    return { user: newUser, token: 'mock_jwt_token_new' };
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ar_auth_token');
      localStorage.removeItem('ar_auth_user');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ar_auth_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return this.currentUser;
        }
      }
    }
    return this.currentUser;
  }
}

export class MockCustomerRepository implements ICustomerRepository {
  async getProfile(customerId: string): Promise<CustomerProfile> {
    await new Promise((r) => setTimeout(r, 150));
    return mockCustomerProfile;
  }

  async getNotifications(customerId: string): Promise<Notification[]> {
    await new Promise((r) => setTimeout(r, 150));
    return mockNotifications;
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    const item = mockNotifications.find((n) => n.id === notificationId);
    if (item) item.isRead = true;
  }
}

export class MockRequisitionRepository implements IRequisitionRepository {
  private requisitions: Requisition[] = [...mockRequisitions];

  async list(customerId?: string): Promise<Requisition[]> {
    await new Promise((r) => setTimeout(r, 200));
    return this.requisitions;
  }

  async getById(id: string): Promise<Requisition | null> {
    await new Promise((r) => setTimeout(r, 150));
    return this.requisitions.find((r) => r.id === id || r.referenceNumber === id) || null;
  }

  async create(payload: NewRequisitionPayload): Promise<Requisition> {
    await new Promise((r) => setTimeout(r, 600));
    const quarry = mockQuarries.find((q) => q.id === payload.quarryId);
    const material = mockMaterials.find((m) => m.id === payload.materialId);

    const refNum = `REQ-2026-${String(this.requisitions.length + 143).padStart(6, '0')}`;
    const newReq: Requisition = {
      id: `req-${Date.now()}`,
      referenceNumber: refNum,
      customerId: mockCustomerProfile.id,
      quarryId: payload.quarryId,
      quarryName: quarry?.name || 'Assigned Quarry',
      materialId: payload.materialId,
      materialName: material?.name || 'Selected Material',
      quantity: payload.quantity,
      unit: material?.unit || 'tonnes',
      transportationType: payload.transportationType,
      destination: payload.destination,
      destinationAddress: payload.destinationAddress,
      requestedDeliveryDate: payload.deliveryDate,
      status: 'submitted',
      pricing: {
        materialCost: 8500 * payload.quantity,
        loadingCharges: 500 * payload.quantity,
        haulageCharges: payload.transportationType === 'self' ? 0 : 85000,
        otherCharges: payload.transportationType === 'self' ? 0 : 2125,
        discount: payload.quantity >= 60 ? (8500 * payload.quantity * 0.03) : 0,
        subtotal: (8500 * payload.quantity) + (500 * payload.quantity) + (payload.transportationType === 'self' ? 0 : 87125),
        tax: 0,
        total: Math.max(0, (8500 * payload.quantity) + (500 * payload.quantity) + (payload.transportationType === 'self' ? 0 : 87125) - (payload.quantity >= 60 ? (8500 * payload.quantity * 0.03) : 0)),
      },
      notes: payload.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.requisitions.unshift(newReq);
    return newReq;
  }

  async calculatePriceQuote(request: import('@ar-multiventures/types').PriceQuoteRequest): Promise<import('@ar-multiventures/types').PriceQuoteBreakdown> {
    await new Promise((r) => setTimeout(r, 250)); // Simulating network latency
    const unitPrice = 8500.00;
    const matAmount = unitPrice * request.quantity;
    const loadingAmount = 500.00 * request.quantity;
    const haulageAmount = request.transportationType === 'self' ? 0 : 85000.00;
    const fuelAmount = request.transportationType === 'self' ? 0 : 2125.00; // 2.5% of haulage
    const discountAmount = request.quantity >= 60 ? Math.round(matAmount * 0.03) : 0;
    const subtotal = matAmount + loadingAmount + haulageAmount + fuelAmount;
    const total = Math.max(0, subtotal - discountAmount);

    return {
      currency: 'NGN',
      quantity: request.quantity,
      material: {
        unitPrice,
        quantity: request.quantity,
        amount: matAmount,
        source: 'STANDARD_QUARRY_PRICE',
      },
      loading: {
        ratePerTonne: 500.00,
        ratePerTrip: 0,
        amount: loadingAmount,
      },
      haulage: {
        amount: haulageAmount,
        source: request.transportationType === 'self' ? 'SELF_PICKUP' : 'DESTINATION_TRUCK_TARIFF',
      },
      fuelAdjustment: {
        percentage: request.transportationType === 'self' ? 0 : 2.5,
        amount: fuelAmount,
      },
      discounts: [
        {
          name: request.quantity >= 60 ? 'High Volume Tier (>=60T)' : 'None',
          amount: discountAmount,
        },
      ],
      subtotal,
      totalDiscount: discountAmount,
      total,
      requiresReview: false,
      quotedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    };
  }
}

export class MockOrderRepository implements IOrderRepository {
  async list(customerId?: string): Promise<Order[]> {
    await new Promise((r) => setTimeout(r, 200));
    return mockOrders;
  }

  async getById(id: string): Promise<Order | null> {
    await new Promise((r) => setTimeout(r, 150));
    return mockOrders.find((o) => o.id === id || o.referenceNumber === id) || null;
  }
}

export class MockDeliveryRepository implements IDeliveryRepository {
  async list(customerId?: string): Promise<Delivery[]> {
    await new Promise((r) => setTimeout(r, 200));
    return mockDeliveries;
  }

  async getActiveDelivery(customerId?: string): Promise<Delivery | null> {
    await new Promise((r) => setTimeout(r, 150));
    return mockActiveDelivery;
  }

  async getById(id: string): Promise<Delivery | null> {
    await new Promise((r) => setTimeout(r, 150));
    return mockDeliveries.find((d) => d.id === id) || null;
  }
}

export class MockInvoiceRepository implements IInvoiceRepository {
  async list(customerId?: string): Promise<Invoice[]> {
    await new Promise((r) => setTimeout(r, 200));
    return mockInvoices;
  }

  async getById(id: string): Promise<Invoice | null> {
    await new Promise((r) => setTimeout(r, 150));
    return mockInvoices.find((i) => i.id === id || i.invoiceNumber === id) || null;
  }
}

export class MockPaymentRepository implements IPaymentRepository {
  async list(customerId?: string): Promise<Payment[]> {
    await new Promise((r) => setTimeout(r, 200));
    return mockPayments;
  }

  async getById(id: string): Promise<Payment | null> {
    await new Promise((r) => setTimeout(r, 150));
    return mockPayments.find((p) => p.id === id || p.referenceNumber === id) || null;
  }
}

export class MockResourceRepository implements IResourceRepository {
  async getQuarries(): Promise<Quarry[]> {
    await new Promise((r) => setTimeout(r, 100));
    return mockQuarries;
  }

  async getMaterials(): Promise<Material[]> {
    await new Promise((r) => setTimeout(r, 100));
    return mockMaterials;
  }

  async getTrucks(): Promise<Truck[]> {
    await new Promise((r) => setTimeout(r, 100));
    return mockTrucks;
  }
}
