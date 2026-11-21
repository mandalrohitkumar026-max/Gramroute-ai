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
exports.Booking = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BookingSchema = new mongoose_1.Schema({
    bookingReference: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
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
    totalAgreedAmountInr: {
        type: Number,
        required: true,
        min: 0
    },
    allocatedWeightKg: {
        type: Number,
        required: true,
        min: 1
    },
    allocatedVolumeCbm: {
        type: Number,
        default: 0
    },
    pickupOtp: {
        type: String,
        required: true
    },
    deliveryOtp: {
        type: String,
        required: true
    },
    bookingStatus: {
        type: String,
        enum: [
            'REQUESTED',
            'ACCEPTED_BY_TRANSPORTER',
            'ACCEPTED_BY_CUSTOMER',
            'CONFIRMED',
            'TRIP_PREPARATION',
            'PICKED_UP',
            'IN_TRANSIT',
            'DELIVERED',
            'COMPLETED',
            'CANCELLED',
            'REJECTED'
        ],
        default: 'REQUESTED',
        index: true
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'ESCROWED', 'DISBURSED', 'REFUNDED'],
        default: 'PENDING',
        index: true
    },
    acceptedByCustomerAt: Date,
    acceptedByTransporterAt: Date,
    confirmedAt: Date,
    pickedUpAt: Date,
    deliveredAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancellationReasonCode: {
        type: String,
        enum: [
            'SHIPPER_SCHEDULE_CHANGE',
            'TRANSPORTER_BREAKDOWN',
            'PRICE_DISAGREEMENT',
            'WEATHER_ROAD_BLOCK',
            'CARGO_NOT_READY',
            'VEHICLE_UNAVAILABLE',
            'OTHER'
        ]
    },
    cancellationReason: String,
    cancellationInitiator: {
        type: String,
        enum: ['SHIPPER', 'TRANSPORTER', 'ADMIN']
    },
    cancellationFeeInr: {
        type: Number,
        default: 0
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
exports.Booking = mongoose_1.default.models.Booking || mongoose_1.default.model('Booking', BookingSchema);
