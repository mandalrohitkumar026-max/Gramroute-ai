import mongoose, { Schema, Document, Model } from 'mongoose';

export type PerishabilityCategory = 'HIGHLY_PERISHABLE' | 'MODERATE' | 'NON_PERISHABLE';
export type ShipmentStatus =
  | 'PENDING'
  | 'LISTED'
  | 'MATCHED'
  | 'BOOKED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export interface IShipment extends Document {
  shipperId: mongoose.Types.ObjectId;
  cargoName: string;
  cargoDescription?: string;
  cargoCategory: string; // e.g., Vegetables, Fruits, Grains, Dairy, Fertilizers
  perishability: PerishabilityCategory;
  isPerishable: boolean;
  weightKg: number;
  volumeCubicMeters: number;
  numberOfPackages: number;
  packagingType: string; // Bags, Crates, Boxes, Loose, Pallets
  isStackable: boolean;
  temperatureControlRequired: boolean;
  handlingRequirements: string[]; // Fragile, Keep Upright, Do Not Stack, etc.
  specialInstructions?: string;
  preferredTransportType?: string; // Pickup Truck, Mini Truck, Tractor Trolley, Reefer
  origin: {
    address: string;
    villageOrTown: string;
    district: string;
    state: string;
    pincode: string;
    location: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
    };
  };
  destination: {
    address: string;
    mandiOrMarketName?: string;
    villageOrTown?: string;
    district: string;
    state: string;
    pincode: string;
    location: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
    };
  };
  pickupWindowStart: Date;
  pickupWindowEnd?: Date;
  deliveryWindowStart?: Date;
  deliveryWindowEnd: Date;
  preferredPickupDate?: Date;
  deliveryDeadline?: Date;
  maxBudgetInr: number;
  status: ShipmentStatus;
  specialHandlingNotes?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentSchema = new Schema<IShipment>(
  {
    shipperId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    cargoName: {
      type: String,
      required: true,
      trim: true
    },
    cargoDescription: {
      type: String,
      trim: true
    },
    cargoCategory: {
      type: String,
      required: true,
      index: true
    },
    perishability: {
      type: String,
      enum: ['HIGHLY_PERISHABLE', 'MODERATE', 'NON_PERISHABLE'],
      default: 'NON_PERISHABLE',
      index: true
    },
    isPerishable: {
      type: Boolean,
      default: false,
      index: true
    },
    weightKg: {
      type: Number,
      required: true,
      min: 1,
      index: true
    },
    volumeCubicMeters: {
      type: Number,
      default: 1,
      min: 0.01
    },
    numberOfPackages: {
      type: Number,
      default: 1,
      min: 1
    },
    packagingType: {
      type: String,
      default: 'Bags'
    },
    isStackable: {
      type: Boolean,
      default: true
    },
    temperatureControlRequired: {
      type: Boolean,
      default: false
    },
    handlingRequirements: {
      type: [String],
      default: []
    },
    specialInstructions: {
      type: String
    },
    preferredTransportType: {
      type: String,
      default: 'ANY'
    },
    origin: {
      address: { type: String, required: true },
      villageOrTown: { type: String, default: 'Village' },
      district: { type: String, required: true, index: true },
      state: { type: String, required: true, index: true },
      pincode: { type: String, default: '422001' },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true
        }
      }
    },
    destination: {
      address: { type: String, required: true },
      mandiOrMarketName: { type: String },
      villageOrTown: { type: String, default: 'Town' },
      district: { type: String, required: true, index: true },
      state: { type: String, required: true, index: true },
      pincode: { type: String, default: '422001' },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true
        }
      }
    },
    pickupWindowStart: {
      type: Date,
      default: Date.now,
      index: true
    },
    pickupWindowEnd: {
      type: Date
    },
    deliveryWindowStart: {
      type: Date
    },
    deliveryWindowEnd: {
      type: Date,
      default: () => new Date(Date.now() + 48 * 60 * 60 * 1000),
      index: true
    },
    preferredPickupDate: {
      type: Date
    },
    deliveryDeadline: {
      type: Date
    },
    maxBudgetInr: {
      type: Number,
      default: 2000
    },
    status: {
      type: String,
      enum: ['PENDING', 'LISTED', 'MATCHED', 'BOOKED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
      index: true
    },
    specialHandlingNotes: {
      type: String
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
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

ShipmentSchema.index({ 'origin.location': '2dsphere' });
ShipmentSchema.index({ 'destination.location': '2dsphere' });

export const Shipment: Model<IShipment> =
  mongoose.models.Shipment || mongoose.model<IShipment>('Shipment', ShipmentSchema);
