"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiEngineClient = exports.AiEngineClient = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
class AiEngineClient {
    baseUrl;
    timeoutMs;
    constructor(baseUrl = env_1.config.AI_ENGINE_URL || 'http://localhost:8000', timeoutMs = 15000) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.timeoutMs = timeoutMs;
    }
    async checkHealth() {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 4000);
            const res = await fetch(`${this.baseUrl}/health`, {
                signal: controller.signal
            });
            clearTimeout(timer);
            if (!res.ok) {
                return { status: 'DEGRADED', service: 'ai-engine', details: `HTTP ${res.status}` };
            }
            const body = await res.json();
            return { status: 'HEALTHY', service: 'ai-engine', details: body };
        }
        catch (error) {
            logger_1.logger.warn('AI Engine health check unreachable:', error instanceof Error ? error.message : error);
            return { status: 'UNAVAILABLE', service: 'ai-engine', details: 'Connection failed or timeout' };
        }
    }
    async optimizeRoute(req) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const res = await fetch(`${this.baseUrl}/api/v1/optimization/route`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req),
                signal: controller.signal
            });
            clearTimeout(timer);
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`AI Engine optimization failed [HTTP ${res.status}]: ${errorText}`);
            }
            return (await res.json());
        }
        catch (error) {
            clearTimeout(timer);
            logger_1.logger.error('Failed to communicate with AI Engine optimization route:', error);
            throw error;
        }
    }
    async evaluateBackhaul(req) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const res = await fetch(`${this.baseUrl}/api/v1/optimization/backhaul`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req),
                signal: controller.signal
            });
            clearTimeout(timer);
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`AI Engine backhaul failed [HTTP ${res.status}]: ${errorText}`);
            }
            return await res.json();
        }
        catch (error) {
            clearTimeout(timer);
            logger_1.logger.error('Failed to communicate with AI Engine backhaul:', error);
            throw error;
        }
    }
    async getAuditHistory(limit = 20) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        try {
            const res = await fetch(`${this.baseUrl}/api/v1/optimization/audit-history?limit=${limit}`, {
                signal: controller.signal
            });
            clearTimeout(timer);
            if (!res.ok) {
                throw new Error(`AI Engine audit history failed [HTTP ${res.status}]`);
            }
            return await res.json();
        }
        catch (error) {
            clearTimeout(timer);
            logger_1.logger.error('Failed to fetch AI Engine audit history:', error);
            throw error;
        }
    }
    async getEngineStatus() {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        try {
            const res = await fetch(`${this.baseUrl}/api/v1/optimization/engine-status`, {
                signal: controller.signal
            });
            clearTimeout(timer);
            if (!res.ok) {
                throw new Error(`AI Engine status probe failed [HTTP ${res.status}]`);
            }
            return await res.json();
        }
        catch (error) {
            clearTimeout(timer);
            logger_1.logger.error('Failed to probe AI Engine engine status:', error);
            throw error;
        }
    }
}
exports.AiEngineClient = AiEngineClient;
exports.aiEngineClient = new AiEngineClient();
