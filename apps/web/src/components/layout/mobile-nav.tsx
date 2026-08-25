import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, PlusCircle, FileText, Package, Truck,
  Receipt, CreditCard, Building2, Bell, User, LogOut
} from 'lucide-react';
import { CUSTOMER_SIDEBAR_LINKS } from '@ar-multiventures/config';
import { useAuth } from '@/features/auth/context/auth-context';

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
  const navigate = useNavigate();
  const { customerProfile, logout } = useAuth();

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  return (
    <nav className="space-y-1.5 pt-2">
      {/* Prominent Action Button for New Requisition */}
      <NavLink
        to="/app/requisitions/new"
        onClick={onClose}
        className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl bg-accent-400 text-neutral-950 font-bold text-body shadow-sm mb-4"
      >
        <PlusCircle className="h-5 w-5" />
        <span>+ New Requisition</span>
      </NavLink>

      {CUSTOMER_SIDEBAR_LINKS.filter((l) => !('isPrimaryAction' in l && l.isPrimaryAction)).map((link) => {
        const isActive = link.href === '/app'
          ? location.pathname === '/app'
          : location.pathname.startsWith(link.href);

        return (
          <NavLink
            key={link.href}
            to={link.href}
            end={link.href === '/app'}
            onClick={onClose}
            className={cn(
              'flex items-center justify-between px-3.5 py-3 rounded-lg text-body font-medium transition-colors',
              isActive
                ? 'bg-primary-600 text-white font-semibold'
                : 'text-neutral-700 hover:bg-neutral-100'
            )}
          >
            <div className="flex items-center gap-3">
              <span className={cn(isActive ? 'text-white' : 'text-neutral-500')}>
                {iconMap[link.icon]}
              </span>
              <span>{link.label}</span>
            </div>
            {link.label === 'Notifications' && (
              <span className="px-2 py-0.5 rounded-full bg-accent-400 text-neutral-950 text-caption font-bold">
                3
              </span>
            )}
          </NavLink>
        );
      })}

      <div className="border-t border-neutral-200 pt-4 mt-6 space-y-1">
        <div className="px-3 py-2 text-caption text-neutral-500 font-medium">
          Logged in as: <strong className="text-neutral-900">{customerProfile?.companyName || 'BuildCorp Nigeria'}</strong>
        </div>

        <NavLink
          to="/app/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-body font-medium text-neutral-700 hover:bg-neutral-100"
        >
          <User className="h-5 w-5 text-neutral-500" />
          <span>Company Profile</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-body font-medium text-error-600 hover:bg-error-50 w-full text-left"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
