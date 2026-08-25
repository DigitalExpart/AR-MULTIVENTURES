import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const badgeVariants = cva(
  'inline-flex items-center gap-1 font-medium transition-colors whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-neutral-100 text-neutral-700',
        primary: 'bg-primary-50 text-primary-700',
        success: 'bg-success-50 text-success-700',
        warning: 'bg-warning-50 text-warning-800',
        error: 'bg-error-50 text-error-700',
        info: 'bg-info-50 text-info-700',
        accent: 'bg-accent-50 text-accent-800',
        outline: 'border border-neutral-300 text-neutral-700 bg-white',
      },
      size: {
        sm: 'text-caption px-1.5 py-0.5 rounded',
        md: 'text-small px-2 py-0.5 rounded-md',
        lg: 'text-body-sm px-2.5 py-1 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  dot?: boolean;
  dotColor?: string;
}

export function Badge({ children, className, variant, size, icon, dot, dotColor }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)}>
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full', dotColor || 'bg-current')}
        />
      )}
      {icon && <span className="shrink-0 -ml-0.5">{icon}</span>}
      {children}
    </span>
  );
}
