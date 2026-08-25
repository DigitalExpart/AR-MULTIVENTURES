import { cn } from '@/lib/utils';
import { Bell, FileText, Truck, CreditCard, AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';

type NotificationType = 'order' | 'delivery' | 'payment' | 'alert' | 'general';

interface NotificationItemProps {
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead?: boolean;
  onClick?: () => void;
  className?: string;
}

const notificationIcons: Record<NotificationType, ReactNode> = {
  order: <FileText className="h-4 w-4" />,
  delivery: <Truck className="h-4 w-4" />,
  payment: <CreditCard className="h-4 w-4" />,
  alert: <AlertCircle className="h-4 w-4" />,
  general: <Bell className="h-4 w-4" />,
};

const iconBgColors: Record<NotificationType, string> = {
  order: 'bg-info-100 text-info-600',
  delivery: 'bg-primary-100 text-primary-600',
  payment: 'bg-success-100 text-success-600',
  alert: 'bg-warning-100 text-warning-600',
  general: 'bg-neutral-100 text-neutral-600',
};

export function NotificationItem({
  type,
  title,
  message,
  time,
  isRead = false,
  onClick,
  className,
}: NotificationItemProps) {
  return (
    <div
      className={cn(
        'flex gap-3 p-3 rounded-lg transition-colors cursor-pointer',
        !isRead && 'bg-primary-50/50',
        'hover:bg-neutral-50',
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className={cn('flex items-center justify-center w-8 h-8 rounded-lg shrink-0', iconBgColors[type])}>
        {notificationIcons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-body-sm', !isRead ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700')}>
            {title}
          </p>
          {!isRead && <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0 mt-1.5" />}
        </div>
        <p className="text-small text-neutral-500 line-clamp-2">{message}</p>
        <p className="text-caption text-neutral-400 mt-1">{time}</p>
      </div>
    </div>
  );
}
