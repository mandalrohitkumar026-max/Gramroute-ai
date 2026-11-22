import { Shipment, IShipment } from '../models/Shipment';
import { Trip, ITrip } from '../models/Trip';
import { Vehicle } from '../models/Vehicle';
import { Booking } from '../models/Booking';
import { ShipmentMatch, IShipmentMatch, IScoringBreakdown } from '../models/ShipmentMatch';
import { checkCargoCompatibility } from '../utils/cargoCompatibility';

/**
 * Calculates Haversine distance in kilometers between two GPS coordinates
 */
export const calculateHaversineKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

export interface MatchEvaluationResult {
  feasible: boolean;
  hardConstraintFailures: string[];
  scoringBreakdown: IScoringBreakdown;
  reasons: string[];
  warnings: string[];
  recommendedPriceInr: number;
  estimatedSavingsInr: number;
  costSavingPercent: number;
  estimatedDetourKm: number;
  additionalDwellMinutes: number;
}

export class MatchingEngine {
  /**
   * Evaluates hard constraints and computes multi-dimensional explainable score
   */
  public static async evaluateTripShipmentMatch(
    shipment: IShipment,
    trip: ITrip
  ): Promise<MatchEvaluationResult> {
    const hardConstraintFailures: string[] = [];
    const reasons: string[] = [];
    const warnings: string[] = [];

    // --- HARD CONSTRAINT 1: Trip & Shipment Status ---
    if (shipment.status === 'BOOKED' || shipment.status === 'IN_TRANSIT' || shipment.status === 'DELIVERED') {
      hardConstraintFailures.push(`Shipment is already ${shipment.status.toLowerCase()}`);
    }
    if (trip.status !== 'PLANNED') {
      hardConstraintFailures.push(`Trip is already ${trip.status.toLowerCase()} and cannot accept new cargo`);
    }

    // --- HARD CONSTRAINT 2: Payload Capacity ---
    if (trip.remainingCapacityKg < shipment.weightKg) {
      hardConstraintFailures.push(
        `Insufficient vehicle payload capacity: Needed ${shipment.weightKg} kg, but trip only has ${trip.remainingCapacityKg} kg available.`
      );
    }

    // --- HARD CONSTRAINT 3: Delivery Deadline Feasibility ---
    const shipmentDeliveryDeadline = shipment.deliveryWindowEnd || shipment.deliveryDeadline;
    if (shipmentDeliveryDeadline && new Date(trip.estimatedArrivalTime) > new Date(shipmentDeliveryDeadline)) {
      hardConstraintFailures.push(
        `Delivery deadline violation: Trip arrival (${new Date(trip.estimatedArrivalTime).toLocaleTimeString()}) exceeds shipment deadline (${new Date(shipmentDeliveryDeadline).toLocaleTimeString()}).`
      );
    }

    // --- HARD CONSTRAINT 4: Maximum Pickup / Delivery Stops (Max 4 stops to prevent excessive delays) ---
    const existingBookings = await Booking.find({
      tripId: trip._id,
      bookingStatus: { $nin: ['CANCELLED', 'REJECTED'] }
    }).populate('shipmentId');

    const MAX_STOPS_LIMIT = 4;
    if (existingBookings.length >= MAX_STOPS_LIMIT) {
      hardConstraintFailures.push(
        `Stop limit exceeded: Trip already has ${existingBookings.length} stops allocated (Max allowed: ${MAX_STOPS_LIMIT}).`
      );
    }

    // --- HARD CONSTRAINT 5: Cargo Compatibility & Cross-Contamination Safety ---
    const vehicle = await Vehicle.findById(trip.vehicleId);
    const vehicleCapacity = {
      maxPayloadKg: vehicle?.payloadCapacityKg || 2500,
      maxVolumeCbm: vehicle?.volumetricCapacityCubicMeters || 10
    };

    const existingShipmentItems = existingBookings
      .map((b) => b.shipmentId as any)
      .filter(Boolean)
      .map((s) => ({
        cargoCategory: s.cargoCategory,
        isPerishable: s.isPerishable,
        temperatureControlRequired: s.temperatureControlRequired,
        weightKg: s.weightKg,
        volumeCubicMeters: s.volumeCubicMeters
      }));

    const compatibilityCheck = checkCargoCompatibility(
      existingShipmentItems,
      {
        cargoCategory: shipment.cargoCategory,
        isPerishable: shipment.isPerishable,
        temperatureControlRequired: shipment.temperatureControlRequired,
        weightKg: shipment.weightKg,
        volumeCubicMeters: shipment.volumeCubicMeters
      },
      vehicleCapacity
    );

    if (!compatibilityCheck.compatible) {
      hardConstraintFailures.push(...compatibilityCheck.reasons);
    }

    // --- HARD CONSTRAINT 6: Geospatial Detour & Feasibility ---
    const tripOriginCoords = trip.origin?.location?.coordinates || [73.8344, 20.0063];
    const tripDestCoords = trip.destination?.location?.coordinates || [72.9982, 19.0771];

    const shipOriginCoords = shipment.origin?.location?.coordinates || [73.8344, 20.0063];
    const shipDestCoords = shipment.destination?.location?.coordinates || [72.9982, 19.0771];

    // Pickup detour distance from trip origin/corridor
    const pickupDetourKm = calculateHaversineKm(
      tripOriginCoords[1],
      tripOriginCoords[0],
      shipOriginCoords[1],
      shipOriginCoords[0]
    );

    // Destination distance from trip destination
    const destinationDiffKm = calculateHaversineKm(
      tripDestCoords[1],
      tripDestCoords[0],
      shipDestCoords[1],
      shipDestCoords[0]
    );

    const MAX_DETOUR_KM = 35; // Maximum 35 km detour allowed
    const MAX_DEST_DIFF_KM = 45; // Maximum 45 km destination spread allowed

    if (pickupDetourKm > MAX_DETOUR_KM) {
      hardConstraintFailures.push(
        `Geographically unsuitable: Pickup detour (${pickupDetourKm} km) exceeds maximum corridor detour threshold (${MAX_DETOUR_KM} km).`
      );
    }

    if (destinationDiffKm > MAX_DEST_DIFF_KM) {
      hardConstraintFailures.push(
        `Geographically unsuitable: Delivery destination is ${destinationDiffKm} km away from trip target corridor (${MAX_DEST_DIFF_KM} km max).`
      );
    }

    // Return early if any hard constraint failed
    if (hardConstraintFailures.length > 0) {
      return {
        feasible: false,
        hardConstraintFailures,
        scoringBreakdown: {
          pickupProximity: 0,
          destinationCompatibility: 0,
          capacityUtilization: 0,
          timeWindowFit: 0,
          detourEfficiency: 0,
          overallScore: 0
        },
        reasons: [],
        warnings: hardConstraintFailures,
        recommendedPriceInr: 0,
        estimatedSavingsInr: 0,
        costSavingPercent: 0,
        estimatedDetourKm: pickupDetourKm,
        additionalDwellMinutes: 0
      };
    }

    // --- EXPLAINABLE MULTI-DIMENSIONAL SCORING (0 to 100) ---
    // 1. Pickup Proximity (0-100)
    const pickupProximity = Math.max(30, Math.min(100, Math.round(100 - pickupDetourKm * 2.2)));

    // 2. Destination Compatibility (0-100)
    const isSameDistrict =
      shipment.destination?.district?.toLowerCase() === trip.destination?.district?.toLowerCase();
    const destinationCompatibility = isSameDistrict
      ? 100
      : Math.max(30, Math.min(95, Math.round(95 - destinationDiffKm * 1.5)));

    // 3. Capacity Utilization Gain (0-100)
    const currentUtil = (trip.allocatedWeightKg / vehicleCapacity.maxPayloadKg) * 100;
    const finalAllocatedWeight = trip.allocatedWeightKg + shipment.weightKg;
    const finalUtil = (finalAllocatedWeight / vehicleCapacity.maxPayloadKg) * 100;
    // Ideal utilization is 80% to 95%
    let capacityUtilization = 80;
    if (finalUtil >= 75 && finalUtil <= 95) {
      capacityUtilization = 98;
    } else if (finalUtil > 50) {
      capacityUtilization = 88;
    } else {
      capacityUtilization = 72;
    }

    // 4. Delivery Deadline & Time-Window Fit (0-100)
    const hoursBetween = Math.abs(
      (new Date(trip.departureTime).getTime() - new Date(shipment.pickupWindowStart).getTime()) / 3600000
    );
    const timeWindowFit = Math.max(40, Math.min(100, Math.round(100 - hoursBetween * 3)));

    // 5. Detour Efficiency (0-100)
    const detourEfficiency = Math.max(40, Math.min(100, Math.round(100 - pickupDetourKm * 1.8)));

    // Weighted Overall Score (explainable)
    // Pickup: 25%, Destination: 25%, Capacity Gain: 20%, Time: 15%, Detour: 15%
    const overallScore = Math.round(
      0.25 * pickupProximity +
        0.25 * destinationCompatibility +
        0.2 * capacityUtilization +
        0.15 * timeWindowFit +
        0.15 * detourEfficiency
    );

    // Human-readable Explanation Reasons
    reasons.push(
      `Pickup in ${shipment.origin?.villageOrTown || 'origin'} is within ${pickupDetourKm} km of driver's active route corridor.`
    );
    if (isSameDistrict) {
      reasons.push(
        `Destination matches target mandi market (${shipment.destination?.district}): Zero off-route transit deviation.`
      );
    } else {
      reasons.push(
        `Destination drop is only ${destinationDiffKm} km from scheduled mandi corridor waypoint.`
      );
    }
    reasons.push(
      `Consolidating this ${shipment.weightKg} kg load raises vehicle payload capacity utilization from ${Math.round(currentUtil)}% to ${Math.round(finalUtil)}%.`
    );

    // Pricing & Savings Calculation
    const distKm = trip.totalDistanceKm || 160;
    const weightTons = shipment.weightKg / 1000;
    const fairTonKmPrice = Math.round(weightTons * distKm * 1.85); // ₹1.85 / ton-km
    const solitaryTruckHireInr = Math.round(fairTonKmPrice * 1.45); // Solitary hire benchmark
    const recommendedPriceInr = Math.min(shipment.maxBudgetInr || 3000, fairTonKmPrice);
    const estimatedSavingsInr = Math.max(400, solitaryTruckHireInr - recommendedPriceInr);
    const costSavingPercent = Math.round((estimatedSavingsInr / solitaryTruckHireInr) * 100);

    reasons.push(
      `Shared consolidation delivers ₹${estimatedSavingsInr} (${costSavingPercent}%) cost reduction compared to solitary vehicle hire.`
    );

    // Compatibility Warnings
    if (shipment.isPerishable) {
      warnings.push(`Perishable consignment: Requires fast-track priority unloading at first mandi stop.`);
    }
    if (shipment.temperatureControlRequired && !vehicle?.hasRefrigeration) {
      warnings.push(`Alert: Cargo specified temperature sensitivity, but vehicle is ambient.`);
    }
    if (shipment.handlingRequirements?.includes('DO_NOT_STACK')) {
      warnings.push(`Stacking instruction: Do not place other bags or crates on top of this consignment.`);
    }

    const additionalDwellMinutes = 15 + Math.round(pickupDetourKm * 1.5);

    return {
      feasible: true,
      hardConstraintFailures: [],
      scoringBreakdown: {
        pickupProximity,
        destinationCompatibility,
        capacityUtilization,
        timeWindowFit,
        detourEfficiency,
        overallScore
      },
      reasons,
      warnings,
      recommendedPriceInr,
      estimatedSavingsInr,
      costSavingPercent,
      estimatedDetourKm: pickupDetourKm,
      additionalDwellMinutes
    };
  }

