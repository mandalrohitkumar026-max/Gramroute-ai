"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All admin routes require ADMIN role
router.use(auth_1.authenticate, (0, auth_1.authorize)('ADMIN'));
router.get('/metrics', admin_controller_1.getPlatformMetrics);
router.get('/flagged', admin_controller_1.getFlaggedActivities);
router.patch('/vehicles/:id/verify', admin_controller_1.verifyVehicle);
router.patch('/vehicles/:vehicleId/documents/:documentId/verify', admin_controller_1.verifyVehicleDocument);
router.patch('/users/:id/verify-identity', admin_controller_1.verifyUserIdentity);
exports.default = router;
