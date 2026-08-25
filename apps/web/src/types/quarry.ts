export interface Quarry {
  id: string;
  name: string;
  location: string;
  state: string;
  isActive: boolean;
  materials: string[];
  coordinates?: { lat: number; lng: number };
}
