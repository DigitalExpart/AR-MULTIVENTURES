import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
  valueClassName?: string;
}

export function StatCard({ title, value, icon, trend, className, valueClassName }: StatCardProps) {
  const trendColor = {
    up: 'text-success-600',
    down: 'text-error-600',
    neutral: 'text-neutral-500',
  };

  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  };

  return (
    <div
      className={cn(
        'bg-white border border-neutral-200 rounded-lg p-4 sm:p-5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-body-sm text-neutral-500 font-medium">{title}</p>
          <p className={cn('text-kpi text-neutral-900 tabular-nums', valueClassName)}>
            {value}
          </p>
          {trend && (
            <div className={cn('flex items-center gap-1 text-small', trendColor[trend.direction])}>
              {(() => {
                const Icon = TrendIcon[trend.direction];
                return <Icon className="h-3.5 w-3.5" />;
              })()}
              <span className="font-medium">{trend.value}%</span>
              {trend.label && <span className="text-neutral-400">{trend.label}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary-50 text-primary-600 shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
