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
exports.Trip = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TripSchema = new mongoose_1.Schema({
    transporterId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    vehicleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true,
        index: true
    },
    routeSummary: {
        type: String
    },
    origin: {
        address: { type: String, default: 'Nashik Aggregation Hub' },
        district: { type: String, default: 'Nashik', index: true },
        state: { type: String, default: 'Maharashtra' },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [73.8344, 20.0063] }
        }
    },
    destination: {
        address: { type: String, default: 'Vashi APMC Mandi' },
        district: { type: String, default: 'Mumbai Suburban', index: true },
        state: { type: String, default: 'Maharashtra' },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [72.9982, 19.0771] }
        }
    },
    departureTime: {
        type: Date,
        required: true,
        index: true
    },
    estimatedArrivalTime: {
        type: Date,
        required: true
    },
    actualStartTime: Date,
    actualCompletionTime: Date,
    totalDistanceKm: {
        type: Number,
        default: 0
    },
    totalEstimatedFuelCost: {
        type: Number,
        default: 0
    },
    totalAgreedEarnings: {
        type: Number,
        default: 0
    },
    allocatedWeightKg: {
        type: Number,
        default: 0
    },
    remainingCapacityKg: {
        type: Number,
        required: true,
        index: true
    },
    remainingVolumeCbm: {
        type: Number,
        default: 10
    },
    isPublished: {
        type: Boolean,
        default: true,
        index: true
    },
    operatingCorridors: {
        type: [String],
        default: ['Nashik-Mumbai', 'Nashik-Pune']
    },
    status: {
        type: String,
        enum: ['PLANNED', 'EN_ROUTE_PICKUP', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'],
        default: 'PLANNED',
        index: true
    },
    optimizedPolyline: String,
    isBackhaulTrip: {
        type: Boolean,
        default: false
    },
    lastKnownLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: [Number],
        speedKmh: Number,
        accuracyMeters: Number,
        updatedAt: Date
    },
    reportedDelayMinutes: {
        type: Number,
        default: 0
    },
    delayReason: String
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});
TripSchema.index({ 'origin.location': '2dsphere' });
TripSchema.index({ 'destination.location': '2dsphere' });
exports.Trip = mongoose_1.default.models.Trip || mongoose_1.default.model('Trip', TripSchema);
