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
exports.TripStop = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TripStopSchema = new mongoose_1.Schema({
    tripId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true,
        index: true
    },
    shipmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Shipment',
        index: true
    },
    stopSequenceOrder: {
        type: Number,
        required: true,
        min: 1
    },
    stopType: {
        type: String,
        enum: ['PICKUP', 'DROP', 'REST_BREAK', 'FUEL_STOP'],
        required: true,
        index: true
    },
    locationName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    scheduledArrivalTime: {
        type: Date,
        required: true
    },
    scheduledDepartureTime: {
        type: Date,
        required: true
    },
    actualArrivalTime: {
        type: Date
    },
    actualDepartureTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['PENDING', 'ARRIVED', 'COMPLETED', 'SKIPPED'],
        default: 'PENDING',
        index: true
    },
    contactPersonName: String,
    contactPhoneNumber: String,
    otpForAction: String,
    proofImageUrl: String,
    notes: String
}, {
    timestamps: true
});
TripStopSchema.index({ tripId: 1, stopSequenceOrder: 1 }, { unique: true });
TripStopSchema.index({ location: '2dsphere' });
exports.TripStop = mongoose_1.default.models.TripStop || mongoose_1.default.model('TripStop', TripStopSchema);
