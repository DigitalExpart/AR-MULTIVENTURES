export interface WizardStep {
  step: number;
  title: string;
  shortTitle: string;
  description: string;
}

export const REQUISITION_WIZARD_STEPS: WizardStep[] = [
  { step: 1, title: 'Select Quarry', shortTitle: 'Quarry', description: 'Choose source quarry facility' },
  { step: 2, title: 'Select Material', shortTitle: 'Material', description: 'Choose granite size or aggregate' },
  { step: 3, title: 'Specify Quantity', shortTitle: 'Quantity', description: 'Enter required tonnage' },
  { step: 4, title: 'Transportation Method', shortTitle: 'Transport', description: 'AR fleet or self haulage' },
  { step: 5, title: 'Select Truck / Haulier', shortTitle: 'Truck', description: 'Select vehicle capacity & type' },
  { step: 6, title: 'Destination & Site', shortTitle: 'Destination', description: 'Delivery address and contact' },
  { step: 7, title: 'Schedule Delivery Date', shortTitle: 'Schedule', description: 'Requested delivery timeframe' },
  { step: 8, title: 'Pricing & Cost Review', shortTitle: 'Review', description: 'Breakdown of material and haulage' },
  { step: 9, title: 'Confirmation', shortTitle: 'Confirm', description: 'Submit order for processing' },
];

export const MATERIAL_PRODUCTS = [
  { id: 'mat-granite-3-4', name: '3/4" Granite Aggregate', code: 'GR-34', category: 'granite', specification: '19mm - 20mm crushed granite', description: 'Standard aggregate for reinforced concrete and structural works.' },
  { id: 'mat-granite-1-2', name: '1/2" Granite Aggregate', code: 'GR-12', category: 'granite', specification: '12.5mm crushed aggregate', description: 'Ideal for pre-cast slabs, columns, and refined paving concrete.' },
  { id: 'mat-granite-10mm', name: '10mm Granite Aggregate', code: 'GR-10', category: 'granite', specification: '10mm aggregate', description: 'Fine aggregate for high-specification asphalt mixes and precast.' },
  { id: 'mat-granite-20mm', name: '20mm Granite Aggregate', code: 'GR-20', category: 'granite', specification: '20mm crushed aggregate', description: 'Heavy-duty structural concrete, foundations, and civil infrastructure.' },
  { id: 'mat-granite-30mm', name: '30mm Granite Aggregate', code: 'GR-30', category: 'granite', specification: '30mm coarse aggregate', description: 'Mass concrete, road base construction, and heavy drainage beds.' },
  { id: 'mat-stone-dust', name: 'Stone Dust / Rock Dust', code: 'SD-01', category: 'dust', specification: 'Fine quarry crushed dust', description: 'Interlocking paving stones, mortar bedding, and block making.' },
  { id: 'mat-quarry-dust', name: 'Quarry Waste Dust', code: 'QD-01', category: 'dust', specification: 'Screened quarry byproduct', description: 'Economical filling, sub-base compaction, and general site works.' },
  { id: 'mat-sharp-sand', name: 'Sharp Sand', code: 'SS-01', category: 'sand', specification: 'Washed coarse construction sand', description: 'Concrete mixing, plastering, screeding, and masonry applications.' },
] as const;
