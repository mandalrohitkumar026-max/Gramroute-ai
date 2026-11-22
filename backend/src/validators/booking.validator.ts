import { z } from 'zod';

export const createBookingSchema = z.object({
  shipmentId: z.string().min(1, 'Shipment ID is required'),
  tripId: z.string().min(1, 'Trip ID is required'),
  allocatedWeightKg: z.number().positive().optional(),
  allocatedVolumeCbm: z.number().positive().optional(),
  agreedPriceInr: z.number().positive('Agreed price must be positive').optional(),
  notes: z.string().optional()
});

export const respondBookingSchema = z.object({
  action: z.enum(['ACCEPT', 'REJECT']),
  reason: z.string().optional()
});

export const verifyOtpSchema = z.object({
  otp: z.string().length(4, 'OTP must be 4 digits')
});

export const transitionBookingStatusSchema = z.object({
  status: z.enum([
    'REQUESTED',
    'ACCEPTED_BY_TRANSPORTER',
    'ACCEPTED_BY_CUSTOMER',
    'CONFIRMED',
    'TRIP_PREPARATION',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'COMPLETED'
  ]),
  otp: z.string().optional()
});

export const cancelBookingSchema = z.object({
  cancellationReasonCode: z.enum([
    'SHIPPER_SCHEDULE_CHANGE',
    'TRANSPORTER_BREAKDOWN',
    'PRICE_DISAGREEMENT',
    'WEATHER_ROAD_BLOCK',
    'CARGO_NOT_READY',
    'VEHICLE_UNAVAILABLE',
    'OTHER'
  ]),
  cancellationReason: z.string().min(3, 'Detailed reason required')
});
