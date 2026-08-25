import { Link } from 'react-router-dom';
import { ArrowRight, LogIn } from 'lucide-react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="section bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container-narrow relative z-10">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-display text-white mb-4">
              Ready to Request Your Next Supply?
            </h2>
            <p className="text-body-lg text-primary-100 mb-8 max-w-xl mx-auto">
              Start sourcing construction materials and coordinating deliveries through one connected platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/app/requisitions/new">
                <Button
                  variant="accent"
                  size="xl"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Create Requisition
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="xl"
                  leftIcon={<LogIn className="h-4 w-4" />}
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                >
                  Login to Your Account
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
