import mongoose, { Schema, Document, Model } from 'mongoose';

export type StopType = 'PICKUP' | 'DROP' | 'REST_BREAK' | 'FUEL_STOP';
export type StopStatus = 'PENDING' | 'ARRIVED' | 'COMPLETED' | 'SKIPPED';

export interface ITripStop extends Document {
  tripId: mongoose.Types.ObjectId;
  shipmentId?: mongoose.Types.ObjectId;
  stopSequenceOrder: number;
  stopType: StopType;
  locationName: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  scheduledArrivalTime: Date;
  scheduledDepartureTime: Date;
  actualArrivalTime?: Date;
  actualDepartureTime?: Date;
  status: StopStatus;
  contactPersonName?: string;
  contactPhoneNumber?: string;
  otpForAction?: string;
  proofImageUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TripStopSchema = new Schema<ITripStop>(
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
    stopSequenceOrder: {
      type: Number,
      required: true,
      min: 1
    },
    stopType: {
      type: String,
      enum: ['PICKUP', 'DROP', 'REST_BREAK', 'FUEL_STOP'],
      required: true,
      index: true
    },
    locationName: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
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
    scheduledArrivalTime: {
      type: Date,
      required: true
    },
    scheduledDepartureTime: {
      type: Date,
      required: true
    },
    actualArrivalTime: {
      type: Date
    },
    actualDepartureTime: {
      type: Date
    },
    status: {
      type: String,
      enum: ['PENDING', 'ARRIVED', 'COMPLETED', 'SKIPPED'],
      default: 'PENDING',
      index: true
    },
    contactPersonName: String,
    contactPhoneNumber: String,
    otpForAction: String,
    proofImageUrl: String,
    notes: String
  },
  {
    timestamps: true
  }
);

TripStopSchema.index({ tripId: 1, stopSequenceOrder: 1 }, { unique: true });
TripStopSchema.index({ location: '2dsphere' });

export const TripStop: Model<ITripStop> = mongoose.models.TripStop || mongoose.model<ITripStop>('TripStop', TripStopSchema);
