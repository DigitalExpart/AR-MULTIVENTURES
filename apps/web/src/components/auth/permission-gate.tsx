import type { ReactNode } from 'react';
import { useAuth } from '@/features/auth/context/auth-context';

interface PermissionGateProps {
  permission?: string;
  role?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({ permission, role, fallback = null, children }: PermissionGateProps) {
  const { user } = useAuth();

  if (!user) return <>{fallback}</>;

  // Super Admins bypass UI gates
  if (user.role === 'admin' || (user as any).isSuperAdmin) {
    return <>{children}</>;
  }

  if (role && user.role !== role) {
    return <>{fallback}</>;
  }

  // Permissions check based on role
  if (permission) {
    const rolePerms: Record<string, string[]> = {
      sales: ['customers.view', 'customers.manage', 'requisitions.view', 'requisitions.create', 'pricing.view'],
      operations: ['requisitions.view', 'requisitions.approve', 'quarries.manage', 'materials.manage', 'destinations.manage', 'loading.manage', 'delivery.manage'],
      accounts: ['customers.view', 'requisitions.view', 'payments.view', 'payments.confirm', 'reports.view'],
      admin: ['customers.manage', 'requisitions.approve', 'pricing.manage', 'quarries.manage', 'materials.manage', 'destinations.manage', 'users.manage', 'reports.view', 'settings.manage'],
    };

    const allowed = rolePerms[user.role] || [];
    if (!allowed.includes(permission)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
