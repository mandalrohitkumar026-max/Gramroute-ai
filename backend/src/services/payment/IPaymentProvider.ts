export interface PaymentOrderParams {
  bookingId: string;
  amountInr: number;
  currency: 'INR';
  payerUserId: string;
  payerPhoneNumber: string;
  description: string;
}

export interface PaymentOrderResult {
  orderId: string;
  paymentGatewayProvider: 'SIMULATED_SANDBOX' | 'RAZORPAY_UPI' | 'CASH_ON_DELIVERY_VOUCHER';
  amountInr: number;
  currency: string;
  status: 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED';
  gatewayCheckoutPayload: Record<string, any>;
  disclaimer: string;
}

export interface PaymentVerificationParams {
  orderId: string;
  paymentId: string;
  signature?: string;
}

export interface RefundResult {
  refundId: string;
  orderId: string;
  amountInr: number;
  status: 'PROCESSED' | 'PENDING' | 'REJECTED';
}

/**
 * Pluggable Payment Provider Interface for GramRoute AI
 * Adheres strictly to RBI & PCI-DSS guidelines:
 * - NO raw card details (PAN, CVV, PIN) are ever handled or stored by this service.
 * - Live settlement / escrow claims are prohibited until compliant banking integrations are activated.
 */
export interface IPaymentProvider {
  createPaymentOrder(params: PaymentOrderParams): Promise<PaymentOrderResult>;
  verifyPaymentSignature(params: PaymentVerificationParams): Promise<boolean>;
  initiateRefund(orderId: string, amountInr: number, reason: string): Promise<RefundResult>;
  getPaymentStatus(orderId: string): Promise<string>;
}
