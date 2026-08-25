import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Truck, Package, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/motion/fade-in';
import { Parallax } from '@/components/motion/parallax';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-neutral-950">
      {/* Background layers */}
      <div className="absolute inset-0">
        {/* Dark gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-primary-950 to-neutral-950" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Accent glow */}
        <Parallax speed={0.2}>
          <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px]" />
        </Parallax>
        <Parallax speed={0.3}>
          <div className="absolute bottom-1/4 -left-20 w-[400px] h-[400px] bg-accent-400/5 rounded-full blur-[100px]" />
        </Parallax>

        {/* Route lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B6B3A" stopOpacity="0" />
              <stop offset="50%" stopColor="#0B6B3A" stopOpacity="1" />
              <stop offset="100%" stopColor="#FFC107" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,400 Q200,350 400,380 T800,320 T1200,360 T1600,300"
            stroke="url(#route-gradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="8 6"
          />
          <path
            d="M0,500 Q300,450 600,480 T1200,420 T1800,460"
            stroke="url(#route-gradient)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="6 8"
          />
        </svg>
      </div>

      <div className="container-wide relative z-10 pt-24 pb-16 md:pt-28 md:pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="max-w-xl">
            <FadeIn delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-small text-neutral-300 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                Integrated Supply & Logistics Platform
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="text-display-lg md:text-display-xl text-white mb-5">
                Reliable Material Supply.{' '}
                <span className="text-primary-400">Smarter Haulage.</span>{' '}
                <span className="text-neutral-400">One Connected Platform.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.35}>
              <p className="text-body-lg text-neutral-400 mb-8 leading-relaxed max-w-lg">
                Source construction materials, manage requisitions and coordinate delivery from quarry to destination through one streamlined platform.
              </p>
            </FadeIn>

            <FadeIn delay={0.45}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/app/requisitions/new">
                  <Button
                    variant="accent"
                    size="xl"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Request Supply
                  </Button>
                </Link>
                <a href="#services">
                  <Button
                    variant="outline"
                    size="xl"
                    className="border-white/20 text-white hover:bg-white/5 hover:border-white/30"
                  >
                    Explore Services
                  </Button>
                </a>
              </div>
            </FadeIn>
          </div>

          {/* Right: Visual composition */}
          <FadeIn delay={0.5} direction="left" className="hidden lg:block">
            <div className="relative">
              {/* Main card — Delivery tracker mockup */}
              <Parallax speed={0.1}>
                <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-caption text-neutral-500 uppercase tracking-wider mb-1">Active Delivery</p>
                      <p className="text-h4 text-white">REQ-2026-000142</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-500/20 text-primary-300 text-small font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                      In Transit
                    </span>
                  </div>

                  {/* Route visualization */}
                  <div className="flex items-center gap-3 py-4 px-4 bg-white/[0.02] rounded-xl mb-5">
                    <div className="text-center">
                      <MapPin className="h-5 w-5 text-primary-400 mx-auto mb-1" />
                      <p className="text-caption text-neutral-400">Abeokuta</p>
                      <p className="text-caption text-neutral-600">Quarry</p>
                    </div>
                    <div className="flex-1 relative">
                      <div className="h-px bg-neutral-700" />
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2"
                        animate={{ x: ['10%', '80%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      >
                        <Truck className="h-4 w-4 text-accent-400" />
                      </motion.div>
                    </div>
                    <div className="text-center">
                      <MapPin className="h-5 w-5 text-accent-400 mx-auto mb-1" />
                      <p className="text-caption text-neutral-400">Victoria Is.</p>
                      <p className="text-caption text-neutral-600">Lagos</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-caption text-neutral-500 mb-0.5">Material</p>
                      <p className="text-body-sm text-white font-medium">20mm Granite</p>
                    </div>
                    <div>
                      <p className="text-caption text-neutral-500 mb-0.5">Quantity</p>
                      <p className="text-body-sm text-white font-medium">30 tonnes</p>
                    </div>
                    <div>
                      <p className="text-caption text-neutral-500 mb-0.5">Truck</p>
                      <p className="text-body-sm text-white font-medium">ABC-123-XY</p>
                    </div>
                  </div>
                </div>
              </Parallax>

              {/* Floating stat cards */}
              <Parallax speed={-0.15}>
                <div className="absolute -top-6 -right-4 bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                      <Package className="h-4 w-4 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-caption text-neutral-500">Today's Orders</p>
                      <p className="text-h4 text-white tabular-nums">24</p>
                    </div>
                  </div>
                </div>
              </Parallax>

              <Parallax speed={-0.1}>
                <div className="absolute -bottom-4 -left-6 bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent-400/20 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-accent-400" />
                    </div>
                    <div>
                      <p className="text-caption text-neutral-500">Delivery Rate</p>
                      <p className="text-h4 text-white tabular-nums">98.5%</p>
                    </div>
                  </div>
                </div>
              </Parallax>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
