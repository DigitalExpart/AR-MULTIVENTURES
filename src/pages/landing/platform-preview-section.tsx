import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, Package, Receipt, Wallet, Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  { icon: <LayoutDashboard className="h-5 w-5" />, title: 'Customer Dashboard', description: 'Complete overview of orders, deliveries and account status' },
  { icon: <FileText className="h-5 w-5" />, title: 'New Requisition', description: 'Streamlined multi-step order placement' },
  { icon: <Package className="h-5 w-5" />, title: 'Order Tracking', description: 'Real-time status for every order' },
  { icon: <Receipt className="h-5 w-5" />, title: 'Invoices', description: 'Automated invoicing and records' },
  { icon: <Wallet className="h-5 w-5" />, title: 'Account Balance', description: 'Credit management and payments' },
  { icon: <Truck className="h-5 w-5" />, title: 'Delivery Tracking', description: 'Live delivery status and ETAs' },
];

export function PlatformPreviewSection() {
  return (
    <section className="section bg-white">
      <div className="container-wide">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="text-label text-primary-600 uppercase tracking-wider mb-2">Platform</p>
            <h2 className="text-display text-neutral-900 mb-3">
              Your Operations, Connected
            </h2>
            <p className="text-body-lg text-neutral-500 max-w-2xl mx-auto">
              A modern customer portal designed for construction material procurement and logistics management.
            </p>
          </div>
        </ScrollReveal>

        {/* Platform preview card */}
        <ScrollReveal>
          <div className="relative max-w-4xl mx-auto">
            <motion.div
              className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden shadow-elevated"
              whileInView={{ y: [30, 0], opacity: [0.7, 1] }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-neutral-800 rounded-md px-4 py-1 text-caption text-neutral-500 max-w-xs w-full text-center">
                    app.armultiventures.com
                  </div>
                </div>
              </div>

              {/* Mock dashboard UI */}
              <div className="p-6 md:p-8 bg-gradient-to-b from-neutral-900 to-neutral-950">
                {/* Mock header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="h-4 w-40 bg-neutral-700 rounded mb-2" />
                    <div className="h-3 w-56 bg-neutral-800 rounded" />
                  </div>
                  <div className="h-9 w-32 bg-primary-600 rounded-md" />
                </div>

                {/* Mock stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {['₦2.45M', '3', '1', '1'].map((val, i) => (
                    <div key={i} className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700/50">
                      <div className="h-2.5 w-16 bg-neutral-700 rounded mb-2" />
                      <p className="text-h3 text-white tabular-nums">{val}</p>
                    </div>
                  ))}
                </div>

                {/* Mock table */}
                <div className="bg-neutral-800/30 rounded-lg border border-neutral-700/50 p-4">
                  <div className="h-3 w-28 bg-neutral-700 rounded mb-4" />
                  {[1, 2, 3].map((row) => (
                    <div key={row} className="flex items-center gap-4 py-2.5 border-b border-neutral-800/50 last:border-0">
                      <div className="h-2.5 w-24 bg-neutral-700/60 rounded" />
                      <div className="h-2.5 w-20 bg-neutral-700/40 rounded" />
                      <div className="h-2.5 w-16 bg-neutral-700/40 rounded" />
                      <div className="ml-auto h-5 w-16 bg-primary-600/30 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </ScrollReveal>

        {/* Feature grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-10 max-w-3xl mx-auto">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 0.08}>
              <div className="flex items-start gap-3 p-3">
                <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <p className="text-body-sm font-semibold text-neutral-900">{feature.title}</p>
                  <p className="text-small text-neutral-500">{feature.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
