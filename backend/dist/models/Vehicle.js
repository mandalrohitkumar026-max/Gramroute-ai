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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vehicle = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const VehicleSchema = new mongoose_1.Schema({
    transporterId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    vehicleType: {
        type: String,
        enum: ['PICKUP_TRUCK', 'MINI_TRUCK', 'TRACTOR_TROLLEY', 'HEAVY_TRUCK', 'REFRIGERATED_VAN'],
        required: true,
        index: true
    },
    vehicleCategory: {
        type: String,
        default: 'TARPAULIN'
    },
    makeAndModel: {
        type: String,
        required: true
    },
    yearOfManufacture: {
        type: Number,
        required: true
    },
    payloadCapacityKg: {
        type: Number,
        required: true,
        index: true
    },
    volumetricCapacityCubicMeters: {
        type: Number,
        required: true
    },
    dimensions: {
        lengthM: Number,
        widthM: Number,
        heightM: Number
    },
    hasRefrigeration: {
        type: Boolean,
        default: false
    },
    hasTarpaulinCover: {
        type: Boolean,
        default: true
    },
    permitType: {
        type: String,
        default: 'State Permit'
    },
    insuranceValidUntil: {
        type: Date
    },
    fitnessCertValidUntil: {
        type: Date
    },
    verificationStatus: {
        type: String,
        enum: ['PENDING', 'VERIFIED', 'REJECTED'],
        default: 'PENDING',
        index: true
    },
    verificationNotes: {
        type: String
    },
    documents: [
        {
            documentType: { type: String, required: true },
            documentNumber: String,
            documentUrl: { type: String, required: true },
            verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
            uploadedAt: { type: Date, default: Date.now }
        }
    ],
    isAvailable: {
        type: Boolean,
        default: true,
        index: true
    },
    availabilityStatus: {
        type: String,
        enum: ['AVAILABLE', 'ON_TRIP', 'MAINTENANCE', 'OFFLINE'],
        default: 'AVAILABLE',
        index: true
    },
    operatingAreas: {
        type: [String],
        default: ['Nashik', 'Pune', 'Mumbai', 'Dindori']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: {
        type: Date
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [73.8344, 20.0063]
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});
VehicleSchema.index({ currentLocation: '2dsphere' });
exports.Vehicle = mongoose_1.default.models.Vehicle || mongoose_1.default.model('Vehicle', VehicleSchema);
