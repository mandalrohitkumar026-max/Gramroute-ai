"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verification_controller_1 = require("../controllers/verification.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// User routes
router.post('/', verification_controller_1.submitVerificationDocument);
router.get('/my', verification_controller_1.getMyVerificationDocuments);
// Admin review routes
router.get('/pending', (0, auth_1.authorize)('ADMIN'), verification_controller_1.adminListAllPendingDocuments);
router.patch('/:id/review', (0, auth_1.authorize)('ADMIN'), verification_controller_1.adminReviewDocument);
exports.default = router;
