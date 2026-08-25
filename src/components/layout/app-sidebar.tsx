import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, PlusCircle, FileText, Package, Truck,
  Receipt, CreditCard, Building2, Bell, User, HelpCircle, LogOut
} from 'lucide-react';
import { SIDEBAR_LINKS } from '@/lib/constants';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4.5 w-4.5" />,
  PlusCircle: <PlusCircle className="h-4.5 w-4.5" />,
  FileText: <FileText className="h-4.5 w-4.5" />,
  Package: <Package className="h-4.5 w-4.5" />,
  Truck: <Truck className="h-4.5 w-4.5" />,
  Receipt: <Receipt className="h-4.5 w-4.5" />,
  CreditCard: <CreditCard className="h-4.5 w-4.5" />,
  Building2: <Building2 className="h-4.5 w-4.5" />,
  Bell: <Bell className="h-4.5 w-4.5" />,
};

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-screen bg-white border-r border-neutral-200 fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-neutral-200 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
          <span className="text-white font-bold text-body-lg">A</span>
        </div>
        <div className="flex flex-col">
          <span className="text-label-sm font-bold text-neutral-900 tracking-tight">AR MULTIVENTURES</span>
          <span className="text-caption text-neutral-400">Customer Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {SIDEBAR_LINKS.map((link) => {
          const isActive = link.href === '/app'
            ? location.pathname === '/app'
            : location.pathname.startsWith(link.href);
          const isPrimary = 'primary' in link && link.primary;

          if (isPrimary) {
            return (
              <NavLink
                key={link.href}
                to={link.href}
                className="flex items-center gap-3 px-3 py-2.5 mb-1 mt-1 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors font-medium text-body-sm"
              >
                {iconMap[link.icon]}
                <span>{link.label}</span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === '/app'}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              )}
            >
              <span className={cn(isActive ? 'text-primary-600' : 'text-neutral-400')}>
                {iconMap[link.icon]}
              </span>
              <span>{link.label}</span>
              {link.label === 'Notifications' && (
                <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-error-500 text-white text-caption font-bold">
                  3
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-neutral-200 p-3 space-y-0.5">
        <NavLink
          to="/app/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
        >
          <User className="h-4.5 w-4.5 text-neutral-400" />
          <span>Profile</span>
        </NavLink>
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
        >
          <HelpCircle className="h-4.5 w-4.5 text-neutral-400" />
          <span>Help & Support</span>
        </a>
        <button
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm font-medium text-neutral-600 hover:text-error-600 hover:bg-error-50 transition-colors w-full text-left"
        >
          <LogOut className="h-4.5 w-4.5 text-neutral-400" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
