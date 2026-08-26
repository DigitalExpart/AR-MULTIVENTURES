import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Building2,
  Mountain,
  Layers,
  X,
  Truck,
  DollarSign,
  Receipt,
  User,
  MapPin,
  Clock
} from 'lucide-react';
import {
  adminApi,
  financeApi,
  deliveryApi,
  fleetApi
} from '@ar-multiventures/api';
import { formatNaira } from '@ar-multiventures/business-logic';

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
    invoices: any[];
    payments: any[];
    trips: any[];
    trucks: any[];
    drivers: any[];
    quarries: any[];
    materials: any[];
  }>({
    requisitions: [],
    customers: [],
    invoices: [],
    payments: [],
    trips: [],
    trucks: [],
    drivers: [],
    quarries: [],
    materials: [],
  });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
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
      setResults({
        requisitions: [],
        customers: [],
        invoices: [],
        payments: [],
        trips: [],
        trucks: [],
        drivers: [],
        quarries: [],
        materials: [],
      });
      return;
    }

    const q = query.toLowerCase();
    async function searchAll() {
      try {
        const [reqs, custs, invs, pays, trips, trks, drvs, qrys, mats] = await Promise.all([
          adminApi.getRequisitions({ search: q }).catch(() => []),
          adminApi.getCustomers({ search: q }).catch(() => []),
          financeApi.getInvoices({ search: q }).catch(() => []),
          financeApi.getPayments().catch(() => []),
          deliveryApi.getTrips().catch(() => []),
          fleetApi.getTrucks().catch(() => []),
          fleetApi.getDrivers().catch(() => []),
          adminApi.getQuarries().catch(() => []),
          adminApi.getMaterials().catch(() => []),
        ]);

        setResults({
          requisitions: reqs.slice(0, 3),
          customers: custs.slice(0, 3),
          invoices: invs.filter((i) => i.invoiceNumber.toLowerCase().includes(q) || i.customerName.toLowerCase().includes(q)).slice(0, 3),
          payments: pays.filter((p) => p.paymentNumber.toLowerCase().includes(q) || p.bankReference?.toLowerCase().includes(q) || p.customerName.toLowerCase().includes(q)).slice(0, 3),
          trips: trips.filter((t) => t.tripNumber.toLowerCase().includes(q) || t.truckRegistration?.toLowerCase().includes(q) || t.driverName?.toLowerCase().includes(q)).slice(0, 3),
          trucks: trks.filter((t) => t.registrationNumber.toLowerCase().includes(q) || t.make.toLowerCase().includes(q)).slice(0, 3),
          drivers: drvs.filter((d) => d.fullName.toLowerCase().includes(q) || d.phoneNumber.includes(q)).slice(0, 3),
          quarries: qrys.filter((x) => x.name.toLowerCase().includes(q) || x.code.toLowerCase().includes(q)).slice(0, 2),
          materials: mats.filter((x) => x.name.toLowerCase().includes(q) || x.code.toLowerCase().includes(q)).slice(0, 2),
        });
      } catch (err) {
        console.error('Command search error:', err);
      }
    }

    const timer = setTimeout(searchAll, 120);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalHits =
    results.requisitions.length +
    results.customers.length +
    results.invoices.length +
    results.payments.length +
    results.trips.length +
    results.trucks.length +
    results.drivers.length +
    results.quarries.length +
    results.materials.length;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-start justify-center pt-16 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-200">
          <Search className="h-5 w-5 text-neutral-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search REQ, INV, PAY, Trips, Trucks, Drivers, Clients, Quarries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-body text-neutral-900 placeholder:text-neutral-400 bg-transparent focus:outline-hidden font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[440px] overflow-y-auto p-3 space-y-4">
          {query.trim() === '' ? (
            <div className="p-6 text-center text-caption text-neutral-400">
              Type reference numbers, customer names, plate numbers, or trip codes.
            </div>
          ) : totalHits === 0 ? (
            <div className="p-6 text-center text-body-sm text-neutral-500">
              No matching records found for "{query}".
            </div>
          ) : (
            <>
              {/* Requisitions */}
              {results.requisitions.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                    Requisitions
                  </div>
                  {results.requisitions.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => {
                        navigate(`/admin/requisitions`);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 cursor-pointer text-body-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-primary-800 shrink-0" />
                        <div>
                          <span className="font-mono font-bold text-neutral-900">{req.referenceNumber}</span>
                          <span className="text-caption text-neutral-500 ml-2">· {req.materialName} ({req.quantity}T)</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Invoices */}
              {results.invoices.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                    Invoices
                  </div>
                  {results.invoices.map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => {
                        navigate(`/admin/finance/invoices`);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 cursor-pointer text-body-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <Receipt className="h-4 w-4 text-amber-700 shrink-0" />
                        <div>
                          <span className="font-mono font-bold text-neutral-900">{inv.invoiceNumber}</span>
                          <span className="text-caption text-neutral-500 ml-2">· {inv.customerName}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-neutral-900 text-caption">
                        {formatNaira(inv.totalAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Delivery Trips */}
              {results.trips.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                    Trips & Dispatch
                  </div>
                  {results.trips.map((trp) => (
                    <div
                      key={trp.id}
                      onClick={() => {
                        navigate(`/admin/operations/dispatch`);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 cursor-pointer text-body-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <Truck className="h-4 w-4 text-blue-700 shrink-0" />
                        <div>
                          <span className="font-mono font-bold text-neutral-900">{trp.tripNumber}</span>
                          <span className="text-caption text-neutral-500 ml-2">
                            · {trp.truckRegistration} ({trp.driverName})
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                        {trp.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Trucks & Fleet */}
              {results.trucks.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                    Fleet Trucks
                  </div>
                  {results.trucks.map((trk) => (
                    <div
                      key={trk.id}
                      onClick={() => {
                        navigate(`/admin/fleet/trucks`);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 cursor-pointer text-body-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <Truck className="h-4 w-4 text-neutral-700 shrink-0" />
                        <div>
                          <span className="font-mono font-bold text-neutral-900">{trk.registrationNumber}</span>
                          <span className="text-caption text-neutral-500 ml-2">· {trk.make} {trk.model} ({trk.capacityTonnes}T)</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {trk.maintenanceStatus}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Customers */}
              {results.customers.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                    Customers
                  </div>
                  {results.customers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        navigate(`/admin/customers/${c.id}`);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 cursor-pointer text-body-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="h-4 w-4 text-neutral-700 shrink-0" />
                        <div>
                          <span className="font-bold text-neutral-900">{c.companyName}</span>
                          <span className="text-caption text-neutral-500 ml-2 font-mono">{c.accountNumber}</span>
                        </div>
                      </div>
                      <span className="text-caption font-mono text-neutral-500">{c.phone}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <span>Press ESC or Click Outside to close</span>
          <span>AR Command Engine</span>
        </div>
      </div>
    </div>
  );
}
