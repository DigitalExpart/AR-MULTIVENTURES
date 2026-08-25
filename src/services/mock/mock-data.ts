import type { UserProfile } from '@/types/user';
import type { Requisition } from '@/types/requisition';
import type { Order } from '@/types/order';
import type { Delivery } from '@/types/delivery';
import type { Invoice } from '@/types/invoice';
import type { Payment } from '@/types/payment';
import type { Quarry } from '@/types/quarry';
import type { Material } from '@/types/material';
import type { Truck } from '@/types/truck';

export const mockUser: UserProfile = {
  id: 'usr-001',
  email: 'operations@buildcorpng.com',
  phone: '+234 812 345 6789',
  firstName: 'Adebayo',
  lastName: 'Ogundimu',
  companyName: 'BuildCorp Nigeria Ltd',
  role: 'customer',
  isVerified: true,
  accountBalance: 2450000,
  createdAt: '2024-08-01T00:00:00Z',
  updatedAt: '2026-08-25T00:00:00Z',
};

export const mockQuarries: Quarry[] = [
  { id: 'qry-001', name: 'Abeokuta Quarry', location: 'Abeokuta', state: 'Ogun', isActive: true, materials: ['granite-3-4', 'granite-1-2', 'stone-dust'] },
  { id: 'qry-002', name: 'Ibadan Central Quarry', location: 'Ibadan', state: 'Oyo', isActive: true, materials: ['granite-20mm', 'granite-30mm', 'quarry-dust'] },
  { id: 'qry-003', name: 'Sagamu Quarry', location: 'Sagamu', state: 'Ogun', isActive: true, materials: ['granite-10mm', 'sharp-sand', 'stone-dust'] },
  { id: 'qry-004', name: 'Ondo Stone Works', location: 'Ondo', state: 'Ondo', isActive: true, materials: ['granite-3-4', 'granite-20mm'] },
];

export const mockMaterials: Material[] = [
  { id: 'mat-001', name: '3/4 Granite', description: '19mm crushed granite aggregate', category: 'granite', unit: 'tonnes', pricePerUnit: 8500, isAvailable: true },
  { id: 'mat-002', name: '1/2 Granite', description: '12.5mm crushed granite aggregate', category: 'granite', unit: 'tonnes', pricePerUnit: 9000, isAvailable: true },
  { id: 'mat-003', name: '10mm Granite', description: 'Fine crushed granite', category: 'granite', unit: 'tonnes', pricePerUnit: 9500, isAvailable: true },
  { id: 'mat-004', name: '20mm Granite', description: 'Medium crushed granite', category: 'granite', unit: 'tonnes', pricePerUnit: 8000, isAvailable: true },
  { id: 'mat-005', name: '30mm Granite', description: 'Coarse crushed granite', category: 'granite', unit: 'tonnes', pricePerUnit: 7500, isAvailable: true },
  { id: 'mat-006', name: 'Stone Dust', description: 'Fine aggregate from crushing', category: 'dust', unit: 'tonnes', pricePerUnit: 4000, isAvailable: true },
  { id: 'mat-007', name: 'Quarry Dust', description: 'Quarry by-product material', category: 'dust', unit: 'tonnes', pricePerUnit: 3500, isAvailable: true },
  { id: 'mat-008', name: 'Sharp Sand', description: 'Coarse sand for construction', category: 'sand', unit: 'tonnes', pricePerUnit: 5000, isAvailable: true },
];

export const mockTrucks: Truck[] = [
  { id: 'trk-001', registrationNumber: 'ABC-123-XY', capacity: 30, type: 'tipper', driverName: 'Chukwudi Nwankwo', driverPhone: '+234 801 234 5678', isAvailable: true },
  { id: 'trk-002', registrationNumber: 'LAG-456-KJ', capacity: 20, type: 'tipper', driverName: 'Musa Ibrahim', driverPhone: '+234 803 456 7890', isAvailable: true },
  { id: 'trk-003', registrationNumber: 'OGN-789-EF', capacity: 30, type: 'flatbed', driverName: 'Emeka Okafor', driverPhone: '+234 805 678 9012', isAvailable: false },
];

