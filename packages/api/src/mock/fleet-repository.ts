import type { IFleetRepository } from '../interfaces';
import type {
  TruckRecord,
  DriverRecord,
  TruckMaintenanceRecord,
  FleetKPIs
} from '@ar-multiventures/types';

export const mockFleetTrucks: TruckRecord[] = [
  {
    id: 'trk-01',
    registrationNumber: 'KJA-104-XA',
    truckType: 'HEAVY_TIPPER_30T',
    capacityTonnes: 30.00,
    ownershipType: 'COMPANY',
    make: 'Mack',
    model: 'Granite 400',
    yearOfManufacture: 2022,
    chassisNumber: '1M2AX18C5NM001294',
    isActive: true,
    maintenanceStatus: 'OPERATIONAL',
    insuranceExpiry: '2027-04-15',
    roadworthinessExpiry: '2027-03-30',
    registrationExpiry: '2027-06-12',
    currentDriverName: 'Ibrahim Musa',
    activeTripId: 'trp-03',
  },
  {
    id: 'trk-02',
    registrationNumber: 'LSR-492-YY',
    truckType: 'HEAVY_TIPPER_30T',
    capacityTonnes: 30.00,
    ownershipType: 'COMPANY',
    make: 'Sinotruk',
    model: 'HOWO 371 Heavy Tipper',
    yearOfManufacture: 2023,
    chassisNumber: 'LZZ5EYVB7PA890123',
    isActive: true,
    maintenanceStatus: 'OPERATIONAL',
    insuranceExpiry: '2027-08-20',
    roadworthinessExpiry: '2027-07-15',
    registrationExpiry: '2027-09-01',
    currentDriverName: 'Babatunde Adeleke',
    activeTripId: 'trp-04',
  },
  {
    id: 'trk-03',
    registrationNumber: 'APP-883-ZZ',
    truckType: 'HEAVY_TIPPER_30T',
    capacityTonnes: 30.00,
    ownershipType: 'COMPANY',
    make: 'Mercedes-Benz',
    model: 'Actros 3340',
    yearOfManufacture: 2021,
    chassisNumber: 'WDB9340321L789456',
    isActive: true,
    maintenanceStatus: 'OPERATIONAL',
    insuranceExpiry: '2027-01-10',
    roadworthinessExpiry: '2027-01-05',
    registrationExpiry: '2027-02-18',
    currentDriverName: 'Chinedu Okonkwo',
  },
  {
    id: 'trk-04',
    registrationNumber: 'EKY-712-BC',
    truckType: 'HEAVY_TIPPER_30T',
    capacityTonnes: 30.00,
    ownershipType: 'CONTRACTOR',
    contractorName: 'Apex Haulage Logistics Ltd',
    make: 'MAN',
    model: 'TGS 33.400',
    yearOfManufacture: 2020,
    isActive: true,
    maintenanceStatus: 'DUE_FOR_SERVICE',
    insuranceExpiry: '2026-11-30',
    roadworthinessExpiry: '2026-10-15',
    registrationExpiry: '2026-12-05',
    notes: 'Scheduled for 60,000km hydraulic maintenance',
  },
  {
    id: 'trk-05',
    registrationNumber: 'BDG-301-QK',
    truckType: 'HEAVY_TIPPER_30T',
    capacityTonnes: 30.00,
    ownershipType: 'COMPANY',
    make: 'Mack',
    model: 'Vision CXU613',
    yearOfManufacture: 2019,
    isActive: false,
    maintenanceStatus: 'UNDER_MAINTENANCE',
    insuranceExpiry: '2026-09-15',
    roadworthinessExpiry: '2026-09-01',
    registrationExpiry: '2026-10-20',
    notes: 'Engine head replacement in progress at central workshop',
  },
];

