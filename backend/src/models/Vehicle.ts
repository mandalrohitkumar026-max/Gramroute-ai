import mongoose, { Schema, Document, Model } from 'mongoose';

export type VehicleType = 'PICKUP_TRUCK' | 'MINI_TRUCK' | 'TRACTOR_TROLLEY' | 'HEAVY_TRUCK' | 'REFRIGERATED_VAN';
export type VehicleVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type VehicleAvailabilityStatus = 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE' | 'OFFLINE';

export interface IVehicleDocument {
  documentType: string; // RC, FITNESS, PERMIT, INSURANCE, POLLUTION
  documentNumber?: string;
  documentUrl: string;
  verificationStatus: VehicleVerificationStatus;
  uploadedAt: Date;
}

export interface IVehicle extends Document {
  transporterId: mongoose.Types.ObjectId;
  registrationNumber: string;
  vehicleType: VehicleType;
  vehicleCategory?: string; // OPEN_BODY, CLOSED_CONTAINER, TARPAULIN, REEFER, TROLLEY
  makeAndModel: string;
  yearOfManufacture: number;
  payloadCapacityKg: number;
  volumetricCapacityCubicMeters: number;
  dimensions?: {
    lengthM?: number;
    widthM?: number;
    heightM?: number;
  };
  hasRefrigeration: boolean;
  hasTarpaulinCover: boolean;
  permitType: string;
  insuranceValidUntil?: Date;
  fitnessCertValidUntil?: Date;
  verificationStatus: VehicleVerificationStatus;
  verificationNotes?: string;
  documents: IVehicleDocument[];
  isAvailable: boolean;
  availabilityStatus: VehicleAvailabilityStatus;
  operatingAreas: string[];
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    updatedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    transporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    vehicleType: {
      type: String,
      enum: ['PICKUP_TRUCK', 'MINI_TRUCK', 'TRACTOR_TROLLEY', 'HEAVY_TRUCK', 'REFRIGERATED_VAN'],
      required: true,
      index: true
    },
    vehicleCategory: {
      type: String,
      default: 'TARPAULIN'
    },
    makeAndModel: {
      type: String,
      required: true
    },
    yearOfManufacture: {
      type: Number,
      required: true
    },
    payloadCapacityKg: {
      type: Number,
      required: true,
      index: true
    },
    volumetricCapacityCubicMeters: {
      type: Number,
      required: true
    },
    dimensions: {
      lengthM: Number,
      widthM: Number,
      heightM: Number
    },
    hasRefrigeration: {
      type: Boolean,
      default: false
    },
    hasTarpaulinCover: {
      type: Boolean,
      default: true
    },
    permitType: {
      type: String,
      default: 'State Permit'
    },
    insuranceValidUntil: {
      type: Date
    },
    fitnessCertValidUntil: {
      type: Date
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
      index: true
    },
    verificationNotes: {
      type: String
    },
    documents: [
      {
        documentType: { type: String, required: true },
        documentNumber: String,
        documentUrl: { type: String, required: true },
        verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    isAvailable: {
      type: Boolean,
      default: true,
      index: true
    },
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE', 'ON_TRIP', 'MAINTENANCE', 'OFFLINE'],
      default: 'AVAILABLE',
      index: true
    },
    operatingAreas: {
      type: [String],
      default: ['Nashik', 'Pune', 'Mumbai', 'Dindori']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [73.8344, 20.0063]
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }
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

VehicleSchema.index({ currentLocation: '2dsphere' });

export const Vehicle: Model<IVehicle> = mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);