export const mockRequisitions: Requisition[] = [
  {
    id: 'req-001',
    referenceNumber: 'REQ-2026-000142',
    customerId: 'usr-001',
    quarryId: 'qry-001',
    quarryName: 'Abeokuta Quarry',
    materialId: 'mat-004',
    materialName: '20mm Granite',
    quantity: 30,
    unit: 'tonnes',
    destination: 'Victoria Island, Lagos',
    destinationAddress: '14B Kofo Abayomi Street, Victoria Island, Lagos',
    truckId: 'trk-001',
    truckRegistration: 'ABC-123-XY',
    deliveryDate: '2026-08-26',
    status: 'dispatched',
    pricing: {
      materialCost: 240000,
      loadingCharges: 15000,
      haulageCharges: 85000,
      otherCharges: 5000,
      discount: 10000,
      subtotal: 345000,
      tax: 0,
      total: 335000,
    },
    createdAt: '2026-08-23T08:30:00Z',
    updatedAt: '2026-08-25T14:00:00Z',
  },
  {
    id: 'req-002',
    referenceNumber: 'REQ-2026-000141',
    customerId: 'usr-001',
    quarryId: 'qry-002',
    quarryName: 'Ibadan Central Quarry',
    materialId: 'mat-001',
    materialName: '3/4 Granite',
    quantity: 50,
    unit: 'tonnes',
    destination: 'Lekki, Lagos',
    destinationAddress: 'Plot 7, Lekki Phase 1, Lagos',
    truckId: 'trk-002',
    truckRegistration: 'LAG-456-KJ',
    status: 'delivered',
    pricing: {
      materialCost: 425000,
      loadingCharges: 20000,
      haulageCharges: 120000,
      otherCharges: 8000,
      discount: 0,
      subtotal: 573000,
      tax: 0,
      total: 573000,
    },
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-24T16:00:00Z',
  },
  {
    id: 'req-003',
    referenceNumber: 'REQ-2026-000140',
    customerId: 'usr-001',
    quarryId: 'qry-001',
    quarryName: 'Abeokuta Quarry',
    materialId: 'mat-006',
    materialName: 'Stone Dust',
    quantity: 20,
    unit: 'tonnes',
    destination: 'Ikeja, Lagos',
    destinationAddress: '25 Allen Avenue, Ikeja, Lagos',
    status: 'payment_pending',
    pricing: {
      materialCost: 80000,
      loadingCharges: 10000,
      haulageCharges: 55000,
      otherCharges: 3000,
      discount: 0,
      subtotal: 148000,
      tax: 0,
      total: 148000,
    },
    createdAt: '2026-08-25T09:00:00Z',
    updatedAt: '2026-08-25T09:30:00Z',
  },
  {
    id: 'req-004',
    referenceNumber: 'REQ-2026-000139',
    customerId: 'usr-001',
    quarryId: 'qry-003',
    quarryName: 'Sagamu Quarry',
    materialId: 'mat-003',
    materialName: '10mm Granite',
    quantity: 15,
    unit: 'tonnes',
    destination: 'Ikoyi, Lagos',
    destinationAddress: '8 Bourdillon Road, Ikoyi, Lagos',
    status: 'completed',
    pricing: {
      materialCost: 142500,
      loadingCharges: 12000,
      haulageCharges: 65000,
      otherCharges: 4000,
      discount: 5000,
      subtotal: 223500,
      tax: 0,
      total: 218500,
    },
    createdAt: '2026-08-15T11:00:00Z',
    updatedAt: '2026-08-19T18:00:00Z',
  },
];

export const mockOrders: Order[] = mockRequisitions.map((req) => ({
  id: req.id.replace('req', 'ord'),
  referenceNumber: req.referenceNumber.replace('REQ', 'ORD'),
  requisitionId: req.id,
  customerId: req.customerId,
  materialName: req.materialName,
  quantity: req.quantity,
  unit: req.unit,
  quarryName: req.quarryName,
  destination: req.destination,
  truckRegistration: req.truckRegistration || '',
  driverName: 'Chukwudi Nwankwo',
  status: req.status,
  totalAmount: req.pricing.total,
  createdAt: req.createdAt,
  updatedAt: req.updatedAt,
}));

