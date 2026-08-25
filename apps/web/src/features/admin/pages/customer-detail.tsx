import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2, Phone, Mail, MapPin, CreditCard, Shield,
  FileText, ArrowLeft, Plus, CheckCircle2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { adminApi } from '@ar-multiventures/api';
import { StatusBadge } from '@/components/business/status-badge';

export function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await adminApi.getCustomerById(id);
        setCustomer(data);
      } catch (err) {
        console.error('Failed to load customer:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (isLoading) {
    return <div className="py-20 text-center text-body-sm text-neutral-500">Loading customer account...</div>;
  }

  if (!customer) {
    return (
      <div className="py-20 text-center space-y-3">
        <h3 className="text-h3 font-bold text-neutral-900">Customer Not Found</h3>
        <Link to="/admin/customers">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Customers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={customer.companyName}
        description={`Account #${customer.accountNumber} · Customer since ${formatDate(customer.createdAt)}`}
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin' },
          { label: 'Customers', href: '/admin/customers' },
          { label: customer.companyName },
        ]}
      />

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Company Profile & Credit Terms */}
        <div className="lg:col-span-4 space-y-6">
          <Card padding="md" className="bg-white border-neutral-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200">
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center font-bold text-lg border border-primary-200">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-950 text-body">{customer.companyName}</h3>
                <span className="font-mono text-caption text-neutral-500">{customer.accountNumber}</span>
              </div>
            </div>

            <div className="space-y-3 text-body-sm">
              <div>
                <span className="text-caption text-neutral-500 block">Primary Contact</span>
                <span className="font-bold text-neutral-900">{customer.contactName}</span>
              </div>
              <div>
                <span className="text-caption text-neutral-500 block">Phone</span>
                <span className="font-medium text-neutral-800">{customer.phone}</span>
              </div>
              <div>
                <span className="text-caption text-neutral-500 block">Email</span>
                <span className="font-medium text-neutral-800">{customer.email}</span>
              </div>
            </div>
          </Card>

          {/* Credit Information */}
          <Card padding="md" className="bg-white border-neutral-200 shadow-2xs space-y-4">
            <h4 className="text-body-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary-700" />
              Credit & Payment Terms
            </h4>

            <div className="space-y-3 text-body-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Credit Status:</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-caption border border-emerald-200">
                  {customer.creditStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Approved Credit Limit:</span>
                <span className="font-mono font-bold text-neutral-900">{formatNaira(customer.creditLimit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Payment Period:</span>
                <span className="font-semibold text-neutral-900">{customer.paymentTermsDays} Days Net</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 8 Cols: Delivery Sites & Order History */}
        <div className="lg:col-span-8 space-y-6">
          {/* Registered Delivery Sites */}
          <Card padding="none" className="bg-white border-neutral-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h4 className="text-body-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                <MapPin className="h-4 w-4 text-neutral-500" />
                Approved Delivery Locations
              </h4>
            </div>

            <div className="p-4 space-y-3">
              {customer.addresses?.map((addr: any, idx: number) => (
                <div key={idx} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-neutral-900 text-body-sm">{addr.label}</span>
                    <p className="text-caption text-neutral-600 mt-0.5">{addr.address}</p>
                  </div>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold uppercase bg-primary-100 text-primary-800 px-2 py-0.5 rounded">
                      Default Site
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Customer Requisitions History */}
          <Card padding="none" className="bg-white border-neutral-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h4 className="text-body-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                <FileText className="h-4 w-4 text-neutral-500" />
                Supply Requisitions
              </h4>
            </div>

            <table className="w-full text-left text-body-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold">
                <tr>
                  <th className="py-2.5 px-4">Requisition #</th>
                  <th className="py-2.5 px-4">Material</th>
                  <th className="py-2.5 px-4">Commercial Total</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {customer.requisitions?.map((req: any) => (
                  <tr key={req.id} className="hover:bg-neutral-50">
                    <td className="py-3 px-4 font-mono font-bold text-primary-800">{req.referenceNumber}</td>
                    <td className="py-3 px-4">{req.materialName} ({req.quantity}T)</td>
                    <td className="py-3 px-4 font-mono font-bold">{formatNaira(req.pricing.total)}</td>
                    <td className="py-3 px-4"><StatusBadge status={req.status} /></td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/admin/requisitions/${req.id}`}>
                        <Button variant="ghost" size="xs">Details</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}
