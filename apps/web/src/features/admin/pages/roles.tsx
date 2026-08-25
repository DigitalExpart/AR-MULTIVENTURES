import { ShieldCheck, Check, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';

export function AdminRolesPage() {
  const permissions = [
    { key: 'requisitions.view', label: 'View Requisitions' },
    { key: 'requisitions.create', label: 'Create Requisition' },
    { key: 'requisitions.approve', label: 'Approve / Reject Orders' },
    { key: 'customers.view', label: 'View Customers' },
    { key: 'customers.manage', label: 'Manage Customer Credit' },
    { key: 'pricing.view', label: 'View Pricing Matrices' },
    { key: 'pricing.manage', label: 'Modify Prices & Tariffs' },
    { key: 'quarries.manage', label: 'Manage Quarry Hubs' },
    { key: 'users.manage', label: 'Manage Users & Roles' },
    { key: 'reports.view', label: 'View Audit Logs & Reports' },
  ];

  const roleMatrix: Record<string, string[]> = {
    SUPER_ADMIN: ['requisitions.view', 'requisitions.create', 'requisitions.approve', 'customers.view', 'customers.manage', 'pricing.view', 'pricing.manage', 'quarries.manage', 'users.manage', 'reports.view'],
    MANAGEMENT: ['requisitions.view', 'customers.view', 'pricing.view', 'reports.view'],
    SALES: ['requisitions.view', 'requisitions.create', 'customers.view', 'customers.manage', 'pricing.view'],
    OPERATIONS: ['requisitions.view', 'requisitions.approve', 'quarries.manage'],
    CUSTOMER: ['requisitions.view', 'requisitions.create'],
  };

  const roles = [
    { code: 'SUPER_ADMIN', name: 'Super Administrator' },
    { code: 'MANAGEMENT', name: 'Management' },
    { code: 'SALES', name: 'Sales Officer' },
    { code: 'OPERATIONS', name: 'Operations' },
    { code: 'CUSTOMER', name: 'Customer' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Enterprise RBAC Permission Matrix"
        description="Role-Based Access Control matrix governing internal staff capabilities and route authorization."
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin' },
          { label: 'Users & Roles', href: '/admin/users' },
          { label: 'Role Matrix' },
        ]}
      />

      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4 w-1/3">Permission Capability</th>
                {roles.map((r) => (
                  <th key={r.code} className="py-3 px-4 text-center">
                    {r.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {permissions.map((p) => (
                <tr key={p.key} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-neutral-900">
                    <div>{p.label}</div>
                    <span className="font-mono text-[11px] text-neutral-400">{p.key}</span>
                  </td>
                  {roles.map((r) => {
                    const hasPerm = roleMatrix[r.code]?.includes(p.key);
                    return (
                      <td key={r.code} className="py-3.5 px-4 text-center">
                        {hasPerm ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-700">
                            <Check className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 text-neutral-300">
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
