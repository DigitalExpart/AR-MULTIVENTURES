import { Search as SearchIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes } from 'react';

export interface SearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  value?: string;
}

const Search = forwardRef<HTMLInputElement, SearchProps>(
  ({ className, onClear, value, ...props }, ref) => {
    return (
      <div className={cn('relative', className)}>
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          ref={ref}
          type="search"
          value={value}
          className={cn(
            'h-9 w-full rounded-md border border-neutral-300 bg-white pl-9 pr-8 text-body text-neutral-900',
            'placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600',
            'transition-colors duration-200'
          )}
          {...props}
        />
        {value && onClear && (
          <button
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-neutral-400 hover:text-neutral-600"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }
);

Search.displayName = 'Search';

export { Search };
