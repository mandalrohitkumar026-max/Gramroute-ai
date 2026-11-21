"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBookingSchema = exports.transitionBookingStatusSchema = exports.verifyOtpSchema = exports.respondBookingSchema = exports.createBookingSchema = void 0;
const zod_1 = require("zod");
exports.createBookingSchema = zod_1.z.object({
    shipmentId: zod_1.z.string().min(1, 'Shipment ID is required'),
    tripId: zod_1.z.string().min(1, 'Trip ID is required'),
    allocatedWeightKg: zod_1.z.number().positive().optional(),
    allocatedVolumeCbm: zod_1.z.number().positive().optional(),
    agreedPriceInr: zod_1.z.number().positive('Agreed price must be positive').optional(),
    notes: zod_1.z.string().optional()
});
exports.respondBookingSchema = zod_1.z.object({
    action: zod_1.z.enum(['ACCEPT', 'REJECT']),
    reason: zod_1.z.string().optional()
});
exports.verifyOtpSchema = zod_1.z.object({
    otp: zod_1.z.string().length(4, 'OTP must be 4 digits')
});
exports.transitionBookingStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
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
    otp: zod_1.z.string().optional()
});
exports.cancelBookingSchema = zod_1.z.object({
    cancellationReasonCode: zod_1.z.enum([
        'SHIPPER_SCHEDULE_CHANGE',
        'TRANSPORTER_BREAKDOWN',
        'PRICE_DISAGREEMENT',
        'WEATHER_ROAD_BLOCK',
        'CARGO_NOT_READY',
        'VEHICLE_UNAVAILABLE',
        'OTHER'
    ]),
    cancellationReason: zod_1.z.string().min(3, 'Detailed reason required')
});
