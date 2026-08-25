import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Mountain, Layers, Scale, Truck as TruckIcon, MapPin, Calendar, Calculator, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { PriceBreakdown } from '@/components/business/price-breakdown';
import { PageHeader } from '@/components/layout/page-header';
import { PageTransition } from '@/components/motion/page-transition';
import { FadeIn } from '@/components/motion/fade-in';
import { REQUISITION_STEPS } from '@/lib/constants';
import { formatNaira } from '@/lib/format';
import { mockQuarries, mockMaterials, mockTrucks } from '@/services/mock/mock-data';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const stepIcons: Record<number, ReactNode> = {
  1: <Mountain className="h-4 w-4" />,
  2: <Layers className="h-4 w-4" />,
  3: <Scale className="h-4 w-4" />,
  4: <TruckIcon className="h-4 w-4" />,
  5: <TruckIcon className="h-4 w-4" />,
  6: <MapPin className="h-4 w-4" />,
  7: <Calendar className="h-4 w-4" />,
  8: <Calculator className="h-4 w-4" />,
  9: <CheckCircle2 className="h-4 w-4" />,
};

export function NewRequisitionPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    quarryId: '',
    materialId: '',
    quantity: '',
    transportationType: '',
    truckId: '',
    destination: '',
    destinationAddress: '',
    deliveryDate: '',
    notes: '',
  });

  const totalSteps = REQUISITION_STEPS.length;

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-h3 text-neutral-900">Select Quarry</h3>
            <p className="text-body text-neutral-500">Choose a quarry source for your material.</p>
            <div className="grid gap-3 mt-4">
              {mockQuarries.map((quarry) => (
                <div
                  key={quarry.id}
                  onClick={() => updateField('quarryId', quarry.id)}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all',
                    formData.quarryId === quarry.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    formData.quarryId === quarry.id ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-500'
                  )}>
                    <Mountain className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-body font-semibold text-neutral-900">{quarry.name}</p>
                    <p className="text-body-sm text-neutral-500">{quarry.location}, {quarry.state} State</p>
                  </div>
                  {formData.quarryId === quarry.id && (
                    <Check className="h-5 w-5 text-primary-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-h3 text-neutral-900">Select Material</h3>
            <p className="text-body text-neutral-500">Choose the type of material you need.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {mockMaterials.map((material) => (
                <div
                  key={material.id}
                  onClick={() => updateField('materialId', material.id)}
                  className={cn(
                    'p-4 rounded-lg border-2 cursor-pointer transition-all',
                    formData.materialId === material.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  )}
                >
                  <p className="text-body font-semibold text-neutral-900">{material.name}</p>
                  <p className="text-body-sm text-neutral-500">{material.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-h3 text-neutral-900">Quantity</h3>
            <p className="text-body text-neutral-500">Specify the tonnage required.</p>
            <div className="max-w-sm mt-4">
              <Input
                label="Quantity (tonnes)"
                type="number"
                placeholder="e.g. 30"
                value={formData.quantity}
                onChange={(e) => updateField('quantity', e.target.value)}
                hint="Minimum order: 10 tonnes"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-h3 text-neutral-900">Transportation</h3>
            <p className="text-body text-neutral-500">How would you like the material transported?</p>
            <div className="grid gap-3 mt-4 max-w-lg">
              {[
                { id: 'company', label: 'AR Multiventures Fleet', description: 'We handle haulage with our fleet' },
                { id: 'self', label: 'Self-Arrangement', description: 'You arrange your own transportation' },
                { id: 'third_party', label: 'Third-Party', description: 'Assign a third-party hauler' },
              ].map((option) => (
                <div
                  key={option.id}
                  onClick={() => updateField('transportationType', option.id)}
                  className={cn(
                    'p-4 rounded-lg border-2 cursor-pointer transition-all',
                    formData.transportationType === option.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  )}
                >
                  <p className="text-body font-semibold text-neutral-900">{option.label}</p>
                  <p className="text-body-sm text-neutral-500">{option.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-h3 text-neutral-900">Select Truck</h3>
            <p className="text-body text-neutral-500">Choose an available truck for delivery.</p>
            <div className="grid gap-3 mt-4">
              {mockTrucks.filter(t => t.isAvailable).map((truck) => (
                <div
                  key={truck.id}
                  onClick={() => updateField('truckId', truck.id)}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all',
                    formData.truckId === truck.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    formData.truckId === truck.id ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-500'
                  )}>
                    <TruckIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-body font-semibold text-neutral-900">{truck.registrationNumber}</p>
                    <p className="text-body-sm text-neutral-500">{truck.type} · {truck.capacity} tonnes · {truck.driverName}</p>
                  </div>
                  {formData.truckId === truck.id && <Check className="h-5 w-5 text-primary-600" />}
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-h3 text-neutral-900">Destination</h3>
            <p className="text-body text-neutral-500">Where should the material be delivered?</p>
            <div className="max-w-lg space-y-4 mt-4">
              <Input
                label="Destination Name"
                placeholder="e.g. Victoria Island, Lagos"
                value={formData.destination}
                onChange={(e) => updateField('destination', e.target.value)}
              />
              <Textarea
                label="Full Delivery Address"
                placeholder="Enter the complete delivery address"
                value={formData.destinationAddress}
                onChange={(e) => updateField('destinationAddress', e.target.value)}
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-h3 text-neutral-900">Delivery Date</h3>
            <p className="text-body text-neutral-500">When do you need the material delivered?</p>
            <div className="max-w-sm mt-4">
              <Input
                label="Preferred Delivery Date"
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => updateField('deliveryDate', e.target.value)}
              />
              <Textarea
                label="Special Instructions (optional)"
                placeholder="Any special delivery instructions..."
                className="mt-4"
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
              />
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <h3 className="text-h3 text-neutral-900">Pricing Review</h3>
            <p className="text-body text-neutral-500">Review the cost breakdown for this requisition.</p>
            <div className="max-w-md mt-4">
              <PriceBreakdown
                items={[
                  { label: 'Material Cost', amount: 0 },
                  { label: 'Loading Charges', amount: 0 },
                  { label: 'Haulage', amount: 0 },
                  { label: 'Other Charges', amount: 0 },
                  { label: 'Discount', amount: 0, isDiscount: true },
                ]}
                total={0}
              />
              <p className="text-caption text-neutral-400 mt-3">
                Final pricing will be confirmed after requisition review.
              </p>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-4 text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 text-primary-600 mb-2">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-h3 text-neutral-900">Confirm Requisition</h3>
            <p className="text-body text-neutral-500 max-w-md mx-auto">
              Review your selections and submit your requisition for processing.
            </p>
            <Button size="lg" className="mt-4">
              Submit Requisition
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageTransition>
      <PageHeader
        title="New Requisition"
        description="Create a new material supply requisition"
        breadcrumbs={[
          { label: 'Requisitions', href: '/app/requisitions' },
          { label: 'New Requisition' },
        ]}
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Main content */}
        <div>
          {/* Step Indicator */}
          <FadeIn>
            <div className="mb-6 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-1 min-w-max pb-2">
                {REQUISITION_STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm font-medium transition-all whitespace-nowrap',
                        currentStep === step.id
                          ? 'bg-primary-600 text-white'
                          : step.id < currentStep
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-neutral-400 hover:text-neutral-600'
                      )}
                    >
                      <span className={cn(
                        'flex items-center justify-center w-6 h-6 rounded-full text-caption font-bold',
                        currentStep === step.id
                          ? 'bg-white/20'
                          : step.id < currentStep
                            ? 'bg-primary-600 text-white'
                            : 'bg-neutral-200'
                      )}>
                        {step.id < currentStep ? <Check className="h-3 w-3" /> : step.id}
                      </span>
                      <span className="hidden sm:inline">{step.title}</span>
                    </button>
                    {index < REQUISITION_STEPS.length - 1 && (
                      <div className={cn(
                        'w-4 h-px mx-1',
                        step.id < currentStep ? 'bg-primary-300' : 'bg-neutral-200'
                      )} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Step Content */}
          <Card padding="lg">
            <FadeIn key={currentStep}>
              {renderStepContent()}
            </FadeIn>

            {/* Navigation */}
            {currentStep < 9 && (
              <div className="flex items-center justify-between mt-8 pt-5 border-t border-neutral-200">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Back
                </Button>
                <div className="text-body-sm text-neutral-400">
                  Step {currentStep} of {totalSteps}
                </div>
                <Button
                  onClick={handleNext}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  {currentStep === totalSteps - 1 ? 'Review' : 'Continue'}
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Order Summary Panel — sticky on desktop */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <Card padding="lg">
              <h3 className="text-h4 text-neutral-900 mb-4">Order Summary</h3>

              <div className="space-y-3 text-body-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Quarry</span>
                  <span className="text-neutral-900 font-medium">
                    {formData.quarryId ? mockQuarries.find(q => q.id === formData.quarryId)?.name : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Material</span>
                  <span className="text-neutral-900 font-medium">
                    {formData.materialId ? mockMaterials.find(m => m.id === formData.materialId)?.name : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Quantity</span>
                  <span className="text-neutral-900 font-medium">{formData.quantity || '—'} tonnes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Destination</span>
                  <span className="text-neutral-900 font-medium text-right max-w-[160px] truncate">
                    {formData.destination || '—'}
                  </span>
                </div>
              </div>

              <div className="border-t border-neutral-200 mt-4 pt-4">
                <PriceBreakdown
                  items={[
                    { label: 'Material Cost', amount: 0 },
                    { label: 'Loading Charges', amount: 0 },
                    { label: 'Haulage', amount: 0 },
                    { label: 'Other Charges', amount: 0 },
                    { label: 'Discount', amount: 0, isDiscount: true },
                  ]}
                  total={0}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
