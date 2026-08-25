import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, PlusCircle, FileText, Package, Truck,
  Receipt, CreditCard, Building2, Bell, User, HelpCircle, LogOut
} from 'lucide-react';
import { CUSTOMER_SIDEBAR_LINKS, BRAND } from '@ar-multiventures/config';
import { useAuth } from '@/features/auth/context/auth-context';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4.5 w-4.5 shrink-0" />,
  PlusCircle: <PlusCircle className="h-4.5 w-4.5 shrink-0" />,
  FileText: <FileText className="h-4.5 w-4.5 shrink-0" />,
  Package: <Package className="h-4.5 w-4.5 shrink-0" />,
  Truck: <Truck className="h-4.5 w-4.5 shrink-0" />,
  Receipt: <Receipt className="h-4.5 w-4.5 shrink-0" />,
  CreditCard: <CreditCard className="h-4.5 w-4.5 shrink-0" />,
  Building2: <Building2 className="h-4.5 w-4.5 shrink-0" />,
  Bell: <Bell className="h-4.5 w-4.5 shrink-0" />,
};

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, customerProfile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-screen bg-neutral-950 text-neutral-300 border-r border-neutral-800 fixed left-0 top-0 z-40">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-neutral-800/90 shrink-0">
        <div className="relative flex items-center justify-center h-9 w-9 rounded-lg overflow-hidden bg-primary-600 shrink-0">
          <img
            src={BRAND.assets.logoImage}
            alt={BRAND.companyName}
            className="h-full w-full object-contain p-0.5"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="text-white font-extrabold text-body absolute">A</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-label-sm font-extrabold text-white tracking-tight truncate">
            AR MULTIVENTURES
          </span>
          <span className="text-[10px] uppercase font-bold text-accent-400 tracking-wider">
            Customer Portal
          </span>
        </div>
      </div>

      {/* Prominent Action Button for New Requisition */}
      <div className="p-3 pb-2">
        <NavLink
          to="/app/requisitions/new"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg bg-accent-400 hover:bg-accent-500 text-neutral-950 font-bold text-body-sm shadow-md transition-all duration-150"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ New Requisition</span>
        </NavLink>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-hide">
        {CUSTOMER_SIDEBAR_LINKS.filter((l) => !('isPrimaryAction' in l && l.isPrimaryAction)).map((link) => {
          const isActive = link.href === '/app'
            ? location.pathname === '/app'
            : location.pathname.startsWith(link.href);

          return (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === '/app'}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg text-body-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-600 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn(isActive ? 'text-white' : 'text-neutral-400')}>
                  {iconMap[link.icon]}
                </span>
                <span>{link.label}</span>
              </div>
              {link.label === 'Notifications' && (
                <span className="flex items-center justify-center px-1.5 py-0.5 rounded-full bg-accent-400 text-neutral-950 text-[10px] font-bold">
                  3
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile & Actions */}
      <div className="border-t border-neutral-800/90 p-3 space-y-1 bg-neutral-950/60">
        <div className="px-3 py-2 mb-1 rounded-lg bg-neutral-900/60 border border-neutral-800/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-600/30 border border-primary-500/40 text-primary-300 flex items-center justify-center font-bold text-caption shrink-0">
            {customerProfile?.firstName?.[0] || 'A'}{customerProfile?.lastName?.[0] || 'O'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-body-sm font-bold text-white truncate">
              {customerProfile?.companyName || 'BuildCorp Nigeria'}
            </p>
            <p className="text-[11px] text-neutral-400 truncate">
              {customerProfile?.email || 'operations@buildcorpng.com'}
            </p>
          </div>
        </div>

        <NavLink
          to="/app/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
        >
          <User className="h-4.5 w-4.5 text-neutral-400" />
          <span>Company Profile</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm font-medium text-error-400 hover:text-error-300 hover:bg-error-950/40 transition-colors w-full text-left"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
