"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFlaggedActivities = exports.verifyUserIdentity = exports.verifyVehicleDocument = exports.verifyVehicle = exports.getPlatformMetrics = void 0;
const User_1 = require("../models/User");
const Vehicle_1 = require("../models/Vehicle");
const Shipment_1 = require("../models/Shipment");
const Trip_1 = require("../models/Trip");
const Booking_1 = require("../models/Booking");
const Dispute_1 = require("../models/Dispute");
const fraudDetectionService_1 = require("../services/fraudDetectionService");
const appError_1 = require("../utils/appError");
const apiResponse_1 = require("../utils/apiResponse");
const getPlatformMetrics = async (_req, res, next) => {
    try {
        const [totalUsers, totalFarmers, totalTransporters, totalBusinesses, totalVehicles, pendingVehicles, totalShipments, activeTrips, totalBookings, openDisputes] = await Promise.all([
            User_1.User.countDocuments({ isDeleted: false }),
            User_1.User.countDocuments({ role: 'FARMER', isDeleted: false }),
            User_1.User.countDocuments({ role: 'TRANSPORTER', isDeleted: false }),
            User_1.User.countDocuments({ role: 'BUSINESS', isDeleted: false }),
            Vehicle_1.Vehicle.countDocuments({ isDeleted: false }),
            Vehicle_1.Vehicle.countDocuments({ verificationStatus: 'PENDING', isDeleted: false }),
            Shipment_1.Shipment.countDocuments({ isDeleted: false }),
            Trip_1.Trip.countDocuments({ status: { $in: ['PLANNED', 'EN_ROUTE_PICKUP', 'IN_TRANSIT'] } }),
            Booking_1.Booking.countDocuments({ bookingStatus: 'COMPLETED' }),
            Dispute_1.Dispute.countDocuments({ status: 'OPEN' })
        ]);
        res.status(200).json(apiResponse_1.ApiResponse.success({
            users: {
                total: totalUsers,
                farmers: totalFarmers,
                transporters: totalTransporters,
                businesses: totalBusinesses
            },
            vehicles: {
                total: totalVehicles,
                pendingVerification: pendingVehicles
            },
            logistics: {
                totalShipments,
                activeTrips,
                completedBookings: totalBookings,
                openDisputes
            }
        }, 'Platform metrics retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.getPlatformMetrics = getPlatformMetrics;
const verifyVehicle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const vehicle = await Vehicle_1.Vehicle.findOneAndUpdate({ _id: id, isDeleted: false }, {
            $set: {
                verificationStatus: status, // 'VERIFIED' or 'REJECTED'
                verificationNotes: notes
            }
        }, { new: true });
        if (!vehicle) {
            throw new appError_1.AppError('Vehicle not found', 404, 'NOT_FOUND');
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(vehicle, `Vehicle verification status set to ${status}`));
    }
    catch (error) {
        next(error);
    }
};
exports.verifyVehicle = verifyVehicle;
const verifyVehicleDocument = async (req, res, next) => {
    try {
        const { vehicleId, documentId } = req.params;
        const { status } = req.body; // 'VERIFIED' | 'REJECTED'
        const vehicle = await Vehicle_1.Vehicle.findOne({ _id: vehicleId, isDeleted: false });
        if (!vehicle) {
            throw new appError_1.AppError('Vehicle not found', 404, 'NOT_FOUND');
        }
        const docIndex = vehicle.documents.findIndex((d) => d._id?.toString() === documentId);
        if (docIndex === -1) {
            throw new appError_1.AppError('Document not found on this vehicle', 404, 'NOT_FOUND');
        }
        vehicle.documents[docIndex].verificationStatus = status;
        // If all documents are verified, update vehicle to VERIFIED
        const allVerified = vehicle.documents.every((d) => d.verificationStatus === 'VERIFIED');
        if (allVerified) {
            vehicle.verificationStatus = 'VERIFIED';
        }
        await vehicle.save();
        res.status(200).json(apiResponse_1.ApiResponse.success(vehicle, `Document status updated to ${status}`));
    }
    catch (error) {
        next(error);
    }
};
exports.verifyVehicleDocument = verifyVehicleDocument;
const verifyUserIdentity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isIdentityVerified } = req.body;
        const user = await User_1.User.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { isIdentityVerified: !!isIdentityVerified } }, { new: true });
        if (!user) {
            throw new appError_1.AppError('User not found', 404, 'NOT_FOUND');
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(user, 'User identity verification status updated'));
    }
    catch (error) {
        next(error);
    }
};
exports.verifyUserIdentity = verifyUserIdentity;
const getFlaggedActivities = async (_req, res, next) => {
    try {
        const [disputes, pendingVehicles, fraudAlerts] = await Promise.all([
            Dispute_1.Dispute.find({ status: { $in: ['OPEN', 'INVESTIGATING'] } })
                .populate('bookingId')
                .populate('raisedByUserId', 'phoneNumber')
                .limit(20),
            Vehicle_1.Vehicle.find({ verificationStatus: 'PENDING', isDeleted: false })
                .populate('transporterId', 'phoneNumber')
                .limit(20),
            fraudDetectionService_1.FraudDetectionService.scanPlatformRisks()
        ]);
        res.status(200).json(apiResponse_1.ApiResponse.success({
            disputes,
            pendingVehicles,
            fraudAlerts
        }, 'Flagged activities retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.getFlaggedActivities = getFlaggedActivities;
