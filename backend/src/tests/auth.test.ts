import request from 'supertest';
import { createApp } from '../app';
import { User } from '../models/User';
import { Profile } from '../models/Profile';

jest.mock('../models/User');
jest.mock('../models/Profile');

describe('Authentication & Authorization Controller Endpoints', () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('rejects registration with invalid phone number format', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        phoneNumber: '123', // Invalid phone
        password: 'Password123',
        role: 'FARMER',
        fullName: 'Ramesh Patil'
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects registration with weak password (missing digit/uppercase)', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        phoneNumber: '+919876543210',
        password: 'weakpassword',
        role: 'FARMER',
        fullName: 'Ramesh Patil'
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects registration with an invalid role', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        phoneNumber: '+919876543210',
        password: 'Password123',
        role: 'SUPER_HACKER',
        fullName: 'Ramesh Patil'
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('successfully registers a new user with valid payload and creates initial profile', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const fakeUser: any = {
        _id: '65f123456789abcdef012345',
        phoneNumber: '+919876543210',
        role: 'FARMER',
        status: 'ACTIVE',
        refreshTokens: [],
        save: jest.fn().mockResolvedValue(true),
        toJSON: () => ({
          _id: '65f123456789abcdef012345',
          phoneNumber: '+919876543210',
          role: 'FARMER'
        })
      };

      (User.create as jest.Mock).mockResolvedValue(fakeUser);
      (Profile.create as jest.Mock).mockResolvedValue({
        _id: '65f987654321abcdef012345',
        fullName: 'Ramesh Patil',
        userId: fakeUser._id
      });

      const res = await request(app).post('/api/v1/auth/register').send({
        phoneNumber: '+919876543210',
        password: 'Password123',
        role: 'FARMER',
        fullName: 'Ramesh Patil'
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns 401 when user is not found', async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      const res = await request(app).post('/api/v1/auth/login').send({
        identifier: '+919876543210',
        password: 'Password123'
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('increments failed attempts when password does not match', async () => {
      const mockUser: any = {
        _id: '65f123456789abcdef012345',
        phoneNumber: '+919876543210',
        status: 'ACTIVE',
        isLocked: jest.fn().mockReturnValue(false),
        comparePassword: jest.fn().mockResolvedValue(false),
        incrementLoginAttempts: jest.fn().mockResolvedValue(undefined)
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const res = await request(app).post('/api/v1/auth/login').send({
        identifier: '+919876543210',
        password: 'WrongPassword123'
      });

      expect(res.status).toBe(401);
      expect(mockUser.incrementLoginAttempts).toHaveBeenCalledTimes(1);
    });

    it('locks account and returns 429 when max login attempts reached', async () => {
      const mockLockedUser: any = {
        _id: '65f123456789abcdef012345',
        phoneNumber: '+919876543210',
        status: 'ACTIVE',
        lockUntil: new Date(Date.now() + 15 * 60 * 1000),
        isLocked: jest.fn().mockReturnValue(true) // Account is locked!
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockLockedUser)
      });

      const res = await request(app).post('/api/v1/auth/login').send({
        identifier: '+919876543210',
        password: 'AnyPassword123'
      });

      expect(res.status).toBe(429);
      expect(res.body.error.code).toBe('ACCOUNT_LOCKED');
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('returns success even if user not found (prevents enumeration)', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/v1/auth/forgot-password').send({
        identifier: '+919999999999'
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
