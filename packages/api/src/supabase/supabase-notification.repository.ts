import type { INotificationRepository } from '../interfaces';
import type { AppNotification, NotificationPreference } from '@ar-multiventures/types';
import { supabase } from './supabase-client';

export class SupabaseNotificationRepository implements INotificationRepository {
  async getNotifications(filters?: { userId?: string; customerId?: string; isRead?: boolean }): Promise<AppNotification[]> {
    let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (filters?.userId) query = query.eq('user_id', filters.userId);
    if (filters?.customerId) query = query.eq('customer_id', filters.customerId);
    if (filters?.isRead !== undefined) query = query.eq('is_read', filters.isRead);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to load notifications from Supabase: ${error.message}`);

    return (data || []).map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      customerId: n.customer_id,
      title: n.title,
      message: n.message,
      templateType: n.template_type,
      channel: n.channel,
      entityType: n.entity_type,
      entityId: n.entity_id,
      link: n.link,
      isRead: n.is_read,
      readAt: n.read_at,
      createdAt: n.created_at,
    }));
  }

  async markNotificationRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(`Failed to mark notification read: ${error.message}`);
  }

  async markAllNotificationsRead(userId?: string): Promise<void> {
    if (userId) {
      const { error } = await supabase.rpc('mark_all_notifications_read', { p_user_id: userId });
      if (error) throw new Error(`Failed to mark all notifications read: ${error.message}`);
    } else {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('is_read', false);
      if (error) throw new Error(`Failed to mark all notifications read: ${error.message}`);
    }
  }

  async getPreferences(userId: string): Promise<NotificationPreference[]> {
    const { data, error } = await supabase.from('notification_preferences').select('*').eq('user_id', userId);
    if (error) throw new Error(`Failed to load notification preferences: ${error.message}`);
    return (data || []).map((p: any) => ({
      id: p.id,
      userId: p.user_id,
      channel: p.channel,
      templateType: p.template_type,
      isEnabled: p.is_enabled,
    }));
  }

  async updatePreference(userId: string, preference: Partial<NotificationPreference>): Promise<void> {
    const { error } = await supabase.from('notification_preferences').upsert({
      user_id: userId,
      channel: preference.channel,
      template_type: preference.templateType,
      is_enabled: preference.isEnabled,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(`Failed to update notification preference: ${error.message}`);
  }
}
