import { apiClient } from './apiClient';

export interface CreateBookingPayload {
  shipmentId: string;
  tripId: string;
  allocatedWeightKg?: number;
  allocatedVolumeCbm?: number;
  agreedPriceInr?: number;
}

export const bookingService = {
  async createBooking(payload: CreateBookingPayload) {
    return apiClient.post<any>('/bookings', payload);
  },

  async getBookings(params?: { bookingStatus?: string; page?: number; limit?: number }) {
    return apiClient.get<any>('/bookings', params as Record<string, unknown>);
  },

  async getBookingById(id: string) {
    return apiClient.get<any>(`/bookings/${id}`);
  },

  async respondToBooking(id: string, action: 'ACCEPT' | 'REJECT', reason?: string) {
    return apiClient.post<any>(`/bookings/${id}/respond`, { action, reason });
  },

  async transitionStatus(id: string, status: string, otp?: string) {
    return apiClient.patch<any>(`/bookings/${id}/status`, { status, otp });
  },

  async cancelBooking(id: string, cancellationReasonCode: string, cancellationReason: string) {
    return apiClient.post<any>(`/bookings/${id}/cancel`, { cancellationReasonCode, cancellationReason });
  }
};
