import mongoose from 'mongoose';
import { Notification, INotification, NotificationChannel, NotificationPriority } from '../models/Notification';
import { websocketService } from './websocketService';
import { logger } from '../utils/logger';

export interface SendNotificationOptions {
  recipientId: string | mongoose.Types.ObjectId;
  title: string;
  message: string;
  category: string;
  channel?: NotificationChannel;
  priority?: NotificationPriority;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  // Optional recipient phone/email for external channel adapters
  recipientPhone?: string;
  recipientEmail?: string;
}

// Multi-Channel External Provider Interfaces
export interface SmsAdapter {
  sendSms(toPhone: string, message: string): Promise<{ success: boolean; providerMessageId?: string; isSimulated: boolean }>;
}

export interface EmailAdapter {
  sendEmail(toEmail: string, subject: string, bodyText: string): Promise<{ success: boolean; isSimulated: boolean }>;
}

// Console & Mock Adapters (Used until external provider credentials like Msg91/Twilio/SendGrid are set in .env)
export const mockSmsAdapter: SmsAdapter = {
  async sendSms(toPhone: string, message: string) {
    logger.info(`[SMS Dispatcher - Simulated Provider] To: ${toPhone} | Message: "${message}"`);
    return {
      success: true,
      providerMessageId: `SIM-SMS-${Date.now()}`,
      isSimulated: true
    };
  }
};

export const mockEmailAdapter: EmailAdapter = {
  async sendEmail(toEmail: string, subject: string, bodyText: string) {
    logger.info(`[Email Dispatcher - Simulated SMTP] To: ${toEmail} | Subject: "${subject}" | Content length: ${bodyText.length}`);
    return {
      success: true,
      isSimulated: true
    };
  }
};

export class NotificationService {
  private smsAdapter: SmsAdapter = mockSmsAdapter;
  private emailAdapter: EmailAdapter = mockEmailAdapter;

  /**
   * Dispatches an in-app notification and broadcasts it live via WebSockets.
   * If SMS or EMAIL is requested, delegates to the configured channel adapter.
   */
  async notify(options: SendNotificationOptions): Promise<INotification> {
    const channel = options.channel || 'IN_APP';
    const priority = options.priority || 'NORMAL';

    // 1. Create In-App Notification in DB
    const notification = await Notification.create({
      recipientId: options.recipientId,
      title: options.title,
      message: options.message,
      category: options.category,
      channel,
      priority,
      actionUrl: options.actionUrl,
      metadata: options.metadata || {},
      isRead: false
    });

    // 2. Broadcast immediately to user's real-time WebSocket connection
    try {
      websocketService.broadcastToUser(options.recipientId.toString(), 'NOTIFICATION', {
        id: notification?._id,
        title: notification?.title || options.title,
        message: notification?.message || options.message,
        category: notification?.category || options.category,
        priority: notification?.priority || priority,
        actionUrl: notification?.actionUrl || options.actionUrl,
        createdAt: notification?.createdAt || new Date()
      });
    } catch (e) {
      logger.warn('Failed to broadcast live notification over WebSocket:', e);
    }

    // 3. Delegate to external communication channels if requested
    if (channel === 'SMS' && options.recipientPhone) {
      await this.smsAdapter.sendSms(options.recipientPhone, `${options.title}: ${options.message}`);
    }

    if (options.recipientEmail) {
      await this.emailAdapter.sendEmail(options.recipientEmail, options.title, options.message);
    }

    return notification;
  }

  // --- Convenience Trigger Methods ---

  async notifyTripStarted(transporterName: string, tripNumber: string, shipperIds: string[]): Promise<void> {
    for (const shipperId of shipperIds) {
      await this.notify({
        recipientId: shipperId,
        title: 'Trip Started & Vehicle En Route',
        message: `${transporterName} has started trip ${tripNumber}. Live tracking is now active.`,
        category: 'TRIP_STARTED',
        priority: 'HIGH',
        actionUrl: `/dashboard/farmer/tracking`
      });
    }
  }

  async notifyDriverArrivedAtPickup(pickupAddress: string, shipperId: string): Promise<void> {
    await this.notify({
      recipientId: shipperId,
      title: 'Vehicle Arrived at Pickup Location',
      message: `The truck has arrived at ${pickupAddress}. Please have your cargo ready for loading.`,
      category: 'ARRIVED_PICKUP',
      priority: 'HIGH',
      actionUrl: `/dashboard/farmer/tracking`
    });
  }

  async notifyCargoLoaded(trackingNumber: string, shipperId: string): Promise<void> {
    await this.notify({
      recipientId: shipperId,
      title: 'Cargo Loaded & In Transit',
      message: `Shipment ${trackingNumber} has been verified, loaded onto the vehicle, and is in transit.`,
      category: 'CARGO_LOADED',
      priority: 'NORMAL',
      actionUrl: `/dashboard/farmer/tracking`
    });
  }

  async notifyTripDelay(tripNumber: string, delayMinutes: number, reason: string, shipperIds: string[]): Promise<void> {
    for (const shipperId of shipperIds) {
      await this.notify({
        recipientId: shipperId,
        title: `Transit Delay Notice (+${delayMinutes} mins)`,
        message: `Trip ${tripNumber} has experienced a ${delayMinutes}-minute delay due to ${reason.toLowerCase().replace(/_/g, ' ')}. ETAs have been updated.`,
        category: 'TRIP_DELAY',
        priority: 'URGENT',
        actionUrl: `/dashboard/farmer/tracking`
      });
    }
  }

  async notifyDeliveryCompleted(trackingNumber: string, receiverName: string, shipperId: string): Promise<void> {
    await this.notify({
      recipientId: shipperId,
      title: 'Delivery Successfully Completed!',
      message: `Shipment ${trackingNumber} was delivered to ${receiverName}. Proof of Delivery (POD) has been verified.`,
      category: 'DELIVERY_COMPLETED',
      priority: 'HIGH',
      actionUrl: `/dashboard/farmer/booking-history`
    });
  }
}

export const notificationService = new NotificationService();
