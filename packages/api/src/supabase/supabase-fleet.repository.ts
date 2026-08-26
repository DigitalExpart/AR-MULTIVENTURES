import type { IFleetRepository } from '../interfaces';
import type {
  TruckRecord,
  DriverRecord,
  TruckMaintenanceRecord,
  FleetKPIs
} from '@ar-multiventures/types';
import { supabase } from './supabase-client';

export class SupabaseFleetRepository implements IFleetRepository {
  async getTrucks(filters?: { isActive?: boolean; maintenanceStatus?: string; search?: string }): Promise<TruckRecord[]> {
    let query = supabase.from('trucks').select('*').order('created_at', { ascending: false });
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters?.maintenanceStatus) {
      query = query.eq('maintenance_status', filters.maintenanceStatus);
    }
    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to load trucks from Supabase: ${error.message}`);
    }
    return (data || []).map((t: any) => ({
      id: t.id,
      organizationId: t.organization_id,
      registrationNumber: t.registration_number,
      truckType: t.truck_type,
      capacityTonnes: Number(t.capacity_tonnes),
      ownershipType: t.ownership_type,
      contractorName: t.contractor_name,
      make: t.make,
      model: t.model,
      yearOfManufacture: t.year_of_manufacture,
      isActive: t.is_active,
      maintenanceStatus: t.maintenance_status,
      insuranceExpiry: t.insurance_expiry,
      roadworthinessExpiry: t.roadworthiness_expiry,
      registrationExpiry: t.registration_expiry,
      notes: t.notes,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }));
  }

  async getTruckById(id: string): Promise<TruckRecord | null> {
    const { data, error } = await supabase.from('trucks').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch truck ${id}: ${error.message}`);
    }
    if (!data) return null;
    return {
      id: data.id,
      organizationId: data.organization_id,
      registrationNumber: data.registration_number,
      truckType: data.truck_type,
      capacityTonnes: Number(data.capacity_tonnes),
      ownershipType: data.ownership_type,
      contractorName: data.contractor_name,
      make: data.make,
      model: data.model,
      yearOfManufacture: data.year_of_manufacture,
      isActive: data.is_active,
      maintenanceStatus: data.maintenance_status,
      insuranceExpiry: data.insurance_expiry,
      roadworthinessExpiry: data.roadworthiness_expiry,
      registrationExpiry: data.registration_expiry,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async saveTruck(truck: Partial<TruckRecord>): Promise<TruckRecord> {
    const payload = {
      registration_number: truck.registrationNumber,
      truck_type: truck.truckType || 'HEAVY_TIPPER_30T',
      capacity_tonnes: truck.capacityTonnes || 30.00,
      ownership_type: truck.ownershipType || 'COMPANY',
      contractor_name: truck.contractorName,
      make: truck.make,
      model: truck.model,
      year_of_manufacture: truck.yearOfManufacture,
      is_active: truck.isActive !== undefined ? truck.isActive : true,
      maintenance_status: truck.maintenanceStatus || 'OPERATIONAL',
      insurance_expiry: truck.insuranceExpiry,
      roadworthiness_expiry: truck.roadworthinessExpiry,
      registration_expiry: truck.registrationExpiry,
      notes: truck.notes,
      updated_at: new Date().toISOString(),
    };

    if (truck.id) {
      const { data, error } = await supabase.from('trucks').update(payload).eq('id', truck.id).select().single();
      if (error) throw new Error(`Failed to update truck: ${error.message}`);
      return { ...truck, ...data } as TruckRecord;
    } else {
      const { data, error } = await supabase.from('trucks').insert(payload).select().single();
      if (error) throw new Error(`Failed to insert truck: ${error.message}`);
      return { ...truck, ...data } as TruckRecord;
    }
  }

  async getTruckMaintenanceRecords(truckId?: string): Promise<TruckMaintenanceRecord[]> {
    let query = supabase.from('truck_maintenance_records').select('*').order('service_date', { ascending: false });
    if (truckId) {
      query = query.eq('truck_id', truckId);
    }
    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch maintenance records: ${error.message}`);
    return (data || []).map((m: any) => ({
      id: m.id,
      truckId: m.truck_id,
      maintenanceType: m.maintenance_type,
      description: m.description,
      serviceProvider: m.service_provider,
      cost: Number(m.cost),
      serviceDate: m.service_date,
      completionDate: m.completion_date,
      status: m.status,
      odometerReading: m.odometer_reading,
      performedBy: m.performed_by,
      notes: m.notes,
      createdAt: m.created_at,
    }));
  }

  async saveMaintenanceRecord(record: Partial<TruckMaintenanceRecord>): Promise<TruckMaintenanceRecord> {
    const payload = {
      truck_id: record.truckId,
      maintenance_type: record.maintenanceType,
      description: record.description,
      service_provider: record.serviceProvider,
      cost: record.cost,
      service_date: record.serviceDate,
      status: record.status || 'COMPLETED',
    };
    const { data, error } = await supabase.from('truck_maintenance_records').insert(payload).select().single();
    if (error) throw new Error(`Failed to save maintenance record: ${error.message}`);
    return { ...record, ...data } as TruckMaintenanceRecord;
  }

  async getDrivers(filters?: { isActive?: boolean; availabilityStatus?: string; search?: string }): Promise<DriverRecord[]> {
    let query = supabase.from('drivers').select('*').order('first_name', { ascending: true });
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters?.availabilityStatus) {
      query = query.eq('availability_status', filters.availabilityStatus);
    }
    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch drivers: ${error.message}`);
    return (data || []).map((d: any) => ({
      id: d.id,
      userId: d.user_id,
      firstName: d.first_name,
      lastName: d.last_name,
      phoneNumber: d.phone_number,
      email: d.email,
      licenseNumber: d.license_number,
      licenseCategory: d.license_category,
      licenseExpiry: d.license_expiry,
      availabilityStatus: d.availability_status,
      isActive: d.is_active,
      address: d.address,
      emergencyContactName: d.emergency_contact_name,
      emergencyContactPhone: d.emergency_contact_phone,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  }

  async getDriverById(id: string): Promise<DriverRecord | null> {
    const { data, error } = await supabase.from('drivers').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch driver ${id}: ${error.message}`);
    }
    if (!data) return null;
    return {
      id: data.id,
      userId: data.user_id,
      firstName: data.first_name,
      lastName: data.last_name,
      phoneNumber: data.phone_number,
      email: data.email,
      licenseNumber: data.license_number,
      licenseCategory: data.license_category,
      licenseExpiry: data.license_expiry,
      availabilityStatus: data.availability_status,
      isActive: data.is_active,
      address: data.address,
      emergencyContactName: data.emergency_contact_name,
      emergencyContactPhone: data.emergency_contact_phone,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async saveDriver(driver: Partial<DriverRecord>): Promise<DriverRecord> {
    const payload = {
      first_name: driver.firstName,
      last_name: driver.lastName,
      phone_number: driver.phoneNumber,
      license_number: driver.licenseNumber,
      license_category: driver.licenseCategory,
      license_expiry: driver.licenseExpiry,
      availability_status: driver.availabilityStatus || 'AVAILABLE',
      is_active: driver.isActive !== undefined ? driver.isActive : true,
      address: driver.address,
      emergency_contact_name: driver.emergencyContactName,
      emergency_contact_phone: driver.emergencyContactPhone,
      updated_at: new Date().toISOString(),
    };
    if (driver.id) {
      const { data, error } = await supabase.from('drivers').update(payload).eq('id', driver.id).select().single();
      if (error) throw new Error(`Failed to update driver: ${error.message}`);
      return { ...driver, ...data } as DriverRecord;
    } else {
      const { data, error } = await supabase.from('drivers').insert(payload).select().single();
      if (error) throw new Error(`Failed to insert driver: ${error.message}`);
      return { ...driver, ...data } as DriverRecord;
    }
  }

  async getFleetKPIs(): Promise<FleetKPIs> {
    const [trucksRes, driversRes] = await Promise.all([
      supabase.from('trucks').select('maintenance_status, is_active'),
      supabase.from('drivers').select('availability_status, is_active'),
    ]);

    if (trucksRes.error) throw new Error(`Failed to fetch fleet KPIs: ${trucksRes.error.message}`);
    if (driversRes.error) throw new Error(`Failed to fetch driver KPIs: ${driversRes.error.message}`);

    const trucks = trucksRes.data || [];
    const drivers = driversRes.data || [];

    return {
      totalTrucks: trucks.length,
      operationalTrucks: trucks.filter((t) => t.maintenance_status === 'OPERATIONAL' && t.is_active).length,
      underMaintenanceTrucks: trucks.filter((t) => t.maintenance_status === 'UNDER_MAINTENANCE' || t.maintenance_status === 'GROUNDED').length,
      activeTripsCount: 0,
      totalDrivers: drivers.length,
      availableDrivers: drivers.filter((d) => d.availability_status === 'AVAILABLE' && d.is_active).length,
      assignedDrivers: drivers.filter((d) => d.availability_status === 'ASSIGNED_TO_TRIP').length,
    };
  }
}
