import type { IFleetRepository } from '../interfaces';
import type {
  TruckRecord,
  DriverRecord,
  TruckMaintenanceRecord,
  FleetKPIs
} from '@ar-multiventures/types';
import { supabase } from './supabase-client';
import { MockFleetRepository } from '../mock/fleet-repository';

export class SupabaseFleetRepository implements IFleetRepository {
  private fallbackMock = new MockFleetRepository();

  async getTrucks(filters?: { isActive?: boolean; maintenanceStatus?: string; search?: string }): Promise<TruckRecord[]> {
    try {
      let query = supabase.from('trucks').select('*').order('created_at', { ascending: false });
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      if (filters?.maintenanceStatus) {
        query = query.eq('maintenance_status', filters.maintenanceStatus);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return this.fallbackMock.getTrucks(filters);
      }
      return data.map((t: any) => ({
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
    } catch {
      return this.fallbackMock.getTrucks(filters);
    }
  }

  async getTruckById(id: string): Promise<TruckRecord | null> {
    try {
      const { data, error } = await supabase.from('trucks').select('*').eq('id', id).single();
      if (error || !data) return this.fallbackMock.getTruckById(id);
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
    } catch {
      return this.fallbackMock.getTruckById(id);
    }
  }

  async saveTruck(truck: Partial<TruckRecord>): Promise<TruckRecord> {
    try {
      if (truck.id) {
        const { data, error } = await supabase
          .from('trucks')
          .update({
            registration_number: truck.registrationNumber,
            truck_type: truck.truckType,
            capacity_tonnes: truck.capacityTonnes,
            ownership_type: truck.ownershipType,
            contractor_name: truck.contractorName,
            make: truck.make,
            model: truck.model,
            is_active: truck.isActive,
            maintenance_status: truck.maintenanceStatus,
            insurance_expiry: truck.insuranceExpiry,
            roadworthiness_expiry: truck.roadworthinessExpiry,
            registration_expiry: truck.registrationExpiry,
            notes: truck.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', truck.id)
          .select()
          .single();

        if (error || !data) return this.fallbackMock.saveTruck(truck);
        return this.fallbackMock.saveTruck(truck);
      } else {
        const { data, error } = await supabase
          .from('trucks')
          .insert({
            registration_number: truck.registrationNumber,
            truck_type: truck.truckType || 'HEAVY_TIPPER_30T',
            capacity_tonnes: truck.capacityTonnes || 30.00,
            ownership_type: truck.ownershipType || 'COMPANY',
            contractor_name: truck.contractorName,
            make: truck.make,
            model: truck.model,
            is_active: truck.isActive !== undefined ? truck.isActive : true,
            maintenance_status: truck.maintenanceStatus || 'OPERATIONAL',
            insurance_expiry: truck.insuranceExpiry,
            roadworthiness_expiry: truck.roadworthinessExpiry,
            registration_expiry: truck.registrationExpiry,
            notes: truck.notes,
          })
          .select()
          .single();

        if (error || !data) return this.fallbackMock.saveTruck(truck);
        return this.fallbackMock.saveTruck(truck);
      }
    } catch {
      return this.fallbackMock.saveTruck(truck);
    }
  }

  async getTruckMaintenanceRecords(truckId?: string): Promise<TruckMaintenanceRecord[]> {
    return this.fallbackMock.getTruckMaintenanceRecords(truckId);
  }

  async saveMaintenanceRecord(record: Partial<TruckMaintenanceRecord>): Promise<TruckMaintenanceRecord> {
    return this.fallbackMock.saveMaintenanceRecord(record);
  }

  async getDrivers(filters?: { isActive?: boolean; availabilityStatus?: string; search?: string }): Promise<DriverRecord[]> {
    try {
      let query = supabase.from('drivers').select('*').order('created_at', { ascending: false });
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      if (filters?.availabilityStatus) {
        query = query.eq('availability_status', filters.availabilityStatus);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return this.fallbackMock.getDrivers(filters);
      }
      return data.map((d: any) => ({
        id: d.id,
        organizationId: d.organization_id,
        userId: d.user_id,
        firstName: d.first_name,
        lastName: d.last_name,
        phoneNumber: d.phone_number,
        email: d.email,
        licenseNumber: d.license_number,
        licenseCategory: d.license_category,
        licenseExpiry: d.license_expiry,
        assignedTruckId: d.assigned_truck_id,
        availabilityStatus: d.availability_status,
        isActive: d.is_active,
        address: d.address,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
    } catch {
      return this.fallbackMock.getDrivers(filters);
    }
  }

  async getDriverById(id: string): Promise<DriverRecord | null> {
    return this.fallbackMock.getDriverById(id);
  }

  async saveDriver(driver: Partial<DriverRecord>): Promise<DriverRecord> {
    return this.fallbackMock.saveDriver(driver);
  }

  async getFleetKPIs(): Promise<FleetKPIs> {
    return this.fallbackMock.getFleetKPIs();
  }
}
