import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { MATERIAL_PRODUCTS } from '@ar-multiventures/config';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MaterialsSection() {
  return (
    <section className="section bg-surface-secondary border-b border-neutral-200/80" id="materials">
      <div className="container-wide">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-caption font-bold text-primary-700 uppercase tracking-widest px-3 py-1 bg-primary-50 rounded-md border border-primary-200">
              MATERIAL SPECIFICATIONS
            </span>
            <h2 className="text-display text-neutral-900 font-extrabold tracking-tight mt-3 mb-4">
              Certified Granite Aggregates & Quarry Materials
            </h2>
            <p className="text-body-lg text-neutral-600">
              Laboratory-tested aggregates with high compressive strength, optimal grading, and low flakiness indices for high-spec engineering concrete.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MATERIAL_PRODUCTS.map((material, index) => (
            <ScrollReveal key={material.id} delay={index * 0.05}>
              <div className="group h-full flex flex-col justify-between bg-white border border-neutral-200 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:border-neutral-300">
                <div>
                  {/* Visual Texture Header with Industrial Theme */}
                  <div className="h-32 bg-neutral-900 relative p-4 flex flex-col justify-between overflow-hidden">
                    {/* Pattern Overlay */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `radial-gradient(#6D6E71 1.5px, transparent 1.5px)`,
                        backgroundSize: '12px 12px',
                      }}
                    />
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="font-mono text-caption font-bold px-2 py-0.5 rounded bg-white/10 text-neutral-200 border border-white/10">
                        {material.code}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-accent-400">
                        {material.category.toUpperCase()}
                      </span>
                    </div>

                    <div className="relative z-10">
                      <p className="text-caption text-neutral-400">{material.specification}</p>
                      <p className="text-h4 text-white font-bold tracking-tight">{material.name}</p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5">
                    <p className="text-body-sm text-neutral-600 leading-relaxed mb-4">
                      {material.description}
                    </p>

                    <div className="space-y-2 text-caption font-medium text-neutral-700">
                      <div className="flex items-center gap-1.5 text-neutral-600">
                        <Check className="h-3.5 w-3.5 text-primary-600 shrink-0" />
                        <span>Certified Sieve Analysis</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-600">
                        <Check className="h-3.5 w-3.5 text-primary-600 shrink-0" />
                        <span>Supplied in 30T / 45T Tippers</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link to="/app/requisitions/new">
                    <button className="w-full py-2 px-3 text-body-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors flex items-center justify-center gap-1">
                      <span>Order Specification</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
