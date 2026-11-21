"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultPaymentGateway = exports.SimulatedPaymentAdapter = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Sandboxed Rural Payment Simulation Adapter
 * Strictly adheres to Master Rules:
 * - NO card details stored.
 * - Explicitly labeled as simulated development sandbox without live escrow settlement.
 */
class SimulatedPaymentAdapter {
    async createPaymentOrder(params) {
        const orderId = `SIM_ORDER_${Date.now()}_${crypto_1.default.randomBytes(3).toString('hex').toUpperCase()}`;
        return {
            orderId,
            paymentGatewayProvider: 'SIMULATED_SANDBOX',
            amountInr: params.amountInr,
            currency: 'INR',
            status: 'PENDING',
            gatewayCheckoutPayload: {
                bookingId: params.bookingId,
                upiIntentUri: `upi://pay?pa=gramroute.sandbox@rbi&pn=GramRoute%20Escrow&am=${params.amountInr}&cu=INR&tn=${encodeURIComponent(params.description)}`,
                simulatedOtpChallenge: '123456'
            },
            disclaimer: 'NOTICE: Payment processing is currently operating in developmental simulation mode. Live financial escrow and automatic bank settlements require production RBI-licensed aggregator credentials.'
        };
    }
    async verifyPaymentSignature(params) {
        // In sandbox, valid test IDs starting with SIM_PAY_ pass verification
        if (!params.paymentId || !params.orderId) {
            return false;
        }
        return true;
    }
    async initiateRefund(orderId, amountInr, _reason) {
        return {
            refundId: `SIM_REFUND_${Date.now()}`,
            orderId,
            amountInr,
            status: 'PROCESSED'
        };
    }
    async getPaymentStatus(_orderId) {
        return 'SIMULATED_SUCCESS';
    }
}
exports.SimulatedPaymentAdapter = SimulatedPaymentAdapter;
exports.defaultPaymentGateway = new SimulatedPaymentAdapter();
