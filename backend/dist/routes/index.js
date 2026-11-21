"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiResponse_1 = require("../utils/apiResponse");
const health_routes_1 = __importDefault(require("./health.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const profile_routes_1 = __importDefault(require("./profile.routes"));
const vehicle_routes_1 = __importDefault(require("./vehicle.routes"));
const shipment_routes_1 = __importDefault(require("./shipment.routes"));
const trip_routes_1 = __importDefault(require("./trip.routes"));
const booking_routes_1 = __importDefault(require("./booking.routes"));
const match_routes_1 = __importDefault(require("./match.routes"));
const tracking_routes_1 = __importDefault(require("./tracking.routes"));
const notification_routes_1 = __importDefault(require("./notification.routes"));
const rating_routes_1 = __importDefault(require("./rating.routes"));
const dispute_routes_1 = __importDefault(require("./dispute.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const optimization_routes_1 = __importDefault(require("./optimization.routes"));
const verification_routes_1 = __importDefault(require("./verification.routes"));
const router = (0, express_1.Router)();
// Root API v1 meta
router.get('/', (_req, res) => {
    (0, apiResponse_1.sendSuccess)(res, {
        name: 'GramRoute AI REST API',
        version: 'v1',
        description: 'Intelligent Rural Freight Optimization & Shared Logistics Network API',
        documentationUrl: '/api/v1/docs',
        status: 'OPERATIONAL'
    });
});
// Mount modules
router.use('/health', health_routes_1.default);
router.use('/auth', auth_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/profiles', profile_routes_1.default);
router.use('/vehicles', vehicle_routes_1.default);
router.use('/shipments', shipment_routes_1.default);
router.use('/trips', trip_routes_1.default);
router.use('/bookings', booking_routes_1.default);
router.use('/matches', match_routes_1.default);
router.use('/tracking', tracking_routes_1.default);
router.use('/notifications', notification_routes_1.default);
router.use('/ratings', rating_routes_1.default);
router.use('/disputes', dispute_routes_1.default);
router.use('/admin', admin_routes_1.default);
router.use('/optimization', optimization_routes_1.default);
router.use('/verification', verification_routes_1.default);
exports.default = router;
