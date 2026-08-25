import type { IResourceRepository } from '../interfaces';
import type { Quarry, Material, Truck } from '@ar-multiventures/types';
import { supabase } from './supabase-client';
import { mockTrucks } from '../mock/mock-db';

export class SupabaseResourceRepository implements IResourceRepository {
  async getQuarries(): Promise<Quarry[]> {
    const { data, error } = await supabase
      .from('quarries')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error || !data || data.length === 0) {
      // Fallback
      return [];
    }

    return data.map((q) => ({
      id: q.id,
      name: q.name,
      code: q.code,
      location: q.location_address,
      state: q.state,
      region: q.region,
      coordinates: q.latitude && q.longitude ? { lat: Number(q.latitude), lng: Number(q.longitude) } : undefined,
      supportedMaterials: [],
      operationalCapacityTonsPerDay: Number(q.loading_capacity_tonnes_per_day),
      isActive: q.is_active,
    }));
  }

  async getMaterials(): Promise<Material[]> {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((m) => ({
      id: m.id,
      name: m.name,
      code: m.code,
      category: m.category,
      specification: m.specification,
      description: m.description || '',
      unit: m.unit as any,
      densityTonPerCbm: m.density_ton_per_cbm ? Number(m.density_ton_per_cbm) : undefined,
      isAvailable: m.is_active,
    }));
  }

  async getTrucks(): Promise<Truck[]> {
    const { data, error } = await supabase
      .from('truck_types')
      .select('*')
      .eq('is_active', true)
      .order('capacity_tonnes');

    if (error || !data || data.length === 0) {
      return mockTrucks;
    }

    return data.map((t, idx) => ({
      id: t.id,
      registrationNumber: `AR-TRK-0${idx + 1}`,
      fleetCode: t.code,
      capacityTonnes: Number(t.capacity_tonnes),
      type: 'heavy_tipper',
      makeModel: t.name,
      assignedDriverName: 'Assigned Driver',
      assignedDriverPhone: '+234 800 AR MULTI',
      isAvailable: true,
      currentStatus: 'idle',
    }));
  }
}
