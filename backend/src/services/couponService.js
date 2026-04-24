import { Coupon } from '../models/index.js';

/**
 * @returns {{ discount: number, coupon: import('sequelize').Model } | { error: string }}
 */
export async function applyCoupon(code, subtotal) {
  if (!code || !String(code).trim()) return { discount: 0, coupon: null };
  const c = await Coupon.findOne({
    where: { code: String(code).trim().toUpperCase(), isActive: true },
  });
  if (!c) return { error: 'Invalid or expired coupon' };
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return { error: 'Coupon has expired' };
  if (c.usageLimit != null && c.usedCount >= c.usageLimit) return { error: 'Coupon usage limit reached' };
  const min = Number(c.minOrderAmount || 0);
  if (subtotal < min) return { error: `Minimum order ₹${min} required for this coupon` };

  let discount = c.type === 'percent' ? (subtotal * Number(c.value)) / 100 : Number(c.value);
  if (c.maxDiscountAmount != null && discount > Number(c.maxDiscountAmount)) {
    discount = Number(c.maxDiscountAmount);
  }
  discount = Math.min(discount, subtotal);
  discount = Math.round(discount * 100) / 100;
  return { discount, coupon: c };
}

export async function incrementCouponUsage(couponId) {
  await Coupon.increment('usedCount', { where: { id: couponId } });
}
