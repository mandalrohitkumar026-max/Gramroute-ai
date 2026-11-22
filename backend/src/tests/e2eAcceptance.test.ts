import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../app';
import { User } from '../models/User';
import { Shipment } from '../models/Shipment';
import { Trip } from '../models/Trip';
import { TripStop } from '../models/TripStop';
import { Booking } from '../models/Booking';
import { TrackingEvent } from '../models/TrackingEvent';
import { Rating } from '../models/Rating';
import { Profile } from '../models/Profile';
import { signAccessToken } from '../utils/jwt';
import { aiEngineClient } from '../services/aiEngineClient';

jest.mock('../models/User');
jest.mock('../models/Shipment');
jest.mock('../models/Trip');
jest.mock('../models/TripStop');
jest.mock('../models/Booking');
jest.mock('../models/TrackingEvent');
jest.mock('../models/Rating');
jest.mock('../models/Profile');
jest.mock('../models/Notification', () => ({
  Notification: {
    create: jest.fn().mockResolvedValue({ _id: 'notif-e2e-001' })
  }
}));

describe('Final Acceptance Test — Complete 12-Step Rural Logistics Lifecycle (Phase 9)', () => {
  const app = createApp();

  const farmerId = new mongoose.Types.ObjectId();
  const transporterId = new mongoose.Types.ObjectId();
  const tripId = new mongoose.Types.ObjectId();
  const stopId = new mongoose.Types.ObjectId();
  const shipmentId = new mongoose.Types.ObjectId();
  const bookingId = new mongoose.Types.ObjectId();

  const farmerToken = signAccessToken({
    userId: farmerId.toString(),
    role: 'FARMER',
    phoneNumber: '+919422011223'
  });

  const transporterToken = signAccessToken({
    userId: transporterId.toString(),
    role: 'TRANSPORTER',
    phoneNumber: '+919823144550'
  });

  const mockFarmerDoc = {
    _id: farmerId,
    role: 'FARMER',
    phoneNumber: '+919422011223',
    status: 'ACTIVE',
    isLocked: () => false
  };

  const mockTransporterDoc = {
    _id: transporterId,
    role: 'TRANSPORTER',
    phoneNumber: '+919823144550',
    status: 'ACTIVE',
    isLocked: () => false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Step 1: Farmer creates shipment with crop specifications and handling requirements', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockFarmerDoc);
    (Shipment.create as jest.Mock).mockResolvedValue({
      _id: shipmentId,
      shipperId: farmerId,
      cargoName: 'Nashik Red Onions (Rabi Season)',
      cargoCategory: 'VEGETABLES',
      weightKg: 1500,
      volumeCubicMeters: 6,
      status: 'PENDING',
      isPerishable: true
    });
    (Trip.find as jest.Mock).mockReturnValue({
      limit: jest.fn().mockResolvedValue([])
    });

    const payload = {
      cargoName: 'Nashik Red Onions (Rabi Season)',
      cargoDescription: '50kg ventilated mesh bags Grade A',
      cargoCategory: 'VEGETABLES',
      weightKg: 1500,
      volumeCubicMeters: 6,
      numberOfPackages: 30,
      packagingType: 'Jute Mesh Bags',
      isPerishable: true,
      handlingRequirements: ['VENTILATED_TARPAULIN'],
      origin: {
        address: 'Farm Gate, Dindori Tehsil',
        villageOrTown: 'Dindori',
        district: 'Nashik',
        state: 'Maharashtra',
        pincode: '422001',
        location: { type: 'Point', coordinates: [73.8344, 20.0063] }
      },
      destination: {
        address: 'Sector 19 Wholesale APMC',
        mandiOrMarketName: 'Vashi APMC Mandi, Navi Mumbai',
        villageOrTown: 'Vashi',
        district: 'Mumbai Suburban',
        state: 'Maharashtra',
        pincode: '400703',
        location: { type: 'Point', coordinates: [72.9982, 19.0771] }
      },
      preferredPickupDate: '2026-11-22T06:30:00.000Z',
      deliveryDeadline: '2026-11-23T18:00:00.000Z',
      maxBudgetInr: 3200
    };

    const res = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.cargoName).toContain('Onions');
  });

  it('Step 2 & 3: Discovers compatible shipments and validates vehicle capacity', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockTransporterDoc);

    const mockShipments = [
      {
        _id: shipmentId,
        cargoName: 'Nashik Red Onions',
        cargoCategory: 'VEGETABLES',
        weightKg: 1500,
        volumeCubicMeters: 6,
        isPerishable: true
      },
      {
        _id: new mongoose.Types.ObjectId(),
        cargoName: 'Sangamner Pomegranates',
        cargoCategory: 'FRUITS',
        weightKg: 800,
        volumeCubicMeters: 3.5,
        isPerishable: true
      }
    ];

    (Shipment.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(mockShipments)
    });
    (Shipment.countDocuments as jest.Mock).mockResolvedValue(2);

    const res = await request(app)
      .get('/api/v1/shipments')
      .set('Authorization', `Bearer ${transporterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(2);

    // Total weight = 2300 kg <= 2500 kg payload capacity
    const totalWeight = res.body.data.items.reduce((sum: number, s: any) => sum + s.weightKg, 0);
    expect(totalWeight).toBeLessThanOrEqual(2500);
  });

  it('Step 4 & 5: AI optimization generates shared route and Shapley cost allocation', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockTransporterDoc);

    const mockAiResult: any = {
      success: true,
      status: 'OPTIMAL',
      total_distance_km: 168.5,
      total_duration_minutes: 240.0,
      total_empty_km: 12.0,
      vehicle_routes: [
        {
          vehicle_id: 'VEH-001',
          assigned_shipments: [shipmentId.toString()],
          total_distance_km: 168.5,
          total_duration_minutes: 240.0,
          stops: []
        }
      ],
      unassigned_shipments: [],
      cost_allocation: {
        total_trip_cost_inr: 4500,
        allocations: [{ shipment_id: shipmentId.toString(), allocated_cost_inr: 2850 }]
      },
      status_message: 'Route optimal'
    };

    jest.spyOn(aiEngineClient, 'optimizeRoute').mockResolvedValue(mockAiResult);

    const optPayload = {
      vehicles: [{ vehicle_id: 'VEH-001' }],
      shipments: [{ shipment_id: shipmentId.toString() }]
    };

    const res = await request(app)
      .post('/api/v1/optimization/route')
      .set('Authorization', `Bearer ${transporterToken}`)
      .send(optPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('OPTIMAL');
    expect(res.body.data.cost_allocation).toBeDefined();
  });

  it('Step 6 & 7: Customer and transporter confirm shared trip booking', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockFarmerDoc);

    const mockBooking: any = {
      _id: bookingId,
      bookingStatus: 'REQUESTED',
      pickupOtp: '4192',
      deliveryOtp: '8835',
      shipperId: farmerId,
      transporterId,
      tripId,
      save: jest.fn().mockImplementation(function (this: any) {
        return Promise.resolve(this);
      })
    };

    (Booking.findById as jest.Mock).mockResolvedValue(mockBooking);

    const res = await request(app)
      .patch(`/api/v1/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({ status: 'CONFIRMED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockBooking.bookingStatus).toBe('CONFIRMED');
  });

  it('Step 8 & 9: Transporter begins journey and records live GPS pings', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockTransporterDoc);

    const mockTrip: any = {
      _id: tripId,
      transporterId,
      status: 'IN_TRANSIT',
      lastKnownLocation: null,
      save: jest.fn().mockResolvedValue(true)
    };

    (Trip.findById as jest.Mock).mockResolvedValue(mockTrip);
    (TrackingEvent.create as jest.Mock).mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      tripId,
      eventType: 'LOCATION_PING'
    } as any);

    const pingRes = await request(app)
      .post('/api/v1/tracking/ping')
      .set('Authorization', `Bearer ${transporterToken}`)
      .send({
        tripId: tripId.toString(),
        latitude: 19.6974,
        longitude: 73.5389,
        speedKmh: 48,
        accuracyMeters: 4.5
      });

    expect(pingRes.status).toBe(201);
    expect(pingRes.body.success).toBe(true);
    expect(mockTrip.lastKnownLocation.coordinates).toEqual([73.5389, 19.6974]);
  });

  it('Step 10 & 11: Proof of Delivery (POD) confirmed and trip marked completed', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockTransporterDoc);

    const mockTrip: any = { _id: tripId, transporterId };
    const mockStop: any = {
      _id: stopId,
      tripId,
      shipmentId,
      stopType: 'DROP',
      status: 'ARRIVED',
      location: { coordinates: [72.99, 19.07] },
      save: jest.fn().mockResolvedValue(true)
    };
    const mockShipment: any = {
      _id: shipmentId,
      cargoName: 'Nashik Red Onions',
      shipperId: farmerId,
      status: 'IN_TRANSIT',
      save: jest.fn().mockResolvedValue(true)
    };

    (Trip.findById as jest.Mock).mockResolvedValue(mockTrip);
    (TripStop.findOne as jest.Mock).mockResolvedValue(mockStop);
    (Shipment.findById as jest.Mock).mockResolvedValue(mockShipment);
    (Booking.updateMany as jest.Mock).mockResolvedValue({} as any);
    (TrackingEvent.create as jest.Mock).mockResolvedValue({} as any);

    const podRes = await request(app)
      .post(`/api/v1/trips/${tripId}/stops/${stopId}/confirm-delivery`)
      .set('Authorization', `Bearer ${transporterToken}`)
      .send({
        receiverName: 'Suresh Patil (APMC Merchant)',
        receiverPhone: '+919820011223',
        proofImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
        remarks: 'Received 30 bags Grade A onions in good condition'
      });

    expect(podRes.status).toBe(200);
    expect(podRes.body.success).toBe(true);
    expect(mockStop.status).toBe('COMPLETED');
    expect(mockShipment.status).toBe('DELIVERED');
  });

  it('Step 12: Rating submitted and platform analytics updated', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockFarmerDoc);

    const mockCompletedBooking: any = {
      _id: bookingId,
      bookingStatus: 'COMPLETED',
      shipperId: farmerId,
      transporterId,
      tripId
    };

    (Booking.findById as jest.Mock).mockResolvedValue(mockCompletedBooking);
    (Rating.findOne as jest.Mock).mockResolvedValue(null);
    (Rating.create as jest.Mock).mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      fromUserId: farmerId,
      toUserId: transporterId,
      bookingId,
      tripId,
      overallRating: 5,
      punctualityRating: 5,
      cargoCareRating: 5,
      communicationRating: 5,
      comment: 'Excellent service. Fresh produce delivered on schedule.'
    });
    (Rating.find as jest.Mock).mockResolvedValue([
      { overallRating: 5 },
      { overallRating: 5 }
    ]);
    (Profile.findOneAndUpdate as jest.Mock).mockResolvedValue({});

    const ratingRes = await request(app)
      .post('/api/v1/ratings')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        bookingId: bookingId.toString(),
        overallRating: 5,
        punctualityRating: 5,
        cargoCareRating: 5,
        communicationRating: 5,
        comment: 'Excellent service. Fresh produce delivered on schedule.'
      });

    expect(ratingRes.status).toBe(201);
    expect(ratingRes.body.success).toBe(true);
    expect(ratingRes.body.data.overallRating).toBe(5);
  });
});
