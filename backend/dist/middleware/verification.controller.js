"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminReviewDocument = exports.adminListAllPendingDocuments = exports.getMyVerificationDocuments = exports.submitVerificationDocument = void 0;
const VerificationDocument_1 = require("../models/VerificationDocument");
const User_1 = require("../models/User");
const Profile_1 = require("../models/Profile");
const appError_1 = require("../utils/appError");
const apiResponse_1 = require("../utils/apiResponse");
const submitVerificationDocument = async (req, res, next) => {
    try {
        const { documentType, documentIdentifierNumber, documentFrontImageUrl, documentBackImageUrl, vehicleId } = req.body;
        if (!documentType || !documentIdentifierNumber) {
            throw new appError_1.AppError('Document type and identifier number are required', 400, 'VALIDATION_ERROR');
        }
        const doc = await VerificationDocument_1.VerificationDocument.create({
            userId: req.user.id,
            vehicleId,
            documentType,
            documentIdentifierNumber,
            documentFrontImageUrl: documentFrontImageUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
            documentBackImageUrl,
            verificationStatus: 'PENDING'
        });
        res.status(201).json(apiResponse_1.ApiResponse.success(doc, 'Verification document submitted successfully for admin review'));
    }
    catch (error) {
        next(error);
    }
};
exports.submitVerificationDocument = submitVerificationDocument;
const getMyVerificationDocuments = async (req, res, next) => {
    try {
        const docs = await VerificationDocument_1.VerificationDocument.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(apiResponse_1.ApiResponse.success(docs, 'Verification documents retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.getMyVerificationDocuments = getMyVerificationDocuments;
const adminListAllPendingDocuments = async (_req, res, next) => {
    try {
        const docs = await VerificationDocument_1.VerificationDocument.find({ verificationStatus: 'PENDING' })
            .populate('userId', 'phoneNumber role')
            .populate('vehicleId', 'registrationNumber vehicleType')
            .sort({ createdAt: 1 });
        res.status(200).json(apiResponse_1.ApiResponse.success(docs, 'Pending verification documents retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.adminListAllPendingDocuments = adminListAllPendingDocuments;
const adminReviewDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body; // 'VERIFIED' | 'REJECTED'
        if (!['VERIFIED', 'REJECTED'].includes(status)) {
            throw new appError_1.AppError('Status must be VERIFIED or REJECTED', 400, 'INVALID_STATUS');
        }
        const doc = await VerificationDocument_1.VerificationDocument.findById(id);
        if (!doc) {
            throw new appError_1.AppError('Document not found', 404, 'NOT_FOUND');
        }
        doc.verificationStatus = status;
        doc.rejectionReason = rejectionReason;
        doc.verifiedByAdminId = req.user.id;
        doc.verifiedAt = new Date();
        await doc.save();
        // If verified, mark user's profile and user model identity verified
        if (status === 'VERIFIED') {
            await Promise.all([
                User_1.User.findByIdAndUpdate(doc.userId, { isIdentityVerified: true }),
                Profile_1.Profile.findOneAndUpdate({ userId: doc.userId }, { isKycVerified: true })
            ]);
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(doc, `Document has been marked as ${status}`));
    }
    catch (error) {
        next(error);
    }
};
exports.adminReviewDocument = adminReviewDocument;
