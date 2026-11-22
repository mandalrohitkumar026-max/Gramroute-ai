import { apiClient } from './apiClient';
import { HealthCheckResponse, ReadinessCheckResponse } from '../types/api';

export const healthService = {
  getLiveness: async (): Promise<HealthCheckResponse> => {
    const res = await apiClient.get<HealthCheckResponse>('/health');
    if (!res.data) throw new Error('No health data returned');
    return res.data;
  },

  getReadiness: async (): Promise<ReadinessCheckResponse> => {
    const res = await apiClient.get<ReadinessCheckResponse>('/health/ready');
    if (!res.data) throw new Error('No readiness data returned');
    return res.data;
  }
};
