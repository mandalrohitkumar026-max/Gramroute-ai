import mongoose, { Schema, Document, Model } from 'mongoose';

export type DocumentType =
  | 'AADHAAR_CARD'
  | 'DRIVING_LICENSE'
  | 'VEHICLE_RC'
  | 'COMMERCIAL_PERMIT'
  | 'APMC_LICENSE'
  | 'GST_CERTIFICATE'
  | 'FPO_REGISTRATION';

export type VerificationDocStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface IVerificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  vehicleId?: mongoose.Types.ObjectId;
  documentType: DocumentType;
  documentIdentifierNumber: string;
  documentFrontImageUrl: string;
  documentBackImageUrl?: string;
  verificationStatus: VerificationDocStatus;
  rejectionReason?: string;
  verifiedByAdminId?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationDocumentSchema = new Schema<IVerificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      index: true
    },
    documentType: {
      type: String,
      enum: [
        'AADHAAR_CARD',
        'DRIVING_LICENSE',
        'VEHICLE_RC',
        'COMMERCIAL_PERMIT',
        'APMC_LICENSE',
        'GST_CERTIFICATE',
        'FPO_REGISTRATION'
      ],
      required: true,
      index: true
    },
    documentIdentifierNumber: {
      type: String,
      required: true,
      trim: true
    },
    documentFrontImageUrl: {
      type: String,
      required: true
    },
    documentBackImageUrl: String,
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
      index: true
    },
    rejectionReason: String,
    verifiedByAdminId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    expiryDate: Date
  },
  {
    timestamps: true
  }
);

export const VerificationDocument: Model<IVerificationDocument> =
  mongoose.models.VerificationDocument ||
  mongoose.model<IVerificationDocument>('VerificationDocument', VerificationDocumentSchema);
