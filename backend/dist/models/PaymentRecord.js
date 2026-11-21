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
exports.PaymentRecord = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PaymentRecordSchema = new mongoose_1.Schema({
    transactionReference: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    bookingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        index: true
    },
    payerUserId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    payeeUserId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    grossAmountInr: {
        type: Number,
        required: true,
        min: 0
    },
    platformFeeInr: {
        type: Number,
        required: true,
        default: 0
    },
    netDisbursedAmountInr: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['UPI', 'NET_BANKING', 'DEBIT_CARD', 'WALLET', 'BANK_TRANSFER'],
        default: 'UPI'
    },
    gatewayTransactionId: String,
    gatewayName: {
        type: String,
        default: 'Razorpay_Sandbox'
    },
    status: {
        type: String,
        enum: ['INITIATED', 'HELD_IN_ESCROW', 'RELEASED_TO_TRANSPORTER', 'REFUNDED', 'FAILED'],
        default: 'INITIATED',
        index: true
    },
    escrowReleasedAt: Date,
    failureReason: String
}, {
    timestamps: true
});
exports.PaymentRecord = mongoose_1.default.models.PaymentRecord || mongoose_1.default.model('PaymentRecord', PaymentRecordSchema);
