import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-600 shadow-sm',
        secondary:
          'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 focus-visible:ring-neutral-400',
        outline:
          'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 active:bg-neutral-100 focus-visible:ring-neutral-400',
        ghost:
          'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 focus-visible:ring-neutral-400',
        accent:
          'bg-accent-400 text-neutral-950 hover:bg-accent-500 active:bg-accent-600 focus-visible:ring-accent-400 shadow-sm font-bold',
        danger:
          'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-600 shadow-sm',
        link: 'text-primary-600 underline-offset-4 hover:underline hover:text-primary-700 focus-visible:ring-primary-600 p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-body-sm rounded',
        md: 'h-10 px-4 text-body rounded-md',
        lg: 'h-11 px-6 text-body-lg rounded-md',
        xl: 'h-12 px-8 text-body-lg rounded-lg',
        icon: 'h-10 w-10 rounded-md',
        'icon-sm': 'h-8 w-8 rounded',
        'icon-lg': 'h-11 w-11 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !isLoading ? <span className="shrink-0">{rightIcon}</span> : null}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
