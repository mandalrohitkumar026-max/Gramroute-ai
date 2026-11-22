import { AxiosError } from 'axios';
import { ApiResponse } from '../types/api';

export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const apiError = (error.response?.data as ApiResponse<unknown>)?.error;
    if (apiError?.message) {
      return apiError.message;
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};
