"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingById = exports.listBookings = exports.cancelBooking = exports.transitionBookingStatus = exports.respondToBooking = exports.createBooking = void 0;
const crypto_1 = __importDefault(require("crypto"));
const Booking_1 = require("../models/Booking");
const Shipment_1 = require("../models/Shipment");
const Trip_1 = require("../models/Trip");
const Vehicle_1 = require("../models/Vehicle");
const cargoCompatibility_1 = require("../utils/cargoCompatibility");
const appError_1 = require("../utils/appError");
const apiResponse_1 = require("../utils/apiResponse");
const pagination_1 = require("../utils/pagination");
/**
 * Valid state transitions for the booking lifecycle
 */
const ALLOWED_TRANSITIONS = {
    REQUESTED: ['ACCEPTED_BY_CUSTOMER', 'ACCEPTED_BY_TRANSPORTER', 'CONFIRMED', 'REJECTED', 'CANCELLED'],
    ACCEPTED_BY_CUSTOMER: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
    ACCEPTED_BY_TRANSPORTER: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
    CONFIRMED: ['TRIP_PREPARATION', 'CANCELLED'],
    TRIP_PREPARATION: ['PICKED_UP', 'CANCELLED'],
    PICKED_UP: ['IN_TRANSIT', 'CANCELLED'],
    IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
    DELIVERED: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
    REJECTED: []
};
const createBooking = async (req, res, next) => {
    try {
        const { shipmentId, tripId, agreedPriceInr } = req.body;
        const shipment = await Shipment_1.Shipment.findById(shipmentId);
        if (!shipment) {
            throw new appError_1.AppError('Shipment not found', 404, 'NOT_FOUND');
        }
        if (['BOOKED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(shipment.status)) {
            throw new appError_1.AppError(`Shipment is already ${shipment.status.toLowerCase()} and cannot be booked`, 400, 'INVALID_STATE');
        }
        const trip = await Trip_1.Trip.findById(tripId);
        if (!trip) {
            throw new appError_1.AppError('Trip not found', 404, 'NOT_FOUND');
        }
        if (trip.status !== 'PLANNED') {
            throw new appError_1.AppError('Cannot book cargo on a trip that is already dispatched or completed', 400, 'TRIP_NOT_AVAILABLE');
        }
        // 1. Cargo Compatibility & Overloading Validation
        const vehicle = await Vehicle_1.Vehicle.findById(trip.vehicleId);
        if (!vehicle) {
            throw new appError_1.AppError('Vehicle assigned to trip not found', 404, 'NOT_FOUND');
        }
        // Fetch existing active bookings on this trip to check cross-cargo compatibility
        const existingBookings = await Booking_1.Booking.find({
            tripId: trip._id,
            bookingStatus: { $nin: ['CANCELLED', 'REJECTED'] }
        }).populate('shipmentId');
        const existingShipments = existingBookings
            .map((b) => b.shipmentId)
            .filter(Boolean)
            .map((s) => ({
            cargoCategory: s.cargoCategory,
            isPerishable: s.isPerishable,
            temperatureControlRequired: s.temperatureControlRequired,
            weightKg: s.weightKg,
            volumeCubicMeters: s.volumeCubicMeters
        }));
        const compatibility = (0, cargoCompatibility_1.checkCargoCompatibility)(existingShipments, {
            cargoCategory: shipment.cargoCategory,
            isPerishable: shipment.isPerishable,
            temperatureControlRequired: shipment.temperatureControlRequired,
            weightKg: shipment.weightKg,
            volumeCubicMeters: shipment.volumeCubicMeters
        }, {
            maxPayloadKg: vehicle.payloadCapacityKg,
            maxVolumeCbm: vehicle.volumetricCapacityCubicMeters
        });
        if (!compatibility.compatible) {
            throw new appError_1.AppError(`Cargo Compatibility Conflict: ${compatibility.reasons.join(' | ')}`, 400, 'CARGO_INCOMPATIBLE', compatibility.reasons);
        }
        // 2. Atomic Overload Protection Check
        const updatedTrip = await Trip_1.Trip.findOneAndUpdate({
            _id: tripId,
            remainingCapacityKg: { $gte: shipment.weightKg }
        }, {
            $inc: {
                remainingCapacityKg: -shipment.weightKg,
                allocatedWeightKg: shipment.weightKg
            }
        }, { new: true });
        if (!updatedTrip) {
            throw new appError_1.AppError(`Vehicle capacity exceeded. Needed: ${shipment.weightKg} kg, Available: ${trip.remainingCapacityKg} kg`, 400, 'INSUFFICIENT_CAPACITY');
        }
        // 3. Generate Secure OTPs and Booking Reference
        const bookingReference = `GR-${Date.now().toString(36).toUpperCase()}-${crypto_1.default.randomBytes(2).toString('hex').toUpperCase()}`;
        const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
        const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
        const isShipper = req.user.id === shipment.shipperId.toString();
        const isTransporter = req.user.id === trip.transporterId.toString();
        let initialStatus = 'REQUESTED';
        let acceptedByCustomerAt;
        let acceptedByTransporterAt;
        if (isShipper) {
            initialStatus = 'ACCEPTED_BY_CUSTOMER';
            acceptedByCustomerAt = new Date();
        }
        else if (isTransporter) {
            initialStatus = 'ACCEPTED_BY_TRANSPORTER';
            acceptedByTransporterAt = new Date();
        }
        const booking = await Booking_1.Booking.create({
            bookingReference,
            shipmentId: shipment._id,
            tripId: trip._id,
            shipperId: shipment.shipperId,
            transporterId: trip.transporterId,
            totalAgreedAmountInr: agreedPriceInr || shipment.maxBudgetInr || 2500,
            allocatedWeightKg: shipment.weightKg,
            allocatedVolumeCbm: shipment.volumeCubicMeters,
            pickupOtp,
            deliveryOtp,
            bookingStatus: initialStatus,
            paymentStatus: 'PENDING',
            acceptedByCustomerAt,
            acceptedByTransporterAt
        });
        shipment.status = 'MATCHED';
        await shipment.save();
        res.status(201).json(apiResponse_1.ApiResponse.success(booking, 'Booking opportunity created successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.createBooking = createBooking;
/**
 * Customer / Transporter accepts or rejects a proposed booking
 */
const respondToBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { action, reason } = req.body; // 'ACCEPT' | 'REJECT'
        const booking = await Booking_1.Booking.findById(id);
        if (!booking) {
            throw new appError_1.AppError('Booking not found', 404, 'NOT_FOUND');
        }
        const isShipper = booking.shipperId ? req.user.id === booking.shipperId.toString() : false;
        const isTransporter = booking.transporterId ? req.user.id === booking.transporterId.toString() : false;
        if (!isShipper && !isTransporter && req.user.role !== 'ADMIN') {
            throw new appError_1.AppError('Forbidden: You are not authorized to respond to this booking', 403, 'FORBIDDEN');
        }
        if (action === 'REJECT') {
            booking.bookingStatus = 'REJECTED';
            booking.cancellationReason = reason || 'Rejected by counterparty';
            await booking.save();
            // Restore trip capacity
            await Trip_1.Trip.findByIdAndUpdate(booking.tripId, {
                $inc: {
                    remainingCapacityKg: booking.allocatedWeightKg,
                    allocatedWeightKg: -booking.allocatedWeightKg
                }
            });
            // Reset shipment status
            await Shipment_1.Shipment.findByIdAndUpdate(booking.shipmentId, { status: 'PENDING' });
            res.status(200).json(apiResponse_1.ApiResponse.success(booking, 'Booking proposal rejected'));
            return;
        }
        // Action === 'ACCEPT'
        if (isShipper) {
            booking.acceptedByCustomerAt = new Date();
            if (booking.bookingStatus === 'ACCEPTED_BY_TRANSPORTER' || booking.acceptedByTransporterAt) {
                booking.bookingStatus = 'CONFIRMED';
                booking.confirmedAt = new Date();
                await Shipment_1.Shipment.findByIdAndUpdate(booking.shipmentId, { status: 'BOOKED' });
            }
            else {
                booking.bookingStatus = 'ACCEPTED_BY_CUSTOMER';
            }
        }
        else if (isTransporter) {
            booking.acceptedByTransporterAt = new Date();
            if (booking.bookingStatus === 'ACCEPTED_BY_CUSTOMER' || booking.acceptedByCustomerAt) {
                booking.bookingStatus = 'CONFIRMED';
                booking.confirmedAt = new Date();
                await Shipment_1.Shipment.findByIdAndUpdate(booking.shipmentId, { status: 'BOOKED' });
            }
            else {
                booking.bookingStatus = 'ACCEPTED_BY_TRANSPORTER';
            }
        }
        await booking.save();
        res.status(200).json(apiResponse_1.ApiResponse.success(booking, `Booking ${booking.bookingStatus.toLowerCase()}`));
    }
    catch (error) {
        next(error);
    }
};
exports.respondToBooking = respondToBooking;
/**
 * Progress booking lifecycle through controlled state transitions
 */
const transitionBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, otp } = req.body;
        const booking = await Booking_1.Booking.findById(id);
        if (!booking) {
            throw new appError_1.AppError('Booking not found', 404, 'NOT_FOUND');
        }
        const currentStatus = booking.bookingStatus;
        const allowed = ALLOWED_TRANSITIONS[currentStatus];
        if (!allowed || !allowed.includes(status)) {
            throw new appError_1.AppError(`Invalid status transition from '${currentStatus}' to '${status}'. Allowed: [${allowed?.join(', ') || 'none'}]`, 400, 'INVALID_STATE_TRANSITION');
        }
        // OTP verification checks
        if (status === 'PICKED_UP') {
            if (!otp || otp !== booking.pickupOtp) {
                throw new appError_1.AppError('Invalid Pickup OTP. The shipper must provide the 4-digit pickup OTP to verify handoff.', 400, 'INVALID_OTP');
            }
            booking.pickedUpAt = new Date();
            await Shipment_1.Shipment.findByIdAndUpdate(booking.shipmentId, { status: 'IN_TRANSIT' });
        }
        if (status === 'DELIVERED') {
            if (!otp || otp !== booking.deliveryOtp) {
                throw new appError_1.AppError('Invalid Delivery OTP. The recipient must provide the 4-digit delivery OTP to confirm cargo arrival.', 400, 'INVALID_OTP');
            }
            booking.deliveredAt = new Date();
            await Shipment_1.Shipment.findByIdAndUpdate(booking.shipmentId, { status: 'DELIVERED' });
        }
        if (status === 'COMPLETED') {
            booking.completedAt = new Date();
            booking.paymentStatus = 'DISBURSED';
        }
        booking.bookingStatus = status;
        await booking.save();
        res.status(200).json(apiResponse_1.ApiResponse.success(booking, `Booking transitioned to ${status}`));
    }
    catch (error) {
        next(error);
    }
};
exports.transitionBookingStatus = transitionBookingStatus;
/**
 * Cancel booking with reason code and cancellation policy rules
 */
const cancelBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { cancellationReasonCode, cancellationReason } = req.body;
        const booking = await Booking_1.Booking.findById(id);
        if (!booking) {
            throw new appError_1.AppError('Booking not found', 404, 'NOT_FOUND');
        }
        if (['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(booking.bookingStatus)) {
            throw new appError_1.AppError(`Cannot cancel booking that is already ${booking.bookingStatus.toLowerCase()}`, 400, 'INVALID_STATE');
        }
        const isShipper = booking.shipperId ? req.user.id === booking.shipperId.toString() : false;
        const isTransporter = booking.transporterId ? req.user.id === booking.transporterId.toString() : false;
        const isAdmin = req.user.role === 'ADMIN';
        if (!isShipper && !isTransporter && !isAdmin) {
            throw new appError_1.AppError('Forbidden: Not authorized to cancel this booking', 403, 'FORBIDDEN');
        }
        // Calculate cancellation fee based on lifecycle stage
        let cancellationFee = 0;
        if (booking.bookingStatus === 'TRIP_PREPARATION') {
            cancellationFee = Math.round(booking.totalAgreedAmountInr * 0.1); // 10% fee for cancellation during prep
        }
        else if (booking.bookingStatus === 'PICKED_UP' || booking.bookingStatus === 'IN_TRANSIT') {
            cancellationFee = Math.round(booking.totalAgreedAmountInr * 0.5); // 50% compensation fee if cargo already loaded
        }
        booking.bookingStatus = 'CANCELLED';
        booking.cancelledAt = new Date();
        booking.cancellationReasonCode = cancellationReasonCode;
        booking.cancellationReason = cancellationReason;
        booking.cancellationInitiator = isShipper ? 'SHIPPER' : isTransporter ? 'TRANSPORTER' : 'ADMIN';
        booking.cancellationFeeInr = cancellationFee;
        booking.paymentStatus = cancellationFee > 0 ? 'REFUNDED' : 'PENDING';
        await booking.save();
        // Restore vehicle capacity on trip
        await Trip_1.Trip.findByIdAndUpdate(booking.tripId, {
            $inc: {
                remainingCapacityKg: booking.allocatedWeightKg,
                allocatedWeightKg: -booking.allocatedWeightKg
            }
        });
        // Reset shipment status
        await Shipment_1.Shipment.findByIdAndUpdate(booking.shipmentId, { status: 'PENDING' });
        res.status(200).json(apiResponse_1.ApiResponse.success(booking, 'Booking successfully cancelled'));
    }
    catch (error) {
        next(error);
    }
};
exports.cancelBooking = cancelBooking;
const listBookings = async (req, res, next) => {
    try {
        const { page, limit, skip, sort } = (0, pagination_1.parsePagination)(req.query);
        const filter = {};
        if (req.user.role === 'FARMER' || req.user.role === 'BUSINESS') {
            filter.shipperId = req.user.id;
        }
        else if (req.user.role === 'TRANSPORTER') {
            filter.transporterId = req.user.id;
        }
        if (req.query.bookingStatus) {
            filter.bookingStatus = req.query.bookingStatus;
        }
        const [bookings, total] = await Promise.all([
            Booking_1.Booking.find(filter)
                .populate('shipmentId')
                .populate('tripId')
                .populate('transporterId', 'phoneNumber')
                .populate('shipperId', 'phoneNumber')
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Booking_1.Booking.countDocuments(filter)
        ]);
        res.status(200).json(apiResponse_1.ApiResponse.success((0, pagination_1.paginateResult)(bookings, total, page, limit), 'Bookings retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.listBookings = listBookings;
const getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking_1.Booking.findById(req.params.id)
            .populate('shipmentId')
            .populate('tripId')
            .populate('transporterId', 'phoneNumber')
            .populate('shipperId', 'phoneNumber');
        if (!booking) {
            throw new appError_1.AppError('Booking not found', 404, 'NOT_FOUND');
        }
        // Role ownership check
        if (req.user.role !== 'ADMIN' &&
            booking.shipperId.toString() !== req.user.id &&
            booking.transporterId.toString() !== req.user.id) {
            throw new appError_1.AppError('Forbidden: Access denied to this booking', 403, 'FORBIDDEN');
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(booking, 'Booking details retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.getBookingById = getBookingById;
