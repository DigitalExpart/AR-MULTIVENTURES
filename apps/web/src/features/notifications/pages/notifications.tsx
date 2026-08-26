import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { notificationApi } from '@ar-multiventures/api';
import { formatDate } from '@ar-multiventures/business-logic';
import type { AppNotification } from '@ar-multiventures/types';
import {
  Bell,
  CheckCheck,
  SlidersHorizontal,
  ArrowRight,
  Package,
  Truck,
  CheckCircle2,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { NotificationPreferencesModal } from '../components/notification-preferences-modal';
import { cn } from '@/lib/utils';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await notificationApi.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkSingleRead = async (id: string) => {
    await notificationApi.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
    );
  };

  const filtered = notifications.filter((n) => (filter === 'UNREAD' ? !n.isRead : true));
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getTemplateIcon = (template: string) => {
    switch (template) {
      case 'REQUISITION_APPROVED':
        return <Package className="h-5 w-5 text-primary-800" />;
      case 'TRIP_DISPATCHED':
        return <Truck className="h-5 w-5 text-blue-700" />;
      case 'DELIVERY_COMPLETED':
        return <CheckCircle2 className="h-5 w-5 text-emerald-700" />;
      case 'PAYMENT_CONFIRMED':
        return <DollarSign className="h-5 w-5 text-emerald-800" />;
      default:
        return <Bell className="h-5 w-5 text-neutral-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Operational Notifications & Alerts Center"
          description="Commercial approvals, dispatch departure alerts, verified weighbridge tickets, and payment receipts."
          breadcrumbs={[{ label: 'Notifications' }]}
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreferencesOpen(true)}
            leftIcon={<SlidersHorizontal className="h-4 w-4" />}
          >
            Preferences
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            leftIcon={<CheckCheck className="h-4 w-4" />}
          >
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl overflow-x-auto max-w-fit">
        <button
          onClick={() => setFilter('ALL')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-caption font-bold transition-all',
            filter === 'ALL' ? 'bg-white text-primary-950 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
          )}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-caption font-bold transition-all flex items-center gap-1.5',
            filter === 'UNREAD' ? 'bg-white text-primary-950 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
          )}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 bg-primary-900 text-white rounded-full text-[10px] font-mono">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="divide-y divide-neutral-100">
          {isLoading ? (
            <div className="py-12 text-center text-caption text-neutral-400 font-mono">
              Loading notifications...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-body-sm text-neutral-500">
              No notifications in this folder.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors',
                  !item.isRead ? 'bg-primary-50/25' : 'hover:bg-neutral-50/60'
                )}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                    {getTemplateIcon(item.templateType)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary-800 inline-block" />
                      )}
                      <h4 className="text-body-sm font-bold text-neutral-950">{item.title}</h4>
                      <span className="text-[11px] font-mono text-neutral-400">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-caption text-neutral-600 leading-relaxed max-w-2xl">
                      {item.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-center">
                  {item.link && (
                    <Link to={item.link} onClick={() => handleMarkSingleRead(item.id)}>
                      <Button variant="outline" size="xs" rightIcon={<ArrowRight className="h-3 w-3" />}>
                        View Details
                      </Button>
                    </Link>
                  )}
                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkSingleRead(item.id)}
                      className="text-[11px] font-mono font-semibold text-neutral-500 hover:text-neutral-900 p-1"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <NotificationPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />
    </div>
  );
}
