/**
 * Minimal GST-style invoice HTML (print-friendly).
 */
export function renderInvoiceHtml(order, opts = {}) {
  const storeName = opts.storeName || 'OneStep Hub';
  const storeGstin = opts.storeGstin || '';
  const addr = order.address || {};
  const items = Array.isArray(order.items) ? order.items : [];

  const rows = items
    .map(
      (it, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHtml(it.name)}</td>
      <td>${it.quantity}</td>
      <td>₹${Number(it.price).toFixed(2)}</td>
      <td>₹${(Number(it.price) * it.quantity).toFixed(2)}</td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Invoice ${escapeHtml(order.orderNumber)}</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 800px; margin: 24px auto; color: #111; }
  h1 { font-size: 1.25rem; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
  th { background: #f4f4f5; }
  .muted { color: #666; font-size: 12px; }
  .totals { margin-top: 16px; text-align: right; }
</style></head><body>
  <h1>Tax Invoice / Bill of Supply</h1>
  <p class="muted">${escapeHtml(storeName)}${storeGstin ? ` &middot; GSTIN: ${escapeHtml(storeGstin)}` : ''}</p>
  <p><strong>Order:</strong> ${escapeHtml(order.orderNumber)}<br/>
  <strong>Date:</strong> ${new Date(order.createdAt).toLocaleString('en-IN')}<br/>
  <strong>Payment:</strong> ${escapeHtml(order.paymentMethod || '')} (${escapeHtml(order.paymentStatus || '')})</p>
  <p><strong>Bill to:</strong><br/>
  ${escapeHtml(addr.fullName || '')}<br/>
  ${escapeHtml(addr.line1 || '')} ${escapeHtml(addr.line2 || '')}<br/>
  ${escapeHtml(addr.city || '')}, ${escapeHtml(addr.state || '')} ${escapeHtml(addr.pincode || '')}<br/>
  ${escapeHtml(addr.phone || '')}</p>
  ${order.gstNote ? `<p class="muted">${escapeHtml(order.gstNote)}</p>` : ''}
  <table>
    <thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    ${order.subtotalAmount != null ? `<div>Subtotal: ₹${Number(order.subtotalAmount).toFixed(2)}</div>` : ''}
    ${order.discountAmount > 0 ? `<div>Discount: −₹${Number(order.discountAmount).toFixed(2)}</div>` : ''}
    ${order.walletAmount > 0 ? `<div>Wallet: −₹${Number(order.walletAmount).toFixed(2)}</div>` : ''}
    <div><strong>Grand Total: ₹${Number(order.totalAmount).toFixed(2)}</strong></div>
  </div>
</body></html>`;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
