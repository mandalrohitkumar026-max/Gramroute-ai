"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelShipment = exports.updateShipment = exports.getShipmentById = exports.listShipments = exports.createShipment = void 0;
const Shipment_1 = require("../models/Shipment");
const Trip_1 = require("../models/Trip");
const ShipmentMatch_1 = require("../models/ShipmentMatch");
const appError_1 = require("../utils/appError");
const apiResponse_1 = require("../utils/apiResponse");
const pagination_1 = require("../utils/pagination");
const createShipment = async (req, res, next) => {
    try {
        const { cargoName, cargoDescription, cargoCategory, weightKg, volumeCubicMeters, numberOfPackages, packagingType, preferredPickupDate, deliveryDeadline, handlingRequirements, isPerishable, specialInstructions, preferredTransportType, origin, destination, maxBudgetInr } = req.body;
        const shipment = await Shipment_1.Shipment.create({
            shipperId: req.user.id,
            cargoName,
            cargoDescription: cargoDescription || cargoName,
            cargoCategory,
            weightKg,
            volumeCubicMeters: volumeCubicMeters || Math.max(0.1, Math.round((weightKg / 250) * 10) / 10),
            numberOfPackages: numberOfPackages || 1,
            packagingType: packagingType || 'Bags',
            isStackable: !handlingRequirements?.includes('DO_NOT_STACK'),
            temperatureControlRequired: handlingRequirements?.includes('TEMPERATURE_CONTROL') || isPerishable,
            handlingRequirements: handlingRequirements || [],
            isPerishable: !!isPerishable,
            specialInstructions,
            preferredTransportType: preferredTransportType || 'ANY',
            origin,
            destination,
            preferredPickupDate: preferredPickupDate ? new Date(preferredPickupDate) : new Date(),
            deliveryDeadline: deliveryDeadline ? new Date(deliveryDeadline) : new Date(Date.now() + 48 * 3600 * 1000),
            pickupWindowStart: preferredPickupDate ? new Date(preferredPickupDate) : new Date(),
            deliveryWindowEnd: deliveryDeadline ? new Date(deliveryDeadline) : new Date(Date.now() + 48 * 3600 * 1000),
            maxBudgetInr: maxBudgetInr || 2500,
            status: 'PENDING'
        });
        // Automatically check for available compatible trips and propose matching opportunities
        const activeTrips = await Trip_1.Trip.find({
            status: 'PLANNED',
            remainingCapacityKg: { $gte: shipment.weightKg },
            isPublished: true
        }).limit(3);
        for (const trip of activeTrips) {
            await ShipmentMatch_1.ShipmentMatch.create({
                shipmentId: shipment._id,
                tripId: trip._id,
                vehicleId: trip.vehicleId,
                compatibilityScore: 92,
                recommendedPriceInr: Math.round(shipment.maxBudgetInr * 0.9),
                costSavingPercent: 25,
                status: 'PROPOSED'
            }).catch(() => null);
        }
        res.status(201).json(apiResponse_1.ApiResponse.success(shipment, 'Shipment created successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.createShipment = createShipment;
const listShipments = async (req, res, next) => {
    try {
        const { page, limit, skip, sort } = (0, pagination_1.parsePagination)(req.query);
        const filter = { isDeleted: false };
        // Shippers see their own shipments by default unless searching marketplace (all=true)
        if ((req.user.role === 'FARMER' || req.user.role === 'BUSINESS') && !req.query.all && !req.query.marketplace) {
            filter.shipperId = req.user.id;
        }
        // Status filter
        if (req.query.status) {
            filter.status = req.query.status;
        }
        // Cargo Category filter
        if (req.query.cargoCategory) {
            filter.cargoCategory = req.query.cargoCategory;
        }
        // Perishability filter
        if (req.query.isPerishable !== undefined) {
            filter.isPerishable = req.query.isPerishable === 'true';
        }
        // Destination District filter
        if (req.query.destinationDistrict) {
            filter['destination.district'] = new RegExp(String(req.query.destinationDistrict), 'i');
        }
        // Weight range filters
        if (req.query.minWeight || req.query.maxWeight) {
            filter.weightKg = {};
            if (req.query.minWeight) {
                filter.weightKg.$gte = Number(req.query.minWeight);
            }
            if (req.query.maxWeight) {
                filter.weightKg.$lte = Number(req.query.maxWeight);
            }
        }
        // Free text search
        if (req.query.search) {
            const searchRegex = new RegExp(String(req.query.search), 'i');
            filter.$or = [
                { cargoName: searchRegex },
                { cargoCategory: searchRegex },
                { 'origin.district': searchRegex },
                { 'destination.district': searchRegex },
                { 'destination.mandiOrMarketName': searchRegex }
            ];
        }
        const [shipments, total] = await Promise.all([
            Shipment_1.Shipment.find(filter).populate('shipperId', 'phoneNumber').sort(sort).skip(skip).limit(limit),
            Shipment_1.Shipment.countDocuments(filter)
        ]);
        res.status(200).json(apiResponse_1.ApiResponse.success((0, pagination_1.paginateResult)(shipments, total, page, limit), 'Shipments retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.listShipments = listShipments;
const getShipmentById = async (req, res, next) => {
    try {
        const shipment = await Shipment_1.Shipment.findOne({ _id: req.params.id, isDeleted: false }).populate('shipperId', 'phoneNumber email');
        if (!shipment) {
            throw new appError_1.AppError('Shipment not found', 404, 'NOT_FOUND');
        }
        // Find any existing matches for this shipment
        const matches = await ShipmentMatch_1.ShipmentMatch.find({ shipmentId: shipment._id })
            .populate('tripId')
            .populate('vehicleId');
        res.status(200).json(apiResponse_1.ApiResponse.success({ shipment, matches }, 'Shipment details retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.getShipmentById = getShipmentById;
const updateShipment = async (req, res, next) => {
    try {
        const shipment = await Shipment_1.Shipment.findOne({ _id: req.params.id, isDeleted: false });
        if (!shipment) {
            throw new appError_1.AppError('Shipment not found', 404, 'NOT_FOUND');
        }
        if (req.user.role !== 'ADMIN' && shipment.shipperId.toString() !== req.user.id) {
            throw new appError_1.AppError('Forbidden: You can only edit your own shipments', 403, 'FORBIDDEN');
        }
        if (['IN_TRANSIT', 'DELIVERED'].includes(shipment.status)) {
            throw new appError_1.AppError('Cannot modify shipment once it is in transit or delivered', 400, 'INVALID_STATE');
        }
        const updated = await Shipment_1.Shipment.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
        res.status(200).json(apiResponse_1.ApiResponse.success(updated, 'Shipment updated successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.updateShipment = updateShipment;
const cancelShipment = async (req, res, next) => {
    try {
        const shipment = await Shipment_1.Shipment.findOne({ _id: req.params.id, isDeleted: false });
        if (!shipment) {
            throw new appError_1.AppError('Shipment not found', 404, 'NOT_FOUND');
        }
        if (req.user.role !== 'ADMIN' && shipment.shipperId.toString() !== req.user.id) {
            throw new appError_1.AppError('Forbidden: You can only cancel your own shipments', 403, 'FORBIDDEN');
        }
        if (['IN_TRANSIT', 'DELIVERED'].includes(shipment.status)) {
            throw new appError_1.AppError('Cannot cancel shipment currently in transit or delivered', 400, 'INVALID_STATE');
        }
        shipment.status = 'CANCELLED';
        await shipment.save();
        res.status(200).json(apiResponse_1.ApiResponse.success(shipment, 'Shipment cancelled successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.cancelShipment = cancelShipment;
