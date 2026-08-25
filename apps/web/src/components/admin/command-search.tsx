import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Building2, Mountain, Layers, X } from 'lucide-react';
import { adminApi } from '@ar-multiventures/api';

interface CommandSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminCommandSearch({ isOpen, onClose }: CommandSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    requisitions: any[];
    customers: any[];
    quarries: any[];
    materials: any[];
  }>({
    requisitions: [],
    customers: [],
    quarries: [],
    materials: [],
  });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ requisitions: [], customers: [], quarries: [], materials: [] });
      return;
    }

    const q = query.toLowerCase();
    async function searchAll() {
      const [reqs, custs, qrys, mats] = await Promise.all([
        adminApi.getRequisitions({ search: q }),
        adminApi.getCustomers({ search: q }),
        adminApi.getQuarries(),
        adminApi.getMaterials(),
      ]);

      setResults({
        requisitions: reqs.slice(0, 4),
        customers: custs.slice(0, 3),
        quarries: qrys.filter((x) => x.name.toLowerCase().includes(q) || x.code.toLowerCase().includes(q)).slice(0, 3),
        materials: mats.filter((x) => x.name.toLowerCase().includes(q) || x.code.toLowerCase().includes(q)).slice(0, 3),
      });
    }

    const timer = setTimeout(searchAll, 150);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-200">
          <Search className="h-5 w-5 text-neutral-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search requisitions (REQ-...), customers (CUS-...), quarries, materials..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-body text-neutral-900 placeholder:text-neutral-400 bg-transparent focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[380px] overflow-y-auto p-3 space-y-3">
          {query.trim() === '' ? (
            <div className="p-6 text-center text-caption text-neutral-400">
              Type keywords or reference codes to search enterprise records.
            </div>
          ) : results.requisitions.length === 0 &&
            results.customers.length === 0 &&
            results.quarries.length === 0 &&
            results.materials.length === 0 ? (
            <div className="p-6 text-center text-body-sm text-neutral-500">
              No matching records found for "{query}".
            </div>
          ) : (
            <>
              {results.requisitions.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Requisitions
                  </div>
                  {results.requisitions.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => {
                        navigate(`/admin/requisitions/${req.id}`);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-neutral-100 cursor-pointer text-body-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-primary-600 shrink-0" />
                        <div>
                          <span className="font-mono font-bold text-neutral-900">{req.referenceNumber}</span>
                          <span className="text-neutral-500 ml-2">· {req.materialName} ({req.quantity}T)</span>
                        </div>
                      </div>
                      <span className="text-caption font-semibold uppercase text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {results.customers.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Customers
                  </div>
                  {results.customers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        navigate(`/admin/customers/${c.id}`);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-neutral-100 cursor-pointer text-body-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="h-4 w-4 text-accent-700 shrink-0" />
                        <div>
                          <span className="font-bold text-neutral-900">{c.companyName}</span>
                          <span className="text-caption text-neutral-500 ml-2 font-mono">{c.accountNumber}</span>
                        </div>
                      </div>
                      <span className="text-caption text-neutral-600">{c.phone}</span>
                    </div>
                  ))}
                </div>
              )}

              {results.quarries.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Quarries
                  </div>
                  {results.quarries.map((q) => (
                    <div
                      key={q.id}
                      onClick={() => {
                        navigate(`/admin/quarries/${q.id}`);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-neutral-100 cursor-pointer text-body-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <Mountain className="h-4 w-4 text-neutral-600 shrink-0" />
                        <span className="font-bold text-neutral-900">{q.name}</span>
                      </div>
                      <span className="text-caption font-mono text-neutral-500">{q.code}</span>
                    </div>
                  ))}
                </div>
              )}

              {results.materials.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Materials
                  </div>
                  {results.materials.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        navigate(`/admin/materials`);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-neutral-100 cursor-pointer text-body-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <Layers className="h-4 w-4 text-neutral-600 shrink-0" />
                        <span className="font-bold text-neutral-900">{m.name}</span>
                      </div>
                      <span className="text-caption text-neutral-500">{m.specification}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Navigate with mouse or keyboard</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
