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
  async list(customerId?: string): Promise<import('@ar-multiventures/types').PaymentRecord[]> {
    await new Promise((r) => setTimeout(r, 150));
    // Delegate to financeApi if available or return mock list
    return [
      {
        id: 'pay-01',
        customerId: customerId || 'cus-buildcorp',
        customerName: 'BuildCorp Nigeria Limited',
        paymentReference: 'PAY-2026-000015',
        paymentMethod: 'PAYSTACK',
        provider: 'PAYSTACK',
        environment: 'TEST',
        amount: 1341375,
        allocatedAmount: 1341375,
        unallocatedAmount: 0,
        currency: 'NGN',
        paymentDate: '2026-08-21',
        status: 'CONFIRMED',
        externalReference: 'PSTK-20260821-499102',
        receiptNumber: 'REC-2026-000015',
        invoiceNumber: 'INV-2026-000041',
        confirmedBy: 'Paystack Automated Gateway',
        confirmedAt: '2026-08-21T11:00:00Z',
        createdAt: '2026-08-21T10:30:00Z',
      },
      {
        id: 'pay-02',
        customerId: customerId || 'cus-buildcorp',
        customerName: 'BuildCorp Nigeria Limited',
        paymentReference: 'PAY-2026-000016',
        paymentMethod: 'BANK_TRANSFER',
        provider: 'MANUAL_BANK_TRANSFER',
        environment: 'TEST',
        amount: 2000000,
        allocatedAmount: 0,
        unallocatedAmount: 2000000,
        currency: 'NGN',
        paymentDate: '2026-08-25',
        status: 'PENDING',
        bankReference: 'ZENITH-DEP-112233',
        invoiceNumber: 'INV-2026-000042',
        notes: 'Direct deposit for August batch supplies via Zenith Bank',
        proofStoragePath: 'customer_proofs/zenith_slip_2000000.pdf',
        createdAt: '2026-08-25T16:00:00Z',
      },
    ];
  }

  async getById(id: string): Promise<import('@ar-multiventures/types').PaymentRecord | null> {
    const list = await this.list();
    return list.find((p) => p.id === id || p.paymentReference === id) || null;
  }

  async initializeOnlinePayment(payload: import('@ar-multiventures/types').PaymentInitRequest): Promise<import('@ar-multiventures/types').PaymentInitResponse> {
    await new Promise((r) => setTimeout(r, 300));
    const ref = `PAY-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
    return {
      success: true,
      reference: ref,
      providerReference: `PSTK-${ref}`,
      amount: 500000,
      amountKobo: 50000000,
      currency: 'NGN',
      authorizationUrl: `/app/payments?mock_reference=${ref}&status=success`,
      accessCode: `MOCK_ACCESS_${ref}`,
    };
  }

  async verifyOnlinePayment(reference: string): Promise<import('@ar-multiventures/types').PaymentVerifyResponse> {
    await new Promise((r) => setTimeout(r, 400));
    const receiptNum = `REC-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
    return {
      success: true,
      paymentId: `pay-${Date.now()}`,
      paymentReference: reference,
      amount: 500000,
      allocatedAmount: 500000,
      receiptNumber: receiptNum,
      receiptId: `rec-${Date.now()}`,
      issuedAt: new Date().toISOString(),
    };
  }

  async submitBankTransfer(payload: import('@ar-multiventures/types').BankTransferSubmissionPayload): Promise<import('@ar-multiventures/types').PaymentRecord> {
    await new Promise((r) => setTimeout(r, 250));
    const ref = `PAY-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
    return {
      id: `pay-${Date.now()}`,
      customerId: payload.customerId,
      customerName: 'BuildCorp Nigeria Limited',
      paymentReference: ref,
      paymentMethod: 'BANK_TRANSFER',
      provider: 'MANUAL_BANK_TRANSFER',
      environment: 'TEST',
      amount: payload.amount,
      allocatedAmount: 0,
      unallocatedAmount: payload.amount,
      currency: 'NGN',
      paymentDate: payload.paymentDate || new Date().toISOString().split('T')[0],
      status: 'PENDING',
      bankReference: payload.bankReference,
      proofStoragePath: payload.proofStoragePath || (typeof payload.proofFile === 'string' ? payload.proofFile : 'customer_proofs/uploaded_slip.png'),
      notes: payload.notes,
      createdAt: new Date().toISOString(),
    };
  }

  async getReceiptByPaymentId(paymentId: string): Promise<import('@ar-multiventures/types').ReceiptRecord | null> {
    await new Promise((r) => setTimeout(r, 100));
    return {
      id: `rec-${paymentId}`,
      receiptNumber: `REC-2026-000015`,
      customerId: 'cus-buildcorp',
      customerName: 'BuildCorp Nigeria Limited',
      paymentId,
      paymentReference: 'PAY-2026-000015',
      paymentMethod: 'PAYSTACK',
      amount: 1341375,
      currency: 'NGN',
      issuedAt: new Date().toISOString(),
      invoiceNumber: 'INV-2026-000041',
      allocatedAmount: 1341375,
    };
  }

  async getCompanyBankAccounts(): Promise<import('@ar-multiventures/types').CompanyBankAccount[]> {
    await new Promise((r) => setTimeout(r, 50));
    return [
      {
        id: 'cba-01',
        bankName: 'Guaranty Trust Bank (GTBank)',
        accountName: 'AR MULTIVENTURES NIGERIA LIMITED',
        accountNumber: '0123456789',
        currency: 'NGN',
        isActive: true,
        displayOrder: 1,
      },
      {
        id: 'cba-02',
        bankName: 'Zenith Bank Plc',
        accountName: 'AR MULTIVENTURES NIGERIA LIMITED - REVENUE',
        accountNumber: '1019283746',
        currency: 'NGN',
        isActive: true,
        displayOrder: 2,
      },
    ];
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

  async getDestinations(): Promise<any[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [
      { id: 'dst-lekki', code: 'DEST-REF-01', name: 'Dangote Refinery / Lekki Free Trade Zone', state: 'Lagos', city: 'Ibeju-Lekki', address: 'Lekki Free Trade Zone, Ibeju-Lekki, Lagos', isActive: true },
      { id: 'dst-eko', code: 'DEST-EKO-02', name: 'Eko Atlantic City Project', state: 'Lagos', city: 'Victoria Island', address: 'Victoria Island Coastal Road, Lagos', isActive: true },
      { id: 'dst-ikeja', code: 'DEST-IKJ-03', name: 'Ikeja Industrial Zone', state: 'Lagos', city: 'Ikeja', address: 'Commercial Avenue, Ikeja, Lagos', isActive: true },
      { id: 'dst-rdm', code: 'DEST-RDM-04', name: 'Redemption City Infrastructure Zone', state: 'Ogun', city: 'Mowe', address: 'Km 46, Lagos-Ibadan Expressway, Ogun', isActive: true },
    ];
  }

  async getTrucks(): Promise<Truck[]> {
    await new Promise((r) => setTimeout(r, 100));
    return mockTrucks;
  }
}
