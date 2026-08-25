export interface Quarry {
  id: string;
  name: string;
  code: string;
  location: string;
  state: string;
  region: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  supportedMaterials: string[];
  operationalCapacityTonsPerDay: number;
  isActive: boolean;
}

export interface Material {
  id: string;
  name: string;
  code: string;
  category: 'granite' | 'dust' | 'sand' | 'hardcore';
  specification: string;
  description: string;
  unit: 'tonnes' | 'trips' | 'cubic_meters';
  densityTonPerCbm?: number;
  isAvailable: boolean;
  basePricePerUnit?: number;
}

export interface Truck {
  id: string;
  registrationNumber: string;
  fleetCode: string;
  capacityTonnes: number;
  type: 'tipper' | 'flatbed' | 'trailer' | 'heavy_tipper';
  makeModel: string;
  assignedDriverName: string;
  assignedDriverPhone: string;
  isAvailable: boolean;
  currentStatus: 'idle' | 'assigned' | 'loading' | 'in_transit' | 'maintenance';
}

export interface Destination {
  id: string;
  siteName: string;
  address: string;
  city: string;
  state: string;
  contactPerson: string;
  contactPhone: string;
  landmark?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}
