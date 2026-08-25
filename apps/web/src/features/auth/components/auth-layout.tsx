import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Mountain, Truck, Package } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 p-10 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 bg-white/10 backdrop-blur rounded-lg border border-white/20">
              <span className="text-white font-bold text-body-lg">A</span>
            </div>
            <span className="text-label font-bold text-white tracking-tight">AR MULTIVENTURES</span>
          </Link>
        </div>

        <div className="relative z-10">
          <h2 className="text-display text-white mb-4">
            Integrated Material Supply & Logistics
          </h2>
          <p className="text-body-lg text-primary-100 mb-8">
            Manage requisitions, track deliveries, and coordinate material supply from quarry to destination.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4">
            {[
              { icon: <Mountain className="h-4 w-4" />, text: 'Multiple quarry sources' },
              { icon: <Truck className="h-4 w-4" />, text: 'Coordinated haulage' },
              { icon: <Package className="h-4 w-4" />, text: 'Real-time order tracking' },
            ].map((feature) => (
              <div key={feature.text} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-primary-200">
                  {feature.icon}
                </div>
                <span className="text-body-sm text-primary-100">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-small text-primary-200/60">
            © {new Date().getFullYear()} AR Multiventures. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
              <span className="text-white font-bold text-body-lg">A</span>
            </div>
            <span className="text-label font-bold text-neutral-900 tracking-tight">AR MULTIVENTURES</span>
          </Link>

          <div className="mb-7">
            <h1 className="text-h1 text-neutral-900 mb-1.5">{title}</h1>
            {subtitle && <p className="text-body text-neutral-500">{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
