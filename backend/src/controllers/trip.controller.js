"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTripStatus = exports.getTripById = exports.listTrips = exports.createTrip = void 0;
const Trip_1 = require("../models/Trip");
const Vehicle_1 = require("../models/Vehicle");
const appError_1 = require("../utils/appError");
const apiResponse_1 = require("../utils/apiResponse");
const pagination_1 = require("../utils/pagination");
const createTrip = async (req, res, next) => {
    try {
        const { vehicleId, departureTime, estimatedArrivalTime, availableCapacityKg, totalPriceInr } = req.body;
        // Verify vehicle belongs to user if transporter
        const vehicle = await Vehicle_1.Vehicle.findById(vehicleId);
        if (!vehicle) {
            throw new appError_1.AppError('Vehicle not found', 404, 'NOT_FOUND');
        }
        if (req.user.role !== 'ADMIN' && vehicle.transporterId.toString() !== req.user.id) {
            throw new appError_1.AppError('Forbidden: You can only create trips for your own vehicles', 403, 'FORBIDDEN');
        }
        const trip = await Trip_1.Trip.create({
            transporterId: req.user.id,
            vehicleId,
            departureTime,
            estimatedArrivalTime,
            totalDistanceKm: 120, // Initial estimate
            totalEstimatedFuelCost: 1500,
            totalAgreedEarnings: totalPriceInr || 3500,
            allocatedWeightKg: 0,
            remainingCapacityKg: availableCapacityKg || vehicle.payloadCapacityKg,
            status: 'PLANNED',
            isBackhaulTrip: false
        });
        res.status(201).json(apiResponse_1.ApiResponse.success(trip, 'Trip created successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.createTrip = createTrip;
const listTrips = async (req, res, next) => {
    try {
        const { page, limit, skip, sort } = (0, pagination_1.parsePagination)(req.query);
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.transporterId) {
            filter.transporterId = req.query.transporterId;
        }
        if (req.query.hasAvailableCapacity === 'true') {
            filter.remainingCapacityKg = { $gt: 0 };
        }
        const [trips, total] = await Promise.all([
            Trip_1.Trip.find(filter).populate('vehicleId').populate('transporterId', 'phoneNumber').sort(sort).skip(skip).limit(limit),
            Trip_1.Trip.countDocuments(filter)
        ]);
        res.status(200).json(apiResponse_1.ApiResponse.success((0, pagination_1.paginateResult)(trips, total, page, limit), 'Trips retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.listTrips = listTrips;
const getTripById = async (req, res, next) => {
    try {
        const trip = await Trip_1.Trip.findById(req.params.id)
            .populate('vehicleId')
            .populate('transporterId', 'phoneNumber');
        if (!trip) {
            throw new appError_1.AppError('Trip not found', 404, 'NOT_FOUND');
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(trip, 'Trip retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.getTripById = getTripById;
const updateTripStatus = async (req, res, next) => {
    try {
        const trip = await Trip_1.Trip.findById(req.params.id);
        if (!trip) {
            throw new appError_1.AppError('Trip not found', 404, 'NOT_FOUND');
        }
        if (req.user.role !== 'ADMIN' && trip.transporterId.toString() !== req.user.id) {
            throw new appError_1.AppError('Forbidden: Only the operating transporter or admin can update trip status', 403, 'FORBIDDEN');
        }
        const { status } = req.body;
        trip.status = status;
        if (status === 'IN_TRANSIT' && !trip.actualStartTime) {
            trip.actualStartTime = new Date();
        }
        else if (status === 'COMPLETED' && !trip.actualCompletionTime) {
            trip.actualCompletionTime = new Date();
        }
        await trip.save();
        res.status(200).json(apiResponse_1.ApiResponse.success(trip, `Trip status updated to ${status}`));
    }
    catch (error) {
        next(error);
    }
};
exports.updateTripStatus = updateTripStatus;
