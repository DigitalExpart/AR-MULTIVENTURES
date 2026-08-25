import { Link } from 'react-router-dom';
import { ArrowRight, LogIn, PhoneCall } from 'lucide-react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Button } from '@/components/ui/button';
import { BRAND } from '@ar-multiventures/config';

export function CtaSection() {
  return (
    <section className="section bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white relative overflow-hidden">
      {/* Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #FFFFFF 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="container-narrow relative z-10 text-center">
        <ScrollReveal>
          <span className="text-caption font-bold text-accent-400 uppercase tracking-widest px-3 py-1 bg-white/10 rounded-md border border-white/20">
            CONNECT YOUR SOURCING
          </span>
          <h2 className="text-display-lg font-extrabold tracking-tight mt-4 mb-4 text-white">
            Ready to Request Your Next Supply?
          </h2>
          <p className="text-body-lg text-primary-100 max-w-xl mx-auto mb-8 font-normal leading-relaxed">
            Eliminate supply bottlenecks. Source certified granite aggregates with guaranteed loading slots and dedicated heavy tipper haulage.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/app/requisitions/new" className="w-full sm:w-auto">
              <Button
                variant="accent"
                size="xl"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="w-full sm:w-auto font-bold text-neutral-950 shadow-xl"
              >
                Create Material Requisition
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="xl"
                leftIcon={<LogIn className="h-4 w-4" />}
                className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:border-white/50"
              >
                Client Portal Sign In
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-center gap-2 text-body-sm text-primary-200">
            <PhoneCall className="h-4 w-4 text-accent-400" />
            <span>Need urgent direct procurement assistance? Call <strong className="text-white">{BRAND.contact.phone}</strong></span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
