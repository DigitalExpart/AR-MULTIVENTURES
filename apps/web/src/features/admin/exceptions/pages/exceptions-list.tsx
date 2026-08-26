import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { exceptionApi } from '@ar-multiventures/api';
import { formatDate } from '@ar-multiventures/business-logic';
import type { OperationalException, ExceptionSeverity } from '@ar-multiventures/types';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminExceptionsListPage() {
  const [exceptions, setExceptions] = useState<OperationalException[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNRESOLVED' | 'CRITICAL' | 'RESOLVED'>('UNRESOLVED');
  const [isLoading, setIsLoading] = useState(true);

  // Resolve Modal State
  const [selectedException, setSelectedException] = useState<OperationalException | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await exceptionApi.getExceptions();
      setExceptions(data);
    } catch (err) {
      console.error('Failed to load exceptions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedException) return;

    setIsSubmitting(true);
    try {
      await exceptionApi.resolveException(selectedException.id, resolutionNotes.trim() || undefined);
      setSelectedException(null);
      setResolutionNotes('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve exception');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = exceptions.filter((exc) => {
    if (filter === 'UNRESOLVED') return !exc.isResolved;
    if (filter === 'RESOLVED') return exc.isResolved;
    if (filter === 'CRITICAL') return exc.severity === 'CRITICAL' && !exc.isResolved;
    return true;
  });

  const criticalCount = exceptions.filter((e) => e.severity === 'CRITICAL' && !e.isResolved).length;
  const warningCount = exceptions.filter((e) => e.severity === 'WARNING' && !e.isResolved).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Operational Exceptions & Alert Center"
          description="Actionable intelligence on pricing gaps, payment approvals, loading variances, and compliance document expirations."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Exceptions' },
          ]}
        />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Card className="bg-red-50 border-red-200 p-4 space-y-1">
          <div className="flex items-center justify-between text-red-700">
            <span className="text-[11px] font-mono font-bold uppercase">Critical Blockers</span>
            <AlertCircle className="h-4 w-4" />
          </div>
          <div className="text-h3 font-black text-red-950 font-mono">{criticalCount}</div>
          <span className="text-[11px] text-red-800">Requires Immediate Action</span>
        </Card>

        <Card className="bg-amber-50 border-amber-200 p-4 space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-mono font-bold uppercase">Warnings</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="text-h3 font-black text-amber-950 font-mono">{warningCount}</div>
          <span className="text-[11px] text-amber-800">Reviews & Expirations</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-neutral-500">Unresolved Total</span>
          <div className="text-h3 font-black text-neutral-900 font-mono">
            {exceptions.filter((e) => !e.isResolved).length}
          </div>
          <span className="text-[11px] text-neutral-400">Open Operational Issues</span>
        </Card>

        <Card className="bg-emerald-50 border-emerald-200 p-4 space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-800">Resolved Today</span>
          <div className="text-h3 font-black text-emerald-950 font-mono">
            {exceptions.filter((e) => e.isResolved).length}
          </div>
          <span className="text-[11px] text-emerald-700">Handled by Operations</span>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl overflow-x-auto max-w-fit">
        {[
          { id: 'UNRESOLVED', label: 'Open Issues', count: exceptions.filter((e) => !e.isResolved).length },
          { id: 'CRITICAL', label: 'Critical Only', count: criticalCount },
          { id: 'RESOLVED', label: 'Resolved History', count: exceptions.filter((e) => e.isResolved).length },
          { id: 'ALL', label: 'All Records', count: exceptions.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-caption font-bold transition-all flex items-center gap-1.5',
              filter === tab.id
                ? 'bg-white text-primary-950 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.2 bg-neutral-100 text-neutral-700 rounded-full text-[10px] font-mono">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Exceptions List Cards */}
      <div className="space-y-3">
        {isLoading ? (
          <Card padding="lg" className="text-center text-caption text-neutral-400 font-mono">
            Loading operational exceptions...
          </Card>
        ) : filtered.length === 0 ? (
          <Card padding="lg" className="text-center text-body-sm text-neutral-500">
            No exceptions found under this filter. All operations running smoothly!
          </Card>
        ) : (
          filtered.map((exc) => (
            <Card
              key={exc.id}
              padding="lg"
              className={cn(
                'border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4',
                exc.severity === 'CRITICAL' && !exc.isResolved
                  ? 'bg-red-50/40 border-red-300'
                  : exc.severity === 'WARNING' && !exc.isResolved
                  ? 'bg-amber-50/40 border-amber-300'
                  : 'bg-white border-neutral-200'
              )}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 mt-0.5',
                    exc.severity === 'CRITICAL' && !exc.isResolved
                      ? 'bg-red-100 text-red-700'
                      : exc.severity === 'WARNING' && !exc.isResolved
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-800'
                  )}
                >
                  {exc.severity === 'CRITICAL' && !exc.isResolved ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : exc.severity === 'WARNING' && !exc.isResolved ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase',
                        exc.severity === 'CRITICAL'
                          ? 'bg-red-200 text-red-900'
                          : exc.severity === 'WARNING'
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-neutral-200 text-neutral-800'
                      )}
                    >
                      {exc.severity}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      Logged {formatDate(exc.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-body font-bold text-neutral-950">{exc.title}</h3>
                  <p className="text-caption text-neutral-600 leading-relaxed max-w-2xl">
                    {exc.description}
                  </p>

                  {exc.isResolved && (
                    <div className="pt-2 text-[11px] font-mono text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Resolved by {exc.resolvedBy || 'Admin'} {exc.resolvedAt && `on ${formatDate(exc.resolvedAt)}`}
                      {exc.resolutionNotes && ` — Notes: ${exc.resolutionNotes}`}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Link to={exc.resolutionRoute}>
                  <Button
                    variant="primary"
                    size="xs"
                    className="font-bold shadow-2xs"
                    rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                  >
                    Open Resolution Path
                  </Button>
                </Link>

                {!exc.isResolved && (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setSelectedException(exc)}
                    leftIcon={<ShieldCheck className="h-3.5 w-3.5" />}
                  >
                    Mark Handled
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Resolution Notes Modal */}
      {selectedException && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-body font-bold text-neutral-950">Resolve Exception</h3>
              <button onClick={() => setSelectedException(null)}>✕</button>
            </div>

            <form onSubmit={handleResolve} className="space-y-3">
              <p className="text-caption text-neutral-600 font-medium">{selectedException.title}</p>
              <div>
                <label className="block text-caption font-bold text-neutral-700 mb-1">
                  Resolution Notes (Optional)
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Configured missing tariff in commercial matrix and confirmed with transport officer."
                  className="w-full h-24 p-2.5 border border-neutral-300 rounded-xl text-caption"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <Button variant="outline" onClick={() => setSelectedException(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting} className="font-bold">
                  Confirm Resolved
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
