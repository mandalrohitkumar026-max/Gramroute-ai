"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReadiness = exports.getLiveness = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const apiResponse_1 = require("../utils/apiResponse");
const aiEngineClient_1 = require("../services/aiEngineClient");
const env_1 = require("../config/env");
const getLiveness = (_req, res) => {
    (0, apiResponse_1.sendSuccess)(res, {
        status: 'UP',
        uptimeSeconds: Math.floor(process.uptime()),
        service: 'gramroute-backend',
        version: '0.1.0',
        environment: env_1.config.NODE_ENV,
        timestamp: new Date().toISOString()
    });
};
exports.getLiveness = getLiveness;
const getReadiness = async (_req, res) => {
    const dbStatus = mongoose_1.default.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
    const aiEngineHealth = await aiEngineClient_1.aiEngineClient.checkHealth();
    const isReady = dbStatus === 'CONNECTED' || env_1.config.NODE_ENV === 'test' || env_1.config.NODE_ENV === 'development';
    (0, apiResponse_1.sendSuccess)(res, {
        ready: isReady,
        checks: {
            database: {
                status: dbStatus,
                readyStateCode: mongoose_1.default.connection.readyState
            },
            aiEngine: aiEngineHealth
        },
        timestamp: new Date().toISOString()
    }, isReady ? 200 : 503);
};
exports.getReadiness = getReadiness;
