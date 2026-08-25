import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Search as SearchIcon, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Drawer } from '@/components/ui/drawer';
import { MobileNav } from './mobile-nav';
import { mockUser } from '@/services/mock/mock-data';

export function AppHeader() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          {/* Left: mobile menu + breadcrumb area */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-md text-neutral-600 hover:bg-neutral-100 transition-colors"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Logo */}
            <Link to="/app" className="lg:hidden flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 bg-primary-600 rounded-md">
                <span className="text-white font-bold text-body-sm">A</span>
              </div>
              <span className="text-label-sm font-bold text-neutral-900">AR MULTI</span>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link to="/app/requisitions/new" className="hidden sm:block">
              <Button size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
                New Requisition
              </Button>
            </Link>

            <Link to="/app/requisitions/new" className="sm:hidden">
              <Button size="icon-sm" aria-label="New Requisition">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </Link>

            <Link to="/app/notifications">
              <button className="relative p-2 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error-500" />
              </button>
            </Link>

            <Link to="/app/profile" className="ml-1">
              <Avatar name={`${mockUser.firstName} ${mockUser.lastName}`} size="sm" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        side="left"
        title="Menu"
      >
        <MobileNav onClose={() => setIsMobileNavOpen(false)} />
      </Drawer>
    </>
  );
}
