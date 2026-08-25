export interface Truck {
  id: string;
  registrationNumber: string;
  capacity: number; // tonnes
  type: 'tipper' | 'flatbed' | 'trailer';
  driverName: string;
  driverPhone: string;
  isAvailable: boolean;
}
