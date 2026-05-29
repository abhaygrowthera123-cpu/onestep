import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import authRoutes from '../src/routes/auth.js';

describe('POST /auth/admin-login in production', () => {
  let app;
  const orig = { ...process.env };

  beforeEach(() => {
    process.env = { ...orig, NODE_ENV: 'production' };
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_JWT_SECRET;
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
  });

  afterEach(() => {
    process.env = orig;
  });

  it('returns 503 when admin env is not configured', async () => {
    const res = await request(app)
      .post('/auth/admin-login')
      .send({ email: 'admin@test.com', password: 'secret' });
    expect(res.status).toBe(503);
  });
});
