"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudDetectionService = void 0;
const Booking_1 = require("../models/Booking");
const User_1 = require("../models/User");
const Shipment_1 = require("../models/Shipment");
class FraudDetectionService {
    /**
     * Scans system for potential multi-accounting or fraudulent patterns
     */
    static async scanPlatformRisks() {
        const alerts = [];
        // 1. Check for repeated cancellations in the last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const cancellationAggregation = await Booking_1.Booking.aggregate([
            {
                $match: {
                    bookingStatus: 'CANCELLED',
                    updatedAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: '$shipperId',
                    cancelCount: { $sum: 1 }
                }
            },
            {
                $match: {
                    cancelCount: { $gte: 3 }
                }
            }
        ]);
        for (const item of cancellationAggregation) {
            alerts.push({
                alertType: 'REPEATED_CANCELLATIONS',
                severity: item.cancelCount > 5 ? 'HIGH' : 'MEDIUM',
                entityId: item._id.toString(),
                userId: item._id.toString(),
                description: `User has recorded ${item.cancelCount} cancelled bookings in the past 7 days. Possible phantom load speculation.`,
                detectedAt: new Date()
            });
        }
        // 2. Check for abnormal shipment payload values (> 25,000 kg for mini-truck or negative / 0 values)
        const abnormalShipments = await Shipment_1.Shipment.find({
            $or: [{ weightKg: { $gt: 25000 } }, { weightKg: { $lte: 0 } }],
            isDeleted: false
        }).limit(10);
        for (const ship of abnormalShipments) {
            alerts.push({
                alertType: 'ABNORMAL_BOOKING_PATTERN',
                severity: 'HIGH',
                entityId: ship._id.toString(),
                userId: ship.shipperId.toString(),
                description: `Shipment #${ship._id} declared unrealistic weight (${ship.weightKg} kg). Exceeds single-vehicle legal rural bridge limits.`,
                detectedAt: new Date()
            });
        }
        // 3. Scan for duplicate phone numbers or shared IP/device fingerprints
        const duplicateUsers = await User_1.User.aggregate([
            {
                $group: {
                    _id: '$phoneNumber',
                    count: { $sum: 1 },
                    userIds: { $push: '$_id' }
                }
            },
            {
                $match: {
                    count: { $gte: 2 }
                }
            }
        ]);
        for (const dup of duplicateUsers) {
            alerts.push({
                alertType: 'SUSPICIOUS_DUPLICATE',
                severity: 'HIGH',
                entityId: dup.userIds[0].toString(),
                phoneNumber: dup._id,
                description: `Phone number ${dup._id} is bound to ${dup.count} separate user accounts.`,
                detectedAt: new Date()
            });
        }
        return alerts;
    }
}
exports.FraudDetectionService = FraudDetectionService;
