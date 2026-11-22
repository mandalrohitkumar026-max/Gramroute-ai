import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request Interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Can inject client auth tokens or correlation IDs if needed
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError<ApiResponse<unknown>>) => {
        const errorData = error.response?.data?.error;
        const normalizedMessage = errorData?.message || error.message || 'An unexpected network error occurred';
        // eslint-disable-next-line no-console
        console.error(`[API Error] ${error.config?.url}:`, normalizedMessage);
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const res = await this.instance.get<ApiResponse<T>>(url, { params });
    return res.data;
  }

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const res = await this.instance.post<ApiResponse<T>>(url, data);
    return res.data;
  }

  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const res = await this.instance.put<ApiResponse<T>>(url, data);
    return res.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const res = await this.instance.patch<ApiResponse<T>>(url, data);
    return res.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const res = await this.instance.delete<ApiResponse<T>>(url);
    return res.data;
  }
}

export const apiClient = new ApiClient();
