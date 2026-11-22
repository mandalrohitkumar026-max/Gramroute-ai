import { MatchingEngine, calculateHaversineKm } from '../services/matchingEngine';
import { Booking } from '../models/Booking';
import { Vehicle } from '../models/Vehicle';
import { Trip } from '../models/Trip';
import { Shipment } from '../models/Shipment';
import { ShipmentMatch } from '../models/ShipmentMatch';

jest.mock('../models/Booking');
jest.mock('../models/Vehicle');
jest.mock('../models/Trip');
jest.mock('../models/Shipment');
jest.mock('../models/ShipmentMatch');

describe('Intelligent Shipment Matching Engine (Phase 4)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Booking.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue([])
    });
    (Vehicle.findById as jest.Mock).mockResolvedValue({
      _id: '65fveh000000000000000001',
      payloadCapacityKg: 2500,
      volumetricCapacityCubicMeters: 12,
      hasRefrigeration: false
    });
  });

  // Base mock trip: Nashik (73.8344, 20.0063) to Mumbai Vashi (72.9982, 19.0771)
  const baseTrip: any = {
    _id: '65ftrip00000000000000001',
    vehicleId: '65fveh000000000000000001',
    transporterId: '65ftrans0000000000000001',
    departureTime: new Date(Date.now() + 6 * 3600 * 1000),
    estimatedArrivalTime: new Date(Date.now() + 14 * 3600 * 1000),
    remainingCapacityKg: 1800,
    allocatedWeightKg: 700,
    remainingVolumeCbm: 8,
    status: 'PLANNED',
    isPublished: true,
    totalDistanceKm: 180,
    origin: {
      address: 'Pimpalgaon Baswant APMC',
      district: 'Nashik',
      location: { type: 'Point', coordinates: [73.8344, 20.0063] }
    },
    destination: {
      address: 'Vashi APMC Mandi',
      district: 'Mumbai Suburban',
      location: { type: 'Point', coordinates: [72.9982, 19.0771] }
    }
  };

  describe('Haversine Geospatial Utility', () => {
    it('calculates accurate distance between coordinates (Nashik to Mumbai ~140-160 km)', () => {
      const distance = calculateHaversineKm(20.0063, 73.8344, 19.0771, 72.9982);
      expect(distance).toBeGreaterThan(130);
      expect(distance).toBeLessThan(170);
    });

    it('returns 0 km for identical coordinates', () => {
      const distance = calculateHaversineKm(20.0063, 73.8344, 20.0063, 73.8344);
      expect(distance).toBe(0);
    });
  });

  describe('Hard Constraint 1: Cargo Compatibility', () => {
    it('rejects match when vehicle already carries food and shipment is chemical pesticides', async () => {
      // Simulate existing vegetable load on trip
      (Booking.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          {
            shipmentId: {
              cargoCategory: 'VEGETABLES',
              isPerishable: true,
              weightKg: 700,
              volumeCubicMeters: 4
            }
          }
        ])
      });

      const chemicalShipment: any = {
        _id: '65fship00000000000000001',
        cargoName: 'Insecticide Spray Drums',
        cargoCategory: 'PESTICIDES',
        isPerishable: false,
        weightKg: 300,
        volumeCubicMeters: 1.5,
        status: 'PENDING',
        pickupWindowStart: new Date(Date.now() + 2 * 3600 * 1000),
        deliveryWindowEnd: new Date(Date.now() + 24 * 3600 * 1000),
        origin: { location: { coordinates: [73.8344, 20.0063] } },
        destination: { location: { coordinates: [72.9982, 19.0771] } }
      };

      const result = await MatchingEngine.evaluateTripShipmentMatch(chemicalShipment, baseTrip);

      expect(result.feasible).toBe(false);
      expect(result.hardConstraintFailures.some((f) => f.includes('Safety Violation'))).toBe(true);
    });
  });

  describe('Hard Constraint 2: Insufficient Payload Capacity', () => {
    it('rejects match when shipment weight exceeds trip remaining capacity', async () => {
      const heavyShipment: any = {
        _id: '65fship00000000000000002',
        cargoName: 'Bulk Grain Sacks',
        cargoCategory: 'GRAINS_CEREALS',
        weightKg: 2200, // 2200 kg > 1800 kg remaining
        volumeCubicMeters: 8,
        status: 'PENDING',
        pickupWindowStart: new Date(Date.now() + 2 * 3600 * 1000),
        deliveryWindowEnd: new Date(Date.now() + 24 * 3600 * 1000),
        origin: { location: { coordinates: [73.8344, 20.0063] } },
        destination: { location: { coordinates: [72.9982, 19.0771] } }
      };

      const result = await MatchingEngine.evaluateTripShipmentMatch(heavyShipment, baseTrip);

      expect(result.feasible).toBe(false);
      expect(result.hardConstraintFailures.some((f) => f.includes('Insufficient vehicle payload capacity'))).toBe(true);
    });
  });

  describe('Hard Constraint 3: Missed Delivery Deadline', () => {
    it('rejects match when trip estimated arrival exceeds shipment delivery deadline', async () => {
      const urgentShipment: any = {
        _id: '65fship00000000000000003',
        cargoName: 'Fresh Strawberries',
        cargoCategory: 'FRUITS',
        isPerishable: true,
        weightKg: 400,
        volumeCubicMeters: 2,
        status: 'PENDING',
        pickupWindowStart: new Date(Date.now() + 2 * 3600 * 1000),
        // Deadline is 10 hours from now, but trip arrives in 14 hours!
        deliveryWindowEnd: new Date(Date.now() + 10 * 3600 * 1000),
        origin: { location: { coordinates: [73.8344, 20.0063] } },
        destination: { location: { coordinates: [72.9982, 19.0771] } }
      };

      const result = await MatchingEngine.evaluateTripShipmentMatch(urgentShipment, baseTrip);

      expect(result.feasible).toBe(false);
      expect(result.hardConstraintFailures.some((f) => f.includes('Delivery deadline violation'))).toBe(true);
    });
  });

  describe('Hard Constraint 4: Geographically Unsuitable Shipments', () => {
    it('rejects shipment requiring excessive pickup detour (> 35 km away from corridor)', async () => {
      const farOffShipment: any = {
        _id: '65fship00000000000000004',
        cargoName: 'Soybean Sacks',
        cargoCategory: 'GRAINS_CEREALS',
        weightKg: 600,
        volumeCubicMeters: 3,
        status: 'PENDING',
        pickupWindowStart: new Date(Date.now() + 2 * 3600 * 1000),
        deliveryWindowEnd: new Date(Date.now() + 24 * 3600 * 1000),
        // Coordinates in Dhule/Malegaon (far north, ~90 km away from Nashik origin)
        origin: { location: { coordinates: [74.5, 20.9] } },
        destination: { location: { coordinates: [72.9982, 19.0771] } }
      };

      const result = await MatchingEngine.evaluateTripShipmentMatch(farOffShipment, baseTrip);

      expect(result.feasible).toBe(false);
      expect(result.hardConstraintFailures.some((f) => f.includes('Geographically unsuitable'))).toBe(true);
      expect(result.hardConstraintFailures.some((f) => f.includes('Pickup detour'))).toBe(true);
    });

    it('rejects shipment whose destination is in a completely opposite district (> 45 km spread)', async () => {
      const oppositeDestShipment: any = {
        _id: '65fship00000000000000005',
        cargoName: 'Farm Hardware',
        cargoCategory: 'GENERAL_FREIGHT',
        weightKg: 500,
        volumeCubicMeters: 2,
        status: 'PENDING',
        pickupWindowStart: new Date(Date.now() + 2 * 3600 * 1000),
        deliveryWindowEnd: new Date(Date.now() + 24 * 3600 * 1000),
        origin: { location: { coordinates: [73.8344, 20.0063] } },
        // Destination in Solapur / Kolhapur (~300 km south, completely opposite to Mumbai)
        destination: { district: 'Kolhapur', location: { coordinates: [74.2433, 16.705] } }
      };

      const result = await MatchingEngine.evaluateTripShipmentMatch(oppositeDestShipment, baseTrip);

      expect(result.feasible).toBe(false);
      expect(result.hardConstraintFailures.some((f) => f.includes('Delivery destination is'))).toBe(true);
    });
  });

  describe('Multi-Dimensional Explainable Scoring & Feasible Ranking', () => {
    it('produces high explainable score (> 85), breakdown, and savings for ideal corridor match', async () => {
      const idealShipment: any = {
        _id: '65fship00000000000000006',
        cargoName: 'Nashik Red Onions',
        cargoCategory: 'VEGETABLES',
        isPerishable: true,
        weightKg: 1200,
        volumeCubicMeters: 5,
        status: 'PENDING',
        maxBudgetInr: 2800,
        pickupWindowStart: new Date(Date.now() + 4 * 3600 * 1000),
        deliveryWindowEnd: new Date(Date.now() + 24 * 3600 * 1000),
        origin: {
          villageOrTown: 'Dindori',
          district: 'Nashik',
          location: { coordinates: [73.84, 20.02] } // ~2 km detour
        },
        destination: {
          mandiOrMarketName: 'Vashi APMC',
          district: 'Mumbai Suburban',
          location: { coordinates: [72.9982, 19.0771] } // Identical destination
        }
      };

      const result = await MatchingEngine.evaluateTripShipmentMatch(idealShipment, baseTrip);

      expect(result.feasible).toBe(true);
      expect(result.hardConstraintFailures).toHaveLength(0);

      // Verify multi-dimensional breakdown scores
      expect(result.scoringBreakdown.pickupProximity).toBeGreaterThanOrEqual(90);
      expect(result.scoringBreakdown.destinationCompatibility).toBe(100);
      expect(result.scoringBreakdown.capacityUtilization).toBeGreaterThanOrEqual(80);
      expect(result.scoringBreakdown.detourEfficiency).toBeGreaterThanOrEqual(90);
      expect(result.scoringBreakdown.overallScore).toBeGreaterThanOrEqual(85);

      // Verify human-readable explanation bullet points
      expect(result.reasons.length).toBeGreaterThanOrEqual(3);
      expect(result.reasons.some((r) => r.includes('route corridor'))).toBe(true);
      expect(result.reasons.some((r) => r.includes('cost reduction compared to solitary'))).toBe(true);

      // Verify safety warning for perishable goods
      expect(result.warnings.some((w) => w.includes('Perishable consignment'))).toBe(true);
    });
  });

  describe('Duplicate Match Prevention & Recalculation', () => {
    it('prevents duplicate active match creation and updates existing proposal', async () => {
      const mockShipment: any = {
        _id: '65fship00000000000000007',
        cargoName: 'Pomegranate Boxes',
        cargoCategory: 'FRUITS',
        isPerishable: true,
        weightKg: 800,
        volumeCubicMeters: 3,
        status: 'PENDING',
        maxBudgetInr: 2500,
        pickupWindowStart: new Date(Date.now() + 3 * 3600 * 1000),
        deliveryWindowEnd: new Date(Date.now() + 24 * 3600 * 1000),
        origin: { location: { coordinates: [73.8344, 20.0063] } },
        destination: { district: 'Mumbai Suburban', location: { coordinates: [72.9982, 19.0771] } }
      };

      (Shipment.findById as jest.Mock).mockResolvedValue(mockShipment);
      (Trip.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue([baseTrip])
      });

      const existingMatch: any = {
        _id: '65fmatch0000000000000001',
        shipmentId: mockShipment._id,
        tripId: baseTrip._id,
        compatibilityScore: 78,
        status: 'PROPOSED',
        save: jest.fn().mockResolvedValue(true)
      };

      (ShipmentMatch.findOne as jest.Mock).mockResolvedValue(existingMatch);

      const matches = await MatchingEngine.findAndRankMatchesForShipment(mockShipment._id);

      expect(matches).toHaveLength(1);
      expect(existingMatch.save).toHaveBeenCalledTimes(1);
      // Ensured ShipmentMatch.create was NOT called again (preventing duplicate matches)
      expect(ShipmentMatch.create).not.toHaveBeenCalled();
    });
  });
});
