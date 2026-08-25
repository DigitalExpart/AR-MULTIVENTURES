import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { FileX, AlertTriangle, WifiOff, SearchX, ShieldX, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

type EmptyStateVariant = 'empty' | 'error' | 'offline' | 'no-results' | 'permission' | 'no-deliveries';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const defaultIcons: Record<EmptyStateVariant, ReactNode> = {
  empty: <FileX className="h-10 w-10" />,
  error: <AlertTriangle className="h-10 w-10" />,
  offline: <WifiOff className="h-10 w-10" />,
  'no-results': <SearchX className="h-10 w-10" />,
  permission: <ShieldX className="h-10 w-10" />,
  'no-deliveries': <Package className="h-10 w-10" />,
};

const iconColors: Record<EmptyStateVariant, string> = {
  empty: 'text-neutral-300',
  error: 'text-error-300',
  offline: 'text-warning-300',
  'no-results': 'text-neutral-300',
  permission: 'text-error-300',
  'no-deliveries': 'text-neutral-300',
};

export function EmptyState({
  variant = 'empty',
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className={cn('mb-4', iconColors[variant])}>
        {icon || defaultIcons[variant]}
      </div>
      <h3 className="text-h4 text-neutral-900 mb-1">{title}</h3>
      {description && (
        <p className="text-body text-neutral-500 max-w-sm">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-5">
          {action && (
            <Button onClick={action.onClick} size="sm">
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick} size="sm">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
