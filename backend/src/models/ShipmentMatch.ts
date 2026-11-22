import mongoose, { Schema, Document, Model } from 'mongoose';

export type MatchStatus =
  | 'PROPOSED'
  | 'ACCEPTED_BY_SHIPPER'
  | 'ACCEPTED_BY_TRANSPORTER'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export interface IScoringBreakdown {
  pickupProximity: number; // 0 to 100
  destinationCompatibility: number; // 0 to 100
  capacityUtilization: number; // 0 to 100
  timeWindowFit: number; // 0 to 100
  detourEfficiency: number; // 0 to 100
  overallScore: number; // 0 to 100
}

export interface IShipmentMatch extends Document {
  shipmentId: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  shipperId: mongoose.Types.ObjectId;
  transporterId: mongoose.Types.ObjectId;

  // Explainable Scoring
  compatibilityScore: number; // Overall 0 to 100
  scoringBreakdown: IScoringBreakdown;

  // Financial & Route Metrics
  recommendedPriceInr: number;
  estimatedSavingsInr: number;
  costSavingPercent: number;
  estimatedDetourKm: number;
  additionalDwellMinutes: number;

  // Explainability text
  reasons: string[];
  warnings: string[];

  status: MatchStatus;
  rejectionReason?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentMatchSchema = new Schema<IShipmentMatch>(
  {
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Shipment',
      required: true,
      index: true
    },
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true
    },
    shipperId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    transporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    compatibilityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true
    },
    scoringBreakdown: {
      pickupProximity: { type: Number, default: 80 },
      destinationCompatibility: { type: Number, default: 85 },
      capacityUtilization: { type: Number, default: 90 },
      timeWindowFit: { type: Number, default: 85 },
      detourEfficiency: { type: Number, default: 90 },
      overallScore: { type: Number, default: 85 }
    },
    recommendedPriceInr: {
      type: Number,
      required: true
    },
    estimatedSavingsInr: {
      type: Number,
      default: 0
    },
    costSavingPercent: {
      type: Number,
      default: 25
    },
    estimatedDetourKm: {
      type: Number,
      default: 5
    },
    additionalDwellMinutes: {
      type: Number,
      default: 25
    },
    reasons: {
      type: [String],
      default: []
    },
    warnings: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['PROPOSED', 'ACCEPTED_BY_SHIPPER', 'ACCEPTED_BY_TRANSPORTER', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
      default: 'PROPOSED',
      index: true
    },
    rejectionReason: String,
    expiresAt: {
      type: Date,
      required: true,
      index: true
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

// Prevent duplicate active proposals for the same shipment and trip
ShipmentMatchSchema.index({ shipmentId: 1, tripId: 1, status: 1 });

export const ShipmentMatch: Model<IShipmentMatch> =
  mongoose.models.ShipmentMatch || mongoose.model<IShipmentMatch>('ShipmentMatch', ShipmentMatchSchema);
