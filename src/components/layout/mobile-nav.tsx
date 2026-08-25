import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, PlusCircle, FileText, Package, Truck,
  Receipt, CreditCard, Building2, Bell, User, HelpCircle, LogOut
} from 'lucide-react';
import { SIDEBAR_LINKS } from '@/lib/constants';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
  PlusCircle: <PlusCircle className="h-5 w-5" />,
  FileText: <FileText className="h-5 w-5" />,
  Package: <Package className="h-5 w-5" />,
  Truck: <Truck className="h-5 w-5" />,
  Receipt: <Receipt className="h-5 w-5" />,
  CreditCard: <CreditCard className="h-5 w-5" />,
  Building2: <Building2 className="h-5 w-5" />,
  Bell: <Bell className="h-5 w-5" />,
};

interface MobileNavProps {
  onClose: () => void;
}

export function MobileNav({ onClose }: MobileNavProps) {
  const location = useLocation();

  return (
    <nav className="space-y-1">
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
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary-600 text-white font-medium text-body"
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
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-body font-medium transition-colors',
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-neutral-600 hover:bg-neutral-50'
            )}
          >
            <span className={cn(isActive ? 'text-primary-600' : 'text-neutral-400')}>
              {iconMap[link.icon]}
            </span>
            <span>{link.label}</span>
          </NavLink>
        );
      })}

      <div className="border-t border-neutral-200 pt-3 mt-4 space-y-1">
        <NavLink
          to="/app/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body font-medium text-neutral-600 hover:bg-neutral-50"
        >
          <User className="h-5 w-5 text-neutral-400" />
          <span>Profile</span>
        </NavLink>
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body font-medium text-neutral-600 hover:bg-neutral-50"
        >
          <HelpCircle className="h-5 w-5 text-neutral-400" />
          <span>Help & Support</span>
        </a>
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body font-medium text-neutral-600 hover:text-error-600 hover:bg-error-50 w-full text-left">
          <LogOut className="h-5 w-5 text-neutral-400" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
