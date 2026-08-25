import { PageHeader } from '@/components/layout/page-header';
import { PageTransition } from '@/components/motion/page-transition';
import { Card } from '@/components/ui/card';
import { NotificationItem } from '@/components/business/notification-item';
import { mockNotifications } from '@/services/mock/mock-data';

export function NotificationsPage() {
  return (
    <PageTransition>
      <PageHeader
        title="Notifications"
        description="Stay updated on your orders and deliveries"
        breadcrumbs={[{ label: 'Notifications' }]}
      />
      <Card>
        <div className="space-y-1">
          {mockNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              type={notification.type}
              title={notification.title}
              message={notification.message}
              time={notification.time}
              isRead={notification.isRead}
            />
          ))}
        </div>
      </Card>
    </PageTransition>
  );
}
