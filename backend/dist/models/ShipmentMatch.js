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
exports.ShipmentMatch = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ShipmentMatchSchema = new mongoose_1.Schema({
    shipmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Shipment',
        required: true,
        index: true
    },
    tripId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true,
        index: true
    },
    vehicleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true,
        index: true
    },
    shipperId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    transporterId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    compatibilityScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        index: true
    },
    scoringBreakdown: {
        pickupProximity: { type: Number, default: 80 },
        destinationCompatibility: { type: Number, default: 85 },
        capacityUtilization: { type: Number, default: 90 },
        timeWindowFit: { type: Number, default: 85 },
        detourEfficiency: { type: Number, default: 90 },
        overallScore: { type: Number, default: 85 }
    },
    recommendedPriceInr: {
        type: Number,
        required: true
    },
    estimatedSavingsInr: {
        type: Number,
        default: 0
    },
    costSavingPercent: {
        type: Number,
        default: 25
    },
    estimatedDetourKm: {
        type: Number,
        default: 5
    },
    additionalDwellMinutes: {
        type: Number,
        default: 25
    },
    reasons: {
        type: [String],
        default: []
    },
    warnings: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ['PROPOSED', 'ACCEPTED_BY_SHIPPER', 'ACCEPTED_BY_TRANSPORTER', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
        default: 'PROPOSED',
        index: true
    },
    rejectionReason: String,
    expiresAt: {
        type: Date,
        required: true,
        index: true
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
// Prevent duplicate active proposals for the same shipment and trip
ShipmentMatchSchema.index({ shipmentId: 1, tripId: 1, status: 1 });
exports.ShipmentMatch = mongoose_1.default.models.ShipmentMatch || mongoose_1.default.model('ShipmentMatch', ShipmentMatchSchema);
