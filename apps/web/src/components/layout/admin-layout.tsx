import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Search, Bell, Shield, LogOut, ChevronDown, Menu, X,
  LayoutDashboard, FileText, Building2, Mountain, Layers,
  MapPin, MapPinned, Calculator, Coins, Truck, BadgePercent,
  Sparkles, Percent, Users, ShieldCheck, History, Settings,
  Banknote, Wallet, Receipt, CreditCard, FileSpreadsheet,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/auth-context';
import { ADMIN_SIDEBAR_SECTIONS } from '@ar-multiventures/config';
import { AdminCommandSearch } from '@/components/admin/command-search';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  FileText,
  Building2,
  Mountain,
  Layers,
  MapPin,
  MapPinned,
  Calculator,
  Coins,
  Truck,
  BadgePercent,
  Sparkles,
  Percent,
  Users,
  ShieldCheck,
  History,
  Settings,
  Banknote,
  Wallet,
  Receipt,
  CreditCard,
  FileSpreadsheet,
};


export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'sales' | 'operations' | 'management'>('admin');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-neutral-900 flex flex-col">
      {/* Top Admin Operational Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 h-16 flex items-center justify-between px-4 lg:px-6 shadow-2xs">
        <div className="flex items-center gap-4">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Platform Logo */}
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-700 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-sm">
              ARM
            </div>
            <div>
              <div className="font-extrabold text-body-sm leading-none text-neutral-950 tracking-tight">
                AR MULTIVENTURES
              </div>
              <div className="text-[10px] font-mono font-bold text-primary-700 tracking-wider uppercase mt-0.5">
                Operations Command Center
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Command Search Bar (Global Quick Trigger) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-neutral-100/80 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-body-sm text-neutral-500 transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <Search className="h-4 w-4 text-neutral-400" />
              <span>Search requisitions, customers, quarries, materials...</span>
            </div>
            <kbd className="hidden lg:inline-block font-mono text-[10px] bg-white border border-neutral-300 px-1.5 py-0.5 rounded text-neutral-500 shadow-2xs">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Actions: Portal Switcher, Role Badge & User Profile */}
        <div className="flex items-center gap-3">
          {/* Link to Customer Portal view */}
          <Link
            to="/app"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-caption font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <span>Customer Portal</span>
            <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
          </Link>

          {/* Quick Role Switcher Simulation (For Dev & Testing) */}
          <div className="hidden xl:flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200 text-caption font-semibold">
            <span className="text-[11px] text-neutral-400 px-1.5 font-mono">SIMULATE:</span>
            {(['admin', 'operations', 'sales', 'management'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={cn(
                  'px-2 py-0.5 rounded uppercase font-mono text-[11px] transition-all',
                  selectedRole === r
                    ? 'bg-primary-700 text-white shadow-2xs font-bold'
                    : 'text-neutral-600 hover:text-neutral-900'
                )}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Notifications Bell */}
          <Link
            to="/admin/audit"
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 relative transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-500 ring-2 ring-white" />
          </Link>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-800 text-white flex items-center justify-center font-bold text-caption">
                {user?.firstName?.[0] || 'A'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-body-sm font-bold text-neutral-900 leading-none">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-[10px] font-mono text-neutral-500 uppercase mt-0.5">
                  {selectedRole.toUpperCase()} OFFICER
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-1 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3.5 py-2.5 border-b border-neutral-100">
                  <p className="text-body-sm font-bold text-neutral-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-caption text-neutral-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-mono font-bold uppercase bg-primary-50 text-primary-700 border border-primary-200 px-1.5 py-0.5 rounded">
                    {selectedRole.toUpperCase()}
                  </span>
                </div>
                <Link
                  to="/admin/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-body-sm text-neutral-700 hover:bg-neutral-50"
                >
                  <Settings className="h-4 w-4 text-neutral-400" />
                  <span>Admin Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-body-sm text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Body container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Admin Navigation Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-200 pt-16 lg:pt-0 lg:static lg:translate-x-0',
            isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          )}
        >
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {ADMIN_SIDEBAR_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = ICON_MAP[item.icon] || FileText;
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      end={item.href === '/admin'}
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-between px-3 py-2 rounded-xl text-body-sm font-semibold transition-all',
                          isActive
                            ? 'bg-primary-50 text-primary-800 font-bold'
                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'
                        )
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0 opacity-80" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono font-bold bg-accent-100 text-accent-800 px-1.5 py-0.5 rounded">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer System Notice */}
          <div className="p-3.5 border-t border-neutral-200 bg-neutral-50/70">
            <div className="flex items-center gap-2 text-caption font-semibold text-neutral-600">
              <Shield className="h-4 w-4 text-primary-700" />
              <span>Enterprise RBAC Active</span>
            </div>
            <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
              AR MULTIVENTURES v1.2
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Global Command Search Modal */}
      <AdminCommandSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
