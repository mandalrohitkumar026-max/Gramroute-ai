"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectMatch = exports.acceptMatch = exports.getMatchById = exports.listMatches = exports.findMatchesForShipmentHandler = void 0;
const crypto_1 = __importDefault(require("crypto"));
const ShipmentMatch_1 = require("../models/ShipmentMatch");
const Shipment_1 = require("../models/Shipment");
const Trip_1 = require("../models/Trip");
const Booking_1 = require("../models/Booking");
const matchingEngine_1 = require("../services/matchingEngine");
const appError_1 = require("../utils/appError");
const apiResponse_1 = require("../utils/apiResponse");
const pagination_1 = require("../utils/pagination");
/**
 * Generate fresh AI matches for a shipment using the multi-criteria explainable matching engine
 */
const findMatchesForShipmentHandler = async (req, res, next) => {
    try {
        const { shipmentId } = req.params;
        const shipment = await Shipment_1.Shipment.findById(shipmentId);
        if (!shipment) {
            throw new appError_1.AppError('Shipment not found', 404, 'NOT_FOUND');
        }
        // Auto-expire stale matches first
        await ShipmentMatch_1.ShipmentMatch.updateMany({ expiresAt: { $lt: new Date() }, status: 'PROPOSED' }, { $set: { status: 'EXPIRED' } });
        const matches = await matchingEngine_1.MatchingEngine.findAndRankMatchesForShipment(shipmentId);
        // Populate for clean frontend presentation
        const populated = await ShipmentMatch_1.ShipmentMatch.find({
            _id: { $in: matches.map((m) => m._id) }
        })
            .populate('shipmentId')
            .populate('tripId')
            .populate('vehicleId')
            .sort({ compatibilityScore: -1 });
        res.status(200).json(apiResponse_1.ApiResponse.success(populated, `Matching engine generated ${matches.length} compatible consolidation opportunities.`));
    }
    catch (error) {
        next(error);
    }
};
exports.findMatchesForShipmentHandler = findMatchesForShipmentHandler;
/**
 * List matches with multi-criteria filters
 */
