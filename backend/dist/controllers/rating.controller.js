"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRatingsForUser = exports.createRating = void 0;
const Rating_1 = require("../models/Rating");
const Profile_1 = require("../models/Profile");
const Booking_1 = require("../models/Booking");
const appError_1 = require("../utils/appError");
const apiResponse_1 = require("../utils/apiResponse");
const pagination_1 = require("../utils/pagination");
const createRating = async (req, res, next) => {
    try {
        const { bookingId, overallRating, punctualityRating, cargoCareRating, communicationRating, comment } = req.body;
        const booking = await Booking_1.Booking.findById(bookingId);
        if (!booking) {
            throw new appError_1.AppError('Booking not found', 404, 'NOT_FOUND');
        }
        // Verify trip is completed
        if (booking.bookingStatus !== 'COMPLETED') {
            throw new appError_1.AppError('Ratings can only be submitted for completed trips', 400, 'BOOKING_NOT_COMPLETED');
        }
        // Verify authorization: only shipper or transporter of this booking can review
        const isShipper = booking.shipperId.toString() === req.user.id;
        const isTransporter = booking.transporterId.toString() === req.user.id;
        if (!isShipper && !isTransporter) {
            throw new appError_1.AppError('Unauthorized: You were not a participant in this booking', 403, 'FORBIDDEN');
        }
        // Prevent duplicate review creation
        const existing = await Rating_1.Rating.findOne({ fromUserId: req.user.id, bookingId: booking._id });
        if (existing) {
            throw new appError_1.AppError('Duplicate review: You have already rated this completed trip', 409, 'DUPLICATE_REVIEW');
        }
        // Determine target recipient (if shipper reviews -> to transporter; if transporter reviews -> to shipper)
        const toUserId = isShipper ? booking.transporterId : booking.shipperId;
        const rating = await Rating_1.Rating.create({
            fromUserId: req.user.id,
            toUserId,
            bookingId: booking._id,
            tripId: booking.tripId,
            overallRating,
            punctualityRating,
            cargoCareRating,
            communicationRating,
            comment
        });
        // Update target profile average rating
        const allRatings = await Rating_1.Rating.find({ toUserId });
        const avg = allRatings.reduce((sum, r) => sum + r.overallRating, 0) / allRatings.length;
        await Profile_1.Profile.findOneAndUpdate({ userId: toUserId }, {
            $set: {
                ratingAverage: Math.round(avg * 10) / 10,
                totalRatingsCount: allRatings.length
            }
        });
        res.status(201).json(apiResponse_1.ApiResponse.success(rating, 'Rating submitted successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.createRating = createRating;
const listRatingsForUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { page, limit, skip, sort } = (0, pagination_1.parsePagination)(req.query);
        const filter = { toUserId: userId };
        const [ratings, total] = await Promise.all([
            Rating_1.Rating.find(filter).populate('fromUserId', 'phoneNumber').sort(sort).skip(skip).limit(limit),
            Rating_1.Rating.countDocuments(filter)
        ]);
        res.status(200).json(apiResponse_1.ApiResponse.success((0, pagination_1.paginateResult)(ratings, total, page, limit), 'Ratings retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.listRatingsForUser = listRatingsForUser;
