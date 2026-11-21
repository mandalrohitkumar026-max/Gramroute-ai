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
exports.CostAllocation = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CostAllocationSchema = new mongoose_1.Schema({
    bookingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true,
        index: true
    },
    tripId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true,
        index: true
    },
    shipmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Shipment',
        required: true,
        index: true
    },
    baseHaulageCostInr: {
        type: Number,
        required: true,
        min: 0
    },
    distanceKm: {
        type: Number,
        required: true
    },
    weightTons: {
        type: Number,
        required: true
    },
    tonKmCost: {
        type: Number,
        required: true
    },
    consolidationDiscountInr: {
        type: Number,
        default: 0
    },
    backhaulDiscountInr: {
        type: Number,
        default: 0
    },
    loadingUnloadingFeeInr: {
        type: Number,
        default: 0
    },
    refrigerationSurchargeInr: {
        type: Number,
        default: 0
    },
    platformFeeInr: {
        type: Number,
        required: true
    },
    gstInr: {
        type: Number,
        default: 0
    },
    finalShipperPayableInr: {
        type: Number,
        required: true
    },
    transporterNetReceivableInr: {
        type: Number,
        required: true
    },
    allocationAlgorithmVersion: {
        type: String,
        default: 'v1.0-fair-proportional-ton-km'
    }
}, {
    timestamps: true
});
exports.CostAllocation = mongoose_1.default.models.CostAllocation || mongoose_1.default.model('CostAllocation', CostAllocationSchema);
