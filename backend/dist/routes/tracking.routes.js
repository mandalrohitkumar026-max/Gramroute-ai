"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tracking_controller_1 = require("../controllers/tracking.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// GPS Periodic Ping
router.post('/ping', tracking_controller_1.recordLocationPing);
// Live Trip Status & Staleness Check
router.get('/:tripId', tracking_controller_1.getTripLiveTracking);
// Historical Breadcrumbs Trajectory
router.get('/:tripId/history', tracking_controller_1.getTripTrackingHistory);
exports.default = router;
