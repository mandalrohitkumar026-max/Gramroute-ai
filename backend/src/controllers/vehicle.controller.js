"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVehicle = exports.uploadVehicleDocument = exports.updateVehicleAvailability = exports.updateVehicle = exports.getVehicleById = exports.listVehicles = exports.createVehicle = void 0;
const Vehicle_1 = require("../models/Vehicle");
const appError_1 = require("../utils/appError");
const apiResponse_1 = require("../utils/apiResponse");
const pagination_1 = require("../utils/pagination");
const createVehicle = async (req, res, next) => {
    try {
        const existing = await Vehicle_1.Vehicle.findOne({
            registrationNumber: req.body.registrationNumber.toUpperCase(),
            isDeleted: false
        });
        if (existing) {
            throw new appError_1.AppError('A vehicle with this registration number already exists', 409, 'CONFLICT');
        }
        const vehicle = await Vehicle_1.Vehicle.create({
            ...req.body,
            registrationNumber: req.body.registrationNumber.toUpperCase(),
            transporterId: req.user.id,
            verificationStatus: 'PENDING',
            isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true,
            availabilityStatus: req.body.availabilityStatus || 'AVAILABLE',
            operatingAreas: req.body.operatingAreas || ['Nashik', 'Pune', 'Mumbai'],
            documents: req.body.documents || []
        });
        res.status(201).json(apiResponse_1.ApiResponse.success(vehicle, 'Vehicle registered successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.createVehicle = createVehicle;
const listVehicles = async (req, res, next) => {
    try {
        const { page, limit, skip, sort } = (0, pagination_1.parsePagination)(req.query);
        const filter = { isDeleted: false };
        // If Transporter, list only their own unless Admin or marketplace search
        if (req.user.role === 'TRANSPORTER' && !req.query.all) {
            filter.transporterId = req.user.id;
        }
        else if (req.query.transporterId && req.user.role === 'ADMIN') {
            filter.transporterId = req.query.transporterId;
        }
        if (req.query.vehicleType) {
            filter.vehicleType = req.query.vehicleType;
        }
        if (req.query.vehicleCategory) {
            filter.vehicleCategory = req.query.vehicleCategory;
        }
        if (req.query.verificationStatus) {
            filter.verificationStatus = req.query.verificationStatus;
        }
        if (req.query.availabilityStatus) {
            filter.availabilityStatus = req.query.availabilityStatus;
        }
        if (req.query.isAvailable !== undefined) {
            filter.isAvailable = req.query.isAvailable === 'true';
        }
        const [vehicles, total] = await Promise.all([
            Vehicle_1.Vehicle.find(filter).populate('transporterId', 'phoneNumber').sort(sort).skip(skip).limit(limit),
            Vehicle_1.Vehicle.countDocuments(filter)
        ]);
        res.status(200).json(apiResponse_1.ApiResponse.success((0, pagination_1.paginateResult)(vehicles, total, page, limit), 'Vehicles retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.listVehicles = listVehicles;
const getVehicleById = async (req, res, next) => {
    try {
        const vehicle = await Vehicle_1.Vehicle.findOne({ _id: req.params.id, isDeleted: false }).populate('transporterId', 'phoneNumber');
        if (!vehicle) {
            throw new appError_1.AppError('Vehicle not found', 404, 'NOT_FOUND');
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(vehicle, 'Vehicle details retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.getVehicleById = getVehicleById;
const updateVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle_1.Vehicle.findOne({ _id: req.params.id, isDeleted: false });
        if (!vehicle) {
            throw new appError_1.AppError('Vehicle not found', 404, 'NOT_FOUND');
        }
        if (req.user.role !== 'ADMIN' && vehicle.transporterId.toString() !== req.user.id) {
            throw new appError_1.AppError('Forbidden: You can only edit your own vehicles', 403, 'FORBIDDEN');
        }
        const updated = await Vehicle_1.Vehicle.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
        res.status(200).json(apiResponse_1.ApiResponse.success(updated, 'Vehicle updated successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.updateVehicle = updateVehicle;
const updateVehicleAvailability = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isAvailable, availabilityStatus } = req.body;
        const vehicle = await Vehicle_1.Vehicle.findOne({ _id: id, isDeleted: false });
        if (!vehicle) {
            throw new appError_1.AppError('Vehicle not found', 404, 'NOT_FOUND');
        }
        if (req.user.role !== 'ADMIN' && vehicle.transporterId.toString() !== req.user.id) {
            throw new appError_1.AppError('Forbidden: You can only manage availability for your own vehicles', 403, 'FORBIDDEN');
        }
        if (isAvailable !== undefined) {
            vehicle.isAvailable = !!isAvailable;
        }
        if (availabilityStatus) {
            vehicle.availabilityStatus = availabilityStatus;
        }
        await vehicle.save();
        res.status(200).json(apiResponse_1.ApiResponse.success(vehicle, 'Vehicle availability updated successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.updateVehicleAvailability = updateVehicleAvailability;
const uploadVehicleDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { documentType, documentNumber, documentUrl } = req.body;
        const vehicle = await Vehicle_1.Vehicle.findOne({ _id: id, isDeleted: false });
        if (!vehicle) {
            throw new appError_1.AppError('Vehicle not found', 404, 'NOT_FOUND');
        }
        if (req.user.role !== 'ADMIN' && vehicle.transporterId.toString() !== req.user.id) {
            throw new appError_1.AppError('Forbidden: Access denied', 403, 'FORBIDDEN');
        }
        vehicle.documents.push({
            documentType,
            documentNumber,
            documentUrl,
            verificationStatus: 'PENDING',
            uploadedAt: new Date()
        });
        vehicle.verificationStatus = 'PENDING';
        await vehicle.save();
        res.status(200).json(apiResponse_1.ApiResponse.success(vehicle, 'Document uploaded for verification'));
    }
    catch (error) {
        next(error);
    }
};
exports.uploadVehicleDocument = uploadVehicleDocument;
const deleteVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle_1.Vehicle.findOne({ _id: req.params.id, isDeleted: false });
        if (!vehicle) {
            throw new appError_1.AppError('Vehicle not found', 404, 'NOT_FOUND');
        }
        if (req.user.role !== 'ADMIN' && vehicle.transporterId.toString() !== req.user.id) {
            throw new appError_1.AppError('Forbidden: You can only delete your own vehicles', 403, 'FORBIDDEN');
        }
        vehicle.isDeleted = true;
        vehicle.deletedAt = new Date();
        await vehicle.save();
        res.status(200).json(apiResponse_1.ApiResponse.success(null, 'Vehicle deleted successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.deleteVehicle = deleteVehicle;
