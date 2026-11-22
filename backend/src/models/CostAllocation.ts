import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICostAllocation extends Document {
  bookingId: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  shipmentId: mongoose.Types.ObjectId;
  baseHaulageCostInr: number;
  distanceKm: number;
  weightTons: number;
  tonKmCost: number;
  consolidationDiscountInr: number;
  backhaulDiscountInr: number;
  loadingUnloadingFeeInr: number;
  refrigerationSurchargeInr: number;
  platformFeeInr: number;
  gstInr: number;
  finalShipperPayableInr: number;
  transporterNetReceivableInr: number;
  allocationAlgorithmVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

const CostAllocationSchema = new Schema<ICostAllocation>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true
    },
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Shipment',
      required: true,
      index: true
    },
    baseHaulageCostInr: {
      type: Number,
      required: true,
      min: 0
    },
    distanceKm: {
      type: Number,
      required: true
    },
    weightTons: {
      type: Number,
      required: true
    },
    tonKmCost: {
      type: Number,
      required: true
    },
    consolidationDiscountInr: {
      type: Number,
      default: 0
    },
    backhaulDiscountInr: {
      type: Number,
      default: 0
    },
    loadingUnloadingFeeInr: {
      type: Number,
      default: 0
    },
    refrigerationSurchargeInr: {
      type: Number,
      default: 0
    },
    platformFeeInr: {
      type: Number,
      required: true
    },
    gstInr: {
      type: Number,
      default: 0
    },
    finalShipperPayableInr: {
      type: Number,
      required: true
    },
    transporterNetReceivableInr: {
      type: Number,
      required: true
    },
    allocationAlgorithmVersion: {
      type: String,
      default: 'v1.0-fair-proportional-ton-km'
    }
  },
  {
    timestamps: true
  }
);

export const CostAllocation: Model<ICostAllocation> =
  mongoose.models.CostAllocation || mongoose.model<ICostAllocation>('CostAllocation', CostAllocationSchema);