export const mockDrivers: DriverRecord[] = [
  {
    id: 'drv-01',
    userId: 'usr-drv-01',
    firstName: 'Ibrahim',
    lastName: 'Musa',
    phoneNumber: '+234 803 111 2233',
    email: 'i.musa@armultiventures.com',
    licenseNumber: 'FRSC-LA-902188',
    licenseCategory: 'CLASS_E (Articulated)',
    licenseExpiry: '2027-11-14',
    assignedTruckId: 'trk-01',
    assignedTruckRegistration: 'KJA-104-XA',
    availabilityStatus: 'ASSIGNED_TO_TRIP',
    isActive: true,
    address: '14 Quarry Road, Abeokuta, Ogun State',
    emergencyContactName: 'Fatima Musa (Wife)',
    emergencyContactPhone: '+234 802 334 5566',
  },
  {
    id: 'drv-02',
    userId: 'usr-drv-02',
    firstName: 'Babatunde',
    lastName: 'Adeleke',
    phoneNumber: '+234 805 222 3344',
    email: 'b.adeleke@armultiventures.com',
    licenseNumber: 'FRSC-OG-881920',
    licenseCategory: 'CLASS_E (Articulated)',
    licenseExpiry: '2028-02-28',
    assignedTruckId: 'trk-02',
    assignedTruckRegistration: 'LSR-492-YY',
    availabilityStatus: 'ASSIGNED_TO_TRIP',
    isActive: true,
    address: '8 Tipper Garage Way, Sagamu, Ogun State',
    emergencyContactName: 'Kemi Adeleke (Sister)',
    emergencyContactPhone: '+234 809 112 3344',
  },
  {
    id: 'drv-03',
    userId: 'usr-drv-03',
    firstName: 'Chinedu',
    lastName: 'Okonkwo',
    phoneNumber: '+234 802 777 8899',
    email: 'c.okonkwo@armultiventures.com',
    licenseNumber: 'FRSC-LA-774411',
    licenseCategory: 'CLASS_E (Articulated)',
    licenseExpiry: '2027-09-30',
    assignedTruckId: 'trk-03',
    assignedTruckRegistration: 'APP-883-ZZ',
    availabilityStatus: 'AVAILABLE',
    isActive: true,
    address: '22 Ikorodu Expressway, Lagos',
    emergencyContactName: 'Ngozi Okonkwo (Wife)',
    emergencyContactPhone: '+234 803 555 6677',
  },
  {
    id: 'drv-04',
    firstName: 'Suleiman',
    lastName: 'Garba',
    phoneNumber: '+234 807 444 5566',
    licenseNumber: 'FRSC-KD-663322',
    licenseCategory: 'CLASS_E (Articulated)',
    licenseExpiry: '2026-12-31',
    availabilityStatus: 'AVAILABLE',
    isActive: true,
    address: '5 Logistics Way, Epe, Lagos',
  },
];

export const mockMaintenanceRecords: TruckMaintenanceRecord[] = [
  {
    id: 'maint-01',
    truckId: 'trk-01',
    maintenanceType: 'ROUTINE_SERVICE',
    description: '10,000 km periodic engine oil, fuel filters and air filter replacement',
    serviceProvider: 'AR Multiventures Central Fleet Workshop',
    cost: 185000,
    serviceDate: '2026-08-10',
    completionDate: '2026-08-10',
    status: 'COMPLETED',
    odometerReading: 45200,
    performedBy: 'Lead Mechanic Sunday Ogundipe',
    createdAt: '2026-08-10T14:00:00Z',
  },
  {
    id: 'maint-02',
    truckId: 'trk-05',
    maintenanceType: 'ENGINE_OVERHAUL',
    description: 'Cylinder head gasket replacement and fuel injector calibration',
    serviceProvider: 'Mack Authorized Service Center Ikeja',
    cost: 950000,
    serviceDate: '2026-08-20',
    status: 'IN_PROGRESS',
    odometerReading: 118400,
    performedBy: 'Mack Technical Team',
    createdAt: '2026-08-20T09:30:00Z',
  },
];

export class MockFleetRepository implements IFleetRepository {
  private trucks = [...mockFleetTrucks];
  private drivers = [...mockDrivers];
  private maintenance = [...mockMaintenanceRecords];

