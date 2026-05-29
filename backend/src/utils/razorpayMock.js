/** Mock Razorpay allowed only when explicitly enabled and not in production. */
export function isRazorpayMockEnabled() {
  return (
    process.env.RAZORPAY_ENABLE_MOCK === 'true' &&
    process.env.NODE_ENV !== 'production'
  );
}
