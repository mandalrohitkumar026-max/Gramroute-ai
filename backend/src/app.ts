import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import { requestCorrelation } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { sanitizeNoSql } from './middleware/sanitize';
import { apiLimiter } from './middleware/rateLimiter';
import { swaggerDocument } from './config/swagger';
import apiV1Router from './routes';

export const createApp = (): Application => {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allow Swagger UI inline CSS and JS
      crossOriginEmbedderPolicy: false
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
    })
  );

  // Body and Cookie Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(config.COOKIE_SECRET));

  // NoSQL Query Injection Sanitization
  app.use(sanitizeNoSql);

  // Request Correlation and Logging
  app.use(requestCorrelation);

  // Top-level /health check for cloud orchestrators (K8s / ECS / Render / Railway)
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'UP', service: 'gramroute-backend' });
  });

  // Swagger OpenAPI raw JSON spec endpoint
  app.get('/api/v1/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerDocument);
  });

  // Swagger OpenAPI UI Documentation
  const swaggerUiOptions = {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'GramRoute AI — Interactive API Documentation'
  };

  // Ensure trailing slash on Swagger UI documentation endpoint so relative assets resolve
  app.get(['/docs', '/api/v1/docs'], (req, res, next) => {
    const urlWithoutQuery = req.originalUrl.split('?')[0];
    if (!urlWithoutQuery.endsWith('/')) {
      return res.redirect(301, `${urlWithoutQuery}/${req.originalUrl.includes('?') ? '?' + req.originalUrl.split('?')[1] : ''}`);
    }
    next();
  });
  app.get('/docs/', (_req, res) => res.redirect(301, '/api/v1/docs/'));
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerUiOptions));

  // Apply general rate limiting to API routes
  app.use('/api/v1', apiLimiter);

  // Mount API v1 Router
  app.use('/api/v1', apiV1Router);

  // 404 Route Not Found Handler
  app.use(notFoundHandler);

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};
