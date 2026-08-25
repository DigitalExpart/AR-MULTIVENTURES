import { Settings, Building2, Bell, Shield, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';

export function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Platform & Enterprise Settings"
        description="Core organization configuration, operational defaults, and notification parameters."
        breadcrumbs={[{ label: 'Admin Command', href: '/admin' }, { label: 'Settings' }]}
      />

      <div className="space-y-6">
        <Card padding="md" className="bg-white border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-neutral-200">
            <Building2 className="h-5 w-5 text-primary-700" />
            <div>
              <h4 className="text-body font-bold text-neutral-950">Organization Profile</h4>
              <p className="text-caption text-neutral-500">Legal business entity details.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Company Legal Name" defaultValue="AR Multiventures Limited" readOnly />
            <Input label="Tenant Code" defaultValue="ARM-HQ" readOnly />
            <Input label="Head Office Address" defaultValue="Victoria Island, Lagos, Nigeria" readOnly />
            <Input label="Support Helpline" defaultValue="+234 800 AR MULTIVENTURES" readOnly />
          </div>
        </Card>

        <Card padding="md" className="bg-white border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-neutral-200">
            <Shield className="h-5 w-5 text-primary-700" />
            <div>
              <h4 className="text-body font-bold text-neutral-950">Operational Sourcing Defaults</h4>
              <p className="text-caption text-neutral-500">Global quotation parameters.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Quote Expiration Window" defaultValue="48 Hours" readOnly />
            <Input label="Currency" defaultValue="NGN (Nigerian Naira)" readOnly />
            <Input label="Default Haulage Truck Classification" defaultValue="30 Tonne Heavy Tipper (10-Wheeler)" readOnly />
            <Input label="Default Weighbridge / Bay Rate" defaultValue="₦500 / Tonne" readOnly />
          </div>
        </Card>
      </div>
    </div>
  );
}
