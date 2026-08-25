import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Mountain, Truck, Navigation, MapPin, ArrowRight } from 'lucide-react';

export function HaulageSection() {
  return (
    <section className="section bg-neutral-950 text-white overflow-hidden" id="haulage">
      <div className="container-wide">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="text-label text-primary-400 uppercase tracking-wider mb-2">Haulage</p>
            <h2 className="text-display text-white mb-3">
              Quarry to Destination
            </h2>
            <p className="text-body-lg text-neutral-400 max-w-2xl mx-auto">
              Reliable material transportation across routes with real-time tracking and coordinated logistics.
            </p>
          </div>
        </ScrollReveal>

        {/* Route Visualization */}
        <ScrollReveal>
          <div className="relative max-w-3xl mx-auto py-12">
            {/* Route line */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2">
              <svg className="w-full h-20" viewBox="0 0 800 80" fill="none" preserveAspectRatio="none">
                <path
                  d="M0,40 C100,40 150,15 250,20 S400,60 500,40 S650,15 800,40"
                  stroke="#1a3a2a"
                  strokeWidth="3"
                  fill="none"
                />
                <motion.path
                  d="M0,40 C100,40 150,15 250,20 S400,60 500,40 S650,15 800,40"
                  stroke="#0B6B3A"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="12 8"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                  viewport={{ once: true }}
                />
              </svg>
            </div>

            {/* Nodes */}
            <div className="relative flex items-center justify-between">
              {/* Quarry */}
              <ScrollReveal delay={0.2}>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary-600/20 border border-primary-600/30 flex items-center justify-center mb-3">
                    <Mountain className="h-7 w-7 text-primary-400" />
                  </div>
                  <p className="text-body-sm font-semibold text-white">Quarry</p>
                  <p className="text-caption text-neutral-500">Source</p>
                </div>
              </ScrollReveal>

              {/* Truck in motion */}
              <ScrollReveal delay={0.5}>
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 rounded-2xl bg-accent-400/20 border border-accent-400/30 flex items-center justify-center mb-3"
                  >
                    <Truck className="h-7 w-7 text-accent-400" />
                  </motion.div>
                  <p className="text-body-sm font-semibold text-white">In Transit</p>
                  <p className="text-caption text-neutral-500">En Route</p>
                </div>
              </ScrollReveal>

              {/* Destination */}
              <ScrollReveal delay={0.8}>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-success-600/20 border border-success-600/30 flex items-center justify-center mb-3">
                    <MapPin className="h-7 w-7 text-success-400" />
                  </div>
                  <p className="text-body-sm font-semibold text-white">Destination</p>
                  <p className="text-caption text-neutral-500">Delivery Site</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </ScrollReveal>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          {[
            { title: 'Route Planning', description: 'Optimized routes from quarry to construction sites across major highways.' },
            { title: 'Fleet Coordination', description: 'Managed truck assignments with capacity planning and scheduling.' },
            { title: 'Delivery Tracking', description: 'Real-time status updates from dispatch through to site delivery.' },
          ].map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 0.1}>
              <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <h4 className="text-body font-semibold text-white mb-2">{feature.title}</h4>
                <p className="text-body-sm text-neutral-400">{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
