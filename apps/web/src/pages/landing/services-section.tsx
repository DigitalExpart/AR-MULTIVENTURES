import { ScrollReveal } from '@/components/motion/scroll-reveal';
import {
  Package, Mountain, Truck, Container, PackageCheck, Users, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const services = [
  {
    icon: <Package className="h-6 w-6" />,
    title: 'Granite & Aggregate Supply',
    description: 'Source certified construction materials including 3/4", 1/2", 10mm, 20mm, 30mm granite aggregates, stone dust, and washed sharp sand directly from certified quarries.',
    color: 'bg-primary-50 text-primary-700',
    tag: 'Certified Quality',
  },
  {
    icon: <Mountain className="h-6 w-6" />,
    title: 'Direct Quarry Sourcing',
    description: 'Multi-quarry integration connecting your procurement to prime deposits across Abeokuta, Ishiagu, Ibadan, and Sagamu operational belts.',
    color: 'bg-info-50 text-info-700',
    tag: 'Multi-Hub Access',
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Heavy Fleet Haulage',
    description: 'Dedicated 30-tonne and 45-tonne heavy-duty tipper fleet coordination with scheduled loading, route optimization, and GPS-monitored transit.',
    color: 'bg-accent-50 text-accent-800',
    tag: '30T / 45T Fleet',
  },
  {
    icon: <Container className="h-6 w-6" />,
    title: 'Loading Bay Coordination',
    description: 'Automated loading slot scheduling, weighbridge ticket verification, and express queue priority for prompt quarry departure.',
    color: 'bg-warning-50 text-warning-800',
    tag: 'Weighbridge Verified',
  },
  {
    icon: <PackageCheck className="h-6 w-6" />,
    title: 'Site Delivery Management',
    description: 'End-to-end offloading oversight at your construction site, digital delivery notes, recipient sign-off, and photo verification.',
    color: 'bg-success-50 text-success-700',
    tag: 'Sign-Off Proof',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Enterprise Account Management',
    description: 'Structured corporate supply agreements, credit line facilities for verified contractors, consolidated invoicing, and requisition history.',
    color: 'bg-neutral-100 text-neutral-800',
    tag: 'B2B Accounts',
  },
];

export function ServicesSection() {
  return (
    <section className="section bg-surface-secondary border-y border-neutral-200/80" id="services">
      <div className="container-wide">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-caption font-bold text-primary-700 uppercase tracking-widest px-3 py-1 bg-primary-50 rounded-md border border-primary-200">
              OPERATIONAL CAPABILITIES
            </span>
            <h2 className="text-display text-neutral-900 font-extrabold tracking-tight mt-3 mb-4">
              Integrated Quarry Supply & Haulage Infrastructure
            </h2>
            <p className="text-body-lg text-neutral-600">
              End-to-end material logistics engineered for construction firms, civil contractors, and infrastructure developers across Nigeria.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ScrollReveal key={service.title} delay={index * 0.08}>
              <div
                className={cn(
                  'h-full flex flex-col justify-between bg-white border border-neutral-200 rounded-xl p-6 transition-all duration-200',
                  'hover:shadow-card-hover hover:border-neutral-300'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={cn('flex items-center justify-center w-12 h-12 rounded-xl', service.color)}>
                      {service.icon}
                    </div>
                    <span className="text-caption font-semibold px-2.5 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                      {service.tag}
                    </span>
                  </div>
                  <h3 className="text-h4 text-neutral-900 font-bold mb-2.5">{service.title}</h3>
                  <p className="text-body text-neutral-600 leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center text-body-sm font-semibold text-primary-700">
                  <span>Explore service specifications</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
