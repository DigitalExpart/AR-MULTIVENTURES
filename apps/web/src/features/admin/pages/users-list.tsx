import { useState, useEffect } from 'react';
import { Users, Shield, ShieldCheck, Mail, Phone, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { formatDate } from '@ar-multiventures/business-logic';
import { adminApi } from '@ar-multiventures/api';
import type { AdminUser } from '@ar-multiventures/types';

export function AdminUsersListPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const list = await adminApi.getUsers();
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    await adminApi.updateUserRole(userId, newRole);
    await loadUsers();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Internal Staff & RBAC Role Assignments"
        description="Manage internal enterprise users, organizational role capabilities, and access permissions."
        breadcrumbs={[{ label: 'Admin Command', href: '/admin' }, { label: 'Users & Roles' }]}
      />

      <Card padding="none" className="bg-white border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] font-mono font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Active RBAC Role</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Role Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-caption text-neutral-400">
                    Loading staff users...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-neutral-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary-800 text-white flex items-center justify-center font-bold text-caption">
                        {u.firstName[0]}
                      </div>
                      <div>
                        <div>{u.firstName} {u.lastName}</div>
                        {u.isSuperAdmin && (
                          <span className="text-[10px] font-mono font-bold text-primary-700 uppercase">SUPER ADMIN</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-700">{u.email}</td>
                    <td className="py-3.5 px-4 font-mono text-caption text-neutral-600">{u.phone || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-primary-50 text-primary-800 border border-primary-200">
                        {u.roleName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-caption text-neutral-500 font-mono">
                      {u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Never'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={u.roleCode}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2.5 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-caption font-bold text-neutral-800"
                      >
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        <option value="MANAGEMENT">MANAGEMENT</option>
                        <option value="OPERATIONS">OPERATIONS</option>
                        <option value="SALES">SALES</option>
                      </select>
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