export const mockDeliveries: Delivery[] = [
  {
    id: 'del-001',
    orderId: 'ord-001',
    orderReference: 'ORD-2026-000142',
    materialName: '20mm Granite',
    quantity: 30,
    quarryName: 'Abeokuta Quarry',
    destination: 'Victoria Island, Lagos',
    truckRegistration: 'ABC-123-XY',
    driverName: 'Chukwudi Nwankwo',
    driverPhone: '+234 801 234 5678',
    status: 'dispatched',
    dispatchedAt: '2026-08-25T14:00:00Z',
    estimatedArrival: '2026-08-25T18:00:00Z',
    createdAt: '2026-08-25T14:00:00Z',
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2026-000089',
    orderId: 'ord-002',
    orderReference: 'ORD-2026-000141',
    customerId: 'usr-001',
    items: [
      { description: '3/4 Granite - 50 tonnes', quantity: 50, unitPrice: 8500, total: 425000 },
      { description: 'Loading charges', quantity: 1, unitPrice: 20000, total: 20000 },
      { description: 'Haulage - Ibadan to Lekki', quantity: 1, unitPrice: 120000, total: 120000 },
    ],
    subtotal: 565000,
    tax: 0,
    total: 573000,
    status: 'paid',
    dueDate: '2026-09-03T00:00:00Z',
    issuedAt: '2026-08-20T10:00:00Z',
    paidAt: '2026-08-22T14:00:00Z',
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2026-000090',
    orderId: 'ord-001',
    orderReference: 'ORD-2026-000142',
    customerId: 'usr-001',
    items: [
      { description: '20mm Granite - 30 tonnes', quantity: 30, unitPrice: 8000, total: 240000 },
      { description: 'Loading charges', quantity: 1, unitPrice: 15000, total: 15000 },
      { description: 'Haulage - Abeokuta to VI', quantity: 1, unitPrice: 85000, total: 85000 },
    ],
    subtotal: 340000,
    tax: 0,
    total: 335000,
    status: 'issued',
    dueDate: '2026-09-08T00:00:00Z',
    issuedAt: '2026-08-23T08:30:00Z',
  },
];

export const mockPayments: Payment[] = [
  {
    id: 'pay-001',
    referenceNumber: 'PAY-2026-000045',
    invoiceId: 'inv-001',
    orderId: 'ord-002',
    orderReference: 'ORD-2026-000141',
    customerId: 'usr-001',
    amount: 573000,
    method: 'bank_transfer',
    status: 'confirmed',
    description: 'Payment for 3/4 Granite - 50 tonnes',
    paidAt: '2026-08-22T14:00:00Z',
    createdAt: '2026-08-22T14:00:00Z',
  },
  {
    id: 'pay-002',
    referenceNumber: 'PAY-2026-000046',
    invoiceId: 'inv-002',
    orderId: 'ord-001',
    orderReference: 'ORD-2026-000142',
    customerId: 'usr-001',
    amount: 335000,
    method: 'bank_transfer',
    status: 'confirmed',
    description: 'Payment for 20mm Granite - 30 tonnes',
    paidAt: '2026-08-24T09:00:00Z',
    createdAt: '2026-08-24T09:00:00Z',
  },
];

export const dashboardStats = {
  accountBalance: mockUser.accountBalance,
  outstandingOrders: 2,
  ordersInTransit: 1,
  pendingPayments: 1,
};

export const mockNotifications = [
  { id: 'n1', type: 'delivery' as const, title: 'Delivery Dispatched', message: 'Your order REQ-2026-000142 has been dispatched from Abeokuta Quarry. Estimated arrival: 6:00 PM today.', time: '2 hours ago', isRead: false },
  { id: 'n2', type: 'payment' as const, title: 'Payment Confirmed', message: 'Payment of ₦335,000 for order REQ-2026-000142 has been confirmed.', time: '1 day ago', isRead: false },
  { id: 'n3', type: 'order' as const, title: 'Order Completed', message: 'Order REQ-2026-000141 for 50 tonnes of 3/4 Granite has been marked as completed.', time: '2 days ago', isRead: true },
  { id: 'n4', type: 'alert' as const, title: 'Payment Pending', message: 'Payment for requisition REQ-2026-000140 is pending. Please complete payment to proceed.', time: '3 hours ago', isRead: false },
];
