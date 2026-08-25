import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { MATERIAL_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const materialImages: Record<string, string> = {};

export function MaterialsSection() {
  return (
    <section className="section bg-surface-secondary" id="materials">
      <div className="container-wide">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="text-label text-primary-600 uppercase tracking-wider mb-2">Materials</p>
            <h2 className="text-display text-neutral-900 mb-3">
              Quality Aggregates & Materials
            </h2>
            <p className="text-body-lg text-neutral-500 max-w-2xl mx-auto">
              Source from a range of crushed granite aggregates, stone dust, and sand products for your construction needs.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {MATERIAL_CATEGORIES.map((material, index) => (
            <ScrollReveal key={material.id} delay={index * 0.06}>
              <div className="group relative bg-white border border-neutral-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:border-neutral-300">
                {/* Material visual */}
                <div className="aspect-[4/3] bg-gradient-to-br from-neutral-100 to-neutral-200 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Textured pattern to represent material */}
                    <div
                      className="w-full h-full opacity-30"
                      style={{
                        backgroundImage: `radial-gradient(circle at 20% 30%, rgba(11,107,58,0.15) 0%, transparent 50%),
                          radial-gradient(circle at 80% 70%, rgba(109,110,113,0.2) 0%, transparent 50%)`,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-kpi-sm text-neutral-400 font-bold">
                        {material.name.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Info */}
                <div className="p-3 sm:p-4">
                  <h3 className="text-body-sm sm:text-body font-semibold text-neutral-900 mb-0.5">
                    {material.name}
                  </h3>
                  <p className="text-caption sm:text-small text-neutral-500 line-clamp-1">
                    {material.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
