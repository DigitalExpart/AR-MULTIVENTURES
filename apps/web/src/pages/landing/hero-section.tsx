import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Truck, Shield, Navigation, Compass, Layers, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/motion/fade-in';
import { Parallax } from '@/components/motion/parallax';

export function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-neutral-950 pt-20 pb-16 lg:pt-24 lg:pb-20">
      {/* Background Architectural Grid & Subtle Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Layer 1: Dark Slate Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950" />

        {/* Layer 2: Precision Engineering Grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Layer 3: Organic Industrial Glows */}
        <div className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-primary-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-accent-400/10 rounded-full blur-[120px]" />

        {/* Layer 4: Animated Coordinate Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hero-route-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B6B3A" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#0B6B3A" stopOpacity="1" />
              <stop offset="100%" stopColor="#FFC107" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <path
            d="M50,600 C250,550 450,420 700,480 S1100,280 1500,320"
            stroke="url(#hero-route-glow)"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="10 8"
          />
        </svg>
      </div>

      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Editorial Copy & CTAs (7 cols) */}
          <div className="lg:col-span-7 max-w-2xl">
            <FadeIn delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.06] border border-white/10 text-caption font-semibold text-neutral-300 mb-6 tracking-wide">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
                </span>
                <span>INTEGRATED GRANITE SUPPLY & FLEET HAULAGE</span>
                <span className="text-neutral-500">|</span>
                <span className="text-accent-400 font-mono text-[11px]">NIGERIA OPERATIONS</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="text-display-lg md:text-display-xl text-white font-extrabold tracking-tight leading-[1.08] mb-6">
                Reliable Material Supply.<br />
                <span className="text-primary-400">Smarter Haulage.</span><br />
                <span className="text-neutral-400">One Connected Platform.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="text-body-lg text-neutral-300/90 mb-8 leading-relaxed max-w-xl font-normal">
                Source high-grade construction aggregates, manage multi-tonnage requisitions, and coordinate real-time dispatch from certified quarry sources directly to your project destination.
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-10">
                <Link to="/app/requisitions/new">
                  <Button
                    variant="accent"
                    size="xl"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    className="w-full sm:w-auto font-bold shadow-lg shadow-accent-400/10 text-neutral-950"
                  >
                    Request Supply Now
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button
                    variant="outline"
                    size="xl"
                    className="w-full sm:w-auto border-neutral-700 bg-neutral-900/60 text-neutral-200 hover:bg-neutral-800 hover:text-white hover:border-neutral-600"
                  >
                    How Sourcing Works
                  </Button>
                </a>
              </div>
            </FadeIn>

            {/* Quick Operational Metrics Overlay */}
            <FadeIn delay={0.5}>
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-800/80">
                <div>
                  <p className="text-caption text-neutral-400 uppercase font-semibold">Quarry Hubs</p>
                  <p className="text-h3 text-white font-bold tracking-tight">4 Regional</p>
                  <p className="text-[11px] text-neutral-400">Abeokuta, Ishiagu, Oyo, Ogun</p>
                </div>
                <div>
                  <p className="text-caption text-neutral-400 uppercase font-semibold">Tonnage Handled</p>
                  <p className="text-h3 text-white font-bold tracking-tight">10T — 5,000T+</p>
                  <p className="text-[11px] text-neutral-400">Bulk structural orders</p>
                </div>
                <div>
                  <p className="text-caption text-neutral-400 uppercase font-semibold">Haulage Fleet</p>
                  <p className="text-h3 text-white font-bold tracking-tight">30T & 45T</p>
                  <p className="text-[11px] text-neutral-400">Dedicated heavy tippers</p>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right Column: Layered Logistics Operational Card (5 cols) */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <FadeIn delay={0.35} direction="left">
              {/* Main Dimensional Card */}
              <div className="relative bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-xl p-6 shadow-2xl">
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-neutral-800">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600/30 text-primary-400 border border-primary-500/30">
                      <Navigation className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">LIVE REQUISITION TRACKING</p>
                      <p className="text-body-sm font-bold text-white">REQ-2026-000142</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-500/20 text-primary-300 text-caption font-semibold border border-primary-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                    DISPATCHED
                  </span>
                </div>

                {/* Integrated Route Graphic */}
                <div className="bg-neutral-950/80 rounded-lg p-4 border border-neutral-800/80 mb-5 relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    {/* Origin */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-primary-400 tracking-wider">SOURCE QUARRY</span>
                      <p className="text-body-sm font-bold text-white">Abeokuta North</p>
                      <p className="text-[11px] font-mono text-neutral-400">7.1475° N, 3.3619° E</p>
                    </div>

                    {/* Mid Route Tracker */}
                    <div className="flex-1 px-4 text-center">
                      <div className="relative flex items-center justify-center">
                        <div className="w-full h-0.5 bg-neutral-700" />
                        <motion.div
                          className="absolute bg-accent-400 text-neutral-950 p-1.5 rounded-full shadow-md"
                          animate={{ x: [-15, 15, -15] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <Truck className="h-3.5 w-3.5" />
                        </motion.div>
                      </div>
                      <p className="text-[10px] text-accent-400 font-medium mt-2">En Route via Lagos-Ibadan Exp.</p>
                    </div>

                    {/* Destination */}
                    <div className="space-y-1 text-right">
                      <span className="text-[10px] uppercase font-bold text-accent-400 tracking-wider">DESTINATION</span>
                      <p className="text-body-sm font-bold text-white">Lekki Phase 1</p>
                      <p className="text-[11px] font-mono text-neutral-400">6.4281° N, 3.4219° E</p>
                    </div>
                  </div>
                </div>

                {/* Material & Haulage Specifications Grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-neutral-950/50 p-3 rounded-lg border border-neutral-800/60">
                    <p className="text-[10px] uppercase font-medium text-neutral-400">Material Specification</p>
                    <p className="text-body-sm font-bold text-white mt-0.5">20mm Granite Aggregate</p>
                    <p className="text-[11px] text-neutral-400">30 Tonnes (Single Tipper)</p>
                  </div>
                  <div className="bg-neutral-950/50 p-3 rounded-lg border border-neutral-800/60">
                    <p className="text-[10px] uppercase font-medium text-neutral-400">Assigned Fleet</p>
                    <p className="text-body-sm font-bold text-white mt-0.5">Howo Sinotruk 371</p>
                    <p className="text-[11px] text-neutral-400">Reg: KJA-842-XY</p>
                  </div>
                </div>

                {/* Weighbridge Verification Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-caption">
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success-400" />
                    <span>Automated Weighbridge Verified</span>
                  </div>
                  <span className="font-mono text-neutral-400">ETA: 6:30 PM Today</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
