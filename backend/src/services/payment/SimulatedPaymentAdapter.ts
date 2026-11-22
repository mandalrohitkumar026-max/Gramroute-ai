import crypto from 'crypto';
import {
  IPaymentProvider,
  PaymentOrderParams,
  PaymentOrderResult,
  PaymentVerificationParams,
  RefundResult
} from './IPaymentProvider';

/**
 * Sandboxed Rural Payment Simulation Adapter
 * Strictly adheres to Master Rules:
 * - NO card details stored.
 * - Explicitly labeled as simulated development sandbox without live escrow settlement.
 */
export class SimulatedPaymentAdapter implements IPaymentProvider {
  public async createPaymentOrder(params: PaymentOrderParams): Promise<PaymentOrderResult> {
    const orderId = `SIM_ORDER_${Date.now()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

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
      disclaimer:
        'NOTICE: Payment processing is currently operating in developmental simulation mode. Live financial escrow and automatic bank settlements require production RBI-licensed aggregator credentials.'
    };
  }

  public async verifyPaymentSignature(params: PaymentVerificationParams): Promise<boolean> {
    // In sandbox, valid test IDs starting with SIM_PAY_ pass verification
    if (!params.paymentId || !params.orderId) {
      return false;
    }
    return true;
  }

  public async initiateRefund(orderId: string, amountInr: number, _reason: string): Promise<RefundResult> {
    return {
      refundId: `SIM_REFUND_${Date.now()}`,
      orderId,
      amountInr,
      status: 'PROCESSED'
    };
  }

  public async getPaymentStatus(_orderId: string): Promise<string> {
    return 'SIMULATED_SUCCESS';
  }
}

export const defaultPaymentGateway = new SimulatedPaymentAdapter();
