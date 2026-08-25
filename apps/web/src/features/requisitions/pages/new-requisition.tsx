import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, Mountain, Layers, Scale,
  Truck as TruckIcon, MapPin, Calendar, CheckCircle2,
  AlertCircle, ShieldCheck, Sparkles, Building2, RefreshCw, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { PriceBreakdown } from '@/components/business/price-breakdown';
import { PageHeader } from '@/components/layout/page-header';
import { PageTransition } from '@/components/motion/page-transition';
import { FadeIn } from '@/components/motion/fade-in';
import { REQUISITION_WIZARD_STEPS } from '@ar-multiventures/config';
import { formatNaira, formatDate } from '@ar-multiventures/business-logic';
import { resourceApi, requisitionApi } from '@ar-multiventures/api';
import type { Quarry, Material, Truck, TransportationType, PriceQuoteBreakdown } from '@ar-multiventures/types';
import { cn } from '@/lib/utils';

export function NewRequisitionPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [quarries, setQuarries] = useState<Quarry[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReference, setSubmittedReference] = useState<string | null>(null);

  // Live Pricing State
  const [priceQuote, setPriceQuote] = useState<PriceQuoteBreakdown | null>(null);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [priceChangedAlert, setPriceChangedAlert] = useState<{ previous: number; current: number } | null>(null);

  const [formData, setFormData] = useState<{
    quarryId: string;
    materialId: string;
    quantity: number;
    transportationType: TransportationType;
    truckId: string;
    destination: string;
    destinationAddress: string;
    deliveryDate: string;
    notes: string;
  }>({
    quarryId: 'qry-abeokuta',
    materialId: 'mat-granite-20mm',
    quantity: 30,
    transportationType: 'company',
    truckId: 'trk-01',
    destination: 'Lekki Coastal Project Site, Lagos',
    destinationAddress: 'Plot 4, Coastal Road Extension, Lekki Phase 1, Lagos',
    deliveryDate: '2026-08-28',
    notes: 'Please ensure driver calls site engineer 1 hour prior to arrival.',
  });

  useEffect(() => {
    async function loadResources() {
      try {
        const [qList, mList, tList] = await Promise.all([
          resourceApi.getQuarries(),
          resourceApi.getMaterials(),
          resourceApi.getTrucks(),
        ]);
        setQuarries(qList);
        setMaterials(mList);
        setTrucks(tList);
        if (qList.length > 0 && !formData.quarryId) {
          setFormData((prev) => ({ ...prev, quarryId: qList[0].id }));
        }
        if (mList.length > 0 && !formData.materialId) {
          setFormData((prev) => ({ ...prev, materialId: mList[0].id }));
        }
      } catch (err) {
        console.error('Failed to load resources:', err);
      }
    }
    loadResources();
  }, []);

  // Live Server Price Quote Fetcher
  useEffect(() => {
    let isCancelled = false;

    async function fetchPriceQuote() {
      if (!formData.quarryId || !formData.materialId || !formData.quantity || formData.quantity < 1) {
        return;
      }

      setIsPricingLoading(true);
      setPricingError(null);

      try {
        const quote = await requisitionApi.calculatePriceQuote({
          quarryId: formData.quarryId,
          materialId: formData.materialId,
          quantity: Number(formData.quantity),
          transportationType: formData.transportationType,
          truckTypeId: formData.truckId,
          deliveryDate: formData.deliveryDate,
        });

        if (!isCancelled) {
          setPriceQuote(quote);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.warn('Pricing engine error:', err);
          setPricingError(err.message || 'Unable to resolve live pricing tariff.');
        }
      } finally {
        if (!isCancelled) {
          setIsPricingLoading(false);
        }
      }
    }

    fetchPriceQuote();

    return () => {
      isCancelled = true;
    };
  }, [
    formData.quarryId,
    formData.materialId,
    formData.quantity,
    formData.transportationType,
    formData.truckId,
    formData.deliveryDate,
  ]);

  const totalSteps = REQUISITION_WIZARD_STEPS.length;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitRequisition = async () => {
    setIsSubmitting(true);
    setPriceChangedAlert(null);

    try {
      const created = await requisitionApi.create({
        quarryId: formData.quarryId,
        materialId: formData.materialId,
        quantity: Number(formData.quantity),
        transportationType: formData.transportationType,
        truckId: formData.truckId,
        destination: formData.destination,
        destinationAddress: formData.destinationAddress,
        deliveryDate: formData.deliveryDate,
        notes: formData.notes,
        expectedTotal: priceQuote?.total,
      });

      setSubmittedReference(created.referenceNumber);
      setCurrentStep(9);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Submission failed:', err);
      if (err.message && err.message.includes('Pricing has changed')) {
        setPriceChangedAlert({
          previous: priceQuote?.total || 0,
          current: priceQuote?.total || 0,
        });
      } else {
        alert(err.message || 'Failed to submit requisition. Please check your connection and retry.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedQuarry = quarries.find((q) => q.id === formData.quarryId);
  const selectedMaterial = materials.find((m) => m.id === formData.materialId);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-h3 font-bold text-neutral-900">Select Extraction Quarry</h3>
              <p className="text-body-sm text-neutral-600 mt-1">
                Choose the certified source extraction plant closest to your construction site.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
              {quarries.map((quarry) => {
                const isSelected = formData.quarryId === quarry.id;
                return (
                  <div
                    key={quarry.id}
                    onClick={() => updateField('quarryId', quarry.id)}
                    className={cn(
                      'p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between',
                      isSelected
                        ? 'border-primary-600 bg-primary-50/50 shadow-sm'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Mountain className={cn('h-5 w-5', isSelected ? 'text-primary-700' : 'text-neutral-500')} />
                          <span className="text-caption font-mono font-bold text-neutral-500 uppercase">
                            {quarry.code}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      <h4 className="text-body font-bold text-neutral-900">{quarry.name}</h4>
                      <p className="text-caption text-neutral-500 mt-1">{quarry.location}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between text-caption">
                      <span className="text-neutral-500">{quarry.state}</span>
                      <span className="font-semibold text-primary-800">
                        {quarry.operationalCapacityTonsPerDay.toLocaleString()} T/Day Cap.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-h3 font-bold text-neutral-900">Select Material Aggregate</h3>
              <p className="text-body-sm text-neutral-600 mt-1">
                Certified granites, quarry dusts, and industrial aggregates with laboratory test specs.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
              {materials.map((mat) => {
                const isSelected = formData.materialId === mat.id;
                return (
                  <div
                    key={mat.id}
                    onClick={() => updateField('materialId', mat.id)}
                    className={cn(
                      'p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between',
                      isSelected
                        ? 'border-primary-600 bg-primary-50/50 shadow-sm'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Layers className={cn('h-5 w-5', isSelected ? 'text-primary-700' : 'text-neutral-500')} />
                          <span className="text-caption font-mono font-bold text-neutral-500 uppercase">
                            {mat.code}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      <h4 className="text-body font-bold text-neutral-900">{mat.name}</h4>
                      <p className="text-caption text-neutral-500 mt-1">{mat.specification}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between text-caption">
                      <span className="text-neutral-500 uppercase font-mono">{mat.category}</span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Available
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-h3 font-bold text-neutral-900">Specify Quantity (Tonnage)</h3>
              <p className="text-body-sm text-neutral-600 mt-1">
                Enter the exact tonnage required for your concrete casting or site base.
              </p>
            </div>

            <div className="max-w-md space-y-4">
              <Input
                type="number"
                label="Required Quantity (Tonnes)"
                min={10}
                max={5000}
                step={5}
                value={formData.quantity}
                onChange={(e) => updateField('quantity', Number(e.target.value))}
                hint="Standard 10-wheeler tipper capacity is 30 Tonnes. Trailers hold 45-60 Tonnes."
              />

              <div className="flex items-center gap-2 pt-2">
                <span className="text-caption font-semibold text-neutral-500">Quick Tonnage Presets:</span>
                {[15, 30, 45, 60, 90, 150].map((tons) => (
                  <button
                    key={tons}
                    type="button"
                    onClick={() => updateField('quantity', tons)}
                    className={cn(
                      'px-2.5 py-1 text-caption font-mono font-bold rounded border transition-colors',
                      formData.quantity === tons
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                    )}
                  >
                    {tons}T
                  </button>
                ))}
              </div>

              {formData.quantity >= 60 && (
                <div className="p-3 bg-accent-50 border border-accent-200 rounded-lg flex items-center gap-2.5 text-caption text-accent-800">
                  <Sparkles className="h-4 w-4 text-accent-600 shrink-0" />
                  <span>
                    <strong>Volume Tier Applied:</strong> High-volume commercial orders qualifying for automated tier discounts!
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-h3 font-bold text-neutral-900">Transportation & Logistics Model</h3>
              <p className="text-body-sm text-neutral-600 mt-1">
                Choose between AR Multiventures managed heavy haulage fleet or client-arranged collection.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div
                onClick={() => updateField('transportationType', 'company')}
                className={cn(
                  'p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between',
                  formData.transportationType === 'company'
                    ? 'border-primary-600 bg-primary-50/50 shadow-sm'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <TruckIcon className="h-6 w-6 text-primary-700" />
                    {formData.transportationType === 'company' && (
                      <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <h4 className="text-body font-bold text-neutral-900">
                    Supply & Managed Haulage (Recommended)
                  </h4>
                  <p className="text-caption text-neutral-600 mt-2">
                    Delivered directly to your construction site by AR Multiventures heavy fleet with GPS route monitoring and insurance.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-200 text-caption font-semibold text-primary-800">
                  Door-to-Site Transit Included
                </div>
              </div>

              <div
                onClick={() => updateField('transportationType', 'self')}
                className={cn(
                  'p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between',
                  formData.transportationType === 'self'
                    ? 'border-primary-600 bg-primary-50/50 shadow-sm'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Scale className="h-6 w-6 text-neutral-700" />
                    {formData.transportationType === 'self' && (
                      <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <h4 className="text-body font-bold text-neutral-900">
                    Self-Pickup (Client Arranged)
                  </h4>
                  <p className="text-caption text-neutral-600 mt-2">
                    Send your own registered trucks to the quarry loading bay. Weighbridge tickets issued on collection.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-200 text-caption font-semibold text-neutral-700">
                  Ex-Quarry Gate Pricing (No Haulage)
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-h3 font-bold text-neutral-900">Vehicle Type & Tonnage Allocation</h3>
              <p className="text-body-sm text-neutral-600 mt-1">
                {formData.transportationType === 'company'
                  ? 'Allocated heavy transport vehicle from the AR Multiventures haulage division.'
                  : 'Specify the vehicle class your driver will present at the quarry weighbridge.'}
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3.5 pt-2">
              {trucks.map((truck) => {
                const isSelected = formData.truckId === truck.id;
                return (
                  <div
                    key={truck.id}
                    onClick={() => updateField('truckId', truck.id)}
                    className={cn(
                      'p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between',
                      isSelected
                        ? 'border-primary-600 bg-primary-50/50 shadow-sm'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-caption font-mono font-bold text-neutral-500">
                          {truck.fleetCode}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-primary-600 text-white flex items-center justify-center">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>
                      <h4 className="text-body-sm font-bold text-neutral-900">{truck.makeModel}</h4>
                      <p className="text-caption text-neutral-500 mt-0.5">Capacity: {truck.capacityTonnes} Tonnes</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-h3 font-bold text-neutral-900">Delivery Destination & Site Address</h3>
              <p className="text-body-sm text-neutral-600 mt-1">
                Provide precise delivery coordinates for driver dispatch and offloading logistics.
              </p>
            </div>

            <div className="space-y-4 max-w-lg">
              <Input
                label="Site / Project Destination Name"
                placeholder="e.g. Lekki Coastal Project Site, Lagos"
                value={formData.destination}
                onChange={(e) => updateField('destination', e.target.value)}
              />

              <Textarea
                label="Full Delivery Address & Landmark"
                placeholder="e.g. Plot 4, Coastal Road Extension, beside Chevron HQ, Lekki Phase 1, Lagos"
                value={formData.destinationAddress}
                onChange={(e) => updateField('destinationAddress', e.target.value)}
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-h3 font-bold text-neutral-900">Schedule Delivery & Site Notes</h3>
              <p className="text-body-sm text-neutral-600 mt-1">
                Select your preferred delivery date and provide access instructions.
              </p>
            </div>

            <div className="space-y-4 max-w-lg">
              <Input
                type="date"
                label="Requested Delivery Date"
                value={formData.deliveryDate}
                onChange={(e) => updateField('deliveryDate', e.target.value)}
              />

              <Textarea
                label="Site Access / Gate Instructions (Optional)"
                placeholder="e.g. Site gates open at 7:00 AM. Please call Engineer Emeka on arrival."
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
              />
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-h3 font-bold text-neutral-900">Pricing & Commercial Quote</h3>
              <p className="text-body-sm text-neutral-600 mt-1">
                Authoritative server-side cost calculation for material extraction, loading bay tickets, and haulage.
              </p>
            </div>

            {priceChangedAlert && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-body-sm font-bold text-amber-900">
                    Pricing Changed Since Your Initial Estimate
                  </h4>
                  <p className="text-caption text-amber-800 mt-1">
                    The active tariff rate was updated. Previous estimate: {formatNaira(priceChangedAlert.previous)}. Current authoritative quote: {formatNaira(priceQuote?.total || 0)}. Please review the updated total before submitting.
                  </p>
                </div>
              </div>
            )}

            <div className="max-w-lg bg-surface-secondary p-5 rounded-xl border border-neutral-200 space-y-4">
              {isPricingLoading ? (
                <div className="py-8 text-center space-y-3">
                  <RefreshCw className="h-6 w-6 text-primary-600 animate-spin mx-auto" />
                  <p className="text-body-sm font-semibold text-neutral-600">
                    Resolving live commercial tariff matrix...
                  </p>
                </div>
              ) : pricingError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-caption text-red-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{pricingError}</span>
                </div>
              ) : priceQuote ? (
                <>
                  <PriceBreakdown
                    items={[
                      {
                        label: `Material Sourcing (${priceQuote.quantity} tonnes @ ${formatNaira(priceQuote.material.unitPrice)}/T)`,
                        amount: priceQuote.material.amount,
                      },
                      {
                        label: 'Quarry Loading Bay & Scale Ticket',
                        amount: priceQuote.loading.amount,
                      },
                      {
                        label: formData.transportationType === 'self'
                          ? 'Self-Pickup (No Haulage Charge)'
                          : 'Heavy Fleet Haulage Logistics',
                        amount: priceQuote.haulage.amount,
                      },
                      ...(priceQuote.fuelAdjustment?.amount > 0
                        ? [
                            {
                              label: `Logistics Fuel Adjustment (${priceQuote.fuelAdjustment.percentage}%)`,
                              amount: priceQuote.fuelAdjustment.amount,
                            },
                          ]
                        : []),
                      ...(priceQuote.totalDiscount > 0
                        ? [
                            {
                              label: priceQuote.discounts[0]?.name || 'Volume Tier Discount',
                              amount: priceQuote.totalDiscount,
                              isDiscount: true,
                            },
                          ]
                        : []),
                    ]}
                    total={priceQuote.total}
                  />

                  <div className="pt-3 border-t border-neutral-200 flex items-center justify-between text-caption text-neutral-500">
                    <span className="font-mono">Quote Valid Until: {formatDate(priceQuote.validUntil)}</span>
                    {priceQuote.requiresReview ? (
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Review Required
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Approved Tariff
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-caption text-neutral-500 text-center py-4">
                  Select your quarry and aggregate to evaluate commercial rates.
                </p>
              )}

              <div className="p-3 bg-neutral-100 rounded-lg border border-neutral-200 flex items-start gap-2.5 text-caption text-neutral-600">
                <ShieldCheck className="h-4 w-4 text-primary-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Immutable Commercial Snapshot:</strong> Upon submission, these commercial line items are frozen in the database. Changing future price catalogs will never alter historical orders.
                </span>
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="text-center py-8 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-50 text-success-700 border border-success-200 mb-2">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h3 className="text-h2 font-extrabold text-neutral-900">
              Requisition Submitted Successfully!
            </h3>
            <p className="text-body text-neutral-600 max-w-md mx-auto">
              Your material requisition has been logged and queued for quarry loading operations.
            </p>

            <div className="p-4 rounded-xl bg-surface-secondary border border-neutral-200 max-w-md mx-auto text-left space-y-2">
              <div className="flex justify-between text-body-sm">
                <span className="text-neutral-500">Reference Number:</span>
                <span className="font-mono font-bold text-primary-700">
                  {submittedReference || 'REQ-2026-000143'}
                </span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-neutral-500">Material & Tonnage:</span>
                <span className="font-medium text-neutral-900">{formData.quantity} Tonnes {selectedMaterial?.name}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-neutral-500">Source Quarry:</span>
                <span className="font-medium text-neutral-900">{selectedQuarry?.name}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-neutral-500">Destination:</span>
                <span className="font-medium text-neutral-900">{formData.destination}</span>
              </div>
              <div className="flex justify-between text-body-sm pt-2 border-t border-neutral-200 font-bold">
                <span className="text-neutral-700">Authoritative Total:</span>
                <span className="text-primary-800 font-mono">{formatNaira(priceQuote?.total || 0)}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/app/requisitions">
                <Button variant="primary" size="lg">
                  View Requisitions List
                </Button>
              </Link>
              <Link to="/app">
                <Button variant="outline" size="lg">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageTransition className="space-y-6">
      <PageHeader
        title="Create Material Supply Requisition"
        description="Structured multi-step ordering workflow for granite supply & haulage dispatch."
        breadcrumbs={[
          { label: 'Requisitions', href: '/app/requisitions' },
          { label: 'New Requisition' },
        ]}
      />

      <div className="grid lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto">
        {/* Main Step Body (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step Progress Bar with short titles */}
          <Card padding="sm" className="bg-white">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
              {REQUISITION_WIZARD_STEPS.map((s, index) => {
                const isPassed = s.step < currentStep;
                const isCurrent = s.step === currentStep;

                return (
                  <div key={s.step} className="flex items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (s.step < currentStep) setCurrentStep(s.step);
                      }}
                      disabled={s.step > currentStep}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-body-sm font-semibold transition-all',
                        isCurrent
                          ? 'bg-primary-600 text-white shadow-xs'
                          : isPassed
                            ? 'bg-primary-50 text-primary-700 hover:bg-primary-100 cursor-pointer'
                            : 'text-neutral-400 cursor-not-allowed opacity-70'
                      )}
                    >
                      <span
                        className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center text-caption font-bold shrink-0',
                          isCurrent
                            ? 'bg-white text-primary-700'
                            : isPassed
                              ? 'bg-primary-600 text-white'
                              : 'bg-neutral-200 text-neutral-500'
                        )}
                      >
                        {isPassed ? <Check className="h-3 w-3" /> : s.step}
                      </span>
                      <span>{s.shortTitle}</span>
                    </button>
                    {index < REQUISITION_WIZARD_STEPS.length - 1 && (
                      <div
                        className={cn(
                          'w-3 h-0.5 mx-1',
                          isPassed ? 'bg-primary-400' : 'bg-neutral-200'
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Active Step Content Form */}
          <Card padding="lg" className="bg-white shadow-sm min-h-[420px] flex flex-col justify-between">
            <FadeIn key={currentStep}>
              {renderStepContent()}
            </FadeIn>

            {/* Step Navigation Controls */}
            {currentStep < 9 && (
              <div className="flex items-center justify-between pt-6 mt-8 border-t border-neutral-200">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Previous Step
                </Button>

                <span className="text-caption font-mono text-neutral-400 font-bold uppercase">
                  STEP {currentStep} OF {totalSteps - 1}
                </span>

                {currentStep === 8 ? (
                  <Button
                    variant="accent"
                    size="lg"
                    isLoading={isSubmitting}
                    onClick={handleSubmitRequisition}
                    rightIcon={<Check className="h-4 w-4" />}
                    className="font-bold text-neutral-950 shadow-md"
                  >
                    Submit Requisition
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Continue to Step {currentStep + 1}
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Live Sticky Order Summary Panel (4 cols on desktop) */}
        <div className="lg:col-span-4 sticky top-20 space-y-4">
          <Card padding="md" className="border-2 border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
              <h4 className="text-body font-extrabold text-neutral-900 uppercase tracking-wide">
                Live Order Summary
              </h4>
              <span className="text-[11px] font-mono font-bold text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-200">
                DRAFT
              </span>
            </div>

            <div className="space-y-3 text-body-sm">
              <div className="flex justify-between items-start">
                <span className="text-neutral-500">Source Quarry:</span>
                <span className="font-bold text-neutral-900 text-right max-w-[170px] truncate">
                  {selectedQuarry?.name || '—'}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-neutral-500">Material Type:</span>
                <span className="font-bold text-neutral-900 text-right max-w-[170px] truncate">
                  {selectedMaterial?.name || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Quantity:</span>
                <span className="font-mono font-bold text-neutral-900">
                  {formData.quantity ? `${formData.quantity} Tonnes` : '—'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Haulage Fleet:</span>
                <span className="font-bold text-neutral-900">
                  {formData.transportationType === 'company' ? 'AR Fleet (30T)' : 'Self-Haulage'}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-neutral-500">Destination:</span>
                <span className="font-medium text-neutral-900 text-right max-w-[170px] truncate">
                  {formData.destination || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Delivery Date:</span>
                <span className="font-mono font-bold text-neutral-900">
                  {formData.deliveryDate ? formatDate(formData.deliveryDate) : '—'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-200">
              {isPricingLoading ? (
                <div className="py-4 text-center text-caption text-neutral-400 animate-pulse">
                  Updating live pricing quote...
                </div>
              ) : priceQuote ? (
                <PriceBreakdown
                  items={[
                    { label: 'Material Subtotal', amount: priceQuote.material.amount },
                    { label: 'Loading & Weighbridge', amount: priceQuote.loading.amount },
                    { label: 'Fleet Haulage', amount: priceQuote.haulage.amount },
                    ...(priceQuote.fuelAdjustment?.amount > 0
                      ? [{ label: 'Fuel Adjustment', amount: priceQuote.fuelAdjustment.amount }]
                      : []),
                    ...(priceQuote.totalDiscount > 0
                      ? [{ label: 'Volume Discount', amount: priceQuote.totalDiscount, isDiscount: true }]
                      : []),
                  ]}
                  total={priceQuote.total}
                />
              ) : (
                <PriceBreakdown
                  items={[
                    { label: 'Material Subtotal', amount: 0 },
                    { label: 'Loading & Weighbridge', amount: 0 },
                    { label: 'Fleet Haulage', amount: 0 },
                  ]}
                  total={0}
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
