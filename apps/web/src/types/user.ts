export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  role: 'customer' | 'admin' | 'driver' | 'operator';
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  address?: string;
  city?: string;
  state?: string;
  creditLimit?: number;
  accountBalance: number;
}
