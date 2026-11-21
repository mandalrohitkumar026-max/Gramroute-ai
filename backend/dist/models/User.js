"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
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
});
// Pre-save hook: Hash password if modified
UserSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) {
        return next();
    }
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.passwordHash = await bcryptjs_1.default.hash(this.passwordHash, salt);
        return next();
    }
    catch (error) {
        return next(error);
    }
});
// Compare candidate password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.passwordHash);
};
// Check if user is currently locked out
UserSchema.methods.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
};
// Increment failed attempts and apply lock if threshold exceeded
UserSchema.methods.incrementLoginAttempts = async function () {
    // If lock has already expired, reset counter to 1
    if (this.lockUntil && this.lockUntil.getTime() < Date.now()) {
        await this.updateOne({
            $set: { failedLoginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
        return;
    }
    const updates = {
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
UserSchema.methods.resetLoginAttempts = async function () {
    await this.updateOne({
        $set: { failedLoginAttempts: 0, lastLoginAt: new Date() },
        $unset: { lockUntil: 1 }
    });
};
exports.User = mongoose_1.default.models.User || mongoose_1.default.model('User', UserSchema);
