import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRating extends Document {
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  overallRating: number; // 1 to 5
  punctualityRating?: number; // 1 to 5
  cargoCareRating?: number; // 1 to 5
  communicationRating?: number; // 1 to 5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true
    },
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    punctualityRating: {
      type: Number,
      min: 1,
      max: 5
    },
    cargoCareRating: {
      type: Number,
      min: 1,
      max: 5
    },
    communicationRating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

RatingSchema.index({ bookingId: 1, fromUserId: 1 }, { unique: true });

export const Rating: Model<IRating> = mongoose.models.Rating || mongoose.model<IRating>('Rating', RatingSchema);
