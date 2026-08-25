import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, PlusCircle, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Drawer } from '@/components/ui/drawer';
import { MobileNav } from './mobile-nav';
import { useAuth } from '@/features/auth/context/auth-context';
import { BRAND } from '@ar-multiventures/config';

export function AppHeader() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { customerProfile } = useAuth();

  const displayName = customerProfile
    ? `${customerProfile.firstName} ${customerProfile.lastName}`
    : 'Adebayo Ogundimu';

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left: Mobile Menu Trigger + Breadcrumb/Context */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open mobile navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Logo Mark */}
            <Link to="/app" className="lg:hidden flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg overflow-hidden shrink-0">
                <img
                  src={BRAND.assets.logoImage}
                  alt={BRAND.companyName}
                  className="h-full w-full object-contain p-0.5"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <span className="text-label font-extrabold text-neutral-900">AR MULTI</span>
            </Link>

            <div className="hidden lg:flex items-center gap-2 text-body-sm text-neutral-500">
              <span className="w-2 h-2 rounded-full bg-success-500" />
              <span>Quarry Dispatch Operations: <strong className="text-neutral-800">Active (4 Hubs Online)</strong></span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Primary Action on Desktop */}
            <Link to="/app/requisitions/new" className="hidden sm:block">
              <Button
                variant="accent"
                size="sm"
                leftIcon={<PlusCircle className="h-4 w-4" />}
                className="font-bold text-neutral-950 shadow-xs"
              >
                + New Requisition
              </Button>
            </Link>

            {/* Notifications with Unread Dot */}
            <Link to="/app/notifications" className="relative p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors" aria-label="View notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-accent-400 border-2 border-white" />
            </Link>

            {/* Account Avatar Pill */}
            <Link
              to="/app/account"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors border border-neutral-200/80"
            >
              <Avatar name={displayName} size="sm" />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-label-sm text-neutral-900 leading-tight">
                  {customerProfile?.companyName || displayName}
                </span>
                <span className="text-[10px] text-success-700 font-semibold flex items-center gap-0.5">
                  <ShieldCheck className="h-3 w-3" /> Verified Contractor
                </span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <Drawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        side="left"
        title="AR Multiventures Menu"
      >
        <MobileNav onClose={() => setIsMobileNavOpen(false)} />
      </Drawer>
    </>
  );
}
