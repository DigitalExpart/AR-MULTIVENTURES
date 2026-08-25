import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { cn } from '@/lib/utils';
import {
  Mountain, Layers, Scale, Truck, MapPin,
  Calculator, Send, CreditCard, Container, PackageCheck,
  Check
} from 'lucide-react';

const steps = [
  { step: 1, icon: <Mountain className="h-5 w-5" />, title: 'Select Quarry', description: 'Choose source quarry in Abeokuta, Ishiagu, Ibadan, or Sagamu.' },
  { step: 2, icon: <Layers className="h-5 w-5" />, title: 'Choose Material', description: 'Select granite grading (3/4", 1/2", 10mm, 20mm, 30mm) or dust.' },
  { step: 3, icon: <Scale className="h-5 w-5" />, title: 'Enter Quantity', description: 'Specify required tonnage (minimum 10 tonnes per order).' },
  { step: 4, icon: <MapPin className="h-5 w-5" />, title: 'Set Destination', description: 'Enter construction site address, landmark, and receiving contact.' },
  { step: 5, icon: <Calculator className="h-5 w-5" />, title: 'Calculate Cost', description: 'Receive transparent breakdown of material, loading, and haulage.' },
  { step: 6, icon: <Send className="h-5 w-5" />, title: 'Submit Requisition', description: 'Submit order for rapid dispatch and operations scheduling.' },
  { step: 7, icon: <CreditCard className="h-5 w-5" />, title: 'Payment / Credit', description: 'Instant payment confirmation or account credit authorization.' },
  { step: 8, icon: <Container className="h-5 w-5" />, title: 'Quarry Loading', description: 'Automated loading slot assignment and weighbridge verification.' },
  { step: 9, icon: <Truck className="h-5 w-5" />, title: 'Fleet Dispatch', description: 'Heavy tipper en route with real-time transit visibility.' },
  { step: 10, icon: <PackageCheck className="h-5 w-5" />, title: 'Site Delivery', description: 'Material offloaded at site with digital weighbridge sign-off.' },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="section bg-white" id="how-it-works">
      <div className="container-wide">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-caption font-bold text-primary-700 uppercase tracking-widest px-3 py-1 bg-primary-50 rounded-md border border-primary-200">
              OPERATIONAL WORKFLOW
            </span>
            <h2 className="text-display text-neutral-900 font-extrabold tracking-tight mt-3 mb-4">
              10-Stage Requisition & Haulage Sequence
            </h2>
            <p className="text-body-lg text-neutral-600">
              From your initial digital requisition to final site weighbridge sign-off, every stage is tracked with precision.
            </p>
          </div>
        </ScrollReveal>

        {/* Desktop Interactive Process Sequence */}
        <div className="hidden lg:block">
          <ScrollReveal>
            <div className="relative mb-8">
              {/* Progress Line */}
              <div className="absolute top-7 left-6 right-6 h-0.5 bg-neutral-200" />
              <motion.div
                className="absolute top-7 left-6 h-0.5 bg-primary-600"
                animate={{ width: `${((activeStep + 0.5) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />

              {/* Steps Indicator Nodes */}
              <div className="grid grid-cols-10 relative">
                {steps.map((item, index) => (
                  <button
                    key={item.title}
                    onClick={() => setActiveStep(index)}
                    className="flex flex-col items-center group cursor-pointer text-center px-1"
                  >
                    <div
                      className={cn(
                        'relative z-10 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200 mb-2.5',
                        index === activeStep
                          ? 'bg-primary-600 text-white ring-4 ring-primary-100 shadow-md scale-105'
                          : index < activeStep
                            ? 'bg-primary-700 text-white'
                            : 'bg-white border-2 border-neutral-300 text-neutral-500 group-hover:border-primary-400 group-hover:text-primary-600'
                      )}
                    >
                      {index < activeStep ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        item.icon
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-caption font-semibold transition-colors line-clamp-1',
                        index === activeStep ? 'text-primary-700' : 'text-neutral-600'
                      )}
                    >
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Step Highlight Card */}
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-neutral-900 text-white rounded-xl p-6 max-w-2xl mx-auto border border-neutral-800 shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-600/30 border border-primary-500/30 text-primary-400 flex items-center justify-center shrink-0">
                  {steps[activeStep]?.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-caption font-mono uppercase text-accent-400 font-bold">
                      STAGE {steps[activeStep]?.step} OF 10
                    </span>
                    <span className="text-neutral-500">·</span>
                    <span className="text-caption text-neutral-400">AR Multiventures Workflow</span>
                  </div>
                  <h3 className="text-h4 font-bold text-white mt-0.5">{steps[activeStep]?.title}</h3>
                  <p className="text-body-sm text-neutral-300 mt-1">{steps[activeStep]?.description}</p>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>

        {/* Mobile Vertical Sequence */}
        <div className="lg:hidden space-y-3">
          {steps.map((item, index) => (
            <ScrollReveal key={item.title} delay={index * 0.03}>
              <div className="flex gap-3.5 p-4 rounded-xl border border-neutral-200 bg-white">
                <div className="w-9 h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center shrink-0 font-bold text-body-sm">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-body font-bold text-neutral-900">{item.title}</h4>
                  <p className="text-body-sm text-neutral-600 mt-0.5">{item.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
