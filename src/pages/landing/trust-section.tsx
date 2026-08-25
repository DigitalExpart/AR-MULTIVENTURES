import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { AnimatedCounter } from '@/components/motion/animated-counter';
import { Mountain, Truck, Eye, ShieldCheck } from 'lucide-react';

const stats = [
  {
    icon: <Mountain className="h-6 w-6" />,
    label: 'Multiple Quarry Sources',
    description: 'Connected network of verified quarry operations',
    value: null,
  },
  {
    icon: <Truck className="h-6 w-6" />,
    label: 'Reliable Fleet Network',
    description: 'Coordinated haulage across major routes',
    value: null,
  },
  {
    icon: <Eye className="h-6 w-6" />,
    label: 'Real-Time Order Visibility',
    description: 'Track every requisition from source to destination',
    value: null,
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    label: 'End-to-End Delivery Management',
    description: 'Complete operational control and accountability',
    value: null,
  },
];

export function TrustSection() {
  return (
    <section className="section bg-white border-b border-neutral-100" id="about">
      <div className="container-wide">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="text-label text-primary-600 uppercase tracking-wider mb-2">Why AR Multiventures</p>
            <h2 className="text-display text-neutral-900 mb-3">
              Built for Serious Infrastructure
            </h2>
            <p className="text-body-lg text-neutral-500 max-w-2xl mx-auto">
              A platform designed for the demands of construction material supply and logistics operations.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <ScrollReveal key={stat.label} delay={index * 0.1}>
              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 mb-4">
                  {stat.icon}
                </div>
                <h3 className="text-h4 text-neutral-900 mb-2">{stat.label}</h3>
                <p className="text-body text-neutral-500">{stat.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
