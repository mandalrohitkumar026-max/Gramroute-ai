import http from 'http';
import mongoose from 'mongoose';
import { createApp } from './app';
import { config } from './config/env';
import { logger } from './utils/logger';
import { websocketService } from './services/websocketService';
import { startBackgroundJobs, stopBackgroundJobs } from './jobs';

const startServer = async (): Promise<void> => {
  const app = createApp();
  const server = http.createServer(app);

  // Initialize Real-Time WebSocket Gateway
  websocketService.initialize(server);

  // Server Listener starts immediately
  server.listen(config.PORT, () => {
    logger.info(`🚀 GramRoute AI Backend is running on port ${config.PORT} [Environment: ${config.NODE_ENV}]`);
    logger.info(`🔗 API v1 Base URL: http://localhost:${config.PORT}/api/v1`);
    logger.info(`📚 Swagger Documentation: http://localhost:${config.PORT}/api/v1/docs/`);
    logger.info(`🩺 Health Check: http://localhost:${config.PORT}/api/v1/health`);

    // Launch background jobs scheduler
    startBackgroundJobs();
  });

  // MongoDB Connection in background
  logger.info('Connecting to MongoDB database...', { uri: config.MONGODB_URI });
  mongoose
    .connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    })
    .then(() => {
      logger.info('MongoDB connected successfully.');
    })
    .catch((err) => {
      logger.warn('Initial MongoDB connection warning (Database may not be running locally yet):', err.message);
      logger.info('Server continuing in resilient mode. Database reconnect will be retried on demand.');
    });

  // Graceful Shutdown
  const handleShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Gracefully shutting down GramRoute backend...`);
    stopBackgroundJobs();
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed.');
      } catch (e) {
        logger.error('Error closing MongoDB connection:', e);
      }
      process.exit(0);
    });

    // Force shutdown after timeout
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer().catch((error) => {
  logger.error('Fatal error during backend server startup:', error);
  process.exit(1);
});
