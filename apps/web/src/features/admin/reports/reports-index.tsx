import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  Building2,
  Layers,
  MapPin,
  Truck,
  Scale,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { ReportDateSelector } from '@/components/reports/report-date-selector';
import { getDateRangeForPeriod } from '@ar-multiventures/business-logic';
import type { DateRangeFilter } from '@ar-multiventures/types';

interface ReportCardItem {
  title: string;
  description: string;
  href: string;
  icon: any;
  category: 'COMMERCIAL' | 'LOGISTICS' | 'FINANCE' | 'GOVERNANCE';
  kpi?: string;
  kpiLabel?: string;
}

const REPORT_CATALOG: ReportCardItem[] = [
  // Commercial
  {
    title: 'Sales & Revenue Performance',
    description: 'Order values, approved sales, material distribution, top clients, and daily/monthly trends.',
    href: '/admin/reports/sales',
    icon: TrendingUp,
    category: 'COMMERCIAL',
    kpi: '₦58.45M',
    kpiLabel: 'Total Sales Value',
  },
  {
    title: 'Customer Volumes & Rates',
    description: 'Order frequency, volume metrics, total spend, credit utilization, and last order dates.',
    href: '/admin/reports/customers',
    icon: Users,
    category: 'COMMERCIAL',
    kpi: '14 Clients',
    kpiLabel: 'Active Accounts',
  },
  {
    title: 'Material Volume & Pricing',
    description: 'Granite sizes sold, loaded, delivered, unit prices, and revenue breakdown by aggregate category.',
    href: '/admin/reports/materials',
    icon: Layers,
    category: 'COMMERCIAL',
    kpi: '4,850 T',
    kpiLabel: 'Aggregate Volume',
  },

  // Logistics & Fleet
  {
    title: 'Quarry Production & Loading',
    description: 'Tonnage loaded per quarry, scale variance tolerances, loading bay speeds, and offload outputs.',
    href: '/admin/reports/quarries',
    icon: Building2,
    category: 'LOGISTICS',
    kpi: '+0.12T',
    kpiLabel: 'Avg Scale Variance',
  },
  {
    title: 'Destination Corridors',
    description: 'Haulage routes, transit cycle durations, corridor revenue, and delivery exception rates.',
    href: '/admin/reports/destinations',
    icon: MapPin,
    category: 'LOGISTICS',
    kpi: '65 Trips',
    kpiLabel: 'Lekki Corridor',
  },
  {
    title: 'Haulage Tariff Revenue',
    description: 'Haulage earnings per trip, route earnings, and vehicle type freight distribution.',
    href: '/admin/reports/haulage',
    icon: Truck,
    category: 'LOGISTICS',
    kpi: '₦18.25M',
    kpiLabel: 'Haulage Revenue',
  },
  {
    title: 'Loading Bay & Weighbridge',
    description: 'Weighbridge tickets, gross vs tare calculations, net tonnage, and overload alerts.',
    href: '/admin/reports/loading',
    icon: Scale,
    category: 'LOGISTICS',
    kpi: '100%',
    kpiLabel: 'Scale Verified',
  },
  {
    title: 'Fleet Utilization & Maintenance',
    description: 'Truck availability, active trip cycle time, maintenance downtime, and servicing costs.',
    href: '/admin/reports/fleet',
    icon: Truck,
    category: 'LOGISTICS',
    kpi: '79.5%',
    kpiLabel: 'Fleet Utilization',
  },
  {
    title: 'Driver Deliveries & Safety',
    description: 'Assigned missions, delivered tonnage, POD completion rates, and license expirations.',
    href: '/admin/reports/drivers',
    icon: Users,
    category: 'LOGISTICS',
    kpi: '98.9%',
    kpiLabel: 'POD Success',
  },
  {
    title: 'Trip Delivery Performance',
    description: 'End-to-end trip cycles, transit durations, offload timestamps, and receiver signoffs.',
    href: '/admin/reports/deliveries',
    icon: Clock,
    category: 'LOGISTICS',
    kpi: '4.8h',
    kpiLabel: 'Avg Transit Time',
  },

  // Finance & Receivables
  {
    title: 'Financial & Collections Overview',
    description: 'Invoiced totals, confirmed collections, unallocated deposits, and payment channels.',
    href: '/admin/reports/finance',
    icon: DollarSign,
    category: 'FINANCE',
    kpi: '₦46.20M',
    kpiLabel: 'Cash Collected',
  },
  {
    title: 'Customer Receivables Aging',
    description: 'Deterministic aging buckets: Current, 1–30, 31–60, 61–90, and 90+ days overdue.',
    href: '/admin/reports/receivables',
    icon: FileSpreadsheet,
    category: 'FINANCE',
    kpi: '₦12.25M',
    kpiLabel: 'Outstanding Total',
  },
  {
    title: 'Payments & Bank Reconciliation',
    description: 'Paystack gateway transactions, direct NIP bank transfers, and confirmed electronic receipts.',
    href: '/admin/reports/payments',
    icon: CheckCircle2,
    category: 'FINANCE',
    kpi: '₦28.4M',
    kpiLabel: 'Paystack Volume',
  },

  // Governance
  {
    title: 'Order Cancellations & Rejections',
    description: 'Cancelled requisitions, root cause reasons, financial impact, and approving officers.',
    href: '/admin/reports/cancellations',
    icon: AlertTriangle,
    category: 'GOVERNANCE',
    kpi: '2 Orders',
    kpiLabel: 'Cancelled',
  },
];

export function AdminReportsIndexPage() {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>(getDateRangeForPeriod('this_month'));
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredReports = REPORT_CATALOG.filter((r) =>
    categoryFilter === 'ALL' ? true : r.category === categoryFilter
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Management Intelligence & Reports Center"
          description="Enterprise analytics, operational haulage audits, receivables aging, loading variance metrics, and CSV/PDF export generation."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Reports' },
          ]}
        />

        <ReportDateSelector value={dateFilter} onChange={setDateFilter} />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl overflow-x-auto max-w-fit">
        {[
          { id: 'ALL', label: 'All Reports (14)' },
          { id: 'COMMERCIAL', label: 'Commercial & Sales' },
          { id: 'LOGISTICS', label: 'Logistics & Fleet' },
          { id: 'FINANCE', label: 'Finance & Receivables' },
          { id: 'GOVERNANCE', label: 'Governance & Exceptions' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-caption font-bold transition-all ${
              categoryFilter === tab.id
                ? 'bg-white text-primary-950 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-primary-700 hover:shadow-md transition-all flex flex-col justify-between group block"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center font-bold group-hover:bg-primary-900 group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  {item.kpi && (
                    <div className="text-right font-mono">
                      <span className="text-body-sm font-black text-neutral-950 block">{item.kpi}</span>
                      <span className="text-[10px] text-neutral-400 uppercase font-sans">{item.kpiLabel}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-body font-bold text-neutral-950 group-hover:text-primary-800 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-caption text-neutral-500 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-caption font-bold text-primary-800">
                <span>View Full Report & Export</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
