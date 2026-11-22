import { apiClient } from './apiClient';

export const adminService = {
  async getMetrics() {
    return apiClient.get<any>('/admin/metrics');
  },

  async getFlaggedActivities() {
    return apiClient.get<any>('/admin/flagged');
  },

  async verifyVehicle(id: string, status: 'VERIFIED' | 'REJECTED', notes?: string) {
    return apiClient.patch<any>(`/admin/vehicles/${id}/verify`, { status, notes });
  },

  async verifyDocument(vehicleId: string, documentId: string, status: 'VERIFIED' | 'REJECTED') {
    return apiClient.patch<any>(`/admin/vehicles/${vehicleId}/documents/${documentId}/verify`, { status });
  },

  async verifyUserIdentity(userId: string, isIdentityVerified: boolean) {
    return apiClient.patch<any>(`/admin/users/${userId}/verify-identity`, { isIdentityVerified });
  }
};
