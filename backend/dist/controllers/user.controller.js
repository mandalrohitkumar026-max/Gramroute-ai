"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.softDeleteUser = exports.updateUserStatus = exports.getUserById = exports.listUsers = void 0;
const User_1 = require("../models/User");
const Profile_1 = require("../models/Profile");
const appError_1 = require("../utils/appError");
const apiResponse_1 = require("../utils/apiResponse");
const pagination_1 = require("../utils/pagination");
const listUsers = async (req, res, next) => {
    try {
        const { page, limit, skip, sort } = (0, pagination_1.parsePagination)(req.query);
        const filter = { isDeleted: false };
        if (req.query.role) {
            filter.role = req.query.role;
        }
        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.search) {
            const regex = new RegExp(String(req.query.search), 'i');
            filter.$or = [{ phoneNumber: regex }, { email: regex }];
        }
        const [users, total] = await Promise.all([
            User_1.User.find(filter).sort(sort).skip(skip).limit(limit),
            User_1.User.countDocuments(filter)
        ]);
        const paginated = (0, pagination_1.paginateResult)(users, total, page, limit);
        res.status(200).json(apiResponse_1.ApiResponse.success(paginated, 'Users retrieved successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.listUsers = listUsers;
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User_1.User.findOne({ _id: id, isDeleted: false });
        if (!user) {
            throw new appError_1.AppError('User not found', 404, 'NOT_FOUND');
        }
        const profile = await Profile_1.Profile.findOne({ userId: user._id, isDeleted: false });
        res.status(200).json(apiResponse_1.ApiResponse.success({ user, profile }, 'User details retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.getUserById = getUserById;
const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = await User_1.User.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { status } }, { new: true });
        if (!user) {
            throw new appError_1.AppError('User not found', 404, 'NOT_FOUND');
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(user, `User status updated to ${status}`));
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserStatus = updateUserStatus;
const softDeleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User_1.User.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true });
        if (!user) {
            throw new appError_1.AppError('User not found', 404, 'NOT_FOUND');
        }
        await Profile_1.Profile.findOneAndUpdate({ userId: user._id }, { $set: { isDeleted: true, deletedAt: new Date() } });
        res.status(200).json(apiResponse_1.ApiResponse.success(null, 'User successfully deleted'));
    }
    catch (error) {
        next(error);
    }
};
exports.softDeleteUser = softDeleteUser;
