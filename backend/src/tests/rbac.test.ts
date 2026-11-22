import request from 'supertest';
import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { signAccessToken } from '../utils/jwt';
import { User } from '../models/User';
import { errorHandler } from '../middleware/errorHandler';

// Mock User model for testing RBAC middleware
jest.mock('../models/User', () => ({
  User: {
    findOne: jest.fn()
  }
}));

describe('RBAC & Route Authorization Middleware', () => {
  const app = express();
  app.use(express.json());

  // Public endpoint
  app.get('/api/public', (_req, res) => res.json({ message: 'public' }));

  // Protected endpoint (any authenticated user)
  app.get('/api/protected', authenticate, (req, res) => res.json({ user: req.user }));

  // Admin-only endpoint
  app.get('/api/admin-only', authenticate, authorize('ADMIN'), (_req, res) => res.json({ secret: 'admin-data' }));

  // Transporter-only endpoint
  app.get('/api/transporter-only', authenticate, authorize('TRANSPORTER'), (_req, res) =>
    res.json({ fleet: 'transporter-data' })
  );

  app.use(errorHandler);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows access to public endpoints without any token', async () => {
    const res = await request(app).get('/api/public');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('public');
  });

  it('rejects access to protected endpoints when no token is provided with 401 UNAUTHORIZED', async () => {
    const res = await request(app).get('/api/protected');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects access when token signature is invalid', async () => {
    const res = await request(app).get('/api/protected').set('Authorization', 'Bearer invalid_signature_token');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('authenticates valid token and attaches user to request', async () => {
    const testUser = {
      _id: '65f123456789abcdef012345',
      role: 'FARMER',
      phoneNumber: '+919876543210',
      status: 'ACTIVE',
      isLocked: () => false
    };

    (User.findOne as jest.Mock).mockResolvedValue(testUser);

    const token = signAccessToken({
      userId: testUser._id,
      role: testUser.role,
      phoneNumber: testUser.phoneNumber
    });

    const res = await request(app).get('/api/protected').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(testUser._id);
    expect(res.body.user.role).toBe('FARMER');
  });

  it('forbids FARMER role from accessing ADMIN-only route with 403 FORBIDDEN', async () => {
    const farmerUser = {
      _id: '65f123456789abcdef012345',
      role: 'FARMER',
      phoneNumber: '+919876543210',
      status: 'ACTIVE',
      isLocked: () => false
    };

    (User.findOne as jest.Mock).mockResolvedValue(farmerUser);

    const token = signAccessToken({
      userId: farmerUser._id,
      role: farmerUser.role,
      phoneNumber: farmerUser.phoneNumber
    });

    const res = await request(app).get('/api/admin-only').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('allows ADMIN role to access ADMIN-only route', async () => {
    const adminUser = {
      _id: '65f999999999abcdef012345',
      role: 'ADMIN',
      phoneNumber: '+919999999999',
      status: 'ACTIVE',
      isLocked: () => false
    };

    (User.findOne as jest.Mock).mockResolvedValue(adminUser);

    const token = signAccessToken({
      userId: adminUser._id,
      role: adminUser.role,
      phoneNumber: adminUser.phoneNumber
    });

    const res = await request(app).get('/api/admin-only').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.secret).toBe('admin-data');
  });

  it('rejects access if user account is locked due to failed login attempts', async () => {
    const lockedUser = {
      _id: '65f123456789abcdef012345',
      role: 'FARMER',
      phoneNumber: '+919876543210',
      status: 'ACTIVE',
      isLocked: () => true // Account is locked!
    };

    (User.findOne as jest.Mock).mockResolvedValue(lockedUser);

    const token = signAccessToken({
      userId: lockedUser._id,
      role: lockedUser.role,
      phoneNumber: lockedUser.phoneNumber
    });

    const res = await request(app).get('/api/protected').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ACCOUNT_LOCKED');
  });
});
