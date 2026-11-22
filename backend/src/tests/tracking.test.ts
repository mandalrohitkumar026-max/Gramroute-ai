import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../app';
import { Trip } from '../models/Trip';
import { TripStop } from '../models/TripStop';
import { TrackingEvent } from '../models/TrackingEvent';
import { Shipment } from '../models/Shipment';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { signAccessToken } from '../utils/jwt';

jest.mock('../models/User', () => ({
  User: {
    findOne: jest.fn()
  }
}));
jest.mock('../models/Notification', () => ({
  Notification: {
    create: jest.fn().mockResolvedValue({ _id: 'notif-1', isRead: false })
  }
}));
jest.mock('../models/Trip');
jest.mock('../models/TripStop');
jest.mock('../models/TrackingEvent');
jest.mock('../models/Shipment');
jest.mock('../models/Booking');

describe('Live Tracking & Trip Execution Workflow (Phase 6)', () => {
  const app = createApp();

  const transporterId = new mongoose.Types.ObjectId();
  const shipperId = new mongoose.Types.ObjectId();

  const transporterToken = signAccessToken({
    userId: transporterId.toString(),
    role: 'TRANSPORTER',
    email: 'transporter@gramroute.ai'
  });

  const shipperToken = signAccessToken({
    userId: shipperId.toString(),
    role: 'FARMER',
    email: 'farmer@gramroute.ai'
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (User.findOne as jest.Mock).mockImplementation(({ _id }: any) => {
      const idStr = _id.toString();
      const isTransporter = idStr === transporterId.toString();
      return Promise.resolve({
        _id: idStr,
        role: isTransporter ? 'TRANSPORTER' : 'FARMER',
        status: 'ACTIVE',
        isLocked: () => false
      });
    });
  });

  describe('POST /api/v1/tracking/ping (Periodic GPS Streaming)', () => {
    it('rejects GPS ping for completed trips with 400', async () => {
      const mockTrip: any = {
        _id: new mongoose.Types.ObjectId(),
        transporterId,
        status: 'COMPLETED'
      };

      (Trip.findById as jest.Mock).mockResolvedValue(mockTrip);

      const res = await request(app)
        .post('/api/v1/tracking/ping')
        .set('Authorization', `Bearer ${transporterToken}`)
        .send({
          tripId: mockTrip._id.toString(),
          latitude: 19.9975,
          longitude: 73.7898,
          speedKmh: 42.5
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/disabled for completed trips/i);
    });

    it('records valid GPS ping, updates trip lastKnownLocation, and returns 201', async () => {
      const tripId = new mongoose.Types.ObjectId();
      const mockTrip: any = {
        _id: tripId,
        transporterId,
        status: 'IN_TRANSIT',
        save: jest.fn().mockResolvedValue(true)
      };

      (Trip.findById as jest.Mock).mockResolvedValue(mockTrip);
      (TrackingEvent.create as jest.Mock).mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        tripId,
        eventType: 'LOCATION_PING'
      } as any);

      const res = await request(app)
        .post('/api/v1/tracking/ping')
        .set('Authorization', `Bearer ${transporterToken}`)
        .send({
          tripId: tripId.toString(),
          latitude: 19.9975,
          longitude: 73.7898,
          speedKmh: 45.0,
          accuracyMeters: 8.5
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(mockTrip.lastKnownLocation.coordinates).toEqual([73.7898, 19.9975]);
      expect(mockTrip.save).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/tracking/:tripId (Live Tracking & Staleness Warning)', () => {
    it('detects stale location when last ping is older than 15 minutes', async () => {
      const tripId = new mongoose.Types.ObjectId();
      const twentyMinsAgo = new Date(Date.now() - 20 * 60000);

      const mockTrip: any = {
        _id: tripId,
        routeSummary: 'Nashik to Vashi APMC',
        origin: { address: 'Nashik Hub' },
        destination: { address: 'Vashi Mandi' },
        status: 'IN_TRANSIT',
        departureTime: new Date(),
        estimatedArrivalTime: new Date(Date.now() + 3600000),
        lastKnownLocation: {
          coordinates: [73.8344, 20.0063],
          speedKmh: 0,
          updatedAt: twentyMinsAgo
        }
      };

      (Trip.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockTrip)
        })
      });

      (TripStop.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { _id: new mongoose.Types.ObjectId(), stopSequenceOrder: 1, status: 'COMPLETED' },
          { _id: new mongoose.Types.ObjectId(), stopSequenceOrder: 2, status: 'PENDING' }
        ])
      });

      (TrackingEvent.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(null)
      });

      const res = await request(app)
        .get(`/api/v1/tracking/${tripId}`)
        .set('Authorization', `Bearer ${shipperToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isStale).toBe(true);
      expect(res.body.data.staleWarning).toMatch(/last updated 20 minutes ago/i);
      expect(res.body.data.progress.completedStops).toBe(1);
      expect(res.body.data.progress.remainingStops).toBe(1);
    });
  });

  describe('Trip Execution State Machine & Proof of Delivery (POD)', () => {
    it('starts trip, transitions to EN_ROUTE_PICKUP, and creates TRIP_STARTED event', async () => {
      const tripId = new mongoose.Types.ObjectId();
      const mockTrip: any = {
        _id: tripId,
        transporterId: { _id: transporterId, name: 'Gurmeet Roadways' },
        status: 'PLANNED',
        origin: { address: 'Nashik Depot', location: { coordinates: [73.78, 19.99] } },
        save: jest.fn().mockResolvedValue(true)
      };

      (Trip.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTrip)
      });

      (Booking.find as jest.Mock).mockResolvedValue([]);
      (TrackingEvent.create as jest.Mock).mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/start`)
        .set('Authorization', `Bearer ${transporterToken}`);

      expect(res.status).toBe(200);
      expect(mockTrip.status).toBe('EN_ROUTE_PICKUP');
      expect(mockTrip.save).toHaveBeenCalled();
    });

    it('submits Proof of Delivery (POD) and updates shipment status to DELIVERED', async () => {
      const tripId = new mongoose.Types.ObjectId();
      const stopId = new mongoose.Types.ObjectId();
      const shipmentId = new mongoose.Types.ObjectId();

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
        cargoName: 'Fresh Tomatoes',
        shipperId,
        status: 'IN_TRANSIT',
        save: jest.fn().mockResolvedValue(true)
      };

      (Trip.findById as jest.Mock).mockResolvedValue(mockTrip);
      (TripStop.findOne as jest.Mock).mockResolvedValue(mockStop);
      (Shipment.findById as jest.Mock).mockResolvedValue(mockShipment);
      (Booking.updateMany as jest.Mock).mockResolvedValue({} as any);
      (TrackingEvent.create as jest.Mock).mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/stops/${stopId}/confirm-delivery`)
        .set('Authorization', `Bearer ${transporterToken}`)
        .send({
          receiverName: 'Sanjay Gaikwad (APMC Shop #12)',
          receiverPhone: '+91 98234 56789',
          proofImageUrl: 'https://images.unsplash.com/photo-pod-sample.jpg',
          remarks: 'Received 18 crates in good condition'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockStop.status).toBe('COMPLETED');
      expect(mockStop.contactPersonName).toBe('Sanjay Gaikwad (APMC Shop #12)');
      expect(mockShipment.status).toBe('DELIVERED');
      expect(res.body.data.proofOfDelivery.receiverName).toBe('Sanjay Gaikwad (APMC Shop #12)');
    });

    it('reports trip delay and updates estimated arrival time', async () => {
      const tripId = new mongoose.Types.ObjectId();
      const mockTrip: any = {
        _id: tripId,
        transporterId,
        reportedDelayMinutes: 0,
        estimatedArrivalTime: new Date('2026-11-20T14:00:00Z'),
        origin: { address: 'Nashik' },
        save: jest.fn().mockResolvedValue(true)
      };

      (Trip.findById as jest.Mock).mockResolvedValue(mockTrip);
      (TrackingEvent.create as jest.Mock).mockResolvedValue({} as any);
      (Booking.find as jest.Mock).mockResolvedValue([]);

      const res = await request(app)
        .post(`/api/v1/trips/${tripId}/report-delay`)
        .set('Authorization', `Bearer ${transporterToken}`)
        .send({
          delayMinutes: 35,
          reason: 'TRAFFIC_CONGESTION_GHAT_SECTION',
          notes: 'Heavy monsoon traffic on Kasara Ghat'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockTrip.reportedDelayMinutes).toBe(35);
      expect(mockTrip.delayReason).toBe('TRAFFIC_CONGESTION_GHAT_SECTION');
    });
  });
});