  /**
   * Discovers and ranks candidate matches for a given shipment
   */
  public static async findAndRankMatchesForShipment(shipmentId: string): Promise<IShipmentMatch[]> {
    const shipment = await Shipment.findById(shipmentId);
    if (!shipment || shipment.isDeleted) {
      return [];
    }

    // Step 1: Query Candidate Trips (Only Planned, Published, with remaining capacity)
    const candidateTrips = await Trip.find({
      status: 'PLANNED',
      isPublished: true,
      remainingCapacityKg: { $gte: shipment.weightKg }
    }).populate('vehicleId');

    const generatedMatches: IShipmentMatch[] = [];

    // Step 2: Evaluate each candidate through the pipeline
    for (const trip of candidateTrips) {
      const evaluation = await this.evaluateTripShipmentMatch(shipment, trip);

      if (!evaluation.feasible) {
        continue;
      }

      // Step 3: Check for existing match to prevent duplicate matches
      const existingMatch = await ShipmentMatch.findOne({
        shipmentId: shipment._id,
        tripId: trip._id,
        status: { $in: ['PROPOSED', 'ACCEPTED_BY_SHIPPER', 'ACCEPTED_BY_TRANSPORTER', 'ACCEPTED'] }
      });

      if (existingMatch) {
        // Update score and details if trip or pricing changed
        existingMatch.compatibilityScore = evaluation.scoringBreakdown.overallScore;
        existingMatch.scoringBreakdown = evaluation.scoringBreakdown;
        existingMatch.reasons = evaluation.reasons;
        existingMatch.warnings = evaluation.warnings;
        existingMatch.recommendedPriceInr = evaluation.recommendedPriceInr;
        existingMatch.estimatedSavingsInr = evaluation.estimatedSavingsInr;
        existingMatch.costSavingPercent = evaluation.costSavingPercent;
        await existingMatch.save();
        generatedMatches.push(existingMatch);
        continue;
      }

      // Step 4: Expiration handling (24h or trip departure time)
      const now = Date.now();
      const tripDepTime = new Date(trip.departureTime).getTime();
      const expiresAt = new Date(Math.min(now + 24 * 3600 * 1000, tripDepTime));

      const match = await ShipmentMatch.create({
        shipmentId: shipment._id,
        tripId: trip._id,
        vehicleId: trip.vehicleId,
        shipperId: shipment.shipperId,
        transporterId: trip.transporterId,
        compatibilityScore: evaluation.scoringBreakdown.overallScore,
        scoringBreakdown: evaluation.scoringBreakdown,
        recommendedPriceInr: evaluation.recommendedPriceInr,
        estimatedSavingsInr: evaluation.estimatedSavingsInr,
        costSavingPercent: evaluation.costSavingPercent,
        estimatedDetourKm: evaluation.estimatedDetourKm,
        additionalDwellMinutes: evaluation.additionalDwellMinutes,
        reasons: evaluation.reasons,
        warnings: evaluation.warnings,
        status: 'PROPOSED',
        expiresAt
      });

      generatedMatches.push(match);
    }

    // Step 5: Rank by overall compatibility score descending
    generatedMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    return generatedMatches;
  }
}
