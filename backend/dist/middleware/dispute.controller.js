"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDispute = exports.listDisputes = exports.createDispute = void 0;
const crypto_1 = __importDefault(require("crypto"));
const Dispute_1 = require("../models/Dispute");
const Booking_1 = require("../models/Booking");
const appError_1 = require("../utils/appError");
const apiResponse_1 = require("../utils/apiResponse");
const pagination_1 = require("../utils/pagination");
const createDispute = async (req, res, next) => {
    try {
        const { bookingId, category, description, evidenceImageUrls, claimAmountInr } = req.body;
        const booking = await Booking_1.Booking.findById(bookingId);
        if (!booking) {
            throw new appError_1.AppError('Booking not found', 404, 'NOT_FOUND');
        }
        const respondentUserId = booking.shipperId.toString() === req.user.id ? booking.transporterId : booking.shipperId;
        const disputeNumber = `DISP-${Date.now().toString(36).toUpperCase()}-${crypto_1.default.randomBytes(2).toString('hex').toUpperCase()}`;
        const dispute = await Dispute_1.Dispute.create({
            disputeNumber,
            bookingId: booking._id,
            raisedByUserId: req.user.id,
            respondentUserId,
            category,
            description,
            evidenceImageUrls: evidenceImageUrls || [],
            claimAmountInr: claimAmountInr || 0,
            status: 'OPEN'
        });
        res.status(201).json(apiResponse_1.ApiResponse.success(dispute, 'Dispute raised successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.createDispute = createDispute;
const listDisputes = async (req, res, next) => {
    try {
        const { page, limit, skip, sort } = (0, pagination_1.parsePagination)(req.query);
        const filter = {};
        if (req.user.role !== 'ADMIN') {
            filter.$or = [{ raisedByUserId: req.user.id }, { respondentUserId: req.user.id }];
        }
        if (req.query.status) {
            filter.status = req.query.status;
        }
        const [disputes, total] = await Promise.all([
            Dispute_1.Dispute.find(filter)
                .populate('bookingId')
                .populate('raisedByUserId', 'phoneNumber')
                .populate('respondentUserId', 'phoneNumber')
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Dispute_1.Dispute.countDocuments(filter)
        ]);
        res.status(200).json(apiResponse_1.ApiResponse.success((0, pagination_1.paginateResult)(disputes, total, page, limit), 'Disputes retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.listDisputes = listDisputes;
const resolveDispute = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, resolutionNotes, refundedAmountInr } = req.body;
        const dispute = await Dispute_1.Dispute.findById(id);
        if (!dispute) {
            throw new appError_1.AppError('Dispute not found', 404, 'NOT_FOUND');
        }
        dispute.status = status;
        dispute.resolutionNotes = resolutionNotes;
        if (refundedAmountInr !== undefined) {
            dispute.refundedAmountInr = refundedAmountInr;
        }
        dispute.resolvedByAdminId = req.user.id;
        dispute.resolvedAt = new Date();
        await dispute.save();
        res.status(200).json(apiResponse_1.ApiResponse.success(dispute, 'Dispute resolved successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.resolveDispute = resolveDispute;
