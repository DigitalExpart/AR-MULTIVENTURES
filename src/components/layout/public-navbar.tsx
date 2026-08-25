import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { NAV_LINKS } from '@/lib/constants';

export function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isScrolled } = useScrollPosition();
  const location = useLocation();

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-nav border-b border-neutral-100'
          : 'bg-transparent'
      )}
    >
      <div className="container-wide">
        <nav className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
              <span className="text-white font-bold text-body-lg">A</span>
            </div>
            <div className="flex flex-col">
              <span className={cn(
                'text-label font-bold tracking-tight transition-colors',
                isScrolled ? 'text-neutral-900' : 'text-white'
              )}>
                AR MULTIVENTURES
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-body-sm font-medium rounded-md transition-colors',
                  isScrolled
                    ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login">
              <Button
                variant={isScrolled ? 'ghost' : 'ghost'}
                size="sm"
                className={cn(
                  !isScrolled && 'text-white/90 hover:text-white hover:bg-white/10'
                )}
              >
                Login
              </Button>
            </Link>
            <Link to="/app/requisitions/new">
              <Button
                variant="accent"
                size="sm"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Request Supply
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={cn(
              'lg:hidden p-2 rounded-md transition-colors',
              isScrolled
                ? 'text-neutral-600 hover:bg-neutral-100'
                : 'text-white hover:bg-white/10'
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white border-b border-neutral-200 overflow-hidden"
          >
            <div className="container-wide py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-body font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-neutral-200 mt-3 space-y-2">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full" size="md">
                    Login
                  </Button>
                </Link>
                <Link to="/app/requisitions/new" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="accent" className="w-full" size="md">
                    Request Supply
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
