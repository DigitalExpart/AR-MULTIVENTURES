import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  className?: string;
  onDismiss?: () => void;
}

const alertConfig = {
  info: {
    icon: Info,
    containerClass: 'bg-info-50 border-info-200 text-info-800',
    iconClass: 'text-info-500',
  },
  success: {
    icon: CheckCircle2,
    containerClass: 'bg-success-50 border-success-200 text-success-800',
    iconClass: 'text-success-500',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-warning-50 border-warning-200 text-warning-800',
    iconClass: 'text-warning-500',
  },
  error: {
    icon: AlertCircle,
    containerClass: 'bg-error-50 border-error-200 text-error-800',
    iconClass: 'text-error-500',
  },
};

export function Alert({ variant = 'info', title, children, className, onDismiss }: AlertProps) {
  const config = alertConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg border',
        config.containerClass,
        className
      )}
      role="alert"
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.iconClass)} />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-body mb-0.5">{title}</p>}
        <div className="text-body-sm">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded hover:bg-black/5 transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
