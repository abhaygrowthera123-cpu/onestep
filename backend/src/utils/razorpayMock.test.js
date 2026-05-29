import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isRazorpayMockEnabled } from './razorpayMock.js';

describe('isRazorpayMockEnabled', () => {
  const orig = { ...process.env };

  beforeEach(() => {
    process.env = { ...orig };
  });

  afterEach(() => {
    process.env = orig;
  });

  it('returns false in production even when mock flag is true', () => {
    process.env.NODE_ENV = 'production';
    process.env.RAZORPAY_ENABLE_MOCK = 'true';
    expect(isRazorpayMockEnabled()).toBe(false);
  });

  it('returns true in development when mock flag is true', () => {
    process.env.NODE_ENV = 'development';
    process.env.RAZORPAY_ENABLE_MOCK = 'true';
    expect(isRazorpayMockEnabled()).toBe(true);
  });

  it('returns false when mock flag is not set', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.RAZORPAY_ENABLE_MOCK;
    expect(isRazorpayMockEnabled()).toBe(false);
  });
});
