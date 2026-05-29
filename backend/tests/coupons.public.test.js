import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { sequelize, Coupon } from '../src/models/index.js';
import couponRoutes from '../src/routes/coupons.js';

describe('GET /coupons/public', () => {
  let app;

  beforeAll(async () => {
    process.env.DB_DIALECT = 'sqlite';
    await sequelize.sync({ force: true });
    await Coupon.create({
      code: 'ACTIVE10',
      type: 'percent',
      value: 10,
      isActive: true,
      expiresAt: new Date(Date.now() + 86400000),
    });
    await Coupon.create({
      code: 'EXPIRED',
      type: 'fixed',
      value: 50,
      isActive: true,
      expiresAt: new Date(Date.now() - 86400000),
    });
    await Coupon.create({
      code: 'INACTIVE',
      type: 'fixed',
      value: 20,
      isActive: false,
    });

    app = express();
    app.use(express.json());
    app.use('/coupons', couponRoutes);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('returns only active non-expired coupons', async () => {
    const res = await request(app).get('/coupons/public');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const codes = res.body.map((c) => c.code);
    expect(codes).toContain('ACTIVE10');
    expect(codes).not.toContain('EXPIRED');
    expect(codes).not.toContain('INACTIVE');
  });
});
