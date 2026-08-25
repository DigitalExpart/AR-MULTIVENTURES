import { Percent, Fuel, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';

export function AdminDiscountsFuelPage() {
  const discountTiers = [
    {
      name: 'Tier 1 Bulk Contractor Discount',
      minTonnage: 60,
      discountType: 'PERCENTAGE',
      value: '3.0%',
      scope: 'All Granite Aggregates',
      status: 'ACTIVE',
    },
    {
      name: 'Tier 2 Mega Infrastructure Discount',
      minTonnage: 100,
      discountType: 'PERCENTAGE',
      value: '5.0%',
      scope: 'All Granite Aggregates',
      status: 'ACTIVE',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Volume Bulk Discounts & Fuel Adjustment Surcharges"
        description="Automated tonnage threshold discount rules and macroeconomic logistics fuel adjustment surcharges."
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin' },
          { label: 'Pricing Center', href: '/admin/pricing' },
          { label: 'Discounts & Fuel' },
        ]}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Volume Discount Tiers */}
        <Card padding="md" className="bg-white border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-neutral-200">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center border border-primary-200">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-neutral-950 text-body">Volume Bulk Discount Tiers</h4>
              <p className="text-caption text-neutral-500">Automatically evaluated during server-side pricing quote.</p>
            </div>
          </div>

          <div className="space-y-3">
            {discountTiers.map((tier) => (
              <div key={tier.name} className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 text-body-sm">{tier.name}</span>
                  <span className="font-mono font-bold text-emerald-800 text-body-sm">{tier.value} Off</span>
                </div>
                <div className="flex items-center justify-between text-caption text-neutral-600">
                  <span>Minimum Threshold: <strong className="font-mono">{tier.minTonnage} Tonnes</strong></span>
                  <span className="font-bold uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px]">
                    {tier.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Fuel Adjustment Surcharge */}
        <Card padding="md" className="bg-white border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-neutral-200">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
              <Fuel className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-neutral-950 text-body">Logistics Fuel Adjustment Surcharge</h4>
              <p className="text-caption text-neutral-500">Applied strictly to heavy fleet haulage tariffs.</p>
            </div>
          </div>

          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-bold text-amber-950">Current Logistics Surcharge Rate</span>
              <span className="text-h3 font-black text-amber-900 font-mono">+2.50%</span>
            </div>
            <p className="text-caption text-amber-800">
              Quarterly macroeconomic diesel price adjustment configured by executive management. Applied directly to the freight haulage portion of supply-and-haulage orders.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