  async getTrucks(filters?: { isActive?: boolean; maintenanceStatus?: string; search?: string }): Promise<TruckRecord[]> {
    await new Promise((r) => setTimeout(r, 100));
    return this.trucks.filter((t) => {
      if (filters?.isActive !== undefined && t.isActive !== filters.isActive) return false;
      if (filters?.maintenanceStatus && t.maintenanceStatus !== filters.maintenanceStatus) return false;
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        return (
          t.registrationNumber.toLowerCase().includes(q) ||
          t.make.toLowerCase().includes(q) ||
          t.model.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }

  async getTruckById(id: string): Promise<TruckRecord | null> {
    await new Promise((r) => setTimeout(r, 80));
    return this.trucks.find((t) => t.id === id || t.registrationNumber === id) || null;
  }

  async saveTruck(truck: Partial<TruckRecord>): Promise<TruckRecord> {
    await new Promise((r) => setTimeout(r, 150));
    if (truck.id) {
      const idx = this.trucks.findIndex((t) => t.id === truck.id);
      if (idx >= 0) {
        this.trucks[idx] = { ...this.trucks[idx], ...truck, updatedAt: new Date().toISOString() };
        return this.trucks[idx];
      }
    }
    const newTruck: TruckRecord = {
      id: `trk-${Date.now().toString().slice(-6)}`,
      registrationNumber: truck.registrationNumber || 'KJA-000-XX',
      truckType: truck.truckType || 'HEAVY_TIPPER_30T',
      capacityTonnes: truck.capacityTonnes || 30.00,
      ownershipType: truck.ownershipType || 'COMPANY',
      make: truck.make || 'Heavy Truck',
      model: truck.model || 'Tipper',
      isActive: truck.isActive !== undefined ? truck.isActive : true,
      maintenanceStatus: truck.maintenanceStatus || 'OPERATIONAL',
      insuranceExpiry: truck.insuranceExpiry,
      roadworthinessExpiry: truck.roadworthinessExpiry,
      registrationExpiry: truck.registrationExpiry,
      notes: truck.notes,
      createdAt: new Date().toISOString(),
    };
    this.trucks.unshift(newTruck);
    return newTruck;
  }

  async getTruckMaintenanceRecords(truckId?: string): Promise<TruckMaintenanceRecord[]> {
    await new Promise((r) => setTimeout(r, 100));
    if (truckId) {
      return this.maintenance.filter((m) => m.truckId === truckId);
    }
    return this.maintenance;
  }

  async saveMaintenanceRecord(record: Partial<TruckMaintenanceRecord>): Promise<TruckMaintenanceRecord> {
    await new Promise((r) => setTimeout(r, 150));
    const newRecord: TruckMaintenanceRecord = {
      id: `maint-${Date.now().toString().slice(-6)}`,
      truckId: record.truckId || 'trk-01',
      maintenanceType: record.maintenanceType || 'ROUTINE_SERVICE',
      description: record.description || 'Maintenance service',
      serviceProvider: record.serviceProvider || 'AR Workshop',
      cost: record.cost || 0,
      serviceDate: record.serviceDate || new Date().toISOString().split('T')[0],
      status: record.status || 'COMPLETED',
      createdAt: new Date().toISOString(),
    };
    this.maintenance.unshift(newRecord);
    return newRecord;
  }

  async getDrivers(filters?: { isActive?: boolean; availabilityStatus?: string; search?: string }): Promise<DriverRecord[]> {
    await new Promise((r) => setTimeout(r, 100));
    return this.drivers.filter((d) => {
      if (filters?.isActive !== undefined && d.isActive !== filters.isActive) return false;
      if (filters?.availabilityStatus && d.availabilityStatus !== filters.availabilityStatus) return false;
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        return (
          d.firstName.toLowerCase().includes(q) ||
          d.lastName.toLowerCase().includes(q) ||
          d.licenseNumber.toLowerCase().includes(q) ||
          d.phoneNumber.includes(q)
        );
      }
      return true;
    });
  }

  async getDriverById(id: string): Promise<DriverRecord | null> {
    await new Promise((r) => setTimeout(r, 80));
    return this.drivers.find((d) => d.id === id || d.userId === id) || null;
  }

  async saveDriver(driver: Partial<DriverRecord>): Promise<DriverRecord> {
    await new Promise((r) => setTimeout(r, 150));
    if (driver.id) {
      const idx = this.drivers.findIndex((d) => d.id === driver.id);
      if (idx >= 0) {
        this.drivers[idx] = { ...this.drivers[idx], ...driver, updatedAt: new Date().toISOString() };
        return this.drivers[idx];
      }
    }
    const newDriver: DriverRecord = {
      id: `drv-${Date.now().toString().slice(-6)}`,
      firstName: driver.firstName || 'Driver',
      lastName: driver.lastName || 'Name',
      phoneNumber: driver.phoneNumber || '+234 800 000 0000',
      licenseNumber: driver.licenseNumber || `FRSC-LA-${Date.now().toString().slice(-6)}`,
      licenseCategory: driver.licenseCategory || 'CLASS_E (Articulated)',
      licenseExpiry: driver.licenseExpiry || '2028-12-31',
      availabilityStatus: driver.availabilityStatus || 'AVAILABLE',
      isActive: driver.isActive !== undefined ? driver.isActive : true,
      address: driver.address,
      createdAt: new Date().toISOString(),
    };
    this.drivers.unshift(newDriver);
    return newDriver;
  }

  async getFleetKPIs(): Promise<FleetKPIs> {
    await new Promise((r) => setTimeout(r, 80));
    return {
      totalTrucks: this.trucks.length,
      operationalTrucks: this.trucks.filter((t) => t.maintenanceStatus === 'OPERATIONAL' && t.isActive).length,
      underMaintenanceTrucks: this.trucks.filter((t) => t.maintenanceStatus === 'UNDER_MAINTENANCE' || t.maintenanceStatus === 'GROUNDED').length,
      activeTripsCount: this.trucks.filter((t) => !!t.activeTripId).length,
      totalDrivers: this.drivers.length,
      availableDrivers: this.drivers.filter((d) => d.availabilityStatus === 'AVAILABLE' && d.isActive).length,
      assignedDrivers: this.drivers.filter((d) => d.availabilityStatus === 'ASSIGNED_TO_TRIP').length,
    };
  }
}

export const mockFleetApi = new MockFleetRepository();
