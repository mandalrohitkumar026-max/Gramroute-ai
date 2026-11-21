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
exports.Shipment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ShipmentSchema = new mongoose_1.Schema({
    shipperId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    cargoName: {
        type: String,
        required: true,
        trim: true
    },
    cargoDescription: {
        type: String,
        trim: true
    },
    cargoCategory: {
        type: String,
        required: true,
        index: true
    },
    perishability: {
        type: String,
        enum: ['HIGHLY_PERISHABLE', 'MODERATE', 'NON_PERISHABLE'],
        default: 'NON_PERISHABLE',
        index: true
    },
    isPerishable: {
        type: Boolean,
        default: false,
        index: true
    },
    weightKg: {
        type: Number,
        required: true,
        min: 1,
        index: true
    },
    volumeCubicMeters: {
        type: Number,
        default: 1,
        min: 0.01
    },
    numberOfPackages: {
        type: Number,
        default: 1,
        min: 1
    },
    packagingType: {
        type: String,
        default: 'Bags'
    },
    isStackable: {
        type: Boolean,
        default: true
    },
    temperatureControlRequired: {
        type: Boolean,
        default: false
    },
    handlingRequirements: {
        type: [String],
        default: []
    },
    specialInstructions: {
        type: String
    },
    preferredTransportType: {
        type: String,
        default: 'ANY'
    },
    origin: {
        address: { type: String, required: true },
        villageOrTown: { type: String, default: 'Village' },
        district: { type: String, required: true, index: true },
        state: { type: String, required: true, index: true },
        pincode: { type: String, default: '422001' },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        }
    },
    destination: {
        address: { type: String, required: true },
        mandiOrMarketName: { type: String },
        villageOrTown: { type: String, default: 'Town' },
        district: { type: String, required: true, index: true },
        state: { type: String, required: true, index: true },
        pincode: { type: String, default: '422001' },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        }
    },
    pickupWindowStart: {
        type: Date,
        default: Date.now,
        index: true
    },
    pickupWindowEnd: {
        type: Date
    },
    deliveryWindowStart: {
        type: Date
    },
    deliveryWindowEnd: {
        type: Date,
        default: () => new Date(Date.now() + 48 * 60 * 60 * 1000),
        index: true
    },
    preferredPickupDate: {
        type: Date
    },
    deliveryDeadline: {
        type: Date
    },
    maxBudgetInr: {
        type: Number,
        default: 2000
    },
    status: {
        type: String,
        enum: ['PENDING', 'LISTED', 'MATCHED', 'BOOKED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING',
        index: true
    },
    specialHandlingNotes: {
        type: String
    },
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
            delete ret.__v;
            return ret;
        }
    }
});
ShipmentSchema.index({ 'origin.location': '2dsphere' });
ShipmentSchema.index({ 'destination.location': '2dsphere' });
exports.Shipment = mongoose_1.default.models.Shipment || mongoose_1.default.model('Shipment', ShipmentSchema);
