import { apiClient } from './apiClient';

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  category: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  channel: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  async getMyNotifications(params?: { isRead?: boolean; page?: number; limit?: number }) {
    const res = await apiClient.get<{ notifications: AppNotification[]; total: number; unreadCount: number }>('/notifications', params as Record<string, unknown>);
    return res?.data;
  },

  async markAsRead(id: string) {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    return apiClient.patch('/notifications/read-all');
  }
};
