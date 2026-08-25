import { PageHeader } from '@/components/layout/page-header';
import { PageTransition } from '@/components/motion/page-transition';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Wallet, Building2, CreditCard } from 'lucide-react';
import { formatNaira } from '@/lib/format';
import { mockUser } from '@/services/mock/mock-data';

export function AccountPage() {
  return (
    <PageTransition>
      <PageHeader
        title="Account"
        description="Manage your company account"
        breadcrumbs={[{ label: 'Account' }]}
      />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Account Balance"
          value={formatNaira(mockUser.accountBalance)}
          icon={<Wallet className="h-5 w-5" />}
          valueClassName="text-kpi-sm"
        />
        <StatCard
          title="Company"
          value={mockUser.companyName || '—'}
          icon={<Building2 className="h-5 w-5" />}
          valueClassName="text-h3"
        />
        <StatCard
          title="Payment Method"
          value="Bank Transfer"
          icon={<CreditCard className="h-5 w-5" />}
          valueClassName="text-h3"
        />
      </div>
      <Card>
        <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
        <div className="grid sm:grid-cols-2 gap-4 text-body-sm">
          <div>
            <p className="text-neutral-500 mb-0.5">Account Holder</p>
            <p className="font-medium text-neutral-900">{mockUser.firstName} {mockUser.lastName}</p>
          </div>
          <div>
            <p className="text-neutral-500 mb-0.5">Email</p>
            <p className="font-medium text-neutral-900">{mockUser.email}</p>
          </div>
          <div>
            <p className="text-neutral-500 mb-0.5">Phone</p>
            <p className="font-medium text-neutral-900">{mockUser.phone}</p>
          </div>
          <div>
            <p className="text-neutral-500 mb-0.5">Verification Status</p>
            <p className="font-medium text-success-600">Verified</p>
          </div>
        </div>
      </Card>
    </PageTransition>
  );
}
