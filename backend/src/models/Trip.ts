import mongoose, { Schema, Document, Model } from 'mongoose';

export type TripStatus = 'PLANNED' | 'EN_ROUTE_PICKUP' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export interface ITrip extends Document {
  transporterId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  routeSummary?: string;
  origin: {
    address: string;
    district: string;
    state: string;
    location?: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  destination: {
    address: string;
    district: string;
    state: string;
    location?: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  departureTime: Date;
  estimatedArrivalTime: Date;
  actualStartTime?: Date;
  actualCompletionTime?: Date;
  totalDistanceKm: number;
  totalEstimatedFuelCost: number;
  totalAgreedEarnings: number;
  allocatedWeightKg: number;
  remainingCapacityKg: number;
  remainingVolumeCbm: number;
  isPublished: boolean;
  operatingCorridors: string[];
  status: TripStatus;
  optimizedPolyline?: string;
  isBackhaulTrip: boolean;
  lastKnownLocation?: {
    type: 'Point';
    coordinates: [number, number];
    speedKmh?: number;
    accuracyMeters?: number;
    updatedAt: Date;
  };
  reportedDelayMinutes?: number;
  delayReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new Schema<ITrip>(
  {
    transporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true
    },
    routeSummary: {
      type: String
    },
    origin: {
      address: { type: String, default: 'Nashik Aggregation Hub' },
      district: { type: String, default: 'Nashik', index: true },
      state: { type: String, default: 'Maharashtra' },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [73.8344, 20.0063] }
      }
    },
    destination: {
      address: { type: String, default: 'Vashi APMC Mandi' },
      district: { type: String, default: 'Mumbai Suburban', index: true },
      state: { type: String, default: 'Maharashtra' },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [72.9982, 19.0771] }
      }
    },
    departureTime: {
      type: Date,
      required: true,
      index: true
    },
    estimatedArrivalTime: {
      type: Date,
      required: true
    },
    actualStartTime: Date,
    actualCompletionTime: Date,
    totalDistanceKm: {
      type: Number,
      default: 0
    },
    totalEstimatedFuelCost: {
      type: Number,
      default: 0
    },
    totalAgreedEarnings: {
      type: Number,
      default: 0
    },
    allocatedWeightKg: {
      type: Number,
      default: 0
    },
    remainingCapacityKg: {
      type: Number,
      required: true,
      index: true
    },
    remainingVolumeCbm: {
      type: Number,
      default: 10
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true
    },
    operatingCorridors: {
      type: [String],
      default: ['Nashik-Mumbai', 'Nashik-Pune']
    },
    status: {
      type: String,
      enum: ['PLANNED', 'EN_ROUTE_PICKUP', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'],
      default: 'PLANNED',
      index: true
    },
    optimizedPolyline: String,
    isBackhaulTrip: {
      type: Boolean,
      default: false
    },
    lastKnownLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number],
      speedKmh: Number,
      accuracyMeters: Number,
      updatedAt: Date
    },
    reportedDelayMinutes: {
      type: Number,
      default: 0
    },
    delayReason: String
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

TripSchema.index({ 'origin.location': '2dsphere' });
TripSchema.index({ 'destination.location': '2dsphere' });

export const Trip: Model<ITrip> = mongoose.models.Trip || mongoose.model<ITrip>('Trip', TripSchema);
