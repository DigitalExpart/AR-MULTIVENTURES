export interface Material {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: 'tonnes' | 'cubic_meters' | 'trips';
  pricePerUnit?: number;
  imageUrl?: string;
  isAvailable: boolean;
}
