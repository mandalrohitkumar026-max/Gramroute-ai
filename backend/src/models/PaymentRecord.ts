import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentRecordStatus = 'INITIATED' | 'HELD_IN_ESCROW' | 'RELEASED_TO_TRANSPORTER' | 'REFUNDED' | 'FAILED';
export type PaymentMethodType = 'UPI' | 'NET_BANKING' | 'DEBIT_CARD' | 'WALLET' | 'BANK_TRANSFER';

export interface IPaymentRecord extends Document {
  transactionReference: string;
  bookingId: mongoose.Types.ObjectId;
  payerUserId: mongoose.Types.ObjectId;
  payeeUserId: mongoose.Types.ObjectId;
  grossAmountInr: number;
  platformFeeInr: number;
  netDisbursedAmountInr: number;
  paymentMethod: PaymentMethodType;
  gatewayTransactionId?: string;
  gatewayName: string;
  status: PaymentRecordStatus;
  escrowReleasedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentRecordSchema = new Schema<IPaymentRecord>(
  {
    transactionReference: {
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
    payerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    payeeUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    grossAmountInr: {
      type: Number,
      required: true,
      min: 0
    },
    platformFeeInr: {
      type: Number,
      required: true,
      default: 0
    },
    netDisbursedAmountInr: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'NET_BANKING', 'DEBIT_CARD', 'WALLET', 'BANK_TRANSFER'],
      default: 'UPI'
    },
    gatewayTransactionId: String,
    gatewayName: {
      type: String,
      default: 'Razorpay_Sandbox'
    },
    status: {
      type: String,
      enum: ['INITIATED', 'HELD_IN_ESCROW', 'RELEASED_TO_TRANSPORTER', 'REFUNDED', 'FAILED'],
      default: 'INITIATED',
      index: true
    },
    escrowReleasedAt: Date,
    failureReason: String
  },
  {
    timestamps: true
  }
);

export const PaymentRecord: Model<IPaymentRecord> =
  mongoose.models.PaymentRecord || mongoose.model<IPaymentRecord>('PaymentRecord', PaymentRecordSchema);
