import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/common';
import { ORDER_STATUS_CONFIG } from './order-status-badge';
import { Check } from 'lucide-react';

interface TimelineStep {
  status: OrderStatus;
  label: string;
  timestamp?: string;
  isCurrent?: boolean;
  isCompleted?: boolean;
}

interface OrderStatusTimelineProps {
  steps: TimelineStep[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function OrderStatusTimeline({ steps, className, orientation = 'horizontal' }: OrderStatusTimelineProps) {
  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-0', className)}>
        {steps.map((step, index) => {
          const config = ORDER_STATUS_CONFIG[step.status];
          const isLast = index === steps.length - 1;

          return (
            <div key={step.status} className="flex gap-3">
              {/* Connector line and dot */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-7 h-7 rounded-full border-2 shrink-0',
                    step.isCompleted
                      ? 'bg-primary-600 border-primary-600'
                      : step.isCurrent
                        ? `border-primary-600 ${config.bgColor}`
                        : 'border-neutral-200 bg-neutral-50'
                  )}
                >
                  {step.isCompleted ? (
                    <Check className="h-3.5 w-3.5 text-white" />
                  ) : step.isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-primary-600" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-neutral-300" />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 h-8',
                      step.isCompleted ? 'bg-primary-600' : 'bg-neutral-200'
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className="pb-8">
                <p
                  className={cn(
                    'text-body-sm font-medium leading-7',
                    step.isCompleted || step.isCurrent
                      ? 'text-neutral-900'
                      : 'text-neutral-400'
                  )}
                >
                  {step.label}
                </p>
                {step.timestamp && (
                  <p className="text-caption text-neutral-400 mt-0.5">
                    {step.timestamp}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal timeline
  return (
    <div className={cn('flex items-start', className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div key={step.status} className={cn('flex items-start', !isLast && 'flex-1')}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0',
                  step.isCompleted
                    ? 'bg-primary-600 border-primary-600'
                    : step.isCurrent
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-neutral-200 bg-neutral-50'
                )}
              >
                {step.isCompleted ? (
                  <Check className="h-4 w-4 text-white" />
                ) : step.isCurrent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-600 animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-neutral-300" />
                )}
              </div>
              <p
                className={cn(
                  'text-caption text-center mt-2 max-w-[80px]',
                  step.isCompleted || step.isCurrent
                    ? 'text-neutral-900 font-medium'
                    : 'text-neutral-400'
                )}
              >
                {step.label}
              </p>
            </div>

            {!isLast && (
              <div
                className={cn(
                  'flex-1 h-0.5 mt-4 mx-1',
                  step.isCompleted ? 'bg-primary-600' : 'bg-neutral-200'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
