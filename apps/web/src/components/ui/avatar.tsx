import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/format';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-7 w-7 text-caption',
    md: 'h-9 w-9 text-small',
    lg: 'h-11 w-11 text-body',
    xl: 'h-14 w-14 text-body-lg',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover border border-neutral-200',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold',
        sizeClasses[size],
        className
      )}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
