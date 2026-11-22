"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.listMyNotifications = void 0;
const Notification_1 = require("../models/Notification");
const appError_1 = require("../utils/appError");
const apiResponse_1 = require("../utils/apiResponse");
const pagination_1 = require("../utils/pagination");
const listMyNotifications = async (req, res, next) => {
    try {
        const { page, limit, skip, sort } = (0, pagination_1.parsePagination)(req.query);
        const filter = { recipientId: req.user.id };
        if (req.query.isRead !== undefined) {
            filter.isRead = req.query.isRead === 'true';
        }
        const [notifications, total] = await Promise.all([
            Notification_1.Notification.find(filter).sort(sort).skip(skip).limit(limit),
            Notification_1.Notification.countDocuments(filter)
        ]);
        res.status(200).json(apiResponse_1.ApiResponse.success((0, pagination_1.paginateResult)(notifications, total, page, limit), 'Notifications retrieved'));
    }
    catch (error) {
        next(error);
    }
};
exports.listMyNotifications = listMyNotifications;
const markNotificationAsRead = async (req, res, next) => {
    try {
        const notification = await Notification_1.Notification.findOneAndUpdate({ _id: req.params.id, recipientId: req.user.id }, { $set: { isRead: true, readAt: new Date() } }, { new: true });
        if (!notification) {
            throw new appError_1.AppError('Notification not found', 404, 'NOT_FOUND');
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(notification, 'Notification marked as read'));
    }
    catch (error) {
        next(error);
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
const markAllNotificationsAsRead = async (req, res, next) => {
    try {
        await Notification_1.Notification.updateMany({ recipientId: req.user.id, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
        res.status(200).json(apiResponse_1.ApiResponse.success(null, 'All notifications marked as read'));
    }
    catch (error) {
        next(error);
    }
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
