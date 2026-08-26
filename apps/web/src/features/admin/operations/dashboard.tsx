import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Send,
  Scale,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Building2,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { deliveryApi, fleetApi } from '@ar-multiventures/api';
import type { OperationsDashboardKPIs, DeliveryTripRecord } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

export function AdminOperationsDashboardPage() {
  const [kpis, setKpis] = useState<OperationsDashboardKPIs>({
    scheduledTripsToday: 0,
    trucksAtQuarry: 0,
    activeLoadingCount: 0,
    dispatchedInTransit: 0,
    completedDeliveriesToday: 0,
    tonnesDeliveredToday: 0,
    activeExceptionsCount: 0,
  });

  const [activeTrips, setActiveTrips] = useState<DeliveryTripRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [kpiData, tripsData] = await Promise.all([
        deliveryApi.getOperationsKPIs(),
        deliveryApi.getTrips(),
      ]);
      setKpis(kpiData);
      setActiveTrips(tripsData);
    } catch (err) {
      console.error('Failed to load operations dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Logistics Operations Command Center"
          description="Real-time multi-trip logistics tracking, heavy fleet dispatch, quarry weighbridge clearance, and Proof of Delivery (POD) monitoring."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin' },
            { label: 'Operations' },
          ]}
        />

        <div className="flex items-center gap-2">
          <Link to="/admin/operations/dispatch">
            <Button variant="primary" size="sm" className="font-bold shadow-2xs">
              Open Dispatch Board
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-mono font-bold uppercase">Scheduled</span>
            <Clock className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="text-h3 font-black text-neutral-900 font-mono">
            {kpis.scheduledTripsToday}
          </div>
          <span className="text-[11px] text-neutral-400">Trips Queued</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-mono font-bold uppercase">At Quarry</span>
            <Building2 className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-h3 font-black text-amber-900 font-mono">
            {kpis.trucksAtQuarry}
          </div>
          <span className="text-[11px] text-amber-700">In Loading Queue</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-[11px] font-mono font-bold uppercase">Loading</span>
            <Scale className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-h3 font-black text-blue-950 font-mono">
            {kpis.activeLoadingCount}
          </div>
          <span className="text-[11px] text-blue-700">At Hoppers</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-[11px] font-mono font-bold uppercase">In Transit</span>
            <Truck className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-h3 font-black text-purple-950 font-mono">
            {kpis.dispatchedInTransit}
          </div>
          <span className="text-[11px] text-purple-700">En Route to Site</span>
        </Card>

        <Card className="bg-white border-neutral-200 p-4 space-y-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-mono font-bold uppercase">Delivered</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-h3 font-black text-emerald-900 font-mono">
            {kpis.completedDeliveriesToday}
          </div>
          <span className="text-[11px] text-emerald-700">Verified POD</span>
        </Card>

        <Card className="bg-emerald-50 border-emerald-200 p-4 space-y-1">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-mono font-bold uppercase">Tonnes Today</span>
            <TrendingUp className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="text-h3 font-black text-emerald-950 font-mono">
            {kpis.tonnesDeliveredToday.toFixed(0)} T
          </div>
          <span className="text-[11px] text-emerald-800">Total Volume</span>
        </Card>
      </div>

      {/* Quick Launchpad & Active Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Missions Card */}
        <Card className="lg:col-span-2 bg-white border-neutral-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-body font-bold text-neutral-950">Active Logistics Missions</h3>
              <p className="text-caption text-neutral-500">Live trips in current operational cycle</p>
            </div>
            <Link to="/admin/operations/dispatch" className="text-caption font-bold text-primary-800 hover:underline">
              View All Pipeline →
            </Link>
          </div>

          <div className="divide-y divide-neutral-100">
            {activeTrips.slice(0, 5).map((t) => (
              <div key={t.id} className="py-3.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary-800 text-body-sm">{t.tripNumber}</span>
                    <span
                      className={cn(
                        'px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase',
                        t.status === 'DELIVERED' && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                        t.status === 'IN_TRANSIT' && 'bg-blue-50 text-blue-800 border border-blue-200',
                        t.status === 'LOADED' && 'bg-purple-50 text-purple-800 border border-purple-200',
                        t.status === 'AT_QUARRY' && 'bg-amber-50 text-amber-800 border border-amber-200',
                        t.status === 'SCHEDULED' && 'bg-neutral-100 text-neutral-700'
                      )}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="text-caption text-neutral-600">
                    {t.customerName} · {t.destinationName}
                  </div>
                </div>

                <div className="text-right font-mono text-body-sm">
                  <div className="font-bold text-neutral-900">
                    {t.weighbridge?.netWeightTonnes || t.plannedQuantityTonnes} Tonnes
                  </div>
                  <div className="text-caption text-neutral-400">
                    {t.truckRegistration || 'Unassigned'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Operational Portals Card */}
        <Card className="bg-white border-neutral-200 p-5 space-y-4 shadow-2xs">
          <div className="space-y-0.5">
            <h3 className="text-body font-bold text-neutral-950">Field Operations Portals</h3>
            <p className="text-caption text-neutral-500">Dedicated operational interfaces</p>
          </div>

          <div className="space-y-3">
            <Link
              to="/operations/quarry"
              className="p-3.5 bg-neutral-50 hover:bg-primary-50/50 border border-neutral-200 rounded-xl flex items-center justify-between transition-colors block"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-900 text-white flex items-center justify-center font-bold">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-neutral-900 text-body-sm">Quarry Weighbridge Dock</div>
                  <div className="text-caption text-neutral-500">Loading dock queue & scale capture</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-neutral-400" />
            </Link>

            <Link
              to="/driver"
              className="p-3.5 bg-neutral-50 hover:bg-emerald-50/50 border border-neutral-200 rounded-xl flex items-center justify-between transition-colors block"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-neutral-900 text-body-sm">Driver Mobile Web Portal</div>
                  <div className="text-caption text-neutral-500">Mobile trip execution & POD signature</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-neutral-400" />
            </Link>

            <Link
              to="/admin/fleet/trucks"
              className="p-3.5 bg-neutral-50 hover:bg-blue-50/50 border border-neutral-200 rounded-xl flex items-center justify-between transition-colors block"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-neutral-800 text-white flex items-center justify-center font-bold">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-neutral-900 text-body-sm">Fleet Management & Maintenance</div>
                  <div className="text-caption text-neutral-500">Trucks, drivers, and service schedules</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-neutral-400" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
