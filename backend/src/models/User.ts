import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'FARMER' | 'BUSINESS' | 'TRANSPORTER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'DEACTIVATED';

export interface IRefreshToken {
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  userAgent?: string;
  ip?: string;
}

export interface IUser extends Document {
  phoneNumber: string;
  email?: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isIdentityVerified: boolean;
  preferredLanguage: string;
  lastLoginAt?: Date;

  // Login attempt & lockout protection
  failedLoginAttempts: number;
  lockUntil?: Date;

  // Refresh token rotation
  refreshTokens: IRefreshToken[];

  // Password reset & email verification
  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;
  emailVerificationTokenHash?: string;
  emailVerificationExpires?: Date;

  // Soft deletion
  isDeleted: boolean;
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

const UserSchema = new Schema<IUser>(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false // Do not include in queries by default
    },
    role: {
      type: String,
      enum: ['FARMER', 'BUSINESS', 'TRANSPORTER', 'ADMIN'],
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'DEACTIVATED'],
      default: 'PENDING_VERIFICATION',
      index: true
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isIdentityVerified: {
      type: Boolean,
      default: false
    },
    preferredLanguage: {
      type: String,
      default: 'en'
    },
    lastLoginAt: {
      type: Date
    },

    // Login security
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    },

    // Refresh Tokens
    refreshTokens: [
      {
        tokenHash: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
        userAgent: String,
        ip: String
      }
    ],

    // Recovery tokens
    passwordResetTokenHash: String,
    passwordResetExpires: Date,
    emailVerificationTokenHash: String,
    emailVerificationExpires: Date,

    // Soft deletion
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
        delete ret.passwordHash;
        delete ret.refreshTokens;
        delete ret.passwordResetTokenHash;
        delete ret.passwordResetExpires;
        delete ret.emailVerificationTokenHash;
        delete ret.emailVerificationExpires;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Pre-save hook: Hash password if modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    return next();
  } catch (error) {
    return next(error as Error);
  }
});

// Compare candidate password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Check if user is currently locked out
UserSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
};

// Increment failed attempts and apply lock if threshold exceeded
UserSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  // If lock has already expired, reset counter to 1
  if (this.lockUntil && this.lockUntil.getTime() < Date.now()) {
    await this.updateOne({
      $set: { failedLoginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
    return;
  }

  const updates: Record<string, unknown> = {
    $inc: { failedLoginAttempts: 1 }
  };

  // Lock account for 15 minutes after 5 failed attempts
  if (this.failedLoginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = {
      lockUntil: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
    };
  }

  await this.updateOne(updates);
};

// Reset failed attempts on successful login
UserSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  await this.updateOne({
    $set: { failedLoginAttempts: 0, lastLoginAt: new Date() },
    $unset: { lockUntil: 1 }
  });
};

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
