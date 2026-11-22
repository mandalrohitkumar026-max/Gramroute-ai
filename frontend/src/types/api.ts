export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
}

export type Role = 'FARMER' | 'BUSINESS' | 'TRANSPORTER' | 'ADMIN';

export interface HealthCheckResponse {
  status: string;
  uptimeSeconds: number;
  service: string;
  version: string;
  environment: string;
  timestamp: string;
}

export interface ReadinessCheckResponse {
  ready: boolean;
  checks: {
    database: {
      status: string;
      readyStateCode: number;
    };
    aiEngine: {
      status: string;
      service: string;
      details?: unknown;
    };
  };
  timestamp: string;
}
