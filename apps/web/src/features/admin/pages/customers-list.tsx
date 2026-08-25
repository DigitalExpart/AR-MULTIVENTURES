import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building2, Eye, Shield, Phone, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { adminApi } from '@ar-multiventures/api';
import { cn } from '@/lib/utils';

export function AdminCustomersListPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      setIsLoading(true);
      try {
        const list = await adminApi.getCustomers({ search: searchQuery });
        setCustomers(list);
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCustomers();
  }, [searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Customer Business Accounts"
        description="Registry of verified B2B construction contractors, credit limits, and negotiated procurement contracts."
        breadcrumbs={[{ label: 'Admin Command', href: '/admin' }, { label: 'Customers' }]}
      />

      <Card padding="sm" className="bg-white border-neutral-200 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search company name, account number (CUS-...), contact, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-body-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-primary-600 focus:bg-white"
          />
        </div>
      </Card>

      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Account #</th>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Primary Contact</th>
                <th className="py-3 px-4">Credit Terms</th>
                <th className="py-3 px-4">Credit Limit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-caption text-neutral-400">
                    Loading customer accounts...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-body-sm text-neutral-500">
                    No customer accounts found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary-800">
                      {c.accountNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-neutral-900">{c.companyName}</div>
                      <div className="text-caption text-neutral-400">Since {formatDate(c.createdAt)}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-neutral-800">{c.contactName}</div>
                      <div className="text-caption text-neutral-500">{c.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-caption">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded font-semibold',
                          c.creditStatus === 'ACTIVE_CREDIT'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-neutral-100 text-neutral-700'
                        )}
                      >
                        {c.creditStatus === 'ACTIVE_CREDIT' ? `Net ${c.paymentTermsDays} Days` : 'Prepaid Only'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                      {c.creditLimit > 0 ? formatNaira(c.creditLimit) : '₦0.00'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-caption font-bold bg-emerald-50 text-emerald-700">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to={`/admin/customers/${c.id}`}>
                        <Button variant="outline" size="xs" leftIcon={<Eye className="h-3.5 w-3.5" />}>
                          View Account
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
