import request from 'supertest';
import express from 'express';
import { sanitizeNoSql } from '../middleware/sanitize';

describe('NoSQL Query Injection Sanitizer Middleware', () => {
  const app = express();
  app.use(express.json());
  app.use(sanitizeNoSql);

  app.post('/test-sanitize', (req, res) => {
    res.status(200).json({ body: req.body });
  });

  it('strips MongoDB query operators starting with $ from request body', async () => {
    const maliciousPayload = {
      username: 'admin',
      password: { $gt: '' },
      nested: {
        $where: 'this.password.length > 0',
        validField: 'safeValue'
      }
    };

    const res = await request(app).post('/test-sanitize').send(maliciousPayload);

    expect(res.status).toBe(200);
    expect(res.body.body.username).toBe('admin');
    expect(res.body.body.password).toEqual({});
    expect(res.body.body.nested).toEqual({ validField: 'safeValue' });
    expect(res.body.body.nested.$where).toBeUndefined();
  });

  it('strips keys containing dot notation to prevent path traversal', async () => {
    const maliciousPayload = {
      'profile.isAdmin': true,
      validField: 'good'
    };

    const res = await request(app).post('/test-sanitize').send(maliciousPayload);

    expect(res.status).toBe(200);
    expect(res.body.body['profile.isAdmin']).toBeUndefined();
    expect(res.body.body.validField).toBe('good');
  });
});
