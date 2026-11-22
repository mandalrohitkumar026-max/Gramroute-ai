import { apiClient } from './apiClient';

export interface CreateTripPayload {
  vehicleId: string;
  routeSummary?: string;
  origin: {
    address: string;
    district: string;
    state: string;
    location?: { type: 'Point'; coordinates: [number, number] };
  };
  destination: {
    address: string;
    district: string;
    state: string;
    location?: { type: 'Point'; coordinates: [number, number] };
  };
  departureTime: string;
  estimatedArrivalTime: string;
  availableCapacityKg: number;
  availableVolumeCbm?: number;
  totalPriceInr?: number;
  operatingCorridors?: string[];
  isPublished?: boolean;
}

export const tripService = {
  async publishTrip(payload: CreateTripPayload) {
    return apiClient.post<any>('/trips', payload);
  },

  async getTrips(params?: { status?: string; transporterId?: string; hasAvailableCapacity?: boolean; page?: number; limit?: number }) {
    return apiClient.get<any>('/trips', params as Record<string, unknown>);
  },

  async getTripById(id: string) {
    return apiClient.get<any>(`/trips/${id}`);
  },

  async updateTripStatus(id: string, status: string) {
    return apiClient.patch<any>(`/trips/${id}/status`, { status });
  }
};
