"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("./app");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const websocketService_1 = require("./services/websocketService");
const startServer = async () => {
    const app = (0, app_1.createApp)();
    const server = http_1.default.createServer(app);
    // Initialize Real-Time WebSocket Gateway
    websocketService_1.websocketService.initialize(server);
    // Server Listener starts immediately
    server.listen(env_1.config.PORT, () => {
        logger_1.logger.info(`🚀 GramRoute AI Backend is running on port ${env_1.config.PORT} [Environment: ${env_1.config.NODE_ENV}]`);
        logger_1.logger.info(`🔗 API v1 Base URL: http://localhost:${env_1.config.PORT}/api/v1`);
        logger_1.logger.info(`📚 Swagger Documentation: http://localhost:${env_1.config.PORT}/api/v1/docs/`);
        logger_1.logger.info(`🩺 Health Check: http://localhost:${env_1.config.PORT}/api/v1/health`);
    });
    // MongoDB Connection in background
    logger_1.logger.info('Connecting to MongoDB database...', { uri: env_1.config.MONGODB_URI });
    mongoose_1.default
        .connect(env_1.config.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
    })
        .then(() => {
        logger_1.logger.info('MongoDB connected successfully.');
    })
        .catch((err) => {
        logger_1.logger.warn('Initial MongoDB connection warning (Database may not be running locally yet):', err.message);
        logger_1.logger.info('Server continuing in resilient mode. Database reconnect will be retried on demand.');
    });
    // Graceful Shutdown
    const handleShutdown = async (signal) => {
        logger_1.logger.info(`Received ${signal}. Gracefully shutting down GramRoute backend...`);
        server.close(async () => {
            logger_1.logger.info('HTTP server closed.');
            try {
                await mongoose_1.default.connection.close();
                logger_1.logger.info('MongoDB connection closed.');
            }
            catch (e) {
                logger_1.logger.error('Error closing MongoDB connection:', e);
            }
            process.exit(0);
        });
        // Force shutdown after timeout
        setTimeout(() => {
            logger_1.logger.error('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 10000);
    };
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
};
startServer().catch((error) => {
    logger_1.logger.error('Fatal error during backend server startup:', error);
    process.exit(1);
});
