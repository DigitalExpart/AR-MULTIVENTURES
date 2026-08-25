import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Mountain, Truck, MapPin, CheckCircle2, Navigation, Clock, ShieldCheck } from 'lucide-react';

export function HaulageSection() {
  return (
    <section className="section bg-neutral-950 text-white overflow-hidden relative" id="haulage">
      {/* Background Subtle Gradient & Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container-wide relative z-10">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-caption font-bold text-accent-400 uppercase tracking-widest px-3 py-1 bg-accent-400/10 rounded-md border border-accent-400/20">
              FLEET & TRANSPORTATION
            </span>
            <h2 className="text-display text-white font-extrabold tracking-tight mt-3 mb-4">
              Direct Haulage Logistics & Delivery Route Management
            </h2>
            <p className="text-body-lg text-neutral-400">
              Coordinated tipper logistics operating from major quarry corridors into metropolitan Lagos, Ogun, Oyo, and interstate projects.
            </p>
          </div>
        </ScrollReveal>

        {/* Animated Haulage Path Sequence */}
        <ScrollReveal>
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 lg:p-10 mb-10 shadow-2xl">
            {/* Visual Step Path */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Point 1: Quarry Hub */}
              <div className="flex flex-col items-center text-center p-4 bg-neutral-950/60 rounded-xl border border-neutral-800">
                <div className="w-14 h-14 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400 mb-3">
                  <Mountain className="h-7 w-7" />
                </div>
                <span className="text-caption font-mono text-primary-400 font-bold uppercase">ORIGIN</span>
                <h4 className="text-h4 font-bold text-white mt-0.5">Quarry Extraction</h4>
                <p className="text-caption text-neutral-400 mt-1">Crushed aggregates weighed & batch loaded</p>
              </div>

              {/* Point 2: Fleet Assignment */}
              <div className="flex flex-col items-center text-center p-4 bg-neutral-950/60 rounded-xl border border-neutral-800">
                <div className="w-14 h-14 rounded-xl bg-accent-400/20 border border-accent-400/30 flex items-center justify-center text-accent-400 mb-3">
                  <Truck className="h-7 w-7" />
                </div>
                <span className="text-caption font-mono text-accent-400 font-bold uppercase">HAULIER</span>
                <h4 className="text-h4 font-bold text-white mt-0.5">Heavy Tipper Fleet</h4>
                <p className="text-caption text-neutral-400 mt-1">30T & 45T heavy-duty Sinotruk & Actros tippers</p>
              </div>

              {/* Point 3: Route Transit */}
              <div className="flex flex-col items-center text-center p-4 bg-neutral-950/60 rounded-xl border border-neutral-800">
                <div className="w-14 h-14 rounded-xl bg-info-500/20 border border-info-500/30 flex items-center justify-center text-info-400 mb-3">
                  <Navigation className="h-7 w-7" />
                </div>
                <span className="text-caption font-mono text-info-400 font-bold uppercase">TRANSIT</span>
                <h4 className="text-h4 font-bold text-white mt-0.5">Monitored Transit</h4>
                <p className="text-caption text-neutral-400 mt-1">GPS route tracking & toll checkpoint timing</p>
              </div>

              {/* Point 4: Site Offloading */}
              <div className="flex flex-col items-center text-center p-4 bg-neutral-950/60 rounded-xl border border-neutral-800">
                <div className="w-14 h-14 rounded-xl bg-success-500/20 border border-success-500/30 flex items-center justify-center text-success-400 mb-3">
                  <MapPin className="h-7 w-7" />
                </div>
                <span className="text-caption font-mono text-success-400 font-bold uppercase">OFFLOAD</span>
                <h4 className="text-h4 font-bold text-white mt-0.5">Destination Site</h4>
                <p className="text-caption text-neutral-400 mt-1">Direct offloading with digital receipt</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800/80">
            <div className="flex items-center gap-2.5 text-accent-400 font-bold text-body-sm mb-2">
              <Clock className="h-4 w-4" />
              <span>Turnaround Guarantee</span>
            </div>
            <p className="text-body-sm text-neutral-400">
              Dedicated loading bays at partner quarries minimize driver waiting times and ensure prompt dispatch.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800/80">
            <div className="flex items-center gap-2.5 text-primary-400 font-bold text-body-sm mb-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Weight & Measure Integrity</span>
            </div>
            <p className="text-body-sm text-neutral-400">
              Every dispatched tipper passes calibrated digital weighbridges with printed tickets before transit.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800/80">
            <div className="flex items-center gap-2.5 text-info-400 font-bold text-body-sm mb-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Safety & Highway Compliance</span>
            </div>
            <p className="text-body-sm text-neutral-400">
              Trained drivers, payload limits adhering to road regulations, and maintained tarpaulin sheeting.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
