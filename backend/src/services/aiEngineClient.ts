import { config } from '../config/env';
import { logger } from '../utils/logger';

export interface Coordinate {
  lat: number;
  lon: number;
  address?: string;
  name?: string;
}

export interface ShipmentItemPayload {
  shipment_id: string;
  shipper_name?: string;
  cargo_category: string;
  cargo_description?: string;
  is_perishable?: boolean;
  weight_kg: number;
  volume_cubic_meters: number;
  pickup_location: Coordinate;
  delivery_location: Coordinate;
  pickup_earliest_min?: number;
  pickup_latest_min?: number;
  delivery_earliest_min?: number;
  delivery_latest_min?: number;
  loading_dwell_min?: number;
  unloading_dwell_min?: number;
}

export interface VehicleItemPayload {
  vehicle_id: string;
  vehicle_type?: string;
  registration_number?: string;
  max_payload_kg: number;
  max_volume_cubic_meters: number;
  start_depot: Coordinate;
  end_depot?: Coordinate;
  earliest_start_min?: number;
  latest_finish_min?: number;
  max_stops?: number;
  cost_per_km_inr?: number;
  fixed_mobilization_cost_inr?: number;
  driver_rate_per_hour_inr?: number;
}

export interface RouteOptimizationPayload {
  trip_id?: string;
  vehicles: VehicleItemPayload[];
  shipments: ShipmentItemPayload[];
  solver_timeout_seconds?: number;
  routing_mode?: 'OSRM' | 'ROAD_MATRIX' | 'SIMULATION';
}

export interface RouteOptimizationResult {
  success: boolean;
  status: 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE' | 'NO_SOLUTION_FOUND';
  algorithm_version: string;
  reproducibility_hash: string;
  timestamp: string;
  total_distance_km: number;
  total_duration_minutes: number;
  total_empty_km: number;
  vehicle_routes: Array<{
    vehicle_id: string;
    registration_number?: string;
    stops: Array<{
      sequence: number;
      stop_type: 'START_DEPOT' | 'PICKUP' | 'DELIVERY' | 'END_DEPOT';
      shipment_id?: string;
      address: string;
      location: Coordinate;
      arrival_time_min: number;
      departure_time_min: number;
      dwell_time_min: number;
      load_after_stop_kg: number;
      load_after_stop_volume_m3: number;
      utilization_percentage: number;
    }>;
    assigned_shipments: string[];
    total_distance_km: number;
    total_duration_minutes: number;
    empty_return_km: number;
    max_payload_utilized_kg: number;
    peak_payload_utilization_pct: number;
    peak_volume_utilization_pct: number;
    estimated_trip_cost_inr: number;
  }>;
  unassigned_shipments: Array<{
    shipment_id: string;
    reason: string;
    constraint_violated: string;
  }>;
  cost_allocation?: {
    total_trip_cost_inr: number;
    fixed_mobilization_cost_inr: number;
    running_distance_cost_inr: number;
    stop_service_cost_inr: number;
    total_shipments_consolidated: number;
    allocations: Array<{
      shipment_id: string;
      shipper_name?: string;
      weight_kg: number;
      direct_distance_km: number;
      ton_km: number;
      ton_km_share_pct: number;
      base_allocated_cost_inr: number;
      stop_handling_charge_inr: number;
      detour_contribution_charge_inr: number;
      total_allocated_cost_inr: number;
      solo_truck_benchmark_cost_inr: number;
      net_savings_inr: number;
      savings_percentage: number;
      allocation_method: string;
      explanation: string;
    }>;
    sum_allocated_inr: number;
    cost_recovery_balanced: boolean;
  };
  benchmark?: {
    total_distance_km: any;
    total_cost_inr: any;
    average_vehicle_utilization_pct: any;
    empty_running_km: any;
    carbon_emissions_kg_co2: any;
    summary: string;
  };
  status_message: string;
}

export interface BackhaulRequestPayload {
  vehicle: VehicleItemPayload;
  return_origin: Coordinate;
  candidate_shipments: ShipmentItemPayload[];
}

export class AiEngineClient {
  private baseUrl: string;
  private timeoutMs: number;

  constructor(baseUrl = config.AI_ENGINE_URL || 'http://localhost:8000', timeoutMs = 15000) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.timeoutMs = timeoutMs;
  }

  async checkHealth(): Promise<{ status: string; service: string; details?: unknown }> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!res.ok) {
        return { status: 'DEGRADED', service: 'ai-engine', details: `HTTP ${res.status}` };
      }

      const body = await res.json();
      return { status: 'HEALTHY', service: 'ai-engine', details: body };
    } catch (error) {
      logger.warn('AI Engine health check unreachable:', error instanceof Error ? error.message : error);
      return { status: 'UNAVAILABLE', service: 'ai-engine', details: 'Connection failed or timeout' };
    }
  }

  async optimizeRoute(req: RouteOptimizationPayload): Promise<RouteOptimizationResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/optimization/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`AI Engine optimization failed [HTTP ${res.status}]: ${errorText}`);
      }

      return (await res.json()) as RouteOptimizationResult;
    } catch (error) {
      clearTimeout(timer);
      logger.error('Failed to communicate with AI Engine optimization route:', error);
      throw error;
    }
  }

  async evaluateBackhaul(req: BackhaulRequestPayload): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/optimization/backhaul`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`AI Engine backhaul failed [HTTP ${res.status}]: ${errorText}`);
      }

      return await res.json();
    } catch (error) {
      clearTimeout(timer);
      logger.error('Failed to communicate with AI Engine backhaul:', error);
      throw error;
    }
  }

  async getAuditHistory(limit = 20): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/optimization/audit-history?limit=${limit}`, {
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`AI Engine audit history failed [HTTP ${res.status}]`);
      }

      return await res.json();
    } catch (error) {
      clearTimeout(timer);
      logger.error('Failed to fetch AI Engine audit history:', error);
      throw error;
    }
  }

  async getEngineStatus(): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/optimization/engine-status`, {
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`AI Engine status probe failed [HTTP ${res.status}]`);
      }

      return await res.json();
    } catch (error) {
      clearTimeout(timer);
      logger.error('Failed to probe AI Engine engine status:', error);
      throw error;
    }
  }
}

export const aiEngineClient = new AiEngineClient();
