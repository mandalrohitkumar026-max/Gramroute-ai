"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Admin-only endpoints
router.get('/', (0, auth_1.authorize)('ADMIN'), user_controller_1.listUsers);
router.get('/:id', (0, auth_1.authorize)('ADMIN'), user_controller_1.getUserById);
router.patch('/:id/status', (0, auth_1.authorize)('ADMIN'), user_controller_1.updateUserStatus);
router.delete('/:id', (0, auth_1.authorize)('ADMIN'), user_controller_1.softDeleteUser);
exports.default = router;
