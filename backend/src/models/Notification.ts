import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationChannel = 'IN_APP' | 'SMS' | 'WHATSAPP';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  category: string; // e.g. 'MATCH_FOUND', 'TRIP_UPDATE', 'PAYMENT', 'DISPUTE'
  actionUrl?: string;
  isRead: boolean;
  readAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    channel: {
      type: String,
      enum: ['IN_APP', 'SMS', 'WHATSAPP'],
      default: 'IN_APP'
    },
    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
      default: 'NORMAL'
    },
    category: {
      type: String,
      required: true,
      index: true
    },
    actionUrl: String,
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: Date,
    metadata: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
