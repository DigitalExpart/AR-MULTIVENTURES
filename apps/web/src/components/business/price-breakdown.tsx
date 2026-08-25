import { cn } from '@/lib/utils';
import { formatNaira } from '@/lib/format';

interface PriceItem {
  label: string;
  amount: number;
  isDiscount?: boolean;
  isBold?: boolean;
}

interface PriceBreakdownProps {
  items: PriceItem[];
  total: number;
  className?: string;
}

export function PriceBreakdown({ items, total, className }: PriceBreakdownProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between text-body-sm">
          <span className={cn('text-neutral-600', item.isBold && 'font-medium text-neutral-900')}>
            {item.label}
          </span>
          <span
            className={cn(
              'tabular-nums font-medium',
              item.isDiscount ? 'text-success-600' : 'text-neutral-900',
              item.isBold && 'font-semibold'
            )}
          >
            {item.isDiscount ? '-' : ''}
            {formatNaira(item.amount)}
          </span>
        </div>
      ))}

      <div className="border-t border-neutral-200 pt-2 mt-3">
        <div className="flex items-center justify-between">
          <span className="text-body font-semibold text-neutral-900">Estimated Total</span>
          <span className="text-h3 text-neutral-900 tabular-nums">{formatNaira(total)}</span>
        </div>
      </div>
    </div>
  );
}
