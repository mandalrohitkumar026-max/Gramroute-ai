"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_controller_1 = require("../controllers/health.controller");
const router = (0, express_1.Router)();
router.get('/', health_controller_1.getLiveness);
router.get('/ready', health_controller_1.getReadiness);
exports.default = router;
