import mongoose, { Schema, Document, Model } from 'mongoose';

export type TrackingEventType =
  | 'TRIP_STARTED'
  | 'LOCATION_PING'
  | 'ARRIVED_PICKUP'
  | 'CARGO_LOADED'
  | 'IN_TRANSIT'
  | 'DELAY_DETECTED'
  | 'ROUTE_DEVIATION'
  | 'ARRIVED_DESTINATION'
  | 'CARGO_UNLOADED'
  | 'POD_VERIFIED'
  | 'TRIP_COMPLETED';

export interface ITrackingEvent extends Document {
  tripId: mongoose.Types.ObjectId;
  shipmentId?: mongoose.Types.ObjectId;
  eventType: TrackingEventType;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  speedKmh?: number;
  batteryLevelPercentage?: number;
  recordedAt: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const TrackingEventSchema = new Schema<ITrackingEvent>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Shipment',
      index: true
    },
    eventType: {
      type: String,
      enum: [
        'TRIP_STARTED',
        'LOCATION_PING',
        'ARRIVED_PICKUP',
        'CARGO_LOADED',
        'IN_TRANSIT',
        'DELAY_DETECTED',
        'ROUTE_DEVIATION',
        'ARRIVED_DESTINATION',
        'CARGO_UNLOADED',
        'POD_VERIFIED',
        'TRIP_COMPLETED'
      ],
      required: true,
      index: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    speedKmh: Number,
    batteryLevelPercentage: Number,
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    metadata: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

TrackingEventSchema.index({ location: '2dsphere' });
TrackingEventSchema.index({ tripId: 1, recordedAt: -1 });

export const TrackingEvent: Model<ITrackingEvent> =
  mongoose.models.TrackingEvent || mongoose.model<ITrackingEvent>('TrackingEvent', TrackingEventSchema);
