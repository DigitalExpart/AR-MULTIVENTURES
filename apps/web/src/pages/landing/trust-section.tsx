import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Mountain, Truck, ShieldCheck, BarChart3, CheckCircle2 } from 'lucide-react';

const pillars = [
  {
    icon: <Mountain className="h-6 w-6" />,
    title: 'Certified Quarry Network',
    description: 'Direct procurement partnerships across major granite belts in Ogun, Oyo, and Ebonyi States.',
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Heavy Tipper Haulage Fleet',
    description: 'Modern 30T and 45T heavy-duty tippers fitted with tarpaulin covers for clean transit.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Calibrated Weighbridge Tickets',
    description: 'Exact digital scale measurements ensuring you receive 100% of your ordered tonnage.',
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Real-Time Order & Transit Visibility',
    description: 'Digital tracking from requisition approval, quarry bay loading, toll transit, to destination sign-off.',
  },
];

export function TrustSection() {
  return (
    <section className="py-16 bg-white border-b border-neutral-200/80" id="about">
      <div className="container-wide">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, index) => (
            <ScrollReveal key={pillar.title} delay={index * 0.08}>
              <div className="h-full p-6 rounded-xl bg-surface-secondary border border-neutral-200/80 flex flex-col justify-start">
                <div className="w-12 h-12 rounded-lg bg-primary-600/10 text-primary-700 flex items-center justify-center mb-4">
                  {pillar.icon}
                </div>
                <h3 className="text-h4 font-bold text-neutral-900 mb-2">{pillar.title}</h3>
                <p className="text-body-sm text-neutral-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
