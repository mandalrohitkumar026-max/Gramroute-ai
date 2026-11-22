import request from 'supertest';
import { createApp } from '../app';

describe('Backend Foundation Health & Base Routes', () => {
  const app = createApp();

  it('GET /health returns 200 UP for orchestrator probe', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('gramroute-backend');
  });

  it('GET /api/v1 returns operational API metadata', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('GramRoute AI REST API');
    expect(res.body.data.version).toBe('v1');
    expect(res.body.data.status).toBe('OPERATIONAL');
  });

  it('GET /api/v1/health returns liveness details and timestamp', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
    expect(res.body.meta.timestamp).toBeDefined();
  });

  it('GET /unknown-path returns standard 404 error envelope', async () => {
    const res = await request(app).get('/api/v1/nonexistent-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});
