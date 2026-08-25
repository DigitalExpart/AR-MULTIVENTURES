import { ScrollReveal } from '@/components/motion/scroll-reveal';
import {
  Package, Mountain, Truck, Container, PackageCheck, Users, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const services = [
  {
    icon: <Package className="h-6 w-6" />,
    title: 'Material Supply',
    description: 'Source quality construction materials including granite aggregates, stone dust, and sand from verified quarry operations.',
    color: 'bg-primary-50 text-primary-600',
    borderColor: 'hover:border-primary-300',
  },
  {
    icon: <Mountain className="h-6 w-6" />,
    title: 'Quarry Requisition',
    description: 'Submit material requisitions directly to quarry sources. Choose from multiple quarries and material specifications.',
    color: 'bg-info-50 text-info-600',
    borderColor: 'hover:border-info-300',
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Haulage & Transportation',
    description: 'Coordinate truck haulage from quarry to your construction site with reliable fleet management and route optimization.',
    color: 'bg-accent-50 text-accent-700',
    borderColor: 'hover:border-accent-300',
  },
  {
    icon: <Container className="h-6 w-6" />,
    title: 'Loading Coordination',
    description: 'Manage loading schedules, truck assignments, and quarry operations for efficient material dispatch.',
    color: 'bg-warning-50 text-warning-700',
    borderColor: 'hover:border-warning-300',
  },
  {
    icon: <PackageCheck className="h-6 w-6" />,
    title: 'Delivery Management',
    description: 'Track deliveries from dispatch to site arrival. Confirm receipt and manage delivery documentation.',
    color: 'bg-success-50 text-success-600',
    borderColor: 'hover:border-success-300',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Customer Account Management',
    description: 'Manage your account, view transaction history, track invoices and maintain your supply relationship.',
    color: 'bg-neutral-100 text-neutral-600',
    borderColor: 'hover:border-neutral-400',
  },
];

export function ServicesSection() {
  return (
    <section className="section bg-surface-secondary" id="services">
      <div className="container-wide">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="text-label text-primary-600 uppercase tracking-wider mb-2">Our Services</p>
            <h2 className="text-display text-neutral-900 mb-3">
              Complete Supply Chain Coverage
            </h2>
            <p className="text-body-lg text-neutral-500 max-w-2xl mx-auto">
              From quarry sourcing through delivery, every stage of the material supply process is managed on one platform.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, index) => (
            <ScrollReveal key={service.title} delay={index * 0.08}>
              <div
                className={cn(
                  'group bg-white border border-neutral-200 rounded-xl p-6 transition-all duration-300',
                  'hover:shadow-card-hover',
                  service.borderColor
                )}
              >
                <div className={cn('inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4', service.color)}>
                  {service.icon}
                </div>
                <h3 className="text-h4 text-neutral-900 mb-2">{service.title}</h3>
                <p className="text-body text-neutral-500 mb-4 leading-relaxed">
                  {service.description}
                </p>
                <span className="inline-flex items-center gap-1 text-body-sm font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
