/**
 * Normalize client address (Address model or legacy) to order storage shape.
 */
export function normalizeOrderAddress(addr) {
  if (!addr) return null;
  if (addr.line1 && addr.fullName) {
    return {
      fullName: addr.fullName,
      phone: String(addr.phone || ''),
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: String(addr.pincode || ''),
      country: addr.country || 'India',
    };
  }
  return {
    fullName: addr.name || addr.fullName || 'Customer',
    phone: String(addr.phoneNumber || addr.phone || ''),
    line1: addr.addressLine1 || addr.line1,
    line2: addr.addressLine2 || addr.line2 || '',
    city: addr.city,
    state: addr.state,
    pincode: String(addr.zipCode || addr.pincode || ''),
    country: addr.country || 'India',
  };
}
