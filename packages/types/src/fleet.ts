export type TruckOwnershipType = 'COMPANY' | 'CONTRACTOR' | 'THIRD_PARTY';
export type TruckMaintenanceStatus = 'OPERATIONAL' | 'DUE_FOR_SERVICE' | 'UNDER_MAINTENANCE' | 'GROUNDED' | 'DECOMMISSIONED';
export type DriverAvailabilityStatus = 'AVAILABLE' | 'ASSIGNED_TO_TRIP' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED';

export interface TruckRecord {
  id: string;
  organizationId?: string;
  registrationNumber: string;
  truckType: string;
  capacityTonnes: number;
  ownershipType: TruckOwnershipType;
  contractorName?: string;
  make: string;
  model: string;
  yearOfManufacture?: number;
  chassisNumber?: string;
  engineNumber?: string;
  isActive: boolean;
  maintenanceStatus: TruckMaintenanceStatus;
  insuranceExpiry?: string;
  roadworthinessExpiry?: string;
  registrationExpiry?: string;
  notes?: string;
  currentDriverName?: string;
  activeTripId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TruckDocument {
  id: string;
  truckId: string;
  documentType: 'INSURANCE' | 'ROADWORTHINESS' | 'REGISTRATION' | 'HACKNEY' | 'OTHER';
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  storagePath: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface TruckMaintenanceRecord {
  id: string;
  truckId: string;
  maintenanceType: string;
  description: string;
  serviceProvider?: string;
  cost: number;
  serviceDate: string;
  completionDate?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  odometerReading?: number;
  performedBy?: string;
  createdAt: string;
}

export interface DriverRecord {
  id: string;
  organizationId?: string;
  userId?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  alternatePhone?: string;
  email?: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  assignedTruckId?: string;
  assignedTruckRegistration?: string;
  availabilityStatus: DriverAvailabilityStatus;
  isActive: boolean;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverDocument {
  id: string;
  driverId: string;
  documentType: 'DRIVERS_LICENSE' | 'MEDICAL_CERTIFICATE' | 'LASDRI_CARD' | 'NATIONAL_ID';
  documentNumber?: string;
  expiryDate?: string;
  storagePath: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface DriverTruckAssignment {
  id: string;
  driverId: string;
  truckId: string;
  assignedAt: string;
  unassignedAt?: string;
  assignedBy?: string;
  notes?: string;
}

export interface FleetKPIs {
  totalTrucks: number;
  operationalTrucks: number;
  underMaintenanceTrucks: number;
  activeTripsCount: number;
  totalDrivers: number;
  availableDrivers: number;
  assignedDrivers: number;
}
