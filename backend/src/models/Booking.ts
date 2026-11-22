import mongoose, { Schema, Document, Model } from 'mongoose';

export type BookingStatus =
  | 'REQUESTED'
  | 'ACCEPTED_BY_TRANSPORTER'
  | 'ACCEPTED_BY_CUSTOMER'
  | 'CONFIRMED'
  | 'TRIP_PREPARATION'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentStatus = 'PENDING' | 'ESCROWED' | 'DISBURSED' | 'REFUNDED';

export type CancellationReasonCode =
  | 'SHIPPER_SCHEDULE_CHANGE'
  | 'TRANSPORTER_BREAKDOWN'
  | 'PRICE_DISAGREEMENT'
  | 'WEATHER_ROAD_BLOCK'
  | 'CARGO_NOT_READY'
  | 'VEHICLE_UNAVAILABLE'
  | 'OTHER';

export interface IBooking extends Document {
  bookingReference: string;
  shipmentId: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  shipperId: mongoose.Types.ObjectId;
  transporterId: mongoose.Types.ObjectId;
  totalAgreedAmountInr: number;
  allocatedWeightKg: number;
  allocatedVolumeCbm?: number;
  pickupOtp: string;
  deliveryOtp: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  acceptedByCustomerAt?: Date;
  acceptedByTransporterAt?: Date;
  confirmedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReasonCode?: CancellationReasonCode;
  cancellationReason?: string;
  cancellationInitiator?: 'SHIPPER' | 'TRANSPORTER' | 'ADMIN';
  cancellationFeeInr?: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
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
    totalAgreedAmountInr: {
      type: Number,
      required: true,
      min: 0
    },
    allocatedWeightKg: {
      type: Number,
      required: true,
      min: 1
    },
    allocatedVolumeCbm: {
      type: Number,
      default: 0
    },
    pickupOtp: {
      type: String,
      required: true
    },
    deliveryOtp: {
      type: String,
      required: true
    },
    bookingStatus: {
      type: String,
      enum: [
        'REQUESTED',
        'ACCEPTED_BY_TRANSPORTER',
        'ACCEPTED_BY_CUSTOMER',
        'CONFIRMED',
        'TRIP_PREPARATION',
        'PICKED_UP',
        'IN_TRANSIT',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
        'REJECTED'
      ],
      default: 'REQUESTED',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'ESCROWED', 'DISBURSED', 'REFUNDED'],
      default: 'PENDING',
      index: true
    },
    acceptedByCustomerAt: Date,
    acceptedByTransporterAt: Date,
    confirmedAt: Date,
    pickedUpAt: Date,
    deliveredAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancellationReasonCode: {
      type: String,
      enum: [
        'SHIPPER_SCHEDULE_CHANGE',
        'TRANSPORTER_BREAKDOWN',
        'PRICE_DISAGREEMENT',
        'WEATHER_ROAD_BLOCK',
        'CARGO_NOT_READY',
        'VEHICLE_UNAVAILABLE',
        'OTHER'
      ]
    },
    cancellationReason: String,
    cancellationInitiator: {
      type: String,
      enum: ['SHIPPER', 'TRANSPORTER', 'ADMIN']
    },
    cancellationFeeInr: {
      type: Number,
      default: 0
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

export const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
