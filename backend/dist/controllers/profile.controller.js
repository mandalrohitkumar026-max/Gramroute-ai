"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeTransporterOnboarding = exports.completeBusinessOnboarding = exports.completeFarmerOnboarding = exports.updateProfile = exports.getProfile = void 0;
const Profile_1 = require("../models/Profile");
const appError_1 = require("../utils/appError");
const apiResponse_1 = require("../utils/apiResponse");
const getProfile = async (req, res, next) => {
    try {
        const profile = await Profile_1.Profile.findOne({ userId: req.user.id, isDeleted: false });
        if (!profile) {
            throw new appError_1.AppError('Profile not found', 404, 'NOT_FOUND');
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(profile, 'Profile retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
    try {
        const profile = await Profile_1.Profile.findOneAndUpdate({ userId: req.user.id, isDeleted: false }, { $set: req.body }, { new: true, runValidators: true });
        if (!profile) {
            throw new appError_1.AppError('Profile not found', 404, 'NOT_FOUND');
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(profile, 'Profile updated successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const completeFarmerOnboarding = async (req, res, next) => {
    try {
        if (req.user.role !== 'FARMER' && req.user.role !== 'ADMIN') {
            throw new appError_1.AppError('Only FARMER accounts can complete farmer onboarding', 403, 'FORBIDDEN');
        }
        const { fullName, address, location, fpoAffiliation, primaryCrop, landHoldingAcres } = req.body;
        const profile = await Profile_1.Profile.findOneAndUpdate({ userId: req.user.id, isDeleted: false }, {
            $set: {
                fullName,
                address,
                ...(location ? { location } : {}),
                fpoAffiliation,
                primaryCrop,
                landHoldingAcres,
                isOnboardingComplete: true
            }
        }, { new: true, upsert: true, runValidators: true });
        res.status(200).json(apiResponse_1.ApiResponse.success(profile, 'Farmer onboarding completed successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.completeFarmerOnboarding = completeFarmerOnboarding;
const completeBusinessOnboarding = async (req, res, next) => {
    try {
        if (req.user.role !== 'BUSINESS' && req.user.role !== 'ADMIN') {
            throw new appError_1.AppError('Only BUSINESS accounts can complete business onboarding', 403, 'FORBIDDEN');
        }
        const { businessName, businessType, address, location, gstNumber, contactPerson } = req.body;
        const profile = await Profile_1.Profile.findOneAndUpdate({ userId: req.user.id, isDeleted: false }, {
            $set: {
                businessName,
                businessType,
                address,
                ...(location ? { location } : {}),
                gstNumber,
                contactPerson,
                fullName: contactPerson,
                isOnboardingComplete: true
            }
        }, { new: true, upsert: true, runValidators: true });
        res.status(200).json(apiResponse_1.ApiResponse.success(profile, 'Business onboarding completed successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.completeBusinessOnboarding = completeBusinessOnboarding;
const completeTransporterOnboarding = async (req, res, next) => {
    try {
        if (req.user.role !== 'TRANSPORTER' && req.user.role !== 'ADMIN') {
            throw new appError_1.AppError('Only TRANSPORTER accounts can complete transporter onboarding', 403, 'FORBIDDEN');
        }
        const { operatorName, address, location, serviceCorridors, fleetSize, permitType } = req.body;
        const profile = await Profile_1.Profile.findOneAndUpdate({ userId: req.user.id, isDeleted: false }, {
            $set: {
                operatorName,
                fullName: operatorName,
                address,
                ...(location ? { location } : {}),
                serviceCorridors,
                fleetSize,
                permitType,
                isOnboardingComplete: true
            }
        }, { new: true, upsert: true, runValidators: true });
        res.status(200).json(apiResponse_1.ApiResponse.success(profile, 'Transporter onboarding completed successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.completeTransporterOnboarding = completeTransporterOnboarding;
