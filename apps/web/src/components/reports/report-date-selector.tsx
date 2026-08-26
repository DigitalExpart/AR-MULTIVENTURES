import { useState } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import type { ReportPeriod, DateRangeFilter } from '@ar-multiventures/types';
import { getDateRangeForPeriod } from '@ar-multiventures/business-logic';
import { cn } from '@/lib/utils';

interface ReportDateSelectorProps {
  value: DateRangeFilter;
  onChange: (filter: DateRangeFilter) => void;
  className?: string;
}

const PERIOD_OPTIONS: Array<{ id: ReportPeriod; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this_week', label: 'This Week' },
  { id: 'last_week', label: 'Last Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'this_quarter', label: 'This Quarter' },
  { id: 'this_year', label: 'This Year' },
  { id: 'custom', label: 'Custom Range' },
];

export function ReportDateSelector({ value, onChange, className }: ReportDateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState(value.startDate.split('T')[0]);
  const [customEnd, setCustomEnd] = useState(value.endDate.split('T')[0]);

  const handleSelectPeriod = (p: ReportPeriod) => {
    if (p === 'custom') {
      const range = getDateRangeForPeriod('custom', customStart, customEnd);
      onChange(range);
    } else {
      const range = getDateRangeForPeriod(p);
      onChange(range);
      setIsOpen(false);
    }
  };

  const handleApplyCustom = () => {
    const range = getDateRangeForPeriod('custom', customStart, customEnd);
    onChange(range);
    setIsOpen(false);
  };

  const activeLabel = PERIOD_OPTIONS.find((o) => o.id === value.period)?.label || 'This Month';

  return (
    <div className={cn('relative inline-block', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm font-semibold text-neutral-800 shadow-2xs transition-all"
      >
        <Calendar className="h-4 w-4 text-primary-800" />
        <span>Period: {activeLabel}</span>
        <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-neutral-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 px-2 block">
              Reporting Window
            </span>
            <div className="grid grid-cols-2 gap-1">
              {PERIOD_OPTIONS.filter((o) => o.id !== 'custom').map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectPeriod(opt.id)}
                  className={cn(
                    'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-caption font-semibold transition-colors text-left',
                    value.period === opt.id
                      ? 'bg-primary-50 text-primary-900 font-bold'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  )}
                >
                  <span>{opt.label}</span>
                  {value.period === opt.id && <Check className="h-3 w-3 text-primary-800" />}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Inputs */}
          <div className="pt-2 border-t border-neutral-100 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 px-1 block">
              Custom Range
            </span>
            <div className="grid grid-cols-2 gap-2 text-caption">
              <div>
                <label className="text-[10px] text-neutral-500 block mb-0.5 font-mono">From</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full p-1.5 border border-neutral-200 rounded-lg text-body-sm font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 block mb-0.5 font-mono">To</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full p-1.5 border border-neutral-200 rounded-lg text-body-sm font-mono text-[11px]"
                />
              </div>
            </div>
            <button
              onClick={handleApplyCustom}
              className="w-full py-1.5 bg-primary-800 text-white rounded-lg text-caption font-bold hover:bg-primary-700 shadow-2xs"
            >
              Apply Custom Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
