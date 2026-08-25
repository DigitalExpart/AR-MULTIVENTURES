export type Role = 'customer' | 'admin' | 'driver' | 'operator' | 'dispatcher';

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer extends User {
  companyName?: string;
  rcNumber?: string;
  taxId?: string;
}

export interface CustomerProfile extends Customer {
  address?: string;
  city?: string;
  state?: string;
  creditLimit?: number;
  accountBalance: number;
}

export interface Driver extends User {
  licenseNumber: string;
  assignedTruckId?: string;
  currentLocation?: {
    lat: number;
    lng: number;
    updatedAt: string;
  };
}
