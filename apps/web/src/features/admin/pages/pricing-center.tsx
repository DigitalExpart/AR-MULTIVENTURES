import { Link } from 'react-router-dom';
import {
  Coins, Truck, BadgePercent, Sparkles, Percent,
  ArrowRight, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';

export function AdminPricingCenterPage() {
  const pricingCards = [
    {
      title: 'Quarry Material Prices',
      description: 'Base sourcing aggregate rates per tonne across certified quarries with historical effective dates.',
      href: '/admin/pricing/materials',
      icon: Coins,
      badge: 'Core Pricing',
    },
    {
      title: 'Heavy Fleet Haulage Tariffs',
      description: 'Logistics freight matrices per trip and per tonne by quarry, destination corridor, and vehicle classification.',
      href: '/admin/pricing/haulage',
      icon: Truck,
      badge: 'Transport',
    },
    {
      title: 'Customer Negotiated Rates',
      description: 'Client-specific corporate price overrides taking top precedence in the commercial pricing engine.',
      href: '/admin/pricing/customers',
      icon: BadgePercent,
      badge: 'Contracts',
    },
    {
      title: 'Promotional Campaigns',
      description: 'Temporary date-bounded aggregate discounts and promotional tariffs for regional stimulus campaigns.',
      href: '/admin/pricing/promotions',
      icon: Sparkles,
      badge: 'Campaigns',
    },
    {
      title: 'Volume Discounts & Fuel Surcharge',
      description: 'Automated tonnage bulk tier discount rules and macroeconomic logistics fuel adjustment surcharges.',
      href: '/admin/pricing/discounts',
      icon: Percent,
      badge: 'Rules & Fuel',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Commercial Pricing Control Center"
        description="Unified commercial tariff administration, precedence rules, and financial rate management."
        breadcrumbs={[{ label: 'Admin Command', href: '/admin' }, { label: 'Pricing Center' }]}
      />

      {/* Precedence Hierarchy Information Notice */}
      <Card padding="md" className="bg-primary-50/50 border-primary-200 shadow-2xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-body-sm font-bold text-primary-950">
              Commercial Engine Precedence Architecture
            </h4>
            <p className="text-caption text-primary-900 leading-relaxed">
              Material rates are evaluated strictly in order: <strong>1. Customer Negotiated Rate</strong> → <strong>2. Active Campaign Promotion</strong> → <strong>3. Standard Quarry Rate</strong>. Haulage evaluates exact quarry-to-destination truck tariffs. Financial calculations execute in PostgreSQL with immutable commercial snapshots.
            </p>
          </div>
        </div>
      </Card>

      {/* Pricing Navigation Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {pricingCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} padding="md" className="bg-white border-neutral-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                    {card.badge}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-950 text-body">{card.title}</h4>
                  <p className="text-caption text-neutral-600 mt-1">{card.description}</p>
                </div>
              </div>

              <Link to={card.href} className="pt-2 border-t border-neutral-100">
                <Button variant="ghost" size="sm" className="w-full justify-between font-bold text-primary-700 hover:text-primary-800">
                  <span>Manage Rates</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
