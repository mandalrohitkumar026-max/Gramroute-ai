import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  businessName?: string;
  avatarUrl?: string;

  // Address and Geospatial coordinates
  address: {
    street?: string;
    villageOrTown: string;
    subDistrict?: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };

  // Farmer specifics
  fpoAffiliation?: string;
  primaryCrop?: string;
  landHoldingAcres?: number;

  // Business specifics
  businessType?: string;
  gstNumber?: string;
  contactPerson?: string;

  // Transporter specifics
  operatorName?: string;
  serviceCorridors?: string[];
  fleetSize?: number;
  permitType?: string;

  // Status & Metrics
  isOnboardingComplete: boolean;
  ratingAverage: number;
  totalRatingsCount: number;

  // Soft deletion
  isDeleted: boolean;
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    businessName: {
      type: String,
      trim: true
    },
    avatarUrl: {
      type: String
    },
    address: {
      street: String,
      villageOrTown: { type: String, default: 'Dindori' },
      subDistrict: String,
      district: { type: String, default: 'Nashik', index: true },
      state: { type: String, default: 'Maharashtra', index: true },
      pincode: { type: String, default: '422001', index: true },
      country: { type: String, default: 'India' }
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [73.8344, 20.0063] // Nashik default
      }
    },

    // Role-specific extensions
    fpoAffiliation: String,
    primaryCrop: String,
    landHoldingAcres: Number,

    businessType: String,
    gstNumber: String,
    contactPerson: String,

    operatorName: String,
    serviceCorridors: [{ type: String }],
    fleetSize: { type: Number, default: 1 },
    permitType: String,

    isOnboardingComplete: {
      type: Boolean,
      default: false
    },
    ratingAverage: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5
    },
    totalRatingsCount: {
      type: Number,
      default: 0
    },

    // Soft deletion
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date
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

ProfileSchema.index({ location: '2dsphere' });

export const Profile: Model<IProfile> = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
