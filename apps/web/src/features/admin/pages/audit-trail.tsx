import { useState, useEffect } from 'react';
import { History, Shield, Filter, Search, User, Clock, Terminal, Download, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { formatDate, downloadCsvFile, buildCsvContent, CsvColumn } from '@ar-multiventures/business-logic';
import { adminApi } from '@ar-multiventures/api';
import type { AuditLogEntry } from '@ar-multiventures/types';

const CSV_COLUMNS: CsvColumn<AuditLogEntry>[] = [
  { header: 'Action', key: 'action' },
  { header: 'Entity Reference', key: (l) => l.reference || '—' },
  { header: 'Authorized Actor', key: 'actorName' },
  { header: 'Actor Email', key: (l) => l.actorEmail || 'system@armultiventures.com' },
  { header: 'IP Address', key: (l) => l.ipAddress || '—' },
  { header: 'Timestamp', key: (l) => formatDate(l.createdAt) },
];

export function AdminAuditTrailPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
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

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchActor = log.actorName?.toLowerCase().includes(q);
      const matchRef = log.reference?.toLowerCase().includes(q);
      const matchAction = log.action?.toLowerCase().includes(q);
      return matchActor || matchRef || matchAction;
    }
    return true;
  });

  const handleExportCsv = () => {
    const csv = buildCsvContent(CSV_COLUMNS, filteredLogs);
    downloadCsvFile('audit_trail_export', csv);
  };

  const actionTypes = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Security & Operational Audit Explorer"
          description="Immutable system-level audit logs capturing every commercial approval, price update, weighbridge ticket, and financial clearance."
          breadcrumbs={[{ label: 'Admin Command', href: '/admin' }, { label: 'Audit Explorer' }]}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          disabled={filteredLogs.length === 0}
          leftIcon={<Download className="h-4 w-4" />}
        >
          Export Audit CSV
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="md" className="bg-white border-neutral-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Actor, Reference # (e.g. REQ-2026), or Action..."
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-body-sm focus:outline-hidden focus:ring-2 focus:ring-primary-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-neutral-400 shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="p-2 border border-neutral-200 rounded-xl text-body-sm font-semibold text-neutral-700 bg-white"
          >
            <option value="ALL">All Actions ({logs.length})</option>
            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Log Feed */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-body-sm text-neutral-400 font-mono">
            Loading audit history records...
          </div>
        ) : filteredLogs.length === 0 ? (
          <Card padding="lg" className="text-center py-12">
            <p className="text-body-sm text-neutral-500">No audit records matching criteria.</p>
          </Card>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.id} padding="md" className="bg-white border-neutral-200 shadow-2xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                    {log.action}
                  </span>
                  {log.reference && (
                    <span className="font-mono font-bold text-primary-900 text-body-sm">
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
                <span>
                  Authorized Actor: <strong>{log.actorName}</strong> ({log.actorEmail || 'System Operations'})
                </span>
              </div>

              {(log.oldValues || log.newValues) && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 font-mono text-[11px] text-neutral-700 space-y-1.5 mt-2">
                  {log.oldValues && (
                    <div className="text-red-700 break-all">
                      <span className="font-bold">- Old Value:</span> {typeof log.oldValues === 'object' ? JSON.stringify(log.oldValues) : log.oldValues}
                    </div>
                  )}
                  {log.newValues && (
                    <div className="text-emerald-800 break-all">
                      <span className="font-bold">+ New Value:</span> {typeof log.newValues === 'object' ? JSON.stringify(log.newValues) : log.newValues}
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
