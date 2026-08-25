import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { PUBLIC_NAV_LINKS, BRAND } from '@ar-multiventures/config';
import { useAuth } from '@/features/auth/context/auth-context';

export function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isScrolled } = useScrollPosition();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-nav border-b border-neutral-200/80 py-2.5'
          : 'bg-gradient-to-b from-neutral-950/90 via-neutral-950/60 to-transparent py-4'
      )}
    >
      <div className="container-wide">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative flex items-center justify-center h-10 w-10 rounded-lg overflow-hidden bg-primary-600 shadow-sm transition-transform group-hover:scale-[1.02]">
              <img
                src={BRAND.assets.logoImage}
                alt={BRAND.companyName}
                className="h-full w-full object-contain p-0.5"
                onError={(e) => {
                  // Fallback to stylized SVG emblem if image fails
                  const target = e.currentTarget;
                  target.style.display = 'none';
                }}
              />
              <span className="text-white font-extrabold text-h4 tracking-tight absolute">A</span>
            </div>
            <div className="flex flex-col">
              <span
                className={cn(
                  'text-label font-extrabold tracking-tight transition-colors flex items-center gap-1.5',
                  isScrolled ? 'text-neutral-950' : 'text-white'
                )}
              >
                AR MULTIVENTURES
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-accent-400" />
              </span>
              <span
                className={cn(
                  'text-[10px] uppercase font-semibold tracking-wider transition-colors line-clamp-1',
                  isScrolled ? 'text-neutral-500' : 'text-neutral-300'
                )}
              >
                Granite & Haulage Logistics
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md"
            style={isScrolled ? { backgroundColor: 'rgba(245, 245, 245, 0.8)', borderColor: 'rgba(220, 220, 220, 0.8)' } : {}}
          >
            {PUBLIC_NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3.5 py-1.5 text-body-sm font-medium rounded-full transition-all duration-200',
                  isScrolled
                    ? 'text-neutral-700 hover:text-primary-700 hover:bg-neutral-200/60'
                    : 'text-neutral-200 hover:text-white hover:bg-white/15'
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/app">
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      isScrolled ? 'text-neutral-800 hover:bg-neutral-100' : 'text-white hover:bg-white/10'
                    )}
                  >
                    Client Sign In
                  </Button>
                </Link>
                <Link to="/app/requisitions/new">
                  <Button
                    variant="accent"
                    size="md"
                    rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                    className="shadow-sm"
                  >
                    Request Supply
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={cn(
              'lg:hidden p-2 rounded-lg transition-colors',
              isScrolled
                ? 'text-neutral-800 hover:bg-neutral-100'
                : 'text-white hover:bg-white/10'
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden bg-neutral-900 border-b border-neutral-800 overflow-hidden shadow-2xl"
          >
            <div className="container-wide py-5 space-y-2">
              {PUBLIC_NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-body font-medium text-neutral-200 hover:text-accent-400 hover:bg-neutral-800/60 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-neutral-800 mt-3 space-y-2.5">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block">
                  <Button variant="outline" className="w-full border-neutral-700 text-white hover:bg-neutral-800" size="lg">
                    Client Sign In
                  </Button>
                </Link>
                <Link to="/app/requisitions/new" onClick={() => setIsMobileMenuOpen(false)} className="block">
                  <Button variant="accent" className="w-full text-neutral-950 font-bold" size="lg">
                    Request Supply / Requisition
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
