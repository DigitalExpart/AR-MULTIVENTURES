import { useState, useEffect } from 'react';
import { History, Shield, Filter, Search, User, Clock, Terminal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { formatDate } from '@ar-multiventures/business-logic';
import { adminApi } from '@ar-multiventures/api';
import type { AuditLogEntry } from '@ar-multiventures/types';

export function AdminAuditTrailPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const list = await adminApi.getAuditLogs();
        setLogs(list);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Security & Operational Audit Trail"
        description="Immutable system-level audit logs capturing every status transition, price update, and administrative action."
        breadcrumbs={[{ label: 'Admin Command', href: '/admin' }, { label: 'Audit Trail' }]}
      />

      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-body-sm text-neutral-400">Loading audit history...</div>
        ) : logs.length === 0 ? (
          <Card padding="lg" className="text-center py-12">
            <p className="text-body-sm text-neutral-500">No audit records found.</p>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id} padding="md" className="bg-white border-neutral-200 shadow-2xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-neutral-100 text-neutral-800">
                    {log.action}
                  </span>
                  {log.reference && (
                    <span className="font-bold text-neutral-900 text-body-sm">
                      {log.reference}
                    </span>
                  )}
                </div>
                <div className="text-caption text-neutral-400 font-mono">
                  {formatDate(log.createdAt)} {log.ipAddress && `· IP: ${log.ipAddress}`}
                </div>
              </div>

              <div className="flex items-center gap-2 text-caption text-neutral-600">
                <User className="h-3.5 w-3.5 text-neutral-400" />
                <span>Authorized Actor: <strong>{log.actorName}</strong> ({log.actorEmail || 'System Operations'})</span>
              </div>

              {(log.oldValues || log.newValues) && (
                <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 font-mono text-[11px] text-neutral-700 space-y-1 mt-2">
                  {log.oldValues && (
                    <div className="text-red-700">
                      - Previous: {JSON.stringify(log.oldValues)}
                    </div>
                  )}
                  {log.newValues && (
                    <div className="text-emerald-800">
                      + Updated: {JSON.stringify(log.newValues)}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
