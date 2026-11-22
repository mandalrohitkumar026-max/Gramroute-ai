import { apiClient } from './apiClient';

export interface CreateVehiclePayload {
  registrationNumber: string;
  vehicleType: string;
  vehicleCategory?: string;
  makeAndModel: string;
  yearOfManufacture: number;
  payloadCapacityKg: number;
  volumetricCapacityCubicMeters?: number;
  dimensions?: {
    lengthM?: number;
    widthM?: number;
    heightM?: number;
  };
  hasRefrigeration?: boolean;
  hasTarpaulinCover?: boolean;
  permitType?: string;
  operatingAreas?: string[];
  isAvailable?: boolean;
  availabilityStatus?: string;
  documents?: Array<{
    documentType: string;
    documentNumber?: string;
    documentUrl: string;
  }>;
}

export const vehicleService = {
  async registerVehicle(payload: CreateVehiclePayload) {
    return apiClient.post<any>('/vehicles', payload);
  },

  async getVehicles(params?: { vehicleType?: string; verificationStatus?: string; isAvailable?: boolean; all?: boolean }) {
    return apiClient.get<any>('/vehicles', params as Record<string, unknown>);
  },

  async getVehicleById(id: string) {
    return apiClient.get<any>(`/vehicles/${id}`);
  },

  async updateVehicle(id: string, payload: Partial<CreateVehiclePayload>) {
    return apiClient.patch<any>(`/vehicles/${id}`, payload);
  },

  async updateAvailability(id: string, isAvailable: boolean, availabilityStatus?: string) {
    return apiClient.patch<any>(`/vehicles/${id}/availability`, { isAvailable, availabilityStatus });
  },

  async uploadDocument(id: string, documentType: string, documentUrl: string, documentNumber?: string) {
    return apiClient.post<any>(`/vehicles/${id}/documents`, { documentType, documentUrl, documentNumber });
  },

  async deleteVehicle(id: string) {
    return apiClient.delete<any>(`/vehicles/${id}`);
  }
};
