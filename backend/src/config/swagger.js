"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerDocument = void 0;
exports.swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'GramRoute AI API Specification',
        version: '1.0.0',
        description: 'Intelligent Rural Freight Optimization & Shared Logistics Network REST API. Provides secure endpoints for Farmers, Businesses, Transporters, and Admins to manage shipments, shared trips, vehicle capacities, tracking, and settlements.',
        contact: {
            name: 'GramRoute Engineering Team',
            email: 'engineering@gramroute.ai'
        }
    },
    servers: [
        {
            url: '/api/v1',
            description: 'Current Environment API Base'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Provide your JWT access token'
            },
            cookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'accessToken',
                description: 'HttpOnly access cookie'
            }
        },
        schemas: {
            ApiResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object' },
                    error: {
                        type: 'object',
                        properties: {
                            code: { type: 'string', example: 'VALIDATION_ERROR' },
                            message: { type: 'string', example: 'Invalid payload provided' },
                            details: { type: 'array', items: { type: 'object' } }
                        }
                    },
                    meta: {
                        type: 'object',
                        properties: {
                            timestamp: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            },
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65f123456789abcdef012345' },
                    phoneNumber: { type: 'string', example: '+919876543210' },
                    email: { type: 'string', example: 'farmer@gramroute.ai' },
                    role: { type: 'string', enum: ['FARMER', 'BUSINESS', 'TRANSPORTER', 'ADMIN'], example: 'FARMER' },
                    status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'], example: 'ACTIVE' },
                    isPhoneVerified: { type: 'boolean', example: true },
                    isIdentityVerified: { type: 'boolean', example: false }
                }
            },
            RegisterRequest: {
                type: 'object',
                required: ['phoneNumber', 'password', 'role', 'fullName'],
                properties: {
                    phoneNumber: { type: 'string', example: '+919876543210' },
                    email: { type: 'string', example: 'farmer@gramroute.ai' },
                    password: { type: 'string', example: 'Pass1234' },
                    role: { type: 'string', enum: ['FARMER', 'BUSINESS', 'TRANSPORTER', 'ADMIN'], example: 'FARMER' },
                    fullName: { type: 'string', example: 'Ramesh Patil' }
                }
            },
            LoginRequest: {
                type: 'object',
                required: ['identifier', 'password'],
                properties: {
                    identifier: { type: 'string', example: '+919876543210' },
                    password: { type: 'string', example: 'Pass1234' }
                }
            }
        }
    },
    paths: {
        '/auth/register': {
            post: {
                tags: ['Authentication'],
                summary: 'Register a new user',
                description: 'Creates a new user account with hashed password and initial role profile.',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } }
                },
                responses: {
                    201: { description: 'User registered successfully' },
                    409: { description: 'Phone or email already registered' }
                }
            }
        },
        '/auth/login': {
            post: {
                tags: ['Authentication'],
                summary: 'Login user',
                description: 'Authenticates user with phone/email and password, issuing access & refresh tokens.',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
                },
                responses: {
                    200: { description: 'Login successful' },
                    401: { description: 'Invalid credentials' },
                    429: { description: 'Account locked due to excessive failed attempts' }
                }
            }
        },
        '/auth/refresh': {
            post: {
                tags: ['Authentication'],
                summary: 'Rotate refresh token',
                description: 'Exchanges current refresh token for a fresh token pair.',
                responses: {
                    200: { description: 'Token refreshed' },
                    401: { description: 'Invalid or expired refresh token' }
                }
            }
        },
        '/auth/me': {
            get: {
                tags: ['Authentication'],
                summary: 'Get current user profile',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Current user profile retrieved' },
                    401: { description: 'Unauthorized' }
                }
            }
        },
        '/vehicles': {
            get: {
                tags: ['Vehicles'],
                summary: 'List vehicles',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'List of vehicles' }
                }
            },
            post: {
                tags: ['Vehicles'],
                summary: 'Register a new vehicle',
                security: [{ bearerAuth: [] }],
                responses: {
                    201: { description: 'Vehicle created' }
                }
            }
        },
        '/shipments': {
            get: {
                tags: ['Shipments'],
                summary: 'List shipments',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'List of shipments' }
                }
            },
            post: {
                tags: ['Shipments'],
                summary: 'Post a new shipment requirement',
                security: [{ bearerAuth: [] }],
                responses: {
                    201: { description: 'Shipment created' }
                }
            }
        },
        '/trips': {
            get: {
                tags: ['Trips'],
                summary: 'List scheduled trips',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'List of trips' }
                }
            },
            post: {
                tags: ['Trips'],
                summary: 'Create a new trip route',
                security: [{ bearerAuth: [] }],
                responses: {
                    201: { description: 'Trip created' }
                }
            }
        },
        '/bookings': {
            get: {
                tags: ['Bookings'],
                summary: 'List bookings',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'List of bookings' }
                }
            },
            post: {
                tags: ['Bookings'],
                summary: 'Create a shared freight booking',
                security: [{ bearerAuth: [] }],
                responses: {
                    201: { description: 'Booking created' }
                }
            }
        },
        '/admin/metrics': {
            get: {
                tags: ['Admin'],
                summary: 'Retrieve operational system metrics',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Metrics retrieved' },
                    403: { description: 'Admin access required' }
                }
            }
        }
    }
};
