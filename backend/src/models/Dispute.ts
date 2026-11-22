import mongoose, { Schema, Document, Model } from 'mongoose';

export type DisputeStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
export type DisputeCategory =
  | 'CARGO_DAMAGE'
  | 'CARGO_LOSS'
  | 'EXTREME_DELAY'
  | 'OVERCHARGING'
  | 'UNAUTHORIZED_CANCELLATION'
  | 'MISBEHAVIOR';

export interface IDispute extends Document {
  disputeNumber: string;
  bookingId: mongoose.Types.ObjectId;
  raisedByUserId: mongoose.Types.ObjectId;
  respondentUserId: mongoose.Types.ObjectId;
  category: DisputeCategory;
  description: string;
  evidenceImageUrls: string[];
  claimAmountInr?: number;
  refundedAmountInr?: number;
  status: DisputeStatus;
  resolutionNotes?: string;
  resolvedByAdminId?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    disputeNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    raisedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    respondentUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: String,
      enum: [
        'CARGO_DAMAGE',
        'CARGO_LOSS',
        'EXTREME_DELAY',
        'OVERCHARGING',
        'UNAUTHORIZED_CANCELLATION',
        'MISBEHAVIOR'
      ],
      required: true,
      index: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 3000
    },
    evidenceImageUrls: [
      {
        type: String
      }
    ],
    claimAmountInr: Number,
    refundedAmountInr: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'],
      default: 'OPEN',
      index: true
    },
    resolutionNotes: String,
    resolvedByAdminId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
  {
    timestamps: true
  }
);

export const Dispute: Model<IDispute> = mongoose.models.Dispute || mongoose.model<IDispute>('Dispute', DisputeSchema);
