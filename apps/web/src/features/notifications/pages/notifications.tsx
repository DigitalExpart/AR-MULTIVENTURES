import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageTransition } from '@/components/motion/page-transition';
import { Card } from '@/components/ui/card';
import { NotificationItem } from '@/components/business/notification-item';
import { customerApi } from '@ar-multiventures/api';
import type { Notification } from '@ar-multiventures/types';
import { CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    async function loadNotifications() {
      const data = await customerApi.getNotifications('usr-buildcorp-01');
      setNotifications(data);
    }
    loadNotifications();
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <PageTransition>
      <PageHeader
        title="Operational Notifications & Alerts"
        description="Real-time dispatch confirmations, quarry weighbridge tickets, and payment receipts."
        breadcrumbs={[{ label: 'Notifications' }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="h-4 w-4" />}
            onClick={handleMarkAllRead}
          >
            Mark All as Read
          </Button>
        }
      />

      <Card padding="sm" className="max-w-4xl">
        <div className="divide-y divide-neutral-100">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              type={n.type}
              title={n.title}
              message={n.message}
              time={n.timestamp}
              isRead={n.isRead}
            />
          ))}
        </div>
      </Card>
    </PageTransition>
  );
}
