import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { cn } from '@/lib/utils';
import {
  Mountain, Layers, Scale, Truck, MapPin,
  Calculator, Send, CreditCard, Container, Navigation, PackageCheck,
  Check
} from 'lucide-react';

const steps = [
  { icon: <Mountain className="h-5 w-5" />, title: 'Select Quarry', description: 'Choose from verified quarry sources' },
  { icon: <Layers className="h-5 w-5" />, title: 'Choose Material', description: 'Select material type and specification' },
  { icon: <Scale className="h-5 w-5" />, title: 'Enter Quantity', description: 'Specify tonnage required' },
  { icon: <MapPin className="h-5 w-5" />, title: 'Choose Destination', description: 'Set delivery location' },
  { icon: <Calculator className="h-5 w-5" />, title: 'Calculate Cost', description: 'Get instant cost breakdown' },
  { icon: <Send className="h-5 w-5" />, title: 'Submit Requisition', description: 'Place your material order' },
  { icon: <CreditCard className="h-5 w-5" />, title: 'Payment Verification', description: 'Confirm payment or credit' },
  { icon: <Container className="h-5 w-5" />, title: 'Loading', description: 'Material loaded at quarry' },
  { icon: <Truck className="h-5 w-5" />, title: 'Dispatch', description: 'Truck dispatched to destination' },
  { icon: <PackageCheck className="h-5 w-5" />, title: 'Delivery', description: 'Material delivered to site' },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="section bg-white" id="how-it-works">
      <div className="container-wide">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="text-label text-primary-600 uppercase tracking-wider mb-2">How It Works</p>
            <h2 className="text-display text-neutral-900 mb-3">
              From Request to Delivery
            </h2>
            <p className="text-body-lg text-neutral-500 max-w-2xl mx-auto">
              A streamlined process that takes your material requisition from submission through to on-site delivery.
            </p>
          </div>
        </ScrollReveal>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden lg:block">
          <ScrollReveal>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute top-8 left-0 right-0 h-0.5 bg-neutral-200" />
              <motion.div
                className="absolute top-8 left-0 h-0.5 bg-primary-600"
                animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Steps */}
              <div className="grid grid-cols-10 relative">
                {steps.map((step, index) => (
                  <button
                    key={step.title}
                    onClick={() => setActiveStep(index)}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div
                      className={cn(
                        'relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 mb-3',
                        index <= activeStep
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-white border-2 border-neutral-200 text-neutral-400 group-hover:border-primary-300 group-hover:text-primary-600'
                      )}
                    >
                      {index < activeStep ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <p
                      className={cn(
                        'text-caption font-medium text-center transition-colors',
                        index === activeStep ? 'text-primary-600' : 'text-neutral-500'
                      )}
                    >
                      {step.title}
                    </p>
                  </button>
                ))}
              </div>

              {/* Active step detail */}
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-8 text-center"
              >
                <div className="inline-flex items-center gap-3 px-6 py-4 bg-primary-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-primary-600 text-white flex items-center justify-center">
                    {steps[activeStep]?.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-h4 text-neutral-900">{steps[activeStep]?.title}</p>
                    <p className="text-body-sm text-neutral-500">{steps[activeStep]?.description}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="lg:hidden">
          <div className="space-y-0">
            {steps.map((step, index) => (
              <ScrollReveal key={step.title} delay={index * 0.05}>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0 text-body-sm font-bold">
                      {index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-8 bg-primary-200" />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className="text-body font-semibold text-neutral-900">{step.title}</p>
                    <p className="text-body-sm text-neutral-500">{step.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
