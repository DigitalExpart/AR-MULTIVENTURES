import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, Package, Receipt, Wallet, Truck, Check, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function PlatformPreviewSection() {
  return (
    <section className="section bg-white border-b border-neutral-200/80">
      <div className="container-wide">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-caption font-bold text-primary-700 uppercase tracking-widest px-3 py-1 bg-primary-50 rounded-md border border-primary-200">
              ENTERPRISE CUSTOMER PORTAL
            </span>
            <h2 className="text-display text-neutral-900 font-extrabold tracking-tight mt-3 mb-4">
              A Complete Digital Command Center for Material Procurement
            </h2>
            <p className="text-body-lg text-neutral-600">
              Say goodbye to fragmented phone calls, untracked drivers, and paper receipts. Control your multi-site granite supply on one unified portal.
            </p>
          </div>
        </ScrollReveal>

        {/* Product Showcase Window */}
        <ScrollReveal>
          <div className="max-w-5xl mx-auto rounded-2xl border border-neutral-300 bg-neutral-950 p-2 shadow-2xl overflow-hidden mb-12">
            {/* Top Window Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 rounded-t-xl">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-error-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-warning-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-success-500/80 inline-block" />
              </div>
              <div className="px-4 py-0.5 rounded bg-neutral-800 text-caption font-mono text-neutral-400 text-xs">
                https://portal.armultiventures.com/app
              </div>
              <div className="w-12" />
            </div>

            {/* Dashboard Mockup Display */}
            <div className="p-6 md:p-8 bg-neutral-900 text-white rounded-b-xl">
              {/* Top Greeting */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-neutral-800">
                <div>
                  <h3 className="text-h3 font-bold text-white">Good morning, Adebayo (BuildCorp Nigeria)</h3>
                  <p className="text-body-sm text-neutral-400">Account Balance: <span className="text-success-400 font-semibold font-mono">₦2,450,000.00</span> | Active Requisitions: <span className="text-white font-semibold">4 Orders</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-primary-600/30 text-primary-400 border border-primary-500/30 text-caption font-bold">
                    + NEW REQUISITION
                  </span>
                </div>
              </div>

              {/* 4 KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800">
                  <p className="text-caption text-neutral-400 font-medium">Account Balance</p>
                  <p className="text-h4 font-bold text-white font-mono mt-1">₦2,450,000</p>
                  <p className="text-[11px] text-success-400 mt-1">Active Credit Line</p>
                </div>
                <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800">
                  <p className="text-caption text-neutral-400 font-medium">Outstanding Orders</p>
                  <p className="text-h4 font-bold text-white font-mono mt-1">4 Requisitions</p>
                  <p className="text-[11px] text-neutral-400 mt-1">2 Sourced, 2 Pending</p>
                </div>
                <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800">
                  <p className="text-caption text-neutral-400 font-medium">Orders in Transit</p>
                  <p className="text-h4 font-bold text-accent-400 font-mono mt-1">2 Tippers</p>
                  <p className="text-[11px] text-accent-400 mt-1">En Route to Lagos</p>
                </div>
                <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800">
                  <p className="text-caption text-neutral-400 font-medium">Pending Invoices</p>
                  <p className="text-h4 font-bold text-white font-mono mt-1">₦780,000</p>
                  <p className="text-[11px] text-warning-400 mt-1">1 Awaiting Payment</p>
                </div>
              </div>

              {/* Live Delivery Preview Box */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-600/30 text-primary-400 flex items-center justify-center shrink-0">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-body-sm font-bold text-white">Order REQ-2026-000142</p>
                      <span className="px-2 py-0.5 rounded bg-primary-500/20 text-primary-300 text-caption font-bold">DISPATCHED</span>
                    </div>
                    <p className="text-caption text-neutral-400">30 Tonnes 20mm Granite | Abeokuta Quarry → Lekki Coastal Site</p>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-caption font-mono text-accent-400 font-semibold">Truck: KJA-842-XY (Sinotruk)</p>
                  <p className="text-[11px] text-neutral-400">Driver: Chukwudi Nwankwo</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Feature Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-body font-bold text-neutral-900">Multi-Site Project Routing</h4>
              <p className="text-body-sm text-neutral-600 mt-0.5">Route requisitions to multiple ongoing project sites with customized billing.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-body font-bold text-neutral-900">Digital Weighbridge Slips</h4>
              <p className="text-body-sm text-neutral-600 mt-0.5">Instant access to digital weigh tickets for every delivery batch.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-body font-bold text-neutral-900">Automated Billing & Tax Invoicing</h4>
              <p className="text-body-sm text-neutral-600 mt-0.5">Download itemized invoices with instant payment confirmation receipts.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
