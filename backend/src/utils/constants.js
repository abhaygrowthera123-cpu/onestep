// ── Order Status Flow ──────────────────────────────────────────
export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'return_requested',
  'returned',
  'refunded',
];

// Allowed status transitions (current → next[])
export const ORDER_STATUS_TRANSITIONS = {
  pending:          ['confirmed', 'cancelled'],
  confirmed:        ['packed', 'cancelled'],
  packed:           ['shipped', 'cancelled'],
  shipped:          ['out_for_delivery', 'delivered'],
  out_for_delivery: ['delivered'],
  delivered:        ['return_requested'],
  return_requested: ['returned', 'delivered'],  // admin can reject return
  returned:         ['refunded'],
  cancelled:        [],
  refunded:         [],
};

// ── Payment Statuses ───────────────────────────────────────────
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

// ── User Roles ─────────────────────────────────────────────────
export const USER_ROLES = ['user', 'seller', 'admin'];

// ── Seller Application Statuses ────────────────────────────────
export const SELLER_STATUSES = ['pending', 'approved', 'rejected', 'suspended'];

// ── Notification Types ─────────────────────────────────────────
export const NOTIFICATION_TYPES = ['order', 'payment', 'system', 'promotion', 'seller'];
