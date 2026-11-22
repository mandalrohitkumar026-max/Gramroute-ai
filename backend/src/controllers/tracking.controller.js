"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeTrip = exports.confirmDeliveryStop = exports.reportTripDelay = exports.confirmPickupStop = exports.arriveAtStop = exports.startTrip = exports.getTripTrackingHistory = exports.getTripLiveTracking = exports.recordLocationPing = void 0;
const Trip_1 = require("../models/Trip");
const TripStop_1 = require("../models/TripStop");
const TrackingEvent_1 = require("../models/TrackingEvent");
const Shipment_1 = require("../models/Shipment");
const Booking_1 = require("../models/Booking");
const apiResponse_1 = require("../utils/apiResponse");
const appError_1 = require("../utils/appError");
const websocketService_1 = require("../services/websocketService");
const notificationService_1 = require("../services/notificationService");
// --- Periodic GPS Ping & Tracking Endpoints ---
const recordLocationPing = async (req, res, next) => {
    try {
        const { tripId, latitude, longitude, speedKmh, accuracyMeters, batteryLevelPercentage, recordedAt } = req.body;
        if (!tripId || latitude === undefined || longitude === undefined) {
            throw appError_1.AppError.badRequest('Missing required tracking payload: tripId, latitude, and longitude are required.');
        }
        const trip = await Trip_1.Trip.findById(tripId);
        if (!trip) {
            throw appError_1.AppError.notFound('Trip not found.');
        }
        // Stop tracking after trip completion or cancellation
        if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
            throw appError_1.AppError.badRequest(`Location tracking is disabled for ${trip.status.toLowerCase()} trips.`);
        }
        // Verify user authorization: Only assigned transporter or ADMIN can submit GPS pings
        if (req.user?.role !== 'ADMIN' && trip.transporterId.toString() !== req.user?.id) {
            throw appError_1.AppError.forbidden('Only the assigned transporter can transmit GPS pings for this trip.');
        }
        const pingTimestamp = recordedAt ? new Date(recordedAt) : new Date();
        // 1. Create TrackingEvent record
        const event = await TrackingEvent_1.TrackingEvent.create({
            tripId: trip._id,
            eventType: 'LOCATION_PING',
            location: {
                type: 'Point',
                coordinates: [longitude, latitude] // GeoJSON [lng, lat]
            },
            speedKmh: speedKmh || 0,
            batteryLevelPercentage,
            recordedAt: pingTimestamp,
            metadata: {
                accuracyMeters: accuracyMeters || 10,
                source: 'MOBILE_GPS_STREAM'
            }
        });
        // 2. Update Trip's last known location
        trip.lastKnownLocation = {
            type: 'Point',
            coordinates: [longitude, latitude],
            speedKmh: speedKmh || 0,
            accuracyMeters: accuracyMeters || 10,
            updatedAt: pingTimestamp
        };
        await trip.save();
        // 3. Broadcast live location update over WebSockets to trip room
        websocketService_1.websocketService.broadcastLocationPing(tripId, {
            latitude,
            longitude,
            speedKmh,
            accuracyMeters,
            recordedAt: pingTimestamp
        });
        (0, apiResponse_1.sendSuccess)(res, {
            eventId: event._id,
            tripId: trip._id,
            recordedAt: pingTimestamp,
            status: trip.status
        }, 201);
    }
    catch (error) {
        next(error);
    }
};
exports.recordLocationPing = recordLocationPing;
const getTripLiveTracking = async (req, res, next) => {
    try {
        const { tripId } = req.params;
        const trip = await Trip_1.Trip.findById(tripId)
            .populate('transporterId', 'name phoneNumber email')
            .populate('vehicleId', 'registrationNumber vehicleType makeAndModel payloadCapacityKg');
        if (!trip) {
            throw appError_1.AppError.notFound('Trip not found.');
        }
        // Retrieve all trip stops in sequence order
        const stops = await TripStop_1.TripStop.find({ tripId }).sort({ stopSequenceOrder: 1 });
        // Retrieve latest tracking ping
        const latestEvent = await TrackingEvent_1.TrackingEvent.findOne({ tripId })
            .sort({ recordedAt: -1 });
        // Check for stale location (> 15 minutes since last ping during active trip)
        const now = Date.now();
        let isStale = false;
        let staleWarning = null;
        if (trip.status === 'EN_ROUTE_PICKUP' || trip.status === 'IN_TRANSIT') {
            const lastPingTime = trip.lastKnownLocation?.updatedAt
                ? new Date(trip.lastKnownLocation.updatedAt).getTime()
                : trip.updatedAt.getTime();
            const minutesSinceLastPing = Math.round((now - lastPingTime) / 60000);
            if (minutesSinceLastPing > 15) {
                isStale = true;
                staleWarning = `GPS location was last updated ${minutesSinceLastPing} minutes ago. Vehicle may be in a rural low-cellular connectivity pocket.`;
            }
        }
        // Count completed vs remaining stops
        const completedStopsCount = stops.filter(s => s.status === 'COMPLETED').length;
        const remainingStopsCount = stops.length - completedStopsCount;
        (0, apiResponse_1.sendSuccess)(res, {
            trip: {
                _id: trip._id,
                routeSummary: trip.routeSummary,
                origin: trip.origin,
                destination: trip.destination,
                status: trip.status,
                departureTime: trip.departureTime,
                estimatedArrivalTime: trip.estimatedArrivalTime,
                actualStartTime: trip.actualStartTime,
                actualCompletionTime: trip.actualCompletionTime,
                reportedDelayMinutes: trip.reportedDelayMinutes || 0,
                delayReason: trip.delayReason,
                transporter: trip.transporterId,
                vehicle: trip.vehicleId
            },
            lastKnownLocation: trip.lastKnownLocation || (latestEvent ? {
                coordinates: latestEvent.location.coordinates,
                speedKmh: latestEvent.speedKmh,
                updatedAt: latestEvent.recordedAt
            } : null),
            isStale,
            staleWarning,
            progress: {
                totalStops: stops.length,
                completedStops: completedStopsCount,
                remainingStops: remainingStopsCount,
                percentComplete: stops.length > 0 ? Math.round((completedStopsCount / stops.length) * 100) : 0
            },
            stops
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTripLiveTracking = getTripLiveTracking;
const getTripTrackingHistory = async (req, res, next) => {
    try {
        const { tripId } = req.params;
        const limit = parseInt(req.query.limit, 10) || 100;
        const events = await TrackingEvent_1.TrackingEvent.find({ tripId })
            .sort({ recordedAt: 1 })
            .limit(limit)
            .select('eventType location speedKmh recordedAt');
        (0, apiResponse_1.sendSuccess)(res, {
            tripId,
            breadcrumbs: events.map(e => ({
                eventType: e.eventType,
                latitude: e.location.coordinates[1],
                longitude: e.location.coordinates[0],
                speedKmh: e.speedKmh,
                timestamp: e.recordedAt
            }))
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTripTrackingHistory = getTripTrackingHistory;
// --- Trip Execution State Machine Handlers ---
const startTrip = async (req, res, next) => {
    try {
        const { id } = req.params;
        const trip = await Trip_1.Trip.findById(id).populate('transporterId', 'name');
        if (!trip)
            throw appError_1.AppError.notFound('Trip not found.');
        if (req.user?.role !== 'ADMIN' && trip.transporterId._id.toString() !== req.user?.id) {
            throw appError_1.AppError.forbidden('Only the assigned transporter can start this trip.');
        }
        if (trip.status !== 'PLANNED') {
            throw appError_1.AppError.badRequest(`Cannot start trip with status '${trip.status}'. Must be 'PLANNED'.`);
        }
        trip.status = 'EN_ROUTE_PICKUP';
        trip.actualStartTime = new Date();
        await trip.save();
        // Record Event
        await TrackingEvent_1.TrackingEvent.create({
            tripId: trip._id,
            eventType: 'TRIP_STARTED',
            location: trip.origin.location || { type: 'Point', coordinates: [73.8344, 20.0063] },
            recordedAt: new Date()
        });
        // Notify all shippers with confirmed bookings on this trip
        const bookings = await Booking_1.Booking.find({ tripId: trip._id, status: { $in: ['CONFIRMED', 'REQUESTED'] } });
        const shipperIds = bookings.map(b => b.shipperId.toString());
        const transporterName = trip.transporterId?.name || 'Transporter';
        await notificationService_1.notificationService.notifyTripStarted(transporterName, `TRP-${trip._id.toString().slice(-4).toUpperCase()}`, shipperIds);
        websocketService_1.websocketService.broadcastTripStatus(trip._id.toString(), 'EN_ROUTE_PICKUP');
        (0, apiResponse_1.sendSuccess)(res, trip, 200);
    }
    catch (error) {
        next(error);
    }
};
exports.startTrip = startTrip;
const arriveAtStop = async (req, res, next) => {
    try {
        const { id, stopId } = req.params;
        const trip = await Trip_1.Trip.findById(id);
        if (!trip)
            throw appError_1.AppError.notFound('Trip not found.');
        const stop = await TripStop_1.TripStop.findOne({ _id: stopId, tripId: trip._id });
        if (!stop)
            throw appError_1.AppError.notFound('Trip stop not found.');
        stop.status = 'ARRIVED';
        stop.actualArrivalTime = new Date();
        await stop.save();
        const eventType = stop.stopType === 'PICKUP' ? 'ARRIVED_PICKUP' : 'ARRIVED_DESTINATION';
        await TrackingEvent_1.TrackingEvent.create({
            tripId: trip._id,
            shipmentId: stop.shipmentId,
            eventType,
            location: stop.location,
            recordedAt: new Date()
        });
        if (stop.stopType === 'PICKUP' && stop.shipmentId) {
            const shipment = await Shipment_1.Shipment.findById(stop.shipmentId);
            if (shipment) {
                await notificationService_1.notificationService.notifyDriverArrivedAtPickup(stop.address, shipment.shipperId.toString());
            }
        }
        websocketService_1.websocketService.broadcastStopUpdate(trip._id.toString(), {
            stopId: stop._id,
            status: 'ARRIVED',
            actualArrivalTime: stop.actualArrivalTime
        });
        (0, apiResponse_1.sendSuccess)(res, stop, 200);
    }
    catch (error) {
        next(error);
    }
};
exports.arriveAtStop = arriveAtStop;
const confirmPickupStop = async (req, res, next) => {
    try {
        const { id, stopId } = req.params;
        const { otp } = req.body;
        const trip = await Trip_1.Trip.findById(id);
        if (!trip)
            throw appError_1.AppError.notFound('Trip not found.');
        const stop = await TripStop_1.TripStop.findOne({ _id: stopId, tripId: trip._id });
        if (!stop)
            throw appError_1.AppError.notFound('Trip stop not found.');
        // OTP Verification if stop has otpForAction configured
        if (stop.otpForAction && otp && stop.otpForAction !== otp) {
            throw appError_1.AppError.badRequest('Invalid Pickup OTP. Please provide the correct 4-digit verification code.');
        }
        stop.status = 'COMPLETED';
        stop.actualDepartureTime = new Date();
        await stop.save();
        // Transition trip status to IN_TRANSIT
        trip.status = 'IN_TRANSIT';
        await trip.save();
        // Update associated Shipment and Booking
        if (stop.shipmentId) {
            const shipment = await Shipment_1.Shipment.findById(stop.shipmentId);
            if (shipment) {
                shipment.status = 'IN_TRANSIT';
                await shipment.save();
                await Booking_1.Booking.updateMany({ shipmentId: stop.shipmentId, tripId: trip._id }, { $set: { status: 'PICKED_UP' } });
                const trackingRef = `SHP-${shipment._id.toString().slice(-4).toUpperCase()} (${shipment.cargoName})`;
                await notificationService_1.notificationService.notifyCargoLoaded(trackingRef, shipment.shipperId.toString());
            }
        }
        await TrackingEvent_1.TrackingEvent.create({
            tripId: trip._id,
            shipmentId: stop.shipmentId,
            eventType: 'CARGO_LOADED',
            location: stop.location,
            recordedAt: new Date()
        });
        websocketService_1.websocketService.broadcastStopUpdate(trip._id.toString(), {
            stopId: stop._id,
            status: 'COMPLETED',
            actualDepartureTime: stop.actualDepartureTime
        });
        websocketService_1.websocketService.broadcastTripStatus(trip._id.toString(), 'IN_TRANSIT');
        (0, apiResponse_1.sendSuccess)(res, { stop, tripStatus: trip.status }, 200);
    }
    catch (error) {
        next(error);
    }
};
exports.confirmPickupStop = confirmPickupStop;
const reportTripDelay = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { delayMinutes, reason, notes } = req.body;
        if (!delayMinutes || delayMinutes <= 0) {
            throw appError_1.AppError.badRequest('Please enter a valid delay duration in minutes.');
        }
        const trip = await Trip_1.Trip.findById(id);
        if (!trip)
            throw appError_1.AppError.notFound('Trip not found.');
        trip.reportedDelayMinutes = (trip.reportedDelayMinutes || 0) + delayMinutes;
        trip.delayReason = reason || 'TRAFFIC_CONGESTION';
        // Extend trip estimated arrival time
        trip.estimatedArrivalTime = new Date(trip.estimatedArrivalTime.getTime() + delayMinutes * 60000);
        await trip.save();
        // Record Event
        await TrackingEvent_1.TrackingEvent.create({
            tripId: trip._id,
            eventType: 'DELAY_DETECTED',
            location: trip.lastKnownLocation || trip.origin.location || { type: 'Point', coordinates: [73.8344, 20.0063] },
            recordedAt: new Date(),
            metadata: { delayMinutes, reason, notes }
        });
        // Notify all shippers on this trip
        const bookings = await Booking_1.Booking.find({ tripId: trip._id });
        const shipperIds = bookings.map(b => b.shipperId.toString());
        const tripNum = `TRP-${trip._id.toString().slice(-4).toUpperCase()}`;
        const delayReasonStr = trip.delayReason || 'TRAFFIC_CONGESTION';
        await notificationService_1.notificationService.notifyTripDelay(tripNum, delayMinutes, delayReasonStr, shipperIds);
        websocketService_1.websocketService.broadcastTripDelay(trip._id.toString(), {
            delayMinutes,
            reason: delayReasonStr,
            notes
        });
        (0, apiResponse_1.sendSuccess)(res, {
            tripId: trip._id,
            reportedDelayMinutes: trip.reportedDelayMinutes,
            updatedEstimatedArrival: trip.estimatedArrivalTime,
            delayReason: trip.delayReason
        }, 200);
    }
    catch (error) {
        next(error);
    }
};
exports.reportTripDelay = reportTripDelay;
const confirmDeliveryStop = async (req, res, next) => {
    try {
        const { id, stopId } = req.params;
        const { receiverName, receiverPhone, proofImageUrl, remarks, otp } = req.body;
        const trip = await Trip_1.Trip.findById(id);
        if (!trip)
            throw appError_1.AppError.notFound('Trip not found.');
        const stop = await TripStop_1.TripStop.findOne({ _id: stopId, tripId: trip._id });
        if (!stop)
            throw appError_1.AppError.notFound('Trip stop not found.');
        if (stop.otpForAction && otp && stop.otpForAction !== otp) {
            throw appError_1.AppError.badRequest('Invalid Delivery OTP. Please verify the code given by the receiver.');
        }
        stop.status = 'COMPLETED';
        stop.actualArrivalTime = stop.actualArrivalTime || new Date();
        stop.actualDepartureTime = new Date();
        stop.contactPersonName = receiverName || stop.contactPersonName || 'Authorized Receiver';
        stop.contactPhoneNumber = receiverPhone || stop.contactPhoneNumber;
        stop.proofImageUrl = proofImageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80';
        stop.notes = remarks || 'Delivered in good condition';
        await stop.save();
        // Update associated Shipment and Booking
        if (stop.shipmentId) {
            const shipment = await Shipment_1.Shipment.findById(stop.shipmentId);
            if (shipment) {
                shipment.status = 'DELIVERED';
                await shipment.save();
                await Booking_1.Booking.updateMany({ shipmentId: stop.shipmentId, tripId: trip._id }, { $set: { status: 'DELIVERED' } });
                const trackingRef = `SHP-${shipment._id.toString().slice(-4).toUpperCase()} (${shipment.cargoName})`;
                await notificationService_1.notificationService.notifyDeliveryCompleted(trackingRef, stop.contactPersonName || 'Authorized Receiver', shipment.shipperId.toString());
            }
        }
        // Record Event
        await TrackingEvent_1.TrackingEvent.create({
            tripId: trip._id,
            shipmentId: stop.shipmentId,
            eventType: 'POD_VERIFIED',
            location: stop.location,
            recordedAt: new Date(),
            metadata: {
                receiverName: stop.contactPersonName,
                proofImageUrl: stop.proofImageUrl,
                remarks: stop.notes
            }
        });
        websocketService_1.websocketService.broadcastStopUpdate(trip._id.toString(), {
            stopId: stop._id,
            status: 'COMPLETED',
            proofOfDelivery: {
                receiverName: stop.contactPersonName,
                proofImageUrl: stop.proofImageUrl,
                deliveredAt: stop.actualDepartureTime
            }
        });
        (0, apiResponse_1.sendSuccess)(res, {
            stop,
            proofOfDelivery: {
                receiverName: stop.contactPersonName,
                proofImageUrl: stop.proofImageUrl,
                remarks: stop.notes,
                deliveredAt: stop.actualDepartureTime
            }
        }, 200);
    }
    catch (error) {
        next(error);
    }
};
exports.confirmDeliveryStop = confirmDeliveryStop;
const completeTrip = async (req, res, next) => {
    try {
        const { id } = req.params;
        const trip = await Trip_1.Trip.findById(id);
        if (!trip)
            throw appError_1.AppError.notFound('Trip not found.');
        trip.status = 'COMPLETED';
        trip.actualCompletionTime = new Date();
        await trip.save();
        await TrackingEvent_1.TrackingEvent.create({
            tripId: trip._id,
            eventType: 'TRIP_COMPLETED',
            location: trip.destination.location || { type: 'Point', coordinates: [72.9982, 19.0771] },
            recordedAt: new Date()
        });
        websocketService_1.websocketService.broadcastTripStatus(trip._id.toString(), 'COMPLETED');
        (0, apiResponse_1.sendSuccess)(res, trip, 200);
    }
    catch (error) {
        next(error);
    }
};
exports.completeTrip = completeTrip;
