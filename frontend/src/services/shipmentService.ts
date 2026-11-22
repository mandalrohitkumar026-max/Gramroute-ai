import { apiClient } from './apiClient';

export interface CreateShipmentPayload {
  cargoName: string;
  cargoDescription?: string;
  cargoCategory: string;
  isPerishable: boolean;
  weightKg: number;
  volumeCubicMeters?: number;
  numberOfPackages?: number;
  packagingType?: string;
  handlingRequirements?: string[];
  specialInstructions?: string;
  preferredTransportType?: string;
  origin: {
    address: string;
    villageOrTown?: string;
    district: string;
    state: string;
    pincode?: string;
    location?: { type: 'Point'; coordinates: [number, number] };
  };
  destination: {
    address: string;
    mandiOrMarketName?: string;
    villageOrTown?: string;
    district: string;
    state: string;
    pincode?: string;
    location?: { type: 'Point'; coordinates: [number, number] };
  };
  preferredPickupDate?: string;
  deliveryDeadline?: string;
  maxBudgetInr?: number;
}

export interface ShipmentFilterParams {
  search?: string;
  cargoCategory?: string;
  isPerishable?: boolean;
  destinationDistrict?: string;
  minWeight?: number;
  maxWeight?: number;
  status?: string;
  all?: boolean;
  marketplace?: boolean;
  page?: number;
  limit?: number;
}

export const shipmentService = {
  async createShipment(payload: CreateShipmentPayload) {
    return apiClient.post<any>('/shipments', payload);
  },

  async getShipments(params?: ShipmentFilterParams) {
    return apiClient.get<any>('/shipments', params as Record<string, unknown>);
  },

  async getShipmentById(id: string) {
    return apiClient.get<any>(`/shipments/${id}`);
  },

  async updateShipment(id: string, payload: Partial<CreateShipmentPayload>) {
    return apiClient.patch<any>(`/shipments/${id}`, payload);
  },

  async cancelShipment(id: string) {
    return apiClient.post<any>(`/shipments/${id}/cancel`);
  }
};
