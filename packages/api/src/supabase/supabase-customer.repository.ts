import type { ICustomerRepository } from '../interfaces';
import type { CustomerProfile, Notification } from '@ar-multiventures/types';
import { supabase } from './supabase-client';

export class SupabaseCustomerRepository implements ICustomerRepository {
  async getProfile(customerId: string): Promise<CustomerProfile> {
    // 1. Check if user is linked to customer via customer_users
    const { data: customerUser } = await supabase
      .from('customer_users')
      .select('customer_id, customers(*)')
      .eq('user_id', customerId)
      .single();

    // 2. Fetch profile info
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', customerId)
      .single();

    const customerRecord = customerUser?.customers as any;

    return {
      id: customerId,
      email: customerRecord?.email || 'operations@buildcorpng.com',
      phone: customerRecord?.phone || profile?.phone || '+234 812 345 6789',
      firstName: profile?.first_name || 'Adebayo',
      lastName: profile?.last_name || 'Ogundimu',
      companyName: customerRecord?.company_name || 'BuildCorp Nigeria Limited',
      rcNumber: customerRecord?.rc_number || 'RC-1489201',
      taxId: customerRecord?.tax_id || undefined,
      role: 'customer',
      isVerified: true,
      accountBalance: 2450000,
      creditLimit: customerRecord?.credit_limit || 15000000,
      address: customerRecord?.notes || 'Plot 12, Commercial Avenue, Lekki Phase 1',
      city: 'Lagos',
      state: 'Lagos State',
      createdAt: customerRecord?.created_at || new Date().toISOString(),
      updatedAt: customerRecord?.updated_at || new Date().toISOString(),
    };
  }

  async getNotifications(customerId: string): Promise<Notification[]> {
    const { data: notifs, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !notifs || notifs.length === 0) {
      return [];
    }

    return notifs.map((n) => ({
      id: n.id,
      type: n.type as any,
      title: n.title,
      message: n.message,
      timestamp: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: n.is_read,
      actionUrl: n.action_url || undefined,
    }));
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);
  }
}
