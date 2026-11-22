"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEngineStatusHandler = exports.getAuditHistoryHandler = exports.evaluateBackhaulHandler = exports.optimizeRouteHandler = void 0;
const aiEngineClient_1 = require("../services/aiEngineClient");
const apiResponse_1 = require("../utils/apiResponse");
const appError_1 = require("../utils/appError");
const optimizeRouteHandler = async (req, res, next) => {
    try {
        const payload = req.body;
        if (!payload.vehicles || payload.vehicles.length === 0) {
            throw appError_1.AppError.badRequest('At least one vehicle must be provided for route optimization.');
        }
        if (!payload.shipments || payload.shipments.length === 0) {
            throw appError_1.AppError.badRequest('At least one shipment must be provided for route optimization.');
        }
        const result = await aiEngineClient_1.aiEngineClient.optimizeRoute(payload);
        (0, apiResponse_1.sendSuccess)(res, result, result.success ? 200 : 422);
    }
    catch (error) {
        next(error);
    }
};
exports.optimizeRouteHandler = optimizeRouteHandler;
const evaluateBackhaulHandler = async (req, res, next) => {
    try {
        const payload = req.body;
        if (!payload.vehicle) {
            throw appError_1.AppError.badRequest('Vehicle details required for backhaul evaluation.');
        }
        if (!payload.return_origin) {
            throw appError_1.AppError.badRequest('Return origin location required for backhaul evaluation.');
        }
        const result = await aiEngineClient_1.aiEngineClient.evaluateBackhaul(payload);
        (0, apiResponse_1.sendSuccess)(res, result, 200);
    }
    catch (error) {
        next(error);
    }
};
exports.evaluateBackhaulHandler = evaluateBackhaulHandler;
const getAuditHistoryHandler = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 20;
        const result = await aiEngineClient_1.aiEngineClient.getAuditHistory(limit);
        (0, apiResponse_1.sendSuccess)(res, result, 200);
    }
    catch (error) {
        next(error);
    }
};
exports.getAuditHistoryHandler = getAuditHistoryHandler;
const getEngineStatusHandler = async (_req, res, next) => {
    try {
        const result = await aiEngineClient_1.aiEngineClient.getEngineStatus();
        (0, apiResponse_1.sendSuccess)(res, result, 200);
    }
    catch (error) {
        next(error);
    }
};
exports.getEngineStatusHandler = getEngineStatusHandler;