const listMatches = async (req, res, next) => {
    try {
        const { page, limit, skip, sort } = (0, pagination_1.parsePagination)(req.query);
        const filter = {};
        // Auto-expire stale matches
        await ShipmentMatch_1.ShipmentMatch.updateMany({ expiresAt: { $lt: new Date() }, status: 'PROPOSED' }, { $set: { status: 'EXPIRED' } });
        // Role-based visibility
        if (req.user.role === 'FARMER' || req.user.role === 'BUSINESS') {
            filter.shipperId = req.user.id;
        }
        else if (req.user.role === 'TRANSPORTER') {
            filter.transporterId = req.user.id;
        }
        if (req.query.shipmentId) {
            filter.shipmentId = req.query.shipmentId;
        }
        if (req.query.tripId) {
            filter.tripId = req.query.tripId;
        }
        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.minScore) {
            filter.compatibilityScore = { $gte: Number(req.query.minScore) };
        }
        const [matches, total] = await Promise.all([
            ShipmentMatch_1.ShipmentMatch.find(filter)
                .populate('shipmentId')
                .populate('tripId')
                .populate('vehicleId')
                .sort(sort)
                .skip(skip)
                .limit(limit),
            ShipmentMatch_1.ShipmentMatch.countDocuments(filter)
        ]);
        res.status(200).json(apiResponse_1.ApiResponse.success((0, pagination_1.paginateResult)(matches, total, page, limit), 'Matches retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.listMatches = listMatches;
const getMatchById = async (req, res, next) => {
    try {
        const match = await ShipmentMatch_1.ShipmentMatch.findById(req.params.id)
            .populate('shipmentId')
            .populate('tripId')
            .populate('vehicleId');
        if (!match) {
            throw new appError_1.AppError('Match not found', 404, 'NOT_FOUND');
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(match, 'Match details retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.getMatchById = getMatchById;
/**
 * Shipper or Transporter accepts a match proposal.
 * When both have accepted, a confirmed Booking is automatically generated!
 */
const acceptMatch = async (req, res, next) => {
    try {
        const { id } = req.params;
        const match = await ShipmentMatch_1.ShipmentMatch.findById(id);
        if (!match) {
            throw new appError_1.AppError('Match not found', 404, 'NOT_FOUND');
        }
        if (match.status === 'EXPIRED') {
            throw new appError_1.AppError('This match proposal has expired. Please recalculate matches.', 400, 'MATCH_EXPIRED');
        }
        const isShipper = req.user.id === match.shipperId.toString();
        const isTransporter = req.user.id === match.transporterId.toString();
        const isAdmin = req.user.role === 'ADMIN';
        if (!isShipper && !isTransporter && !isAdmin) {
            throw new appError_1.AppError('Forbidden: Not authorized to accept this match', 403, 'FORBIDDEN');
        }
        const shipment = await Shipment_1.Shipment.findById(match.shipmentId);
        const trip = await Trip_1.Trip.findById(match.tripId);
        if (!shipment || !trip) {
            throw new appError_1.AppError('Shipment or Trip associated with this match no longer exists', 404, 'NOT_FOUND');
        }
        // Check if other party already accepted
        let newStatus = 'PROPOSED';
        let shouldCreateBooking = false;
        if (isShipper) {
            if (match.status === 'ACCEPTED_BY_TRANSPORTER' || isAdmin) {
                newStatus = 'ACCEPTED';
                shouldCreateBooking = true;
            }
            else {
                newStatus = 'ACCEPTED_BY_SHIPPER';
            }
        }
        else if (isTransporter) {
            if (match.status === 'ACCEPTED_BY_SHIPPER' || isAdmin) {
                newStatus = 'ACCEPTED';
                shouldCreateBooking = true;
            }
            else {
                newStatus = 'ACCEPTED_BY_TRANSPORTER';
            }
        }
        match.status = newStatus;
        await match.save();
        let createdBooking = null;
        if (shouldCreateBooking) {
            // Re-verify capacity atomically before creating booking
            const updatedTrip = await Trip_1.Trip.findOneAndUpdate({
                _id: trip._id,
                remainingCapacityKg: { $gte: shipment.weightKg }
            }, {
                $inc: {
                    remainingCapacityKg: -shipment.weightKg,
                    allocatedWeightKg: shipment.weightKg
                }
            }, { new: true });
            if (!updatedTrip) {
                throw new appError_1.AppError('Capacity was booked by another concurrent shipper. Match cannot be converted to booking.', 400, 'CAPACITY_UNAVAILABLE');
            }
            const bookingReference = `GR-${Date.now().toString(36).toUpperCase()}-${crypto_1.default.randomBytes(2).toString('hex').toUpperCase()}`;
            const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
            const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
            createdBooking = await Booking_1.Booking.create({
                bookingReference,
                shipmentId: shipment._id,
                tripId: trip._id,
                shipperId: shipment.shipperId,
                transporterId: trip.transporterId,
                totalAgreedAmountInr: match.recommendedPriceInr,
                allocatedWeightKg: shipment.weightKg,
                allocatedVolumeCbm: shipment.volumeCubicMeters,
                pickupOtp,
                deliveryOtp,
                bookingStatus: 'CONFIRMED',
                paymentStatus: 'PENDING',
                confirmedAt: new Date()
            });
            shipment.status = 'BOOKED';
            await shipment.save();
        }
        res.status(200).json(apiResponse_1.ApiResponse.success({
            match,
            booking: createdBooking,
            isBookingCreated: shouldCreateBooking
        }, shouldCreateBooking
            ? 'Match accepted by both parties! Confirmed booking generated.'
            : `Match accepted by ${isShipper ? 'shipper' : 'transporter'}. Awaiting counterparty confirmation.`));
    }
    catch (error) {
        next(error);
    }
};
exports.acceptMatch = acceptMatch;
/**
 * Shipper or Transporter rejects a match proposal
 */
const rejectMatch = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const match = await ShipmentMatch_1.ShipmentMatch.findById(id);
        if (!match) {
            throw new appError_1.AppError('Match not found', 404, 'NOT_FOUND');
        }
        match.status = 'REJECTED';
        match.rejectionReason = reason || 'Declined by user';
        await match.save();
        res.status(200).json(apiResponse_1.ApiResponse.success(match, 'Match proposal rejected'));
    }
    catch (error) {
        next(error);
    }
};
exports.rejectMatch = rejectMatch;
