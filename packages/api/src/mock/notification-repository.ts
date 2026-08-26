import type { INotificationRepository } from '../interfaces';
import type { AppNotification, NotificationPreference } from '@ar-multiventures/types';

export const mockAppNotifications: AppNotification[] = [
  {
    id: 'notif-01',
    userId: 'usr-customer-01',
    customerId: 'cus-buildcorp',
    title: 'Requisition REQ-2026-000041 Approved',
    message: 'Your 150-tonne Granite 3/4" supply order has been approved by sales. Payment clearance is verified.',
    templateType: 'REQUISITION_APPROVED',
    channel: 'IN_APP',
    entityType: 'requisition',
    entityId: 'req-01',
    link: '/app/requisitions',
    isRead: false,
    createdAt: '2026-08-26T08:30:00Z',
  },
  {
    id: 'notif-02',
    userId: 'usr-customer-01',
    customerId: 'cus-buildcorp',
    title: 'Trip TRP-2026-000083 Dispatched',
    message: 'Truck KJA-104-XA (30.15 Tonnes) departed Abeokuta Quarry and is en route to Dangote Refinery Lekki Site.',
    templateType: 'TRIP_DISPATCHED',
    channel: 'IN_APP',
    entityType: 'trip',
    entityId: 'trp-03',
    link: '/app/deliveries',
    isRead: false,
    createdAt: '2026-08-26T08:45:00Z',
  },
  {
    id: 'notif-03',
    userId: 'usr-admin-01',
    title: 'Direct Bank Transfer Awaiting Review',
    message: 'Customer Julius Berger uploaded ₦3,200,000 proof of payment (Ref: GTB-NIP-998231). Confirmation required.',
    templateType: 'PAYMENT_REQUIRED',
    channel: 'IN_APP',
    entityType: 'payment',
    entityId: 'pay-03',
    link: '/admin/finance/payments',
    isRead: false,
    createdAt: '2026-08-26T09:00:00Z',
  },
  {
    id: 'notif-04',
    userId: 'usr-customer-01',
    customerId: 'cus-buildcorp',
    title: 'Delivery Completed & POD Verified',
    message: 'Trip TRP-2026-000082 (30.05 Tonnes) delivered and digitally signed by Engr. Babatunde Alabi.',
    templateType: 'DELIVERY_COMPLETED',
    channel: 'IN_APP',
    entityType: 'trip',
    entityId: 'trp-02',
    link: '/app/deliveries',
    isRead: true,
    readAt: '2026-08-25T16:00:00Z',
    createdAt: '2026-08-25T15:20:00Z',
  },
  {
    id: 'notif-05',
    userId: 'usr-customer-01',
    customerId: 'cus-buildcorp',
    title: 'Payment Confirmed — ₦2,450,000',
    message: 'Paystack online card transaction confirmed. Electronic receipt RCT-2026-000014 generated.',
    templateType: 'PAYMENT_CONFIRMED',
    channel: 'IN_APP',
    entityType: 'payment',
    entityId: 'pay-01',
    link: '/app/payments',
    isRead: true,
    readAt: '2026-08-25T12:00:00Z',
    createdAt: '2026-08-25T11:35:00Z',
  },
];

export class MockNotificationRepository implements INotificationRepository {
  private notifications = [...mockAppNotifications];
  private preferences: NotificationPreference[] = [
    { id: 'pref-1', userId: 'usr-customer-01', channel: 'IN_APP', templateType: 'REQUISITION_APPROVED', isEnabled: true },
    { id: 'pref-2', userId: 'usr-customer-01', channel: 'IN_APP', templateType: 'TRIP_DISPATCHED', isEnabled: true },
    { id: 'pref-3', userId: 'usr-customer-01', channel: 'IN_APP', templateType: 'DELIVERY_COMPLETED', isEnabled: true },
    { id: 'pref-4', userId: 'usr-customer-01', channel: 'EMAIL', templateType: 'PAYMENT_CONFIRMED', isEnabled: true },
    { id: 'pref-5', userId: 'usr-customer-01', channel: 'SMS', templateType: 'TRIP_DISPATCHED', isEnabled: false },
    { id: 'pref-6', userId: 'usr-customer-01', channel: 'WHATSAPP', templateType: 'DELIVERY_COMPLETED', isEnabled: false },
  ];

  async getNotifications(filters?: { userId?: string; customerId?: string; isRead?: boolean }): Promise<AppNotification[]> {
    await new Promise((r) => setTimeout(r, 80));
    return this.notifications.filter((n) => {
      if (filters?.customerId && n.customerId && n.customerId !== filters.customerId) return false;
      if (filters?.isRead !== undefined && n.isRead !== filters.isRead) return false;
      return true;
    });
  }

  async markNotificationRead(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 60));
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      notif.readAt = new Date().toISOString();
    }
  }

  async markAllNotificationsRead(userId?: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 80));
    for (const n of this.notifications) {
      n.isRead = true;
      n.readAt = new Date().toISOString();
    }
  }

  async getPreferences(userId: string): Promise<NotificationPreference[]> {
    await new Promise((r) => setTimeout(r, 60));
    return this.preferences.filter((p) => p.userId === userId || p.userId === 'usr-customer-01');
  }

  async updatePreference(userId: string, preference: Partial<NotificationPreference>): Promise<void> {
    await new Promise((r) => setTimeout(r, 80));
    const existing = this.preferences.find(
      (p) => p.userId === userId && p.channel === preference.channel && p.templateType === preference.templateType
    );
    if (existing) {
      existing.isEnabled = preference.isEnabled ?? existing.isEnabled;
    } else if (preference.channel && preference.templateType) {
      this.preferences.push({
        id: `pref-${Date.now()}`,
        userId,
        channel: preference.channel,
        templateType: preference.templateType,
        isEnabled: preference.isEnabled ?? true,
      });
    }
  }
}
