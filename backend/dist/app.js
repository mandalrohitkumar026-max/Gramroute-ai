"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const env_1 = require("./config/env");
const requestLogger_1 = require("./middleware/requestLogger");
const errorHandler_1 = require("./middleware/errorHandler");
const sanitize_1 = require("./middleware/sanitize");
const rateLimiter_1 = require("./middleware/rateLimiter");
const swagger_1 = require("./config/swagger");
const routes_1 = __importDefault(require("./routes"));
const createApp = () => {
    const app = (0, express_1.default)();
    // Security Headers
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false, // Allow Swagger UI inline CSS and JS
        crossOriginEmbedderPolicy: false
    }));
    // CORS Configuration
    app.use((0, cors_1.default)({
        origin: env_1.config.CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
    }));
    // Body and Cookie Parsing
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    app.use((0, cookie_parser_1.default)(env_1.config.COOKIE_SECRET));
    // NoSQL Query Injection Sanitization
    app.use(sanitize_1.sanitizeNoSql);
    // Request Correlation and Logging
    app.use(requestLogger_1.requestCorrelation);
    // Top-level /health check for cloud orchestrators (K8s / ECS / Render / Railway)
    app.get('/health', (_req, res) => {
        res.status(200).json({ status: 'UP', service: 'gramroute-backend' });
    });
    // Swagger OpenAPI raw JSON spec endpoint
    app.get('/api/v1/docs.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.json(swagger_1.swaggerDocument);
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
    app.use('/api/v1/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerDocument, swaggerUiOptions));
    // Apply general rate limiting to API routes
    app.use('/api/v1', rateLimiter_1.apiLimiter);
    // Mount API v1 Router
    app.use('/api/v1', routes_1.default);
    // 404 Route Not Found Handler
    app.use(errorHandler_1.notFoundHandler);
    // Centralized Error Handling Middleware
    app.use(errorHandler_1.errorHandler);
    return app;
};
exports.createApp = createApp;
