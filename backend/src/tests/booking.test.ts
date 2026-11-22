import request from 'supertest';
import { createApp } from '../app';
import { Booking } from '../models/Booking';
import { Shipment } from '../models/Shipment';
import { Trip } from '../models/Trip';
import { User } from '../models/User';
import { signAccessToken } from '../utils/jwt';

jest.mock('../models/Booking');
jest.mock('../models/Shipment');
jest.mock('../models/Trip');
jest.mock('../models/User');

describe('Booking Workflow & State Machine API', () => {
  const app = createApp();
  const testUserId = '65f123456789abcdef012345';
  const testUserToken = signAccessToken({
    userId: testUserId,
    role: 'FARMER',
    phoneNumber: '+919876543210'
  });

  const mockUserDoc = {
    _id: testUserId,
    role: 'FARMER',
    phoneNumber: '+919876543210',
    status: 'ACTIVE',
    isLocked: () => false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (User.findOne as jest.Mock).mockResolvedValue(mockUserDoc);
  });

  describe('PATCH /api/v1/bookings/:id/status (Lifecycle Progression)', () => {
    it('rejects invalid state transition (jumping from REQUESTED directly to DELIVERED)', async () => {
      const mockBooking: any = {
        _id: '65f999999999abcdef012345',
        bookingStatus: 'REQUESTED',
        pickupOtp: '1234',
        deliveryOtp: '5678',
        shipperId: testUserId,
        transporterId: '65fcccccccccabcdef012345',
        save: jest.fn()
      };

      (Booking.findById as jest.Mock).mockResolvedValue(mockBooking);

      const res = await request(app)
        .patch('/api/v1/bookings/65f999999999abcdef012345/status')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ status: 'DELIVERED' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });

    it('rejects transition to PICKED_UP when incorrect OTP is supplied', async () => {
      const mockBooking: any = {
        _id: '65f999999999abcdef012345',
        bookingStatus: 'TRIP_PREPARATION',
        pickupOtp: '4321',
        deliveryOtp: '8765',
        shipperId: testUserId,
        transporterId: '65fcccccccccabcdef012345',
        save: jest.fn()
      };

      (Booking.findById as jest.Mock).mockResolvedValue(mockBooking);

      const res = await request(app)
        .patch('/api/v1/bookings/65f999999999abcdef012345/status')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ status: 'PICKED_UP', otp: '9999' }); // Wrong OTP

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_OTP');
    });

    it('successfully transitions to PICKED_UP when correct OTP is verified', async () => {
      const mockBooking: any = {
        _id: '65f999999999abcdef012345',
        bookingStatus: 'TRIP_PREPARATION',
        pickupOtp: '4321',
        deliveryOtp: '8765',
        shipmentId: '65faaaaaaaaaabcdef012345',
        shipperId: testUserId,
        transporterId: '65fcccccccccabcdef012345',
        save: jest.fn().mockResolvedValue(true)
      };

      (Booking.findById as jest.Mock).mockResolvedValue(mockBooking);
      (Shipment.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .patch('/api/v1/bookings/65f999999999abcdef012345/status')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ status: 'PICKED_UP', otp: '4321' }); // Correct OTP

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockBooking.bookingStatus).toBe('PICKED_UP');
      expect(mockBooking.pickedUpAt).toBeDefined();
    });
  });

  describe('POST /api/v1/bookings/:id/cancel (Cancellation Policy)', () => {
    it('applies cancellation fee policy when cancelling after preparation stage', async () => {
      const mockBooking: any = {
        _id: '65f999999999abcdef012345',
        bookingStatus: 'TRIP_PREPARATION',
        totalAgreedAmountInr: 2000,
        allocatedWeightKg: 500,
        tripId: '65fbbbbbbbbbabcdef012345',
        shipmentId: '65faaaaaaaaaabcdef012345',
        shipperId: testUserId,
        transporterId: '65fcccccccccabcdef012345',
        save: jest.fn().mockResolvedValue(true)
      };

      (Booking.findById as jest.Mock).mockResolvedValue(mockBooking);
      (Trip.findByIdAndUpdate as jest.Mock).mockResolvedValue({});
      (Shipment.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/bookings/65f999999999abcdef012345/cancel')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          cancellationReasonCode: 'SHIPPER_SCHEDULE_CHANGE',
          cancellationReason: 'Harvest rescheduled by 2 days'
        });

      expect(res.status).toBe(200);
      expect(mockBooking.bookingStatus).toBe('CANCELLED');
      expect(mockBooking.cancellationFeeInr).toBe(200); // 10% fee on 2000 INR
      expect(Trip.findByIdAndUpdate).toHaveBeenCalledWith(
        mockBooking.tripId,
        expect.objectContaining({
          $inc: { remainingCapacityKg: 500, allocatedWeightKg: -500 }
        })
      );
    });
  });
});
